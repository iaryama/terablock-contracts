var TeraBlockToken = artifacts.require("TeraBlockToken")
var ERC20Old = artifacts.require("ERC20Old")
const Swap = artifacts.require("Swap")
module.exports = async function (deployer, network, accounts) {
    await deployer.deploy(TeraBlockToken)
    await deployer.deploy(ERC20Old)
    await deployer.deploy(Swap, ERC20Old.address, TeraBlockToken.address)
}
