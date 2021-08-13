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
        bsc_testnet: {
            provider: () =>
                new HDWalletProvider(
                    process.env["MNEMONIC"] || "",
                    "https://data-seed-prebsc-2-s1.binance.org:8545/"
                ),
            network_id: "97",
        },
        rinkeby: {
            provider: () => {
                return new HDWalletProvider(
                    process.env["MNEMONIC"] || "",
                    process.env["RINKEBY_ENDPOINT"] || ""
                )
            },
            network_id: "4",
        },
    },
    plugins: ["truffle-plugin-verify"],
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
    api_keys: {
        etherscan: "66G55FZP3P12NBT6BBR5U5ADCVX53QRGZP",
    },
}
