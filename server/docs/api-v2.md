<a name="top"></a>
# Studio Backend API v2.0.0

The Fuse Studio V2 REST API for accessing the data and the services of the Fuse network in a simple way. You can use this API to query and interact with the objects of the Fuse network such as: Communities, Tokens, Bridges and Entities. The backend base URL is https://studio.fuse.io. Learn more on https://github.com/fuseio/fuse-studio

- [Admin](#Admin)
	- [Burn tokens](#Burn-tokens)
	- [Get burn events](#Get-burn-events)
	- [Create token](#Create-token)
	- [Create wallet for phone number](#Create-wallet-for-phone-number)
	- [Get expired by wallet/token/spendabilityId](#Get-expired-by-wallet/token/spendabilityId)
	- [Mint tokens](#Mint-tokens)
	- [Transfer tokens from account](#Transfer-tokens-from-account)
	
- [Contacts](#Contacts)
	- [Acknowledge contacts list sync with nonce](#Acknowledge-contacts-list-sync-with-nonce)
	- [Sync contacts list](#Sync-contacts-list)
	
- [Jobs](#Jobs)
	- [Fetch job by correlationId](#Fetch-job-by-correlationId)
	- [Fetch job by id](#Fetch-job-by-id)
	
- [Login](#Login)
	- [Login using firebase ID token](#Login-using-firebase-ID-token)
	- [Request a verification code](#Request-a-verification-code)
	- [Verify user phone number](#Verify-user-phone-number)
	
- [Wallet](#Wallet)
	- [Create wallet contract for user](#Create-wallet-contract-for-user)
	- [Create wallet contract for user on Ethereum](#Create-wallet-contract-for-user-on-Ethereum)
	- [Fetch all wallets by phone number](#Fetch-all-wallets-by-phone-number)
	- [Fetch user wallet](#Fetch-user-wallet)
	- [Fetch latest wallet by phone number](#Fetch-latest-wallet-by-phone-number)
	- [Notify server on client wallet backup](#Notify-server-on-client-wallet-backup)
	- [Create wallet for phone number](#Create-wallet-for-phone-number)
	- [Check if wallet exists by wallet address](#Check-if-wallet-exists-by-wallet-address)
	

# <a name='Admin'></a> Admin

## <a name='Burn-tokens'></a> Burn tokens
[Back to top](#top)

<p>Start async job of burning tokens</p>

```
POST /api/v2/admin/tokens/burn
```
### Headers
| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization | String | <p>JWT Authorization in a format &quot;Bearer {jwtToken}&quot;</p>|

### Parameter Parameters
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| tokenAddress | `String` | <p>Token address to burn (body parameter)</p> |
| networkType | `String` | <p>Token's network (must be Fuse)</p> |
| amount | `String` | <p>Token amount to burn</p> |
| from | `String` | <p>account to burn from (optional)</p> |

### Examples
Burn 1.1 tokens on Fuse network

```
POST /api/v2/admin/tokens/burn
body: { tokenAddress: '0xbAa75ecD3Ea911c78A23D7cD16961Eadc5867d2b', networkType: 'fuse', amount: '1.1' }
```


### Success 200
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| Started | `String` | <p>job data</p> |
## <a name='Get-burn-events'></a> Get burn events
[Back to top](#top)

<p>Get burn events created by admin</p>

```
POST /api/v2/admin/tokens/burnEvents
```
### Headers
| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization | String | <p>JWT Authorization in a format &quot;Bearer {jwtToken}&quot;</p>|

### Parameter Parameters
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| fromWallet | `String` |  |
| startTime | `String` |  |
| endTime | `String` |  |
| networkType | `String` | <p>Token's network (must be Fuse)</p> |

### Examples
GET /api/v2/admin/tokens/burnEvents

```
GET /api/v2/admin/tokens/burnEvents
body: { fromWallet: '0x755c33BE69dD2baB7286E7a2010fc8591AF15a1e', networkType: 'fuse' }
```


## <a name='Create-token'></a> Create token
[Back to top](#top)

<p>Start async job of creating a token</p>

```
POST /api/v2/admin/tokens/create
```
### Headers
| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization | String | <p>JWT Authorization in a format &quot;Bearer {jwtToken}&quot;</p>|

### Parameter Parameters
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| name | `String` | <p>Token name</p> |
| symbol | `String` | <p>Token symbol</p> |
| initialSupply | `String` | <p>Token initial supply (in ETH)</p> |
| uri | `String` | <p>Token URI (metadata)</p> |
| expiryTimestamp | `String` | <p>Token expiry timestamp after which cannot transfer (Unix epoch time - in seconds)</p> |
| spendabilityIds | `String` | <p>Token spendability ids (comma-seperated list)</p> |
| networkType | `String` | <p>Token's network (must be Fuse)</p> |

### Examples
Create a token on Fuse network

```
POST /api/v2/admin/tokens/create
body: { name: 'MyCoolToken', symbol: 'MCT', initialSupply: '100', uri: 'ipfs://hash', expiryTimestamp: 1585036857, spendabilityIds: 'a,b,c', networkType: 'fuse' }
```


### Success 200
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| Started | `String` | <p>job data</p> |
## <a name='Create-wallet-for-phone-number'></a> Create wallet for phone number
[Back to top](#top)

<p>Start async job of creating a wallet for phone number (owned by the community admin)</p>

```
POST /api/v2/admin/wallets/create
```
### Headers
| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization | String | <p>JWT Authorization in a format &quot;Bearer {jwtToken}&quot;</p>|

### Parameter Parameters
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| phoneNumber | `String` | <p>phone number to create a wallet for (body parameter)</p> |

### Examples
Create wallet for the provided phone number

```
POST /api/v2/admin/wallets/create
body: { phoneNumber: '+972546123321' }
```


### Success 200
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| Started | `String` | <p>job data</p> |
## <a name='Get-expired-by-wallet/token/spendabilityId'></a> Get expired by wallet/token/spendabilityId
[Back to top](#top)

<p>Get expired balance for one/multiple wallets by token or spendabilityId</p>

```
POST /api/v2/admin/tokens/expired
```
### Headers
| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization | String | <p>JWT Authorization in a format &quot;Bearer {jwtToken}&quot;</p>|

### Parameter Parameters
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| walletAddress | `String` |  |
| tokenAddress | `String` |  |
| spendabilityId | `String` |  |
| networkType | `String` | <p>Token's network (must be Fuse)</p> |

### Examples
GET /api/v2/admin/tokens/expired

```
GET /api/v2/admin/tokens/expired
body: { walletAddress: '0x755c33BE69dD2baB7286E7a2010fc8591AF15a1e', tokenAddress: '0xbAa75ecD3Ea911c78A23D7cD16961Eadc5867d2b', networkType: 'fuse' }
```


## <a name='Mint-tokens'></a> Mint tokens
[Back to top](#top)

<p>Start async job of minting tokens</p>

```
POST /api/v2/admin/tokens/mint
```
### Headers
| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization | String | <p>JWT Authorization in a format &quot;Bearer {jwtToken}&quot;</p>|

### Parameter Parameters
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| tokenAddress | `String` | <p>Token address to mint (body parameter)</p> |
| networkType | `String` | <p>Token's network (must be Fuse)</p> |
| amount | `String` | <p>Token amount to mint</p> |
| toAddress | `String` | <p>account to transfer to</p> |

### Examples
Minting 1.1 tokens on Fuse network

```
POST /api/v2/admin/tokens/mint
body: { tokenAddress: '0xbAa75ecD3Ea911c78A23D7cD16961Eadc5867d2b', networkType: 'fuse', amount: '1.1' }
```


### Success 200
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| Started | `String` | <p>job data</p> |
## <a name='Transfer-tokens-from-account'></a> Transfer tokens from account
[Back to top](#top)

<p>Start async job of transferring tokens from account (owned by community admin)</p>

```
POST /api/v2/admin/tokens/transfer
```
### Headers
| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization | String | <p>JWT Authorization in a format &quot;Bearer {jwtToken}&quot;</p>|

### Parameter Parameters
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| tokenAddress | `String` | <p>Token address to transfer (body parameter)</p> |
| spendabilityIds | `String` | <p>Token spendability ids (comma-seperated list) - if sent, no need for tokenAddress</p> |
| spendabilityOrder | `String` | <p>Token spendability order (asc/desc) - mandatory if using spendabilityIds</p> |
| networkType | `String` | <p>Token's network (must be Fuse)</p> |
| amount | `String` | <p>Token amount to transfer</p> |
| from | `String` | <p>account to transfer from</p> |
| to | `String` | <p>address to transfer to</p> |

### Examples
Transfer 1.1 tokens on Fuse network

```
POST /api/v2/admin/tokens/transfer
body: { tokenAddress: '0xbAa75ecD3Ea911c78A23D7cD16961Eadc5867d2b', networkType: 'fuse', amount: '1.1', from: '0x755c33BE69dD2baB7286E7a2010fc8591AF15a1e', to: '0x5d651E34B6694A8778839441dA954Ece0EA733D8' }
```


### Success 200
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| Started | `String` | <p>job data</p> |
# <a name='Contacts'></a> Contacts

## <a name='Acknowledge-contacts-list-sync-with-nonce'></a> Acknowledge contacts list sync with nonce
[Back to top](#top)

<p>Acknowledge contacts list sync with nonce</p>

```
POST /api/v2/contacts/:nonce
```
### Headers
| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization | String | <p>JWT Authorization in a format &quot;Bearer {jwtToken}&quot;</p>|



### Success 200
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| response | `String` | <p>Response status - ok</p> |
## <a name='Sync-contacts-list'></a> Sync contacts list
[Back to top](#top)

<p>Sync contacts list</p>

```
POST api/v2/contacts/
```
### Headers
| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization | String | <p>JWT Authorization in a format &quot;Bearer {jwtToken}&quot;</p>|

### Parameter Parameters
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| contacts | `String[]` | <p>phone numbers list</p> |


### Success 200
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| new | `Object[]` | <p>contacts list (phoneNumber, account)</p> |
| nonce | `Number` |  |
# <a name='Jobs'></a> Jobs

## <a name='Fetch-job-by-correlationId'></a> Fetch job by correlationId
[Back to top](#top)

<p>Fetches agenda job by job's correlationId</p>

```
GET api/v2/jobs/correlationId/:correlationId
```
### Headers
| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization | String | <p>JWT Authorization in a format &quot;Bearer {jwtToken}&quot;</p>|



### Success 200
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| data | `Object` | <p>Job object</p> |
## <a name='Fetch-job-by-id'></a> Fetch job by id
[Back to top](#top)

<p>Fetches agenda job by job id</p>

```
GET api/v2/jobs/:jobId
```
### Headers
| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization | String | <p>JWT Authorization in a format &quot;Bearer {jwtToken}&quot;</p>|



### Success 200
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| data | `Object` | <p>Job object</p> |
# <a name='Login'></a> Login

## <a name='Login-using-firebase-ID-token'></a> Login using firebase ID token
[Back to top](#top)

<p>Login using firebase ID token</p>

```
POST api/v2/login/
```

### Parameter Parameters
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| accountAddress | `String` | <p>User account address</p> |
| token | `String` | <p>Firebase ID token</p> |


### Success 200
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| token | `String` | <p>JWT token</p> |
## <a name='Request-a-verification-code'></a> Request a verification code
[Back to top](#top)

<p>Request a verification code to user's phone number</p>

```
POST api/v2/login/request
```

### Parameter Parameters
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| phoneNumber | `String` | <p>User phone number</p> |


### Success 200
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| response | `String` | <p>Response status - ok</p> |
## <a name='Verify-user-phone-number'></a> Verify user phone number
[Back to top](#top)

<p>Verify user phone number by SMS verification code</p>

```
POST api/v2/login/verify
```

### Parameter Parameters
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| phoneNumber | `String` | <p>User phone number</p> |
| accountAddress | `String` | <p>User account address</p> |
| code | `String` | <p>SMS code recieved to user phone number</p> |


### Success 200
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| token | `String` | <p>JWT token</p> |
# <a name='Wallet'></a> Wallet

## <a name='Create-wallet-contract-for-user'></a> Create wallet contract for user
[Back to top](#top)

<p>Creates wallet contract for the user</p>

```
POST api/v2/wallets/
```
### Headers
| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization | String | <p>JWT Authorization in a format &quot;Bearer {jwtToken}&quot;</p>|



### Success 200
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| Started | `Object` | <p>job data</p> |
## <a name='Create-wallet-contract-for-user-on-Ethereum'></a> Create wallet contract for user on Ethereum
[Back to top](#top)

<p>Creates wallet contract for the user on Ethereum</p>

```
POST api/v2/wallets/foreign
```
### Headers
| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization | String | <p>JWT Authorization in a format &quot;Bearer {jwtToken}&quot;</p>|



### Success 200
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| Started | `Object` | <p>job data</p> |
## <a name='Fetch-all-wallets-by-phone-number'></a> Fetch all wallets by phone number
[Back to top](#top)

<p>Fetches all wallets created by phone number</p>

```
GET api/v2/wallets/all/:phoneNumber
```
### Headers
| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization | String | <p>JWT Authorization in a format &quot;Bearer {jwtToken}&quot;</p>|



### Success 200
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| data | `Object` | <p>Array of Wallet objects</p> |
## <a name='Fetch-user-wallet'></a> Fetch user wallet
[Back to top](#top)

<p>Fetches user's wallet address</p>

```
GET api/v2/wallets/
```
### Headers
| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization | String | <p>JWT Authorization in a format &quot;Bearer {jwtToken}&quot;</p>|



### Success 200
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| data | `Object` | <p>User wallet object</p> |
## <a name='Fetch-latest-wallet-by-phone-number'></a> Fetch latest wallet by phone number
[Back to top](#top)

<p>Fetches latest wallet created by phone number</p>

```
GET api/v2/wallets/:phoneNumber
```
### Headers
| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization | String | <p>JWT Authorization in a format &quot;Bearer {jwtToken}&quot;</p>|



### Success 200
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| data | `Object` | <p>Wallet object</p> |
## <a name='Notify-server-on-client-wallet-backup'></a> Notify server on client wallet backup
[Back to top](#top)

<p>Notify the server that the client has backed up his wallet</p>

```
POST api/v2/wallets/backup
```
### Headers
| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization | String | <p>JWT Authorization in a format &quot;Bearer {jwtToken}&quot;</p>|

### Parameter Parameters
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| communityAddress | `String` | <p>community address</p> |


### Success 200
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| Started | `Object` | <p>job data</p> |
## <a name='Create-wallet-for-phone-number'></a> Create wallet for phone number
[Back to top](#top)

<p>Creates wallet contract for phone number, owned by the server until claimed by the user</p>

```
POST api/v2/wallets/invite/:phoneNumber
```
### Headers
| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization | String | <p>JWT Authorization in a format &quot;Bearer {jwtToken}&quot;</p>|

### Parameter Parameters
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| communityAddress | `String` | <p>community address</p> |


### Success 200
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| Started | `Object` | <p>job data</p> |
## <a name='Check-if-wallet-exists-by-wallet-address'></a> Check if wallet exists by wallet address
[Back to top](#top)

<p>Checks if wallet exists by wallet address</p>

```
GET api/v2/wallets/exists/:walletAddress
```
### Headers
| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization | String | <p>JWT Authorization in a format &quot;Bearer {jwtToken}&quot;</p>|



### Success 200
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| data | `Boolean` | <p>True if wallet exists, false otherwide</p> |
