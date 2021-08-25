var BscTeraToken = artifacts.require("TeraToken")
var EthTeraToken = artifacts.require("TeraBlockToken")
var TeraLock = artifacts.require("TeraLock")
var ERC20Old = artifacts.require("ERC20Old")
const truffleAssert = require("truffle-assertions")
contract("TeraToken", function (accounts) {
    before(async () => {
        eth_tera_token = await EthTeraToken.new({ from: accounts[0] })
        bsc_tera_token = await BscTeraToken.new({ from: accounts[0] })
        tera_lock = await TeraLock.new(bsc_tera_token.address, { from: accounts[0] })
        tera_lock_address = tera_lock.address
        // used to test withdrawal of any erc20 token on `eth_tera_token`
        oldToken = await ERC20Old.new()
    })

    describe("TeraToken Contract Tests", async () => {
        it("should have the correct token name", async function () {
            const name = await bsc_tera_token.name()
            assert.equal(name, "TeraToken", "has the correct name")
        })
        it("should have the correct symbol", async function () {
            const symbol = await bsc_tera_token.symbol()
            assert.equal(symbol, "TRA", "has the correct symbol")
        })

        it("should be able to mint new tokens", async function () {
            await truffleAssert.passes(
                bsc_tera_token.mint(accounts[0], 1000000, {
                    from: accounts[0],
                })
            )
        })

        it("fetch the owner of the contract", async function () {
            assert.equal(await bsc_tera_token.getOwner({ from: accounts[1] }), accounts[0])
        })

        it("non-admin shouldn't be able to mint tokens", async function () {
            truffleAssert.reverts(
                bsc_tera_token.mint(accounts[0], 1000000, { from: accounts[1] }),
                "Caller does not have Admin Access"
            )
        })

        it("initial supply alloted to admin account must tally", async function () {
            const totalSupply = await bsc_tera_token.totalSupply()
            assert.equal(totalSupply.toNumber(), 1000000)
            const adminBalance = await bsc_tera_token.balanceOf(accounts[0])
            assert.equal(adminBalance.toNumber(), 1000000)
        })

        it("approves tokens for delegated transfer", async function () {
            const receipt = await bsc_tera_token.approve(tera_lock_address, 100, {
                from: accounts[0],
            })
            truffleAssert.eventEmitted(receipt, "Approval", (ev) => {
                return ev.owner == accounts[0] && ev.spender == tera_lock_address && ev.value == 100
            })
            const allowance = await bsc_tera_token.allowance(accounts[0], tera_lock_address)
            assert.equal(allowance.toNumber(), 100, "stores the allowance for delegated trasnfer")
        })
    })

    describe("TeraBlockToken Mint and Burn Tests", async () => {
        it("should be able to mint new tokens", async function () {
            await truffleAssert.passes(eth_tera_token.mint(accounts[1], 1000000))
        })
        it("should be able to burn tokens", async function () {
            await truffleAssert.passes(
                eth_tera_token.transferTokensToBSC(1000000, {
                    from: accounts[1],
                })
            )
        })
        it("admin should be able to update releasedTokens Onto BSC mapping", async function () {
            await truffleAssert.passes(eth_tera_token.releasedTokensToBSC(accounts[1]))
        })
    })

    describe("TeraLock Contract Tests", async () => {
        it("tokens not approved by user, can't be locked", async () => {
            truffleAssert.reverts(
                tera_lock.lockTokens(100, {
                    from: accounts[1],
                })
            )
        })
        it("tokens to be locked should equal the allowance given by the user", async () => {
            truffleAssert.reverts(
                tera_lock.lockTokens(110, {
                    from: accounts[0],
                })
            )
        })
        it("approved, should be able to lock tokens", async () => {
            const receipt = await tera_lock.lockTokens(100, {
                from: accounts[0],
            })
            truffleAssert.eventEmitted(receipt, "TokenLocked", (ev) => {
                return ev._currentTokensToBeReleasedOntoEth == 100 && ev._userAddress == accounts[0]
            })
        })
        it("non-admins shouldn't release tokens onto eth", async () => {
            truffleAssert.reverts(
                tera_lock.releaseTokens(accounts[0], {
                    from: accounts[1],
                }),
                "Caller does not have Admin Access"
            )
        })
        it("admins should release tokens onto eth", async () => {
            const receipt = await tera_lock.releaseTokens(accounts[0], {
                from: accounts[0],
            })
            truffleAssert.eventEmitted(receipt, "TokenReleased", (ev) => {
                return ev._currentReleasedTokens == 100 && ev._userAddress == accounts[0]
            })
        })
        it("non-admins shouldn't release tokens onto bsc", async () => {
            truffleAssert.reverts(
                tera_lock.releaseTokensToBSC(accounts[1], 100, {
                    from: accounts[1],
                }),
                "Caller does not have Admin Access"
            )
        })
        it("admins should release tokens onto bsc", async () => {
            await truffleAssert.passes(tera_lock.releaseTokensToBSC(accounts[1], 100))
        })
        it("admins should be able to fetch current state", async () => {
            await truffleAssert.passes(
                tera_lock.getCurrentState(accounts[1]),
                "Caller does not have Admin Access"
            )
        })
        it("non-admins shouldn't be able to fetch current state", async () => {
            truffleAssert.reverts(
                tera_lock.getCurrentState(accounts[1], {
                    from: accounts[1],
                }),
                "Caller does not have Admin Access"
            )
        })
        it("withdraws any tokens from contract", async () => {
            //mint
            await truffleAssert.passes(oldToken.mint(eth_tera_token.address, 1000))
            assert.equal(await oldToken.balanceOf(accounts[0]), 0)
            await truffleAssert.passes(eth_tera_token.withdrawTokens(oldToken.address))
            assert.equal(await oldToken.balanceOf(accounts[0]), 1000)
        })
    })
})
