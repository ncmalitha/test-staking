const { assert } = require("chai");
const truffleAssert = require('truffle-assertions');

const DaiToken = artifacts.require("DaiToken");
const DappToken = artifacts.require("DappToken");
const TokenFarm = artifacts.require("TokenFarm");

require("chai")
  .use(require("chai-as-promised"))
  .should();
//contract("TokenFarm", (accounts) => {
contract("TokenFarm", ([owner, investor]) => {

  let daiToken, dappToken, tokenFarm;

  function tokens(n) {
    return web3.utils.toWei(n, "ether");
  }

  before(async() => {
    daiToken = await DaiToken.new();
    dappToken = await DappToken.new();
    tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address);

    // transfer all tokens to TokenFarm
    await dappToken.transfer(tokenFarm.address, tokens('1000000'));
    await daiToken.transfer(investor, tokens('100'), {
      from: owner
    });
  });

  describe("Mock Dai deployment", async () => {
    it("has name ", async () => {
      const name = await daiToken.name();
      assert.equal(name, "Mock DAI Token");
    });
  });

  describe("DappToken deployment", async () => {
    it("has name ", async () => {
      const name = await dappToken.name();
      assert.equal(name, "DApp Token");
    });
  });

  describe("Token Farm deployment", async () => {
    it("has name ", async () => {
      const name = await tokenFarm.name();
      assert.equal(name, 'Dapp Token Farm');
    });

    it("has DappToken and DaiToken", async () => {
      const dappToken = await tokenFarm.dappToken();
      assert.isNotNull(dappToken.address);
      
    });

    it("has balance of 1000000", async () => {
      const balance = await dappToken.balanceOf(tokenFarm.address);
      assert.equal(balance.toString(), tokens('1000000'));
      
    });
  });

  describe("Farming tokens", async () => {
    it("rewards investors for staking", async () => {
      
      let result;

      result = await daiToken.balanceOf(investor);
      assert.equal(result.toString(), tokens('100'), "Mock wallet balance is correct before staking");

      // staking mocked dai
      await daiToken.approve(tokenFarm.address, tokens('100'), {
        from: investor
      });

      await tokenFarm.stakeTokens(tokens('100'), {
        from: investor
      });

      let investorTokens = await daiToken.balanceOf(investor);
      assert.equal(investorTokens.toString(), tokens('0'), "Wallet should be empty");

      result = await daiToken.balanceOf(tokenFarm.address);
      assert.equal(result.toString(), tokens('100'), "Wallet should have money");

      result = await tokenFarm.stakingBalance(investor);
      assert.equal(result.toString(), tokens('100'), "Wallet should have send amount");

      result = await tokenFarm.isStaking(investor);
      assert.equal(result, true, "is staking");

      result = await tokenFarm.hasStaked(investor);
      assert.equal(result, true, "has staking");

      // issue
      await tokenFarm.issueTokens({from: owner});

      result = await dappToken.balanceOf(investor);
      assert.equal(result.toString(), tokens('100'), "now investor should have money issued");

      //try to issue not from owner
      await tokenFarm.issueTokens({from: investor}).should.be.rejected;

      //unstake tokens
      await tokenFarm.unstake({from: investor});

      // now investor staking balance is 0
      result = await tokenFarm.stakingBalance(investor);
      assert.equal(result.toString(), 0, "staking balance is zero");

      result = await tokenFarm.isStaking(investor);
      assert.equal(result, false, "is staking");

      investorTokens = await daiToken.balanceOf(investor);
      assert.equal(investorTokens.toString(), tokens('100'), "Wallet have the money back");

    });
  });

  describe("Pausing functions", async () => {
    it("pause contract", async () => {
      await tokenFarm.pause();
    });

    it("unpause contract", async () => {
      await tokenFarm.unpause();
    });
  });

  describe("Farming tokens when pause", async () => {

    it("rewards investors for staking", async () => {
      
      let result;

      result = await daiToken.balanceOf(investor);
      assert.equal(result.toString(), tokens('100'), "Mock wallet balance is correct before staking");

      // staking mocked dai
      await daiToken.approve(tokenFarm.address, tokens('100'), {
        from: investor
      });

      await tokenFarm.pause();

      await truffleAssert.fails(
        tokenFarm.stakeTokens(tokens('100'), {
          from: investor
        }),
        truffleAssert.ErrorType.REVERT,
        "Pausable: paused"
      );

    });
  });
});
