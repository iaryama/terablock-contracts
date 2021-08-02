var TeraToken = artifacts.require("TeraToken")
var TeraLock = artifacts.require("TeraLock")
var PolygonTeraToken = artifacts.require("PolygonTeraToken")

module.exports = async function (deployer, network, accounts) {
    if (network == "bsc_testnet" || network == "bsc_mainnet") {
        await deployer.deploy(TeraToken)
        await deployer.deploy(TeraLock, TeraToken.address)
    } else if (network == "matic_mainnet" || network == "mumbai_testnet") {
        await deployer.deploy(PolygonTeraToken)
    } else if (network == "development") {
        await deployer.deploy(TeraToken)
        await deployer.deploy(TeraLock, TeraToken.address)
        await deployer.deploy(PolygonTeraToken)
    } else {
        return
    }
}
