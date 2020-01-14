<a name="top"></a>
# Studio Backend API v2.0.0

The Fuse Studio V2 REST API for accessing the data and the services of the Fuse network in a simple way. You can use this API to query and interact with the objects of the Fuse network such as: Communities, Tokens, Bridges and Entities. The backend base URL is https://studio.fuse.io. Learn more on https://github.com/fuseio/fuse-studio

- [Admin](#Admin)
	- [Burn tokens](#Burn-tokens)
	- [Mint tokens](#Mint-tokens)
	
- [Contacts](#Contacts)
	- [Acknowledge contacts list sync with nonce](#Acknowledge-contacts-list-sync-with-nonce)
	- [Sync contacts list](#Sync-contacts-list)
	
- [Jobs](#Jobs)
	- [Fetch job by id](#Fetch-job-by-id)
	
- [Login](#Login)
	- [Request a verification code](#Request-a-verification-code)
	- [Verify user phone number](#Verify-user-phone-number)
	
- [Wallet](#Wallet)
	- [Create wallet contract for user](#Create-wallet-contract-for-user)
	- [Fetch user wallet](#Fetch-user-wallet)
	- [Fetch latest wallet by phone number](#Fetch-latest-wallet-by-phone-number)
	- [Create wallet for phone number](#Create-wallet-for-phone-number)
	

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

### Examples
: Burn 1.1 tokens on Fuse network

```
POST /api/v2/admin/tokens/burn
body: { tokenAddress: '0xbAa75ecD3Ea911c78A23D7cD16961Eadc5867d2b', networkType: 'fuse', amount: '1.1' }
```


### Success 200
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| Started | `String` | <p>job data</p> |
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

### Examples
: Minting 1.1 tokens on Fuse network

```
POST /api/v2/admin/tokens/mint
body: { tokenAddress: '0xbAa75ecD3Ea911c78A23D7cD16961Eadc5867d2b', networkType: 'fuse', amount: '1.1' }
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
| data | `Object` | <p>User wallet object</p> |
# <a name='Login'></a> Login

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
| User | `accountAddress` | <p>account address</p> |
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
| response | `String` | <p>Response status - ok</p> |
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
| response | `String` | <p>Response status - ok</p> |
