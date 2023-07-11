const config = require('config')
const { inspect } = require('util')
const mongoose = require('mongoose')
const Account = mongoose.model('Account')
const { get, has, includes } = require('lodash')
const BigNumber = require('bignumber.js')
const { pendingAndUpdateByJob } = require('@utils/wallet/actions')

const calculateTxFee = ({ gasUsed, gasPrice }) => {
  return new BigNumber(gasUsed).multipliedBy(gasPrice).toString()
}

const getMethodName = (method) => method ? get(method, 'methodName', 'unknown') : 'raw'

const retries = 3

const TRANSACTION_HASH_IMPORTED = 'Node error: {"code":-32010,"message":"Transaction with the same hash was already imported."}'
const TRANSACTION_HASH_TOO_LOW = 'Node error: {"code":-32010,"message":"Transaction nonce is too low. Try incrementing the nonce."}'
const TRANSACTION_TIMEOUT = 'Error: Timeout exceeded during the transaction confirmation process. Be aware the transaction could still get confirmed!'

const getJobDataPath = (txContext) => has(txContext, 'txName') ? `data.${get(txContext, 'txName')}` : 'data'

const send = async ({ web3, bridgeType, address }, method, options, txContext = {}) => {
  const { job } = txContext

  const defaults = {
    handleTransactionHash: async (hash) => {
      console.log(`transaction ${hash} is created by ${account.address}`)
      if (job) {
        const jobDataPath = getJobDataPath(txContext)
        job.set(`${jobDataPath}.txHash`, hash)
        const { communityAddress } = txContext
        if (communityAddress) {
          job.set('communityAddress', communityAddress)
        }
        await pendingAndUpdateByJob(job, hash)
        return job.save()
      }
    },
    handleReceipt: (receipt) => {
      const { blockNumber, txFee } = receipt
      const txSuccess = get(receipt, 'status')

      if (job) {
        const jobDataPath = getJobDataPath(txContext)
        job.set(`${jobDataPath}.transactionBody`, { ...get(job.data, 'transactionBody', {}), status: txSuccess ? 'confirmed' : 'failed', blockNumber })
        job.set(`${jobDataPath}.txFee`, txFee, mongoose.Decimal128)

        // sum the fees if job got multiple transactions
        if (jobDataPath !== 'data') {
          const feeTillNow = get(job, 'data.txFee', '0')
          job.set(`data.txFee`, new BigNumber(txFee).plus(feeTillNow), mongoose.Decimal128)
        }

        return job.save()
      }
    }
  }

  const doSend = async (retry) => {
    let transactionHash
    const nonce = account.nonces[bridgeType]
    const methodName = getMethodName(method)
    console.log(`[${bridgeType}][retry: ${retry}] sending method ${methodName} from ${from} with nonce ${nonce}. gas price: ${gasPrice}, gas limit: ${gas}, options: ${inspect(options)}`)
    const txObject = { ...options, gasPrice, gas, nonce, chainId: bridgeType === 'home' ? config.get('network.home.chainId') : undefined }

    const calculateTxHash = async () => {
      const { transactionHash } = await web3.eth.accounts.signTransaction({ to: method && method.contract._address, data: method ? method.encodeABI() : '', ...txObject }, web3.eth.accounts.wallet[0].privateKey)
      return transactionHash
    }

    const handleTransactionHash = get(txContext, 'transactionHash', defaults.handleTransactionHash)
    try {
      transactionHash = await calculateTxHash()
    } catch (err) {
      console.log('txHash could not get calculated')
      console.error(err)
    }
    if (transactionHash) {
      console.log(`calculated txHash is ${transactionHash}`)
      await handleTransactionHash(transactionHash)
    }

    const promise = method ? method.send(txObject) : web3.eth.sendTransaction(txObject)

    promise.on('transactionHash', (actualTxHash) => {
      console.log(`actual TxHash is ${actualTxHash}`)
      if (transactionHash) {
        if (transactionHash !== actualTxHash) {
          console.error(`calculates txHash ${transactionHash} is not matching the actual one ${actualTxHash}`)
        }
      } else {
        transactionHash = actualTxHash
        handleTransactionHash(actualTxHash)
      }
    })

    try {
      if (methodName === 'deploy') {
        // TODO: add tx fee here too (we don't use that flow now for any tx's we want to count)
        const contract = await promise
        console.log(`[${bridgeType}] method ${methodName} succeeded ${contract.options.address}`)
        return { receipt: contract }
      } else {
        const receipt = await new Promise(async (resolve, reject) => {
          promise
            .on('error', (e, rec) => {
              e.receipt = rec
              reject(e)
            })
            .on('receipt', (r) => resolve(r))
        })
        console.log(`[${bridgeType}] method ${methodName} succeeded in tx ${receipt.transactionHash}`)
        return { receipt }
      }
    } catch (error) {
      console.error(error)

      // reverted: transaction has been confirmed but failed
      if (error.receipt) {
        return error
      }

      const updateNonce = async () => {
        console.log('updating the nonce')
        const nonce = await web3.eth.getTransactionCount(from)
        console.log(`new nonce is ${nonce}`)
        account.nonces[bridgeType] = nonce
      }

      const errorHandlers = {
        [TRANSACTION_HASH_IMPORTED]: async () => {
          if (transactionHash) {
            const receipt = await web3.eth.getTransactionReceipt(transactionHash)
            return { receipt }
          }
        },
        [TRANSACTION_HASH_TOO_LOW]: updateNonce,
        [TRANSACTION_TIMEOUT]: updateNonce
      }
      const errorMessage = error.message || error.error
      console.error(`[${bridgeType}][retry: ${retry}] sending method ${methodName} from ${from} with nonce ${nonce} failed with ${errorMessage}`)
      if (errorHandlers.hasOwnProperty(errorMessage)) {
        const response = await errorHandlers[errorMessage]()
        return { ...response, error }
      } else {
        console.log('No error handler found, using the default one.')
        await updateNonce()
        return { error }
      }
    }
  }

  const estimateGas = () => options.gas ||
    (method ? method.estimateGas({ from }) : web3.eth.estimateGas(options))

  const from = address
  const gas = await estimateGas()
  // const gasPrice = await getGasPrice(bridgeType, web3, options.gasSpeed)
  const gasPrice = '11000000000'
  const account = await Account.findOne({ address, bridgeType })
  for (let i = 0; i < retries; i++) {
    const response = await doSend(i) || {}
    const { receipt, error } = response
    if (receipt) {
      if (!receipt.status) {
        console.warn(`Transaction ${receipt.transactionHash} is reverted`)
      }
      account.nonces[bridgeType]++
      await Account.updateOne({ address, bridgeType }, { [`nonces.${bridgeType}`]: account.nonces[bridgeType] })
      receipt.bridgeType = bridgeType
      receipt.gasPrice = gasPrice
      receipt.txFee = calculateTxFee(receipt)
      const handleReceipt = get(txContext, 'handleReceipt', defaults.handleReceipt)
      await handleReceipt(receipt)

      return receipt
    }
    if (includes(error.message, 'AlreadyKnown') || includes(error.message, 'InsufficientFunds')) {
      console.log(`Insufficient funds in the relayer account: ${address}`)
      throw Error(error.message)
    }
    if (error && i === retries - 1) {
      throw error
    }
  }
}

module.exports = {
  send
}
