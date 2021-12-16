const HDWalletProvider = require("@truffle/hdwallet-provider")
require("dotenv").config()

module.exports = {
    networks: {
        development: {
            host: "127.0.0.1",
            port: 8545,
            network_id: "*", // Match any network id
        },
        bsc_testnet: {
            provider: () =>
                new HDWalletProvider({
                    privateKeys: [process.env.PRIVATE_KEY],
                    providerOrUrl: `https://data-seed-prebsc-1-s1.binance.org:8545/`,
                    addressIndex: 0,
                }),
            network_id: "97",
            skipDryRun: true,
            networkCheckTimeout: 20000,
        },
        bsc_mainnet: {
            provider: () =>
                new HDWalletProvider({
                    privateKeys: [process.env.PRIVATE_KEY],
                    providerOrUrl: "https://bsc-dataseed.binance.org/",
                    addressIndex: 0,
                }),
            network_id: "56",
            skipDryRun: true,
        },
        ethereum_mainnet: {
            provider: () =>
                new HDWalletProvider({
                    privateKeys: [process.env.PRIVATE_KEY],
                    providerOrUrl: `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
                    addressIndex: 0,
                }),
            network_id: "1",
            skipDryRun: true,
        },
        rinkeby: {
            provider: () =>
                new HDWalletProvider({
                    privateKeys: [process.env.PRIVATE_KEY],
                    providerOrUrl: `https://rinkeby.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
                    addressIndex: 0,
                }),
            network_id: "4",
            skipDryRun: true,
            networkCheckTimeout: 10000,
            timeoutBlocks: 200,
        },
    },
    solc: {
        optimizer: {
            enabled: true,
            runs: 200,
        },
    },
    compilers: {
        solc: {
            version: "0.6.12",
        },
    },
    plugins: ["truffle-plugin-verify"],
    api_keys: {
        etherscan: process.env.ETHERSCAN_API_KEY,
        bscscan: process.env.BSCSCAN_API_KEY,
    },
}
