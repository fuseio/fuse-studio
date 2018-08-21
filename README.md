[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

# CLN Community App
Welcome to the CLN community app repo. We're building a dApp that will interact with the smart contracts of the CLN ecosystem. For now, we have a small api server that communicates with an IPFS node (because exposing an IPFS node might be unsafe) and replicates the data into mongodb.

# Develop


## With Docker

copy the confige file and start the docker compose:

```
cp .env.dist .env
docker network create cln-community
docker-compose up -d
```

the `.env.dist` is the config template while `.env` is the actual file used for environment variables. The `.env` is gitignored so fill free to tweak it.

Then open [localhost:9000](localhost:9000) in your browser. The IPFS node needs time to sync, so for the first time part of the data may not be fetched on time. Refresh the browser if this is the case.

### Frontend Development

For the best experience, stop the client docker container and start it natively as described [here](#setup-client).

## Without Docker

### Setup database

Start a mongodb daemon with default settings.

### Setup IPFS node

Start a IPFS daemon with default settings.

```
ipfs daemon
```

Then define following environment variables for the server's shell
```
export COMMUNITY_IPFS_HOST=127.0.0.1
export COMMUNITY_IPFS_PORT=5001
export COMMUNITY_IPFS_PROTOCOL=http
```

### Setup Ethereum node

You can skip this step if you will use MeteMask or Mist to browser the DApp.

Otherwise, run an ethereum node, for example:

```
geth --testnet  --rpc --rpcapi="db,eth,net,web3,personal,web3"
```

Then export its HTTP enpoint as `COMMUNITY_WEB3_PROVIDER` variable:

```
export COMMUNITY_WEB3_PROVIDER=http://127.0.0.1:8545
```

### Setup Server

`cd` to project's directory, then:

```
cd server
npm install
npm run dev
```

### Setup client

Load the relevant environment variables from the [.env](.env.dist) file.

`cd` to project's directory, then:
```
cd client
npm install
npm start
```

If your browser has an MetaMask extension, that should be enought.


### Other configs
Take a look into [server/config](server/config) directory.

# Contributing

Please open an issue for requests, ideas or bugs.

# License
MIT
