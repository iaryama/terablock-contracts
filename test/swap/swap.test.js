const Swap = artifacts.require("Swap")
const ERC20Old = artifacts.require("ERC20Old")
const EthTeraToken = artifacts.require("EthTeraToken")
const truffleAssert = require("truffle-assertions")

contract("Swap contract tests", async (accounts) => {
    let oldToken, newToken, swap
    beforeEach(async () => {
        oldToken = await ERC20Old.new()
        newToken = await EthTeraToken.new()
        swap = await Swap.new(oldToken.address, newToken.address)
        await newToken.mint(swap.address, 1000)
        await oldToken.mint(accounts[0], 1000)
        await oldToken.approve(swap.address, 1000)
    })
    it("correctly deploys with token addresses", async () => {
        assert.equal(await swap.oldToken(), oldToken.address)
        assert.equal(await swap.newToken(), newToken.address)
    })
    it("swaps", async () => {
        console.log(await oldToken.balanceOf(accounts[0]))
        assert.equal(await oldToken.balanceOf(accounts[0]), 1000)
        assert.equal(await newToken.balanceOf(accounts[0]), 0)
        assert.equal(await newToken.balanceOf(swap.address), 1000)
        // swap
        await swap.swapTokens(1000)
        //
        assert.equal(await newToken.balanceOf(accounts[0]), 1000)
        assert.equal(await newToken.balanceOf(swap.address), 0)
    })
    it("withdraws any tokens from contract", async () => {
        await swap.swapTokens(1000)
        assert.equal(await oldToken.balanceOf(accounts[0]), 0)
        await swap.withdrawTokens(oldToken.address)
        assert.equal(await oldToken.balanceOf(accounts[0]), 1000)
    })
    describe("Error testing", async () => {
        it("throws on deploying with incorrect token addresses", async () => {
            await truffleAssert.reverts(Swap.new(oldToken.address, oldToken.address), "wrong token addresses")
            const ZERO_ADDRESS = "0x".padEnd(42, "0")
            await truffleAssert.reverts(Swap.new(oldToken.address, ZERO_ADDRESS), "wrong token addresses")
        })
        it("throws if insufficient oldToken balance of user", async () => {
            await truffleAssert.reverts(swap.swapTokens(1001), "ERC20: transfer amount exceeds balance")
        })
        it("throws if insufficient newTokens in the contract", async () => {
            // mint extra 1000 tokens so new balance 2000
            await oldToken.mint(accounts[0], 1000)
            await oldToken.approve(swap.address, 2000)
            // reverts because contract holds only 1000 `newTokens`
            await truffleAssert.reverts(swap.swapTokens(1001), "ERC20: transfer amount exceeds balance")
        })

        it("throws if non-owner tries to withdraw", async () => {
            await swap.swapTokens(1000)
            await truffleAssert.reverts(
                swap.withdrawTokens(oldToken.address, { from: accounts[1] }),
                "Ownable: caller is not the owner"
            )
        })
    })
})
