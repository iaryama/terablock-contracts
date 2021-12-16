const SPSGameLock = artifacts.require("SPSGameLock")
const SPS = artifacts.require("SPS")
module.exports = async function (deployer, network, accounts) {
    const sps = await SPS.new()
    console.log("SPS deployed", sps.address)

    const lock = await SPSGameLock.new("0x5B6B2Ddb609412F9E5dEF8773Cda1393F2D47A07")
    console.log("SPSGameLock deployed", lock.address)

    await sps.transfer(lock.address, "100000000".padEnd(27, "0")) // 100M liquidity
}
