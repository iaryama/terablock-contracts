var TeraToken = artifacts.require("TeraToken")
var TeraLock = artifacts.require("TeraLock")
var EthTeraToken = artifacts.require("EthTeraToken")

module.exports = async function (deployer, network, accounts) {
    if (network == "bsc_testnet" || network == "bsc_mainnet") {
        await deployer.deploy(TeraToken)
        await deployer.deploy(TeraLock, TeraToken.address)
    } else if (network == "matic_mainnet" || network == "mumbai_testnet") {
        await deployer.deploy(EthTeraToken)
    } else if (network == "development") {
        await deployer.deploy(TeraToken)
        await deployer.deploy(TeraLock, TeraToken.address)
        await deployer.deploy(EthTeraToken)
    } else {
        return
    }
}
