// @ts-nocheck
require('@nomiclabs/hardhat-waffle');
require('hardhat-deploy');
require('hardhat-deploy-ethers');
require('solidity-coverage');
require('@nomiclabs/hardhat-etherscan');
require('hardhat-abi-exporter');
require('hardhat-gas-reporter');

const customTestnetAccounts = {
  deployer: '<add-deployer-address>', // Account 0
  admin: '<add-admin-address>', // Account 1,
  testnetUserA: '<add-testnetUserA-address>', // Account 3
  testnetUserB: '<add-testnetUserB-address>', // Account 4
  testnetUserC: '<add-testnetUserC-address>', // Account 3
};

const networks = {
  coverage: {
    url: 'http://127.0.0.1:8555',
    blockGasLimit: 200000000,
    allowUnlimitedContractSize: true,
  },
  localhost: {
    chainId: 31337,
    url: 'http://127.0.0.1:8545',
    allowUnlimitedContractSize: true,
    timeout: 1000 * 60,
  },
};

if (process.env.ALCHEMY_URL && process.env.FORK_ENABLED) {
  networks.hardhat = {
    allowUnlimitedContractSize: true,
    chainId: 1,
    forking: {
      url: process.env.ALCHEMY_URL,
    },
    accounts: {
      mnemonic: process.env.HDWALLET_MNEMONIC,
    },
  };
} else {
  networks.hardhat = {
    allowUnlimitedContractSize: true,
  };
}

if (process.env.INFURA_API_KEY && process.env.HDWALLET_MNEMONIC) {
  networks.rinkeby = {
    url: `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
    accounts: {
      mnemonic: process.env.HDWALLET_MNEMONIC,
    },
  };

  networks.mainnet = {
    url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
    accounts: {
      mnemonic: process.env.HDWALLET_MNEMONIC,
    },
  };

  networks.goerli = {
    url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
    accounts: {
      mnemonic: process.env.HDWALLET_MNEMONIC,
    },
  };
} else {
  console.warn('No infura or hdwallet available for testnets');
}

const optimizerEnabled = !process.env.OPTIMIZER_DISABLED;

const config = {
  solidity: {
    version: '0.8.17',
    settings: {
      optimizer: {
        enabled: optimizerEnabled,
        runs: 200,
      },
      evmVersion: 'istanbul',
    },
  },
  networks,
  gasReporter: {
    currency: 'ETH',
    gasPrice: 100,
    enabled: process.env.REPORT_GAS ? true : false,
    coinmarketcap: process.env.COINMARKETCAP_TOKEN,
  },
  namedAccounts: {
    deployer: {
      default: 0,
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
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  mocha: {
    timeout: 30000,
  },
  abiExporter: {
    path: './abis',
    clear: true,
    flat: true,
  },
};

module.exports = config;
