const HDWalletProvider = require('truffle-hdwallet-provider')

const createProvider = (rpcUrl) => {
  if (process.env.MNEMONIC) {
    return new HDWalletProvider(process.env.MNEMONIC, rpcUrl)
  } else if (process.env.PRIVATE_KEY) {
    return new HDWalletProvider(process.env.PRIVATE_KEY, rpcUrl)
  }
}

module.exports = {
  /**
   * Networks define how you connect to your ethereum client and let you set the
   * defaults web3 uses to send transactions. If you don't specify one truffle
   * will spin up a development blockchain for you on port 9545 when you
   * run `develop` or `test`. You can ask a truffle command to use a specific
   * network from the command line, e.g
   *
   * $ truffle test --network <network-name>
   */

  networks: {
    // Useful for testing. The `development` name is special - truffle uses it by default
    // if it's defined here and no other network is specified at the command line.
    // You should run a client (like ganache-cli, geth or parity) in a separate terminal
    // tab if you use this network and you must also set the `host`, `port` and `network_id`
    // options below to some value.
    //
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*'
    },

    fuse: {
      provider: () => createProvider('http://rpc.fuse.io'),
      network_id: '*',
      gas: 6721975,
      gasPrice: 1000000000
    }
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: '0.4.24',
      // docker: true,
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      //  evmVersion: "byzantium"
      }
    }
  }
}
