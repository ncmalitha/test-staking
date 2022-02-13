require('babel-register');
require('babel-polyfill');
require('dotenv').config();
const HDWalletProvider = require("@truffle/hdwallet-provider");

console.log(process.env.MNEMONIC);
console.log(process.env.INFURA_API_KEY);

module.exports = {
  mocha: {
    enableTimeouts: false,
    before_timeout: 120000
  },
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    goerli: {
      provider: function() {
        return new HDWalletProvider(process.env.MNEMONIC, "wss://goerli.infura.io/ws/v3/" + process.env.INFURA_API_KEY)
      },
      network_id: 5
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(process.env.MNEMONIC, "wss://ropsten.infura.io/ws/v3/" + process.env.INFURA_API_KEY)
      },
      network_id: 3
    }
  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      version:"^0.8.0",
      optimizer: {
        enabled: true,
        runs: 200
      },
      evmVersion: "petersburg"
    }
  }
}
