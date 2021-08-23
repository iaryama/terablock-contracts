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
        },
        bsc_mainnet: {
            provider: () =>
                new HDWalletProvider({
                    privateKeys: [process.env.PRIVATE_KEY],
                    providerOrUrl: "https://bsc-dataseed.binance.org/",
                    addressIndex: 0,
                }),
            network_id: "80001",
        },
        ethereum_mainnet: {
            provider: () =>
                new HDWalletProvider({
                    privateKeys: [process.env.PRIVATE_KEY],
                    providerOrUrl: `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
                    addressIndex: 0,
                }),
            network_id: "1",
        },
        rinkeby_testnet: {
            provider: () =>
                new HDWalletProvider({
                    privateKeys: [process.env.PRIVATE_KEY],
                    providerOrUrl: `https://rinkeby.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
                    addressIndex: 0,
                }),
            network_id: "4",
            networkCheckTimeout: 2000000,
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
        etherscan: "66G55FZP3P12NBT6BBR5U5ADCVX53QRGZP",
        bscscan: "MY_API_KEY",
    },
}
