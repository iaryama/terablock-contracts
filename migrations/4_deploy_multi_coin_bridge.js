var TeraBlockBridge = artifacts.require("TeraBlockBridge")
var TeraBlockToken = artifacts.require("TeraBlockToken")
var MultiCoin = artifacts.require("MultiCoin")
var MultiCoinLock = artifacts.require("MultiCoinLock")
module.exports = async function (deployer, network, accounts) {
    if (network == "ethereum_mainnet" || network == "rinkeby_testnet") {
        await deployer.deploy(TeraBlockToken)
        await deployer.deploy(TeraBlockBridge, TeraBlockToken.address)
    } else if (network == "bsc_mainnet" || network == "bsc_testnet") {
        await deployer.deploy(MultiCoin)
        await deployer.deploy(MultiCoinLock, MultiCoin.address)
    } else {
        return
    }
}
