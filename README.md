[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

# Fuse Studio
Fuse Studio is a DApp running on the Ethereum and Fuse networks. Via the DApp you can access to the contracts and the services of the Fuse network. You can launch your DeFi community on the Fuse network with a token bridged to Ethereum. The community is upgraded by a variety of plugins that customize the community to your needs.  It allows you to:
- Add to your community users, business, admins and more tailor made roles
- Define transfer and bonus rules for the community members
- Make bounties (soon to come)
- You can your own plugins (soon to come)

The logic is defined by EVM compatible smart contracts and backend services that listen to the events on the blockchain. We prefer to use the Fuse chain for fast and cheap transactions, but some significant events are neccesery to happen on the Ethereum network, as a gateway to the whole ecosystem. We do not own user private data, it is controlled by the user itself via 3box and stored in IPFS.

# Backend Infrastructure
The backend is composed of the following independent services
- Studio API Backend have two purposes. Provides an API for fast and convinient queriying of the blockchain data for the Studio DApp. Transmists heavy and complicated transaction flows on behalf of the user.
- Fuse-funder service used to fund community members and wallet users on the Fuse blockchain.
- Fuse ipfs proxy used for fast fetching and storing data in IPFS.

# Contracts
Fuse studio is aimed to launch DeFi communities on Fuse network. The community contract binds together most of the services and features of the Studio. Among other things it consists of:
- Entities List contract to store community members and their roles
- Community ERC20 token on Fuse network with transfer rules
- ERC20 token on Ethereum. That's the token that the user issues part of the community deploy process
- [Multitoken bridge](https://docs.fuse.io/docs/developers/important-smart-contracts/major-deployed-contracts) - to minimize friction and costs we extended the POA ERC20-ERC20 bridge contract to many-ERC20-to-many contract.

# Plugins
The plugins are used to customise the community to your special needs. They can be smart contracts, backend services or the integration of two. The available plugins now are:
- Business list - allows you to add businesses to you community. Businesses are entities list members with special role.
- Join bonus - new community members will receive a join bonus.

# Contributing

Please open an issue for requests, ideas or bugs.

# License
MIT
