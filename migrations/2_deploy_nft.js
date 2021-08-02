const TeraNFT = artifacts.require("TeraNFT")

module.exports = function (deployer) {
    deployer.deploy(TeraNFT)
}
