
# Prerequisites
  
- Install nodejs, I advise to install node v10 because  
- [experimental-repl-await](https://nodejs.org/api/cli.html#cli_experimental_repl_await) flag that allow to use `await` not in a function. 
- Install web3:
```
npm instal web3@2.0.0-alpha.1
npm install ethereumjs-util
npm install request
npm install request-promise-native
``` 
- Run node with a required parameters: `PK` and the associated `ACCOUNT_ADDRESS`:
  ```
  PK=7b84f5037b8e9350557c05ece0e333b42838930063d652044367d110c3d508e3 ACCOUNT_ADDRESS=0x915C2352A5e0747ee0AB2D2F152b274189594a22 node --experimental-repl-await
  ```
Your account will be needed to have some balance on the Fuse chain to pay for transaction's gas.
- Create a fuse provider with the following configurations:
```js
const pk = process.env.PK // Ethereum private key of your account
const accountAddress = process.env.ACCOUNT_ADDRESS // Ethereum account address corresponding to the private key

const Web3 = require('web3')
const ethUtils = require('ethereumjs-util')
const request = require('request-promise-native')

const web3 = new Web3('https://rpc.fusenet.io')
web3.eth.accounts.wallet.add(ethUtils.addHexPrefix(pk))
const contractOptions = {
  transactionConfirmationBlocks: 2 
} // contract options to use on Fuse network.

const apiUrl = 'https://studio-qa-ropsten.fusenet.io/api/v1' // we'll use our QA server. Ropsten means that the Fuse network is connected to Ethereum Ropsten (might be irelevant)

// This function submits a contract method on the Fuse chain, and updated studio backend about the transaction result
let send = async (method) => {
  const gasLimit = await method.estimateGas({ from: accountAddress })
  const nonce = await web3.eth.getTransactionCount(accountAddress)
  console.log(`gas limit estimated is ${gasLimit}`) 
  const receipt = await method.send({
    from: accountAddress,
    gasPrice: 1e9,
    nonce,
    gasLimit
  })
  console.log('transaction is confirmed, updating fuse backend')
  const response = await request({
    method: 'POST',
    uri: `${apiUrl}/receipts`,
    body: { receipt, bridgeType: 'home' },
    json: true
  })
  if (response.updated) {
    console.log('fuse backend is updated')
  } else {
    console.error(`fuse is not updated. reason: ${response.msg}`)
  }
  return receipt
}

  ```

# Launching a Community

## Creating a Token
Sardex can do the issuance themselves and send the token address to fuse-studio. On the other hand we can do the issuance to lower friction.
- Issue a mintable/burnable token with zero supply:
```js
const tokenAbi = require('./TokenABI') // we need to provide the ABI for Sardex

// define token arguments
const tokenName = 'SardexCoin'
const tokenSymbol = 'SC'
const initialSupply = '0'

let issueToken = async (tokenName, tokenSymbol, initialSupply) => {
    const factoryAddress = '0x49cc3F721DCf33d716B6241Bce0892dEaf9Da58A'
    const factoryABI = require('./TokenFactory')
    const tokenURI = 'ipfs://hash' // link to IPFS, might be removed
    const factoryContract = new web3.eth.Contract(factoryABI, factoryAddress, contractOptions)
    const method = factoryContract.methods.createMintableBurnableToken(tokenName, tokenSymbol, initialSupply, '')
    const receipt = await send(method)
    const tokenAddress = receipt.events.TokenCreated.returnValues.token
    console.log(`Token is issued with contract address ${tokenAddress}`)
    return tokenAddress
}

// let tokenAddress
tokenAddress = await issueToken(tokenName, tokenSymbol, initialSupply)


const tokenContract = new web3.eth.Contract(tokenAbi, tokenAddress, contractOptions)
```

## Launching and configuring the community 
- After the token is created, you should launch the community with that token. 
```
curl -X POST -d '{
        "steps": {
                "community": {
                        "args": {
                        "isClosed":false,
                        "name":"SardexCoin",
                        "adminAddress":"you account"}
                }
        }
}' https://studio-qa-ropsten.fusenet.io/api/v1/deployments 
```
*TODO: Make that API work on Fuse (now the bridge is a mandatory step)*

- Add business list plugin to the community

curl -X POST -d '{
  "plugins": {
    "businessList": {
      "isActive": true
    }
  }
  
' https://studio-qa-ropsten.fusenet.io/api/v1/communities/{communityAddress}

- *TODO: Make the business list customizable to the issuer needs (define fields, roles, etc..)*
- *TODO: Make the endpoint nicer and safier (not it looks too generic)*
- *TODO: Authentication is misssing*

## Expiration Feature
Basically Should be part of the token contract. ERC721 with transfer rules based on the blocknumbers. We can use our own tranfer rules and roles to customise this.



# Actor Representation and Rights:

## PK and account address.
See the `Prerequisites` section.


## Minting permissions
- Community launcher should give permissions to issuers to issue tokens.
```js

send(tokenContract.methods.addMinter(minterAddress)) // the minter can mint any number of tokens
```
- Also he should renounce it's own permissions after he added all minters. On the other hand, if he renounce himself from minting role, he cannot add more minters.
```js
send(tokenContract.methods.renounceMinter())
```


## Distributors (Operators) right to move funds

There's two models for distributors to get the tokens. push and pull.
- push: the issuer sends tokens to distributors accounts
- pull: the distibutors pull money from some account they have special rights to access. It can be a multisig, or they just have an approval to move issuer's funds.

## Distributors (Operators) right to add business and users

- The community launcher have to make the distributors admins of the community. Then the distributors can add more entities to the community.
```js

const { roles, combineRoles } = require('@fuse/roles') // need to upload package to npm

const communityAbi = require('Community')

const communityAddress = '' //community address should be retrived from fuse-studio backend
const distributorAddress = '' // the community launcher


const addEntity = async (communityAddress, entityAddress, role) => {
    const communityContract = new web3.eth.Contract(communityAbi, communityAddress, contractOptions)
    const method = communityContract.methods.addEntity(entityAddress, roles.ADMIN_ROLE)

    return send(method)
}

await addEntity(communityAddress, distributorAddress, roles.ADMIN_ROLE)
```

# Issuance
- Minting of ERC20 tokens:
```js
await send(tokenContract.methods.mint(accountAddress, amount)) 
// accountAddress will receive the tokens 
```

- Minting of ERC721 tokens:
```js
await send(tokenContract.methods.mint(accountAddress, tokenId)) 
//the tokenId must be unique
```

- Minting tokens with expirity date (blockNumber) and value
```js
await send(tokenContract.methods.mint(accountAddress, tokenId, blockNumber, value)) 
```

- Batch token Minting (tokenIds is array)
```js
await send(tokenContract.methods.mint(accountAddress, tokenIds, blockNumber, value)) 
```
The problem is that the `tokenIds` should be given as an array not used tokenIds. Why not to keep the tokenId counter in the contract and let the contract allocate the ids?


# Onboarding

## Adding businesses or users to the community by the community admins

- Adding user to community
```js
await addEntity(communityAddress, entityAddress, roles.USER_ROLE)
```

- Adding a business to community
```js
await addEntity(communityAddress, entityAddress, roles.BUSINESS_ROLE)
```

This also can be done via the fuse-studio UI.