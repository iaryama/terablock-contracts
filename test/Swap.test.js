const Swap = artifacts.require("Swap")
const ERC20Old = artifacts.require("ERC20Old")
const ERC20New = artifacts.require("ERC20New")
const truffleAssert = require("truffle-assertions")

contract("Swap contract tests", async (accounts) => {
    let oldToken, newToken, swap
    beforeEach(async () => {
        oldToken = await ERC20Old.new()
        newToken = await ERC20New.new()
        swap = await Swap.new(oldToken.address, newToken.address)
        await newToken.mint(swap.address, 1000)
        await oldToken.mint(accounts[0], 1000)
        await oldToken.approve(swap.address, 1000)
    })
    it("correctly deploys with token addresses", async () => {
        assert.equal(await swap.oldToken(), oldToken.address)
        assert.equal(await swap.newToken(), newToken.address)
    })
    it("throws on deploying with incorrect token addresses", async () => {
        await truffleAssert.reverts(Swap.new(oldToken.address, oldToken.address), "wrong token addresses")
        const ZERO_ADDRESS = "0x".padEnd(42, "0")
        await truffleAssert.reverts(Swap.new(oldToken.address, ZERO_ADDRESS), "wrong token addresses")
    })
    it("swaps", async () => {
        assert.equal(await oldToken.balanceOf(accounts[0]), 1000)
        assert.equal(await newToken.balanceOf(accounts[0]), 0)
        assert.equal(await newToken.balanceOf(swap.address), 1000)
        await swap.swapTokens(1000)
        assert.equal(await newToken.balanceOf(accounts[0]), 1000)
        assert.equal(await newToken.balanceOf(swap.address), 0)
    })
    it("withdraws oldTokens from contract", async () => {
        await swap.swapTokens(1000)
        assert.equal(await oldToken.balanceOf(accounts[0]), 0)
        await swap.withdrawTokens()
        assert.equal(await oldToken.balanceOf(accounts[0]), 1000)
    })
})
