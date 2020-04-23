# Create a `fuse` only community for an existing token

In order to create a community on `fuse` which will work in the mobile wallet, we need the following:

1. upload image & cover photo to ipfs
2. create community metadata on ipfs
3. create community on blockchain and DB
4. register the existing token to the graph

### Upload image to IPFS
This step should be done for both image & cover photo

##### request
`POST https://studio.fuse.io/api/v1/images`

`content-type: multipart/form-data`

```
name: "image"
value: "<selected image file>"
```

##### response
```
{
  "hash": "QmSPCrxQWNTYLAZYBwNXEYCa8TAREt1NLfRycAYphNEMRE"
}
```

### Create community metadata on ipfs
This step should be done using previous step results (hashes)

##### request
`POST https://studio.fuse.io/api/v1/metadata`

`content-type: application/json`

```
{
"metadata": {
		"coverPhoto": "QmSPCrxQWNTYLAZYBwNXEYCa8TAREt1NLfRycAYphNEMRE",
		"image": "QmPBFyz8DYQyqT5CB5NfpyhE4o6uC5ePutrEuV5FpjXLD9"
	}
}
```

##### response
```
{
  "createdAt": "2020-04-21T08:39:08.313Z",
  "updatedAt": "2020-04-21T08:39:08.313Z",
  "hash": "QmZRE4B4e7Rg96Dmq2L6goqiaLtnTVMLW6u81rG4uQW2ia",
  "data": {
    "coverPhoto": "QmSPCrxQWNTYLAZYBwNXEYCa8TAREt1NLfRycAYphNEMRE",
    "image": "QmPBFyz8DYQyqT5CB5NfpyhE4o6uC5ePutrEuV5FpjXLD9"
  }
}
```

### Create community on blockchain and DB
##### request
`POST https://studio.fuse.io/api/v1/deployments`

`content-type: application/json`

```
{
  "steps": {
    "community": {
      "args": {
        "isClosed": false,
        "name": "<community name>",
        "adminAddress": "<admin account address>",
		 "communityURI": "ipfs://<community metadata hash from previous section>",
		 "homeTokenAddress": "<token address on fuse>"
      }
    }
  }
}
```

##### response
```
{
  "data": {
    "_id": "5e9eb4b4f946de001c2f8228",
    "steps": {
      "community": {
        "args": {
          "isClosed": false,
        	"name": "<community name>",
        	"adminAddress": "<admin account address>",
		 	"communityURI": "ipfs://<community metadata hash from previous section>",
		 	"homeTokenAddress": "<token address on fuse>"
        }
      }
    },
    "createdAt": "2020-04-21T08:54:12.361Z",
    "updatedAt": "2020-04-21T08:54:12.361Z"
  }
}
```

A `deploy` job will be created in the DB table `agendaJobs` and once complete the `communityAddress` can be found on the job data.
You can find the community in the `communities` table in the DB as well as on the [graph](https://graph.fuse.io/subgraphs/name/fuseio/fuse/graphql) using the query:

```
{
  communities (where: {name:"<community name>"}) {
    id
    address
    name
  }
}
```

### Register the existing token to the graph
Call `registerToken(address _community, address _token)` on the `CommunityFactoryV2` contract from its owner account (which is the multiple-bridge owner account) using the following data:

```
4739f7e5000000000000000000000000<community address>000000000000000000000000<token address>
```

After the tranacaction is successful the token can be found on the [graph](https://graph.fuse.io/subgraphs/name/fuseio/fuse/graphql) using the query:

```
{
  tokens (where: {address:"<token address>"}){
    id
    address
    name
  }
}
```
