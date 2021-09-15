var TeraBlockBridge = artifacts.require("TeraBlockBridge")
var TeraBlockToken = artifacts.require("TeraBlockToken")
module.exports = async function (deployer, network, accounts) {
    await deployer.deploy(TeraBlockToken)
    await deployer.deploy(TeraBlockBridge, TeraBlockToken.address)
}
