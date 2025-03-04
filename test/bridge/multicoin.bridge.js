var MultiCoinParent = artifacts.require("MultiCoin")
var MultiCoinLock = artifacts.require("MultiCoinLock")
var MultiCoinChild = artifacts.require("TeraBlockToken")
const truffleAssert = require("truffle-assertions")
const web3Abi = require("web3-eth-abi")
const sigUtil = require("@metamask/eth-sig-util")
const ReleaseTokensAdminPK = "feec0bcb2778f82159de2d5a270e896ac77580be878df76581cfd6572fe32f81" // Release Tokens Admin is accounts[0]
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

const releaseTokensABI = {
    inputs: [
        {
            internalType: "address",
            name: "_user",
            type: "address",
        },
        {
            internalType: "uint256",
            name: "_amount",
            type: "uint256",
        },
        {
            internalType: "string",
            name: "parentHashProof",
            type: "string",
        },
    ],
    name: "releaseTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
}

const getTransactionData = async (nonce, abi, domainData, params) => {
    const functionSignature = web3Abi.encodeFunctionCall(abi, params)

    let message = {}
    message.nonce = parseInt(nonce)
    message.from = params[0]
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
        privateKey: Buffer.from(ReleaseTokensAdminPK, "hex"),
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

contract("MultiCoin", function (accounts) {
    before(async () => {
        multi_coin_child = await MultiCoinChild.new({ from: accounts[0] })
        multi_coin_parent = await MultiCoinParent.new(1000000, { from: accounts[0] })
        multi_coin_lock = await MultiCoinLock.new(multi_coin_parent.address, { from: accounts[0] })
        multi_coin_lock_address = multi_coin_lock.address
    })

    describe("MultiCoin Contract Tests", async () => {
        it("should have the correct token name", async function () {
            const name = await multi_coin_parent.name()
            assert.equal(name, "MultiCoin", "has the correct name")
        })
        it("should have the correct symbol", async function () {
            const symbol = await multi_coin_parent.symbol()
            assert.equal(symbol, "MC", "has the correct symbol")
        })

        it("initial supply alloted to admin account must tally", async function () {
            const totalSupply = await multi_coin_parent.totalSupply()
            assert.equal(totalSupply.toNumber(), 1000000)
            const adminBalance = await multi_coin_parent.balanceOf(accounts[0])
            assert.equal(adminBalance.toNumber(), 1000000)
        })
    })

    describe("ChildMultiCoin Mint and Burn Tests", async () => {
        it("should be able to mint new tokens", async function () {
            await truffleAssert.passes(multi_coin_child.mint(accounts[1], 1000000))
        })
        it("should be able to burn tokens", async function () {
            await truffleAssert.passes(
                multi_coin_child.burn(1000000, {
                    from: accounts[1],
                })
            )
        })
        describe("MultiCoinLock Contract Tests", async () => {
            it("tokens not approved by user, can't be locked", async () => {
                truffleAssert.reverts(
                    multi_coin_lock.lockTokens(100, {
                        from: accounts[1],
                    })
                )
            })
            it("tokens to be locked should equal the allowance given by the user", async () => {
                truffleAssert.reverts(
                    multi_coin_lock.lockTokens(110, {
                        from: accounts[0],
                    })
                )
            })
            it("approves tokens for delegated transfer", async function () {
                const receipt = await multi_coin_parent.approve(multi_coin_lock_address, 100, {
                    from: accounts[0],
                })
                truffleAssert.eventEmitted(receipt, "Approval", (ev) => {
                    return ev.owner == accounts[0] && ev.spender == multi_coin_lock_address && ev.value == 100
                })
                const allowance = await multi_coin_parent.allowance(accounts[0], multi_coin_lock_address)
                assert.equal(allowance.toNumber(), 100, "stores the allowance for delegated trasnfer")
            })

            it("transfer tokens from one account to another", async function () {
                const receipt = await multi_coin_parent.transfer(accounts[1], 100, {
                    from: accounts[0],
                })
                truffleAssert.eventEmitted(receipt, "Transfer")

                await truffleAssert.passes(
                    multi_coin_parent.transfer(accounts[2], 5000, {
                        from: accounts[0],
                    })
                )
            })

            it("approved, should be able to lock tokens", async () => {
                const receipt = await multi_coin_lock.lockTokens(100, {
                    from: accounts[0],
                })
                truffleAssert.eventEmitted(receipt, "Lock", (ev) => {
                    return ev.user == accounts[0] && ev.amount == 100
                })
            })
            it("non-admins shouldn't release tokens", async () => {
                truffleAssert.reverts(
                    multi_coin_lock.releaseTokens(accounts[0], 100, "parentHash", {
                        from: accounts[1],
                    }),
                    "Ownable: caller is not the owner"
                )
            })
            it("admins should release tokens for account", async () => {
                const receipt = await multi_coin_lock.releaseTokens(accounts[0], 100, "parentHash", {
                    from: accounts[0],
                })
                truffleAssert.eventEmitted(receipt, "Release", (ev) => {
                    return ev.amount == 100 && ev.user == accounts[0]
                })
            })
            it("Provide Liquidity", async () => {
                await truffleAssert.passes(multi_coin_parent.transfer(multi_coin_lock_address, 4000))
            })
            it("Release Tokens from the Lock Contract. Signed ReleaseTokens By Admin With Meta Tx Done by the User", async () => {
                await multi_coin_parent.approve(multi_coin_lock_address, 100, {
                    from: accounts[1],
                })
                await truffleAssert.passes(
                    multi_coin_lock.lockTokens(100, {
                        from: accounts[1],
                    })
                )

                let name = "MultiCoinLock"
                let nonce = await multi_coin_lock.getNonce(accounts[1])
                let version = "1"
                let chainId = await multi_coin_lock.getChainId()
                let domainData = {
                    name: name,
                    version: version,
                    verifyingContract: multi_coin_lock_address,
                    salt: "0x" + parseInt(chainId).toString(16).padStart(64, "0"),
                }

                let { r, s, v, functionSignature } = await getTransactionData(
                    nonce,
                    releaseTokensABI,
                    domainData,
                    [accounts[1], 100, "parentHashMeta"]
                )
                const metaTransaction = await multi_coin_lock.executeMetaTransaction(
                    functionSignature,
                    r,
                    s,
                    v,
                    { from: accounts[1] }
                )

                await truffleAssert.reverts(
                    multi_coin_lock.executeMetaTransaction(functionSignature, r, s, v, {
                        from: accounts[1],
                    })
                )
                console.log(
                    "----------Meta Tx---------",
                    "\nFrom Address fetched in Receipt " + metaTransaction.receipt.from,
                    "\nSigned By " + accounts[0]
                )
            })
            it("Remove Liquidity Provided by Liquidity Admin", async () => {
                const poolLiquidity = await multi_coin_parent.balanceOf(multi_coin_lock_address)
                await truffleAssert.passes(multi_coin_lock.removeLiquidity(poolLiquidity))
            })
            it("withdraws any tokens from contract", async () => {
                //mint
                it("should be able to mint new tokens", async function () {
                    await truffleAssert.passes(multi_coin_child.mint(multi_coin_lock, 1000000))
                })
                await truffleAssert.passes(multi_coin_lock.withdrawTokens(multi_coin_child.address))
            })
            it("should not withdraws liquidity tokens using withdraw function", async () => {
                await truffleAssert.reverts(multi_coin_lock.withdrawTokens(multi_coin_parent.address))
            })
            it("throws if non owner tries to pause", async () => {
                await truffleAssert.reverts(
                    multi_coin_lock.pause({ from: accounts[1] }),
                    "Ownable: caller is not the owner"
                )
            })
            it("throws if attempting to deposit when `paused`", async () => {
                await multi_coin_lock.pause()
                await truffleAssert.reverts(
                    multi_coin_lock.lockTokens(1000000, { from: accounts[0] }),
                    "Pausable: paused"
                )
            })
        })
    })
})
