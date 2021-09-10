var TeraBlockToken = artifacts.require("TeraBlockToken")
var ERC20Old = artifacts.require("ERC20Old")
const truffleAssert = require("truffle-assertions")
contract("TeraBlock Token", function (accounts) {
    before(async () => {
        tera_block_token = await TeraBlockToken.new({ from: accounts[0] })
        depositedData = web3.eth.abi.encodeParameter("uint256", "1000000")
        // used to test withdrawal of any erc20 token on `tera_block_token`
        oldToken = await ERC20Old.new()
    })

    describe("TeraBlock Token Contract Tests", async () => {
        it("should have the correct token name", async function () {
            const name = await tera_block_token.name()
            assert.equal(name, "TeraBlock Token", "has the correct name")
        })
        it("should have the correct symbol", async function () {
            const symbol = await tera_block_token.symbol()
            assert.equal(symbol, "TBC", "has the correct symbol")
        })

        it("should be able to mint new tokens", async function () {
            await truffleAssert.passes(
                tera_block_token.mint(accounts[0], 1000000, {
                    from: accounts[0],
                })
            )
        })

        it("fetch the owner of the contract", async function () {
            assert.equal(await tera_block_token.getOwner({ from: accounts[1] }), accounts[0])
        })

        it("non-admin shouldn't be able to mint tokens", async function () {
            truffleAssert.reverts(
                tera_block_token.mint(accounts[0], 1000000, { from: accounts[1] }),
                "Caller does not have Admin Access"
            )
        })

        it("initial supply alloted to admin account must tally", async function () {
            const totalSupply = await tera_block_token.totalSupply()
            assert.equal(totalSupply.toNumber(), 1000000)
            const adminBalance = await tera_block_token.balanceOf(accounts[0])
            assert.equal(adminBalance.toNumber(), 1000000)
        })

        it("approves tokens for delegated transfer", async function () {
            const receipt = await tera_block_token.approve(accounts[1], 500000, {
                from: accounts[0],
            })
            truffleAssert.eventEmitted(receipt, "Approval", (ev) => {
                return ev.owner == accounts[0] && ev.spender == accounts[1] && ev.value == 500000
            })
            const allowance = await tera_block_token.allowance(accounts[0], accounts[1])
            assert.equal(allowance.toNumber(), 500000, "stores the allowance for delegated trasnfer")
        })
        it("Transfer Tokens From One Account to Other", async function () {
            await truffleAssert.passes(
                tera_block_token.transferFrom(accounts[0], accounts[1], 500000, {
                    from: accounts[1],
                })
            )
        })
        it("withdraws any tokens from contract", async () => {
            //mint
            await truffleAssert.passes(oldToken.mint(tera_block_token.address, 1000))
            assert.equal(await oldToken.balanceOf(accounts[0]), 0)
            await truffleAssert.passes(tera_block_token.withdrawTokens(oldToken.address))
            assert.equal(await oldToken.balanceOf(accounts[0]), 1000)
        })
        it("Set Deposit Admin", async () => {
            await truffleAssert.passes(tera_block_token.setDepositAdmin(accounts[2]))
        })
        it("Deposit Tokens on the Contract by Deposit Admin", async () => {
            //deposit
            await truffleAssert.passes(
                tera_block_token.deposit(accounts[1], depositedData, { from: accounts[2] })
            )
            assert.equal(await tera_block_token.totalSupply(), 2000000)
        })
        it("Non Deposit Admin should not Deposit Tokens on the Contract", async () => {
            //deposit
            await truffleAssert.reverts(tera_block_token.deposit(accounts[1], depositedData))
            assert.equal(await tera_block_token.totalSupply(), 2000000)
        })
        it("Burn Tokens", async () => {
            //burn
            await truffleAssert.passes(tera_block_token.withdraw(500000, { from: accounts[1] }))
            assert.equal(await tera_block_token.totalSupply(), 1500000)
        })
    })
})
