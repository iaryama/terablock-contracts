const NFT = artifacts.require("TeraNFT")
const truffleAssert = require("truffle-assertions")

contract("NFT", (accounts) => {
    before(async () => {
        this.nft = await NFT.deployed()
    })
    it("should have correct name", async () => {
        const name = await this.nft.name()
        assert.equal(name, "Terablock NFT")
    })
    it("should have correct symbol", async () => {
        const symbol = await this.nft.symbol()
        assert.equal(symbol, "TNFT")
    })
    describe("Access Tests", async () => {
        it("owner should be able to mint", async () => {
            const recepient = accounts[1]
            const data = "some-data"
            const hash = "some-hash"
            const result = await this.nft.issueToken(recepient, hash, data)
            truffleAssert.eventEmitted(result, "Transfer")
            const nftOwner = await this.nft.ownerOf(1)
            assert.equal(nftOwner, accounts[1])
        })
        it("non-owner should not be able to mint", async () => {
            const recepient = accounts[1]
            const data = "some-data"
            const hash = "some-hash"
            try {
                var result = await this.nft.issueToken(recepient, hash, data, { from: accounts[1] })
            } catch (err) {
                if (err.reason == "Ownable: caller is not the owner") return
                else return false
            }
            truffleAssert.eventNotEmitted(result, "Transfer")
            return false
        })
    })
    describe("Functionality Tests", async () => {
        it("nft-owner should be able to transfer NFT", async () => {
            const nftOwner = accounts[1]
            const recepient = accounts[2]
            const nftId = 1
            var result = await this.nft.transferFrom(nftOwner, recepient, nftId, { from: nftOwner })
            truffleAssert.eventEmitted(result, "Transfer")
            const newOwner = await this.nft.ownerOf(nftId)
            assert.notEqual(newOwner, nftOwner)
            assert.equal(newOwner, recepient)
        })
        it("non-nft-owner should not be able to transfer NFT", async () => {
            const user = accounts[3]
            const recepient = accounts[5]
            const nftId = 1
            try {
                var result = await this.nft.transferFrom(user, recepient, nftId, { from: user })
            } catch (err) {
                if (err.reason == "ERC721: transfer caller is not owner nor approved") return
                else return false
            }
            truffleAssert.eventNotEmitted(result, "Transfer")
            const nftOwner = await this.nft.ownerOf(nftId)
            assert.notEqual(nftOwner, recepient)
            assert.equal(nftOwner, accounts[4])
        })
        it("nft-owner should be able to approve other addresses", async () => {
            const nftOwner = accounts[2]
            const user = accounts[3]
            const nftId = 1
            var result = await this.nft.approve(user, nftId, { from: nftOwner })
            truffleAssert.eventEmitted(result, "Approval")
            const approved = await this.nft.getApproved(nftId)
            assert.equal(approved, user)
        })
        it("approved should be able to transfer NFT", async () => {
            const nftOwner = accounts[2]
            const approved = accounts[3]
            const recepient = accounts[3]
            const nftId = 1
            var result = await this.nft.transferFrom(nftOwner, recepient, nftId, { from: approved })
            truffleAssert.eventEmitted(result, "Transfer")
            const newOwner = await this.nft.ownerOf(nftId)
            assert.notEqual(newOwner, nftOwner)
            assert.equal(newOwner, recepient)
        })
    })
})
