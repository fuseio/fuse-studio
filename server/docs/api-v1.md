<a name="top"></a>
# Studio Backend API v0.1.0

The Fuse Studio REST API for accessing the data and the services of the Fuse network in a simple way. You can use this API to query and interact with the objects of the Fuse network such as: Communities, Tokens, Bridges and Entities. Learn more on https://github.com/fuseio/fuse-studio.

- [Bridge](#Bridge)
	- [Fetch bridge](#Fetch-bridge)
	
- [Community](#Community)
	- [Add plugins to community](#Add-plugins-to-community)
	- [](#)
	- [Fetch community](#Fetch-community)
	- [Fetch community with plugins adjusted for the specified account](#Fetch-community-with-plugins-adjusted-for-the-specified-account)
	- [Invite a user to community](#Invite-a-user-to-community)
	- [Set secondary token for the community](#Set-secondary-token-for-the-community)
	- [Update community metadata](#Update-community-metadata)
	
- [Entity](#Entity)
	- [Fetch my communities](#Fetch-my-communities)
	- [Fetch community entities](#Fetch-community-entities)
	- [Fetch entity](#Fetch-entity)
	- [Fetch entity metadata](#Fetch-entity-metadata)
	
- [Token](#Token)
	- [Adding new token](#Adding-new-token)
	- [Fetch token](#Fetch-token)
	- [Fetch tokens](#Fetch-tokens)
	- [Fetch tokens by owner](#Fetch-tokens-by-owner)
	

# <a name='Bridge'></a> Bridge

## <a name='Fetch-bridge'></a> Fetch bridge
[Back to top](#top)

<p>The token bridge connects the Ethereum and Fuse network</p>

```
GET /bridges/:homeTokenAddress
```

### Parameter Parameters
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| homeTokenAddress | `String` | <p>Home (Fuse) token address</p> |


### Success 200
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| homeTokenAddress | `String` | <p>Token address on the Fuse network</p> |
| foreignTokenAddress | `String` | <p>Token address on the Ethereum network</p> |
| foreignBridgeAddress | `String` | <p>Bridge address on the Ethereum network</p> |
| homeBridgeAddress | `String` | <p>Bridge address on the Fuse network</p> |
| homeBridgeBlockNumber | `Number` | <p>Bridge creation block number on the Fuse network</p> |
| foreignBridgeBlockNumber | `Number` | <p>Bridge creation block number on the Ethereum network</p> |
# <a name='Community'></a> Community

## <a name='Add-plugins-to-community'></a> Add plugins to community
[Back to top](#top)



```
POST /communities/:communityAddress/plugins
```

### Parameter Parameters
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| communityAddress | `String` | <p>Community address</p> |
| plugins | `Object` | <p>The plugins (with arguments)</p> |

### Param Examples
`json` - Request-Example:

```json
{
   "name": "joinBonus",
   "isActive": false
 }
```

## <a name=''></a> 
[Back to top](#top)

<p>Community is a set of contracts and services. Members of the community are users of the Fuse network. The community is configured via the plugins.</p>

```
GET /communities
```

### Parameter Parameters
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| homeTokenAddress | `String` | <p>Home token address (optional)</p> |


### Success 200
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| communityAddress | `String` | <p>Address of the community on the Fuse network</p> |
| homeTokenAddress | `String` | <p>Address of the community token on the Fuse network</p> |
| foreignTokenAddress | `String` | <p>Address of the community token on the Ethereum network</p> |
| homeBridgeAddress | `String` | <p>Address of the community bridge on the Fuse network</p> |
| foreignBridgeAddress | `String` | <p>Address of the community bridge on the Ethereum network</p> |
| isClosed | `Boolean` | <p>Is the community is closed or open. Closed community requires an approve of community admin to join.</p> |
| plugins | `Object` | <p>Defines the community plugins.</p> |
## <a name='Fetch-community'></a> Fetch community
[Back to top](#top)

<p>Community is a set of contracts and services. Members of the community are users of the Fuse network. The community is configured via the plugins.</p>

```
GET /communities/:communityAddress
```

### Parameter Parameters
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| communityAddress | `String` | <p>Community address</p> |


### Success 200
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| communityAddress | `String` | <p>Address of the community on the Fuse network</p> |
| homeTokenAddress | `String` | <p>Address of the community token on the Fuse network</p> |
| foreignTokenAddress | `String` | <p>Address of the community token on the Ethereum network</p> |
| homeBridgeAddress | `String` | <p>Address of the community bridge on the Fuse network</p> |
| foreignBridgeAddress | `String` | <p>Address of the community bridge on the Ethereum network</p> |
| isClosed | `Boolean` | <p>Is the community is closed or open. Closed community requires an approve of community admin to join.</p> |
| plugins | `Object` | <p>Defines the community plugins.</p> |
## <a name='Fetch-community-with-plugins-adjusted-for-the-specified-account'></a> Fetch community with plugins adjusted for the specified account
[Back to top](#top)

<p>Community is a set of contracts and services. Members of the community are users of the Fuse network. The community is configured via the plugins.</p>

```
GET /communities/:communityAddress
```

### Parameter Parameters
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| communityAddress | `String` | <p>Community address</p> |
| accountAddress | `String` | <p>User account address</p> |


### Success 200
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| communityAddress | `String` | <p>Address of the community on the Fuse network</p> |
| homeTokenAddress | `String` | <p>Address of the community token on the Fuse network</p> |
| foreignTokenAddress | `String` | <p>Address of the community token on the Ethereum network</p> |
| homeBridgeAddress | `String` | <p>Address of the community bridge on the Fuse network</p> |
| foreignBridgeAddress | `String` | <p>Address of the community bridge on the Ethereum network</p> |
| isClosed | `Boolean` | <p>Is the community is closed or open. Closed community requires an approve of community admin to join.</p> |
| plugins | `Object` | <p>Defines the community plugins.</p> |
## <a name='Invite-a-user-to-community'></a> Invite a user to community
[Back to top](#top)



```
POST /communities/:communityAddress/invite
```

### Parameter Parameters
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| communityAddress | `String` | <p>Community address</p> |

### Param Examples
`json` - Request-Example:

```json
{
   "phoneNumber": {{userPhoneNumber}},
}
```
`json` - Request-Example:

```json
{
   "email": {{userEmail}},
}
```

## <a name='Set-secondary-token-for-the-community'></a> Set secondary token for the community
[Back to top](#top)



```
PUT /communities/:communityAddress/secondary
```

### Parameter Parameters
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| secondaryTokenAddress | `String` | <p>Address of the secondary token</p> |
| networkType | `String` | <p>Token's network type</p> |
| tokenType | `String` | <p>Token's network type</p> |

### Param Examples
`json` - Request-Example:

```json
{
   "secondaryTokenAddress": "0xd6aab51d1343dcbee9b47e6fef8ba4469cf3dbde",
   "networkType": "fuse",
   "tokenType": "basic"
 }
```

## <a name='Update-community-metadata'></a> Update community metadata
[Back to top](#top)



```
PUT /communities/:communityAddress
```

### Parameter Parameters
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| communityAddress | `String` | <p>Community address</p> |
| community | `Object` | <p>metadata to update</p> |

### Param Examples
`json` - Request-Example:

```json
{
   "communityURI": "ipfs://hash",
 }
```

# <a name='Entity'></a> Entity

## <a name='Fetch-my-communities'></a> Fetch my communities
[Back to top](#top)

<p>Fetching communities I'm part of</p>

```
GET /communities/account/:account
```

### Parameter Parameters
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| account | `String` | <p>address</p> |


### Success 200
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| - | `Object[]` | <p>List of entities with their communities and tokens</p> |
## <a name='Fetch-community-entities'></a> Fetch community entities
[Back to top](#top)



```
GET /entities/:communityAddress
```

### Parameter Parameters
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| communityAddress | `String` | <p>Community address of the Fuse network</p> |
| page | `Number` | <p>Page number for pagination</p> |
| withMetadata | `Boolean` | <p>Get entities with entity's metadata</p> |
| search | `String` | <p>Entity's name for a search by name</p> |


### Success 200
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| - | `Object[]` | <p>List of entities. See GetEntity endpoint for entity fields</p> |
## <a name='Fetch-entity'></a> Fetch entity
[Back to top](#top)

<p>Entity is an account on the Fuse network. It can have variety of roles like user, admin, business, or custom defined role.</p>

```
GET /entities/:communityAddress/:account
```

### Parameter Parameters
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| communityAddress | `String` | <p>Community address</p> |
| account | `String` | <p>Entity's account address</p> |


### Success 200
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| account | `String` | <p>Entity's account on Fuse network</p> |
| communityAddress | `String` | <p>Community address of the entity</p> |
| uri | `String` | <p>IPFS URI points to entity's metadata</p> |
| name | `String` | <p>Entity's name</p> |
| roles | `String` | <p>Entity's role encoded as a byte array</p> |
| type | `String` | <p>Entity's type</p> |
| isAdmin | `Boolean` |  |
| isApproved | `Boolean` |  |
## <a name='Fetch-entity-metadata'></a> Fetch entity metadata
[Back to top](#top)

<p>Entity is an account on the Fuse network. It can have variety of roles like user, admin, business, or custom defined role.</p>

```
GET /entities/metadata/:communityAddress/:account
```

### Parameter Parameters
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| communityAddress | `String` | <p>Community address</p> |
| account | `String` | <p>Entity's account address</p> |


### Success 200
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| account | `String` | <p>Entity's account on Fuse network</p> |
| communityAddress | `String` | <p>Community address of the entity</p> |
| uri | `String` | <p>IPFS URI points to entity's metadata</p> |
| name | `String` | <p>Entity's name</p> |
| roles | `String` | <p>Entity's role encoded as a byte array</p> |
| type | `String` | <p>Entity's type</p> |
| isAdmin | `Boolean` |  |
| isApproved | `Boolean` |  |
# <a name='Token'></a> Token

## <a name='Adding-new-token'></a> Adding new token
[Back to top](#top)

<p>Tokens are compatible with the ERC20 standard, and they also can be burnable/mintable. Tokens are an important part of the community economy.</p>

```
GET /tokens/:address
```

### Parameter Parameters
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| address | `String` | <p>Token address to add</p> |
| networkType | `String` | <p>The network of the token (body parameter)</p> |

### Examples
Adding DAI token on mainnet:

```
POST /tokens/0x6b175474e89094c44da98b954eedeac495271d0f
body: { networkType: mainnet }
```


### Success 200
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| address | `String` | <p>Token's address</p> |
| name | `String` | <p>Token's name</p> |
| symbol | `String` | <p>Token's symbol</p> |
| tokenURI | `String` | <p>IPFS URI points to token metadata</p> |
| totalSupply | `String` | <p>Token's total supply</p> |
| owner | `String` | <p>Token's owner</p> |
| factoryAddress | `String` | <p>Factory contract that created the token</p> |
| blockNumber | `String` | <p>Block number of the token's creation</p> |
| tokenType | `String` | <p>Token type: basic/mintableBurnable/imported</p> |
| networkType | `String` | <p>Network type where the token is issued: mainnet/ropsten/fuse</p> |
## <a name='Fetch-token'></a> Fetch token
[Back to top](#top)

<p>Tokens are compatible with the ERC20 standard, and they also can be burnable/mintable. Tokens are an important part of the community economy.</p>

```
GET /tokens/:address
```

### Parameter Parameters
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| address | `String` | <p>Token address</p> |


### Success 200
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| address | `String` | <p>Token's address</p> |
| name | `String` | <p>Token's name</p> |
| symbol | `String` | <p>Token's symbol</p> |
| tokenURI | `String` | <p>IPFS URI points to token metadata</p> |
| totalSupply | `String` | <p>Token's total supply</p> |
| owner | `String` | <p>Token's owner</p> |
| factoryAddress | `String` | <p>Factory contract that created the token</p> |
| blockNumber | `String` | <p>Block number of the token's creation</p> |
| tokenType | `String` | <p>Token type: basic/mintableBurnable/imported</p> |
| networkType | `String` | <p>Network type where the token is issued: mainnet/ropsten/fuse</p> |
## <a name='Fetch-tokens'></a> Fetch tokens
[Back to top](#top)



```
GET /tokens
```

### Parameter Parameters
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| networkType | `String` | <p>mainnet/ropsten/fuse</p> |
| page | `Number` | <p>Page number for pagination</p> |


### Success 200
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| - | `Object[]` | <p>List of Tokens. See GetToken endpoint for token fields</p> |
## <a name='Fetch-tokens-by-owner'></a> Fetch tokens by owner
[Back to top](#top)



```
GET /tokens/owner/:owner
```

### Parameter Parameters
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| owner | `String` | <p>account address of the token owner</p> |
| networkType | `String` | <p>mainnet/ropsten/fuse</p> |


### Success 200
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| - | `Object[]` | <p>List of Tokens. See GetToken endpoint for token fields</p> |
