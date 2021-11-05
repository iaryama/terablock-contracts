var TeraBlockToken = artifacts.require("TeraBlockToken")
var OldToken = artifacts.require("MultiCoinChild")
const Swap = artifacts.require("Swap")
module.exports = async function (deployer, network, accounts) {
    await deployer.deploy(TeraBlockToken)
    await deployer.deploy(OldToken, 1000)
    await deployer.deploy(Swap, OldToken.address, TeraBlockToken.address)
}
