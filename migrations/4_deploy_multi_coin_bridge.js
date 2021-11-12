var MultiCoin = artifacts.require("MultiCoin")
var MultiCoinLock = artifacts.require("MultiCoinLock")
module.exports = async function (deployer, network, accounts) {
    await deployer.deploy(MultiCoin, web3.utils.toWei("10000000", "ether"))
    await deployer.deploy(MultiCoinLock, MultiCoin.address)
}
