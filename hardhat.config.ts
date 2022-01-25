const networks = require('./hardhat.networks')

require("@nomiclabs/hardhat-waffle");
require('hardhat-deploy')
require('hardhat-deploy-ethers')
require('solidity-coverage')
require("@nomiclabs/hardhat-etherscan")
require('hardhat-abi-exporter')
require("hardhat-gas-reporter");

const customTestnetAccounts = {
  deployer: "<add-deployer-address>", // Account 0
  admin: '<add-admin-address>', // Account 1,
  testnetUserA: '<add-testnetUserA-address>', // Account 3
  testnetUserB: '<add-testnetUserB-address>', // Account 4
  testnetUserC: '<add-testnetUserC-address>', // Account 3
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
