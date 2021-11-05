var TeraBlockToken = artifacts.require("TeraBlockToken")
var ERC20Old = artifacts.require("ERC20Old")
var TeraBlockBridge = artifacts.require("TeraBlockBridge")
const truffleAssert = require("truffle-assertions")
const web3Abi = require("web3-eth-abi")
const sigUtil = require("@metamask/eth-sig-util")
const DepositAdminPK = "65896b827386e22274ab391e5eb640fe57a841bf52597188740e6e0c49772e1e" // Deposit Admin is accounts[0]
const domainType = [
    {
        name: "name",
        type: "string",
    },
    {
        name: "version",
        type: "string",
    },
    {
        name: "verifyingContract",
        type: "address",
    },
    {
        name: "salt",
        type: "bytes32",
    },
]

const metaTransactionType = [
    {
        name: "nonce",
        type: "uint256",
    },
    {
        name: "from",
        type: "address",
    },
    {
        name: "functionSignature",
        type: "bytes",
    },
]

const depositABI = {
    inputs: [
        {
            internalType: "address",
            name: "user",
            type: "address",
        },
        {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
        },
        {
            internalType: "string",
            name: "burntTxHash",
            type: "string",
        },
    ],
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
}

const getTransactionData = async (admin, nonce, abi, domainData, params) => {
    const functionSignature = web3Abi.encodeFunctionCall(abi, params)

    let message = {}
    message.nonce = parseInt(nonce)
    message.from = await admin.address
    message.functionSignature = functionSignature

    const dataToSign = {
        types: {
            EIP712Domain: domainType,
            MetaTransaction: metaTransactionType,
        },
        domain: domainData,
        primaryType: "MetaTransaction",
        message: message,
    }
    const signature = sigUtil.signTypedData({
        privateKey: Buffer.from(admin.privateKey, "hex"),
        data: dataToSign,
        version: sigUtil.SignTypedDataVersion.V3,
    })

    let r = signature.slice(0, 66)
    let s = "0x".concat(signature.slice(66, 130))
    let v = "0x".concat(signature.slice(130, 132))
    v = parseInt(v)
    if (![27, 28].includes(v)) v += 27

    return {
        r,
        s,
        v,
        functionSignature,
    }
}

contract("TeraBlock Token", function (accounts) {
    before(async () => {
        tera_block_token = await TeraBlockToken.new({ from: accounts[0] })
        tera_block_bridge = await TeraBlockBridge.new(tera_block_token.address, { from: accounts[0] })
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
            await truffleAssert.passes(tera_block_token.setDepositAdmin(tera_block_bridge.address))
        })
        it("Deposit Tokens from the Bridge by Deposit Admin", async () => {
            //deposit
            await truffleAssert.passes(
                tera_block_bridge.deposit(accounts[1], 1000000, "burntHash", { from: accounts[0] })
            )
            assert.equal(await tera_block_token.balanceOf(accounts[1]), 1500000)
            assert.equal(await tera_block_token.totalSupply(), 2000000)
        })
        it("Deposit Tokens from the Bridge Signed Deposit Admin With Meta Tx Done by the User", async () => {
            let name = "TeraBlockBridge"
            let nonce = await tera_block_bridge.getNonce(accounts[1])
            let version = "1"
            let chainId = await tera_block_bridge.getChainId()
            let domainData = {
                name: name,
                version: version,
                verifyingContract: tera_block_bridge.address,
                salt: "0x" + parseInt(chainId).toString(16).padStart(64, "0"),
            }

            let { r, s, v, functionSignature } = await getTransactionData(
                { address: accounts[0], privateKey: DepositAdminPK },
                nonce,
                depositABI,
                domainData,
                [accounts[1], 1000000, "burntHashMeta"]
            )
            await truffleAssert.reverts(
                tera_block_bridge.executeMetaTransaction(accounts[0], functionSignature, r, s, v, {
                    from: accounts[2],
                })
            )
            const metaTransaction = await tera_block_bridge.executeMetaTransaction(
                accounts[0],
                functionSignature,
                r,
                s,
                v,
                { from: accounts[1] }
            )

            await truffleAssert.reverts(
                tera_block_bridge.executeMetaTransaction(accounts[0], functionSignature, r, s, v, {
                    from: accounts[1],
                })
            )
            console.log(
                "----------Meta Tx---------",
                "\nFrom Address fetched in Receipt " + metaTransaction.receipt.from,
                "\nSigned By " + accounts[0]
            )
            assert.equal((await tera_block_token.balanceOf(accounts[1])).toNumber(), 2500000)
            assert.equal((await tera_block_token.totalSupply()).toNumber(), 3000000)
        })
        it("Non Deposit Admin should not Deposit Tokens on the Contract", async () => {
            //deposit
            await truffleAssert.reverts(
                tera_block_bridge.deposit(accounts[1], 1000000, "burntHash", { from: accounts[2] })
            )
            assert.equal((await tera_block_token.totalSupply()).toNumber(), 3000000)
        })
        it("Burn Tokens", async () => {
            //burn
            await truffleAssert.passes(tera_block_token.burn(500000, { from: accounts[1] }))
            assert.equal((await tera_block_token.totalSupply()).toNumber(), 2500000)
        })
        it("throws if non owner tries to pause", async () => {
            await truffleAssert.reverts(
                tera_block_bridge.pause({ from: accounts[1] }),
                "Ownable: caller is not the owner"
            )
        })
        it("throws if attempting to deposit when `paused`", async () => {
            await tera_block_bridge.pause()
            await truffleAssert.reverts(
                tera_block_bridge.deposit(accounts[1], 1000000, "burnHash", { from: accounts[0] }),
                "Pausable: paused"
            )
        })
    })
})
