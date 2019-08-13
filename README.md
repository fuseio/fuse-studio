[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

# Fuse Studio DApp
Welcome to the Fuse Studio DApp repo. We're building a DApp that will interact with the smart contracts of the Fuse ecosystem. For now, we have a small api server that communicates with an IPFS node (because exposing an IPFS node might be unsafe) and replicates the data into mongodb.

# Develop


## With Docker

copy the confige file and start the docker compose:

```
cp .env.dist .env
docker network create fuse-studio
docker-compose up -d
```

the `.env.dist` is the config template while `.env` is the actual file used for environment variables. The `.env` is gitignored so fill free to tweak it.

Then open [localhost:9000](localhost:9000) in your browser. The IPFS node needs time to sync, so for the first time part of the data may not be fetched on time. Refresh the browser if this is the case.

### Frontend Development

For the best experience, stop the client docker container and start it natively as described [here](#setup-client).

## Without Docker

### dependencies

- [mongoDB](https://www.mongodb.com/)
- [ipfs](https://ipfs.io/docs/install/)

Optional:
- [geth](https://ethereum.gitbooks.io/frontier-guide/content/getting_a_client.html)

### Setup database

Start a mongodb daemon with default settings.

### Setup IPFS node

Start a IPFS daemon with default settings.

```
ipfs daemon
```

Then define following environment variables for the server's shell
```
cp ./server/config/defaults.json ./server/config/local.json
```
You can edit the `./server/config/local.json` file as you like.

### Setup IPFS proxy

IPFS lacks permissions so all access to the IPFS node is done through the IPFS proxy.

Learn how to install and configure the proxy in the [fuse-ipfs-proxy](https://github.com/fuseio/fuse-ipfs-proxy) repo.

### Setup Ethereum node (Optional)

You can start your own Ethereum node:

```
geth --testnet  --rpc --rpcapi="db,eth,net,web3,personal,web3"
```

Or use Infura (or other provider) as your provider, just change it in the config file (`./server/config/local.json`)

### Setup Server

`cd` to project's directory, then:

```
cd server
npm install
npm run dev --NODE_ENV=local
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

## Fast frontend track

If you plan to work only on the frontend you can use our QA servers as a backend infrastucture. For this setup just run:

```
cd client
npm install
NODE_ENV=QA npm start
```

Though you still need a web3 provider like [MetaMask](https://metamask.io/).

# Contributing

Please open an issue for requests, ideas or bugs.

# License
MIT
