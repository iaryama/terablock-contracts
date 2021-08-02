const StakingRewards = artifacts.require("StakingRewards")
const StakingRewardsFactory = artifacts.require("StakingRewardsFactory")
const StakingToken = artifacts.require("StakingToken")
const RewardToken = artifacts.require("RewardToken")

const BN = require("bignumber.js")

const ether = new BN(Math.pow(10, 18))

contract("StakingRewardsFactory", (accounts) => {
    let staking_token, reward_token, staking_factory, staking_rewards
    before(async () => {
        staking_token = await StakingToken.new({ from: accounts[0] })
        reward_token = await RewardToken.new({ from: accounts[0] })
    })

    describe("Deploy Staking Factory", async () => {
        it("deploy staking factory", async () => {
            staking_factory = await StakingRewardsFactory.new(
                reward_token.address,
                Math.floor(Date.now() / 1000) + 120
            )
        })

        it("deploy reward", async () => {
            const amount = ether.multipliedBy(200000)
            await staking_factory.deploy(staking_token.address, amount, 60 * 10)

            await staking_token.transfer(staking_factory.address, amount, { from: accounts[0] })

            staking_rewards = await StakingRewards.at(
                (
                    await staking_factory.stakingRewardsInfoByStakingToken(staking_token.address)
                ).stakingRewards
            )
        })
    })
})
