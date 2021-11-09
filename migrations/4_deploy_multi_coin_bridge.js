var MultiCoin = artifacts.require("MultiCoin")
var MultiCoinLock = artifacts.require("MultiCoinLock")
module.exports = async function (deployer, network, accounts) {
    await deployer.deploy(MultiCoin)
    await deployer.deploy(MultiCoinLock, MultiCoin.address)
}
