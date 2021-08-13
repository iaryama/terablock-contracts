var ERC20New = artifacts.require("ERC20New")
var ERC20Old = artifacts.require("ERC20Old")
const Swap = artifacts.require("Swap")
module.exports = async function (deployer, network, accounts) {
    await deployer.deploy(ERC20New)
    await deployer.deploy(ERC20Old)
    await deployer.deploy(Swap, ERC20Old.address, ERC20New.address)
    await deployer.deploy(TeraToken)
    await deployer.deploy(TeraLock, TeraToken.address)
    await deployer.deploy(EthTeraToken)
}
