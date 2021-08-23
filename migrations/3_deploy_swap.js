var EthTeraToken = artifacts.require("EthTeraToken")
var ERC20Old = artifacts.require("ERC20Old")
const Swap = artifacts.require("Swap")
module.exports = async function (deployer, network, accounts) {
    if (network == "rinkeby_testnet" || network == "ethereum_mainnet" || network == "development") {
        await deployer.deploy(EthTeraToken)
        await deployer.deploy(ERC20Old)
        await deployer.deploy(Swap, ERC20Old.address, EthTeraToken.address)
    } else {
        return
    }
}
