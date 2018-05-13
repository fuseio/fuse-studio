[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

# CLN Community App
Welcome to the CLN community app repo. We're building a dApp that will interact with the smart contracts of the CLN ecosystem. For now, we have a small api server that communicates with an IPFS node (because exposing an IPFS node might be unsafe) and replicates the data into mongodb.

# Install
For running locally first start a mongo daemon, then:
```
cd server
npm install
npm run dev
```

Start the client in a new tab client:
```
cd client
npm install
npm start
```

The client should connect to the Ropsten network, to do so you have several options:
- Install a MetaMask plugin
- Run a local node of the default port
- add `COMMUNITY_WEB3_PROVIDER` env variable with your specific web3 provider like Infura.

# Contributing

Please open an issue for requests, ideas or bugs.

# License
MIT
