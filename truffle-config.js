const HDWalletProvider = require("@truffle/hdwallet-provider")
require("dotenv").config()

module.exports = {
    networks: {
        // development: {
        //     host: "127.0.0.1",
        //     port: 7545,
        //     network_id: "*", // Match any network id
        // },
        // test: {
        //     host: "127.0.0.1",
        //     port: 7545,
        //     network_id: "*", // Match any network id
        // },
        mumbai_testnet: {
            provider: () =>
                new HDWalletProvider({
                    privateKeys: [process.env.PRIVATE_KEY],
                    providerOrUrl: `https://rpc-mumbai.maticvigil.com`,
                    addressIndex: 0,
                }),
            network_id: "80001",
        },
        matic_mainnet: {
            provider: () =>
                new HDWalletProvider({
                    privateKeys: [process.env.PRIVATE_KEY],
                    providerOrUrl: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
                    addressIndex: 0,
                }),
            network_id: "137",
        },
        bsc_testnet: {
            provider: () =>
                new HDWalletProvider({
                    privateKeys: [process.env.PRIVATE_KEY],
                    providerOrUrl: `https://data-seed-prebsc-1-s1.binance.org:8545/`,
                    addressIndex: 0,
                }),
            network_id: "97",
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
}
