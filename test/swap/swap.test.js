const Swap = artifacts.require("Swap")
const MultiCoin = artifacts.require("MultiCoin")
const TeraBlockToken = artifacts.require("TeraBlockToken")
const truffleAssert = require("truffle-assertions")

contract("Swap contract tests", async (accounts) => {
    let oldToken, newToken, swap
    beforeEach(async () => {
        oldToken = await MultiCoin.new(1000)
        newToken = await TeraBlockToken.new()
        swap = await Swap.new(oldToken.address, newToken.address)
        await newToken.mint(swap.address, 1000)
        await oldToken.approve(swap.address, 1000)
    })
    it("correctly deploys with token addresses", async () => {
        assert.equal(await swap.oldToken(), oldToken.address)
        assert.equal(await swap.newToken(), newToken.address)
    })
    it("swaps", async () => {
        assert.equal(await oldToken.balanceOf(accounts[0]), 1000)
        assert.equal(await newToken.balanceOf(accounts[0]), 0)
        assert.equal(await newToken.balanceOf(swap.address), 1000)
        // swap
        await swap.swapTokens(1000)
        //
        assert.equal(await newToken.balanceOf(accounts[0]), 1000)
        assert.equal(await newToken.balanceOf(swap.address), 0)
    })
    it("burns old tokens during the swap", async () => {
        await swap.swapTokens(1000)
        assert.equal(await oldToken.balanceOf(swap.address), 0)
    })
    it("withdraws any stuck IERC20 tokens from contract", async () => {
        await oldToken.transfer(swap.address, 1000) // tokens stuck in contract
        assert.equal(await oldToken.balanceOf(accounts[0]), 0)
        await swap.withdrawTokens(oldToken.address) // tokens withdrawn
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
            await oldToken.approve(swap.address, 2000)
            // reverts because contract holds only 1000 `newTokens`
            await truffleAssert.reverts(swap.swapTokens(1001), "ERC20: transfer amount exceeds balance")
        })
        it("throws if non-owner tries to withdraw", async () => {
            await oldToken.transfer(swap.address, 1000) // tokens stuck in contract
            assert.equal(await oldToken.balanceOf(accounts[0]), 0)
            await truffleAssert.reverts(
                swap.withdrawTokens(oldToken.address, { from: accounts[1] }),
                "Ownable: caller is not the owner"
            ) // tokens withdrawn
        })
        it("throws if non owner tries to pause", async () => {
            await truffleAssert.reverts(swap.pause({ from: accounts[1] }), "Ownable: caller is not the owner")
            await swap.pause() // works with owner only
        })
        it("throws if attempting to swap when `paused`", async () => {
            await swap.pause()
            await truffleAssert.reverts(swap.swapTokens(1000), "Pausable: paused")
        })
    })
})
