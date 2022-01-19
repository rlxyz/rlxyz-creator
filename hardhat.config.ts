const networks = require('./hardhat.networks')

require("@nomiclabs/hardhat-waffle");
require('hardhat-deploy')
require('hardhat-deploy-ethers')
require('solidity-coverage')
require("@nomiclabs/hardhat-etherscan")
require('hardhat-abi-exporter')
require("hardhat-gas-reporter");

const customTestnetAccounts = {
  deployer: "0xe78AB0C30856b4F82d73Fc3411a9860A8ff5c57B", // Account 0
  admin: '0xe693cb9ca5ec4b2f6a4111ae53308bef811e9e3e', // Account 1,
  testnetUserA: '0x2976134d99b6C9AC1bC8D6407F07B31c9247c230', // Account 3
  testnetUserB: '0x1e33eDFd7BB11eA57Cc8E2Bd7547cCFEf8F21e6F', // Account 4
  testnetUserC: '0x36e1d0A149b5aB87C74E91CBd4903Fef709421c6', // Account 3
}

const optimizerEnabled = !process.env.OPTIMIZER_DISABLED

const config = {
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: optimizerEnabled,
        runs: 200
      },
      evmVersion: "istanbul"
    }
  },
  networks,
  gasReporter: {
    currency: 'ETH',
    gasPrice: 100,
    enabled: (process.env.REPORT_GAS) ? true : false,
    coinmarketcap: process.env.COINMARKETCAP_TOKEN
  },
  namedAccounts: {
    deployer: {
      default: 0
    },
    admin: {
      default: 1,
      4: customTestnetAccounts.admin,
    },
    testnetUserA: {
      default: 2,
      4: customTestnetAccounts.testnetUserA,
    },
    testnetUserB: {
      default: 3,
      4: customTestnetAccounts.testnetUserB,
    },
    testnetUserC: {
      default: 4,
      4: customTestnetAccounts.testnetUserC,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  mocha: {
    timeout: 30000
  },
  abiExporter: {
    path: './abis',
    clear: true,
    flat: true
  }
};

module.exports = config