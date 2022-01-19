// @ts-nocheck
const networks = {
    coverage: {
        url: 'http://127.0.0.1:8555',
        blockGasLimit: 200000000,
        allowUnlimitedContractSize: true
    },
    localhost: {
        chainId: 31337,
        url: 'http://127.0.0.1:8545',
        allowUnlimitedContractSize: true,
        timeout: 1000 * 60
    }
}

if (process.env.ALCHEMY_URL && process.env.FORK_ENABLED) {
    networks.hardhat = {
        allowUnlimitedContractSize: true,
        chainId: 1,
        forking: {
            url: process.env.ALCHEMY_URL
        },
        accounts: {
            mnemonic: process.env.HDWALLET_MNEMONIC
        }
    }
} else {
    networks.hardhat = {
        allowUnlimitedContractSize: true
    }
}

if (process.env.INFURA_API_KEY && process.env.HDWALLET_MNEMONIC) {
    networks.rinkeby = {
        url: `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
        accounts: {
            mnemonic: process.env.HDWALLET_MNEMONIC
        }
    }

    networks.mainnet = {
        url: process.env.ALCHEMY_URL,
        accounts: {
            mnemonic: process.env.HDWALLET_MNEMONIC
        }
    }
} else {
    console.warn('No infura or hdwallet available for testnets')
}

module.exports = networks