const { MethodParser } = require('@utils/abi')

class RelayJobParser {
  constructor (signatureStore) {
    this.parser = new MethodParser(signatureStore)
  }

  parseJob (job) {
    if (job.name !== 'relay') {
      throw Error(`job ${job._id} is not a relay job but ${job.name}`)
    }
    const { params, contractName, methodName } = this.parser(job.data.methodData)
    if (methodName !== job.data.methodName) {
      console.warn(`supplied method name of ${job.data.methodName} does not match the one extracted for method data ${methodName}, job is is ${job._id}`)
    }
    if (contractName !== job.data.walletModule) {
      console.warn(`supplied module name of ${job.data.methodName} does not match the one extracted for method data ${methodName}, job is is ${job._id}`)
    }

    if (methodName === 'approveTokenAndCallContract' || methodName === 'callContract') {
      const nested = this.parser(params.data)
      return { params, contractName, methodName, nested }
    }
    return { params, contractName, methodName }
  }
}

module.exports = RelayJobParser
