const { assert } = require("chai");
const truffleAssert = require('truffle-assertions');

const DaiToken = artifacts.require("DaiToken");
const DappToken = artifacts.require("DappToken");
const TokenFarm = artifacts.require("TokenFarm");

require("chai")
  .use(require("chai-as-promised"))
  .should();
//contract("TokenFarm", (accounts) => {
contract("TokenFarm", ([owner, investor, withdrawInvestor, farmingInvestor]) => {

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
    await daiToken.transfer(withdrawInvestor, tokens('500'), {
      from: owner
    });
    await daiToken.transfer(farmingInvestor, tokens('100'), {
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

      // @todo :: fix from here
      // issue
      // await tokenFarm.issueTokens({from: owner});

      // result = await dappToken.balanceOf(investor);
      // assert.equal(result.toString(), tokens('100'), "now investor should have money issued");

      // //try to issue not from owner should work
      // await tokenFarm.issueTokens({from: investor});

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

  describe("Withdraw tokens", async () => {
    let result;
    
    it("withdraw amount when nothing staked", async () => {
      await tokenFarm.withdrawAmount(tokens('150'), {
        from: withdrawInvestor
      }).should.be.rejected;

      result = await tokenFarm.isStaking(withdrawInvestor);
      assert.equal(result, false, "is staking");
    });

    it("withdraw amount greater than staked", async () => {
      result = await daiToken.balanceOf(withdrawInvestor);

      // staking mocked dai
      await daiToken.approve(tokenFarm.address, tokens('100'), {
        from: withdrawInvestor
      });

      await tokenFarm.stakeTokens(tokens('100'), {
        from: withdrawInvestor
      });

      await tokenFarm.withdrawAmount(tokens('150'), {
        from: withdrawInvestor
      }).should.be.rejected;

      result = await tokenFarm.isStaking(withdrawInvestor);
      assert.equal(result, true, "is staking");
    });

    it("withdraw amount same as staked", async () => {
      result = await tokenFarm.withdrawAmount(tokens('100'), {
        from: withdrawInvestor
      });

      // now investor staking balance is 0
      result = await tokenFarm.stakingBalance(withdrawInvestor);
      assert.equal(result.toString(), 0, "staking balance is zero");

      result = await tokenFarm.isStaking(withdrawInvestor);
      assert.equal(result, false, "is staking");
    });

    it("withdraw amount less than staked", async () => {

      // staking mocked dai
      await daiToken.approve(tokenFarm.address, tokens('100'), {
        from: withdrawInvestor
      });

      await tokenFarm.stakeTokens(tokens('100'), {
        from: withdrawInvestor
      });

      result = await tokenFarm.stakingBalance(withdrawInvestor);
      assert.equal(result.toString(), tokens('100'), "staking balance is 100");

      result = await tokenFarm.withdrawAmount(tokens('50'), {
        from: withdrawInvestor
      });

      // now investor staking balance is 50
      result = await tokenFarm.stakingBalance(withdrawInvestor);
      assert.equal(result.toString(), tokens('50'), "staking balance is 50");

      result = await tokenFarm.isStaking(withdrawInvestor);
      assert.equal(result, true, "is staking");
    });
  });

  describe("Pausing functions", async () => {
    let isPaused;
    it("pause contract", async () => {
      await tokenFarm.pause();
      isPaused = await tokenFarm.paused();
      assert.equal(isPaused, true, "Dapp is paused");
    });

    it("unpause contract", async () => {
      await tokenFarm.unpause();
      isPaused = await tokenFarm.paused();
      assert.equal(isPaused, false, "Dapp is unpaused");
    });
  });

  describe("Farming tokens when paused", async () => {
    let result, isPaused;
    it("pause contract", async () => {
      isPaused = await tokenFarm.paused();
      assert.equal(isPaused, false, "Dapp is paused");

      result = await daiToken.balanceOf(farmingInvestor);
      assert.equal(result.toString(), tokens('100'), "Mock wallet balance is correct before staking");

      // staking mocked dai
      await daiToken.approve(tokenFarm.address, tokens('100'), {
        from: farmingInvestor
      });

      await tokenFarm.pause();

      await truffleAssert.fails(
        tokenFarm.stakeTokens(tokens('100'), {
          from: farmingInvestor
        }),
        truffleAssert.ErrorType.REVERT,
        "Pausable: paused"
      );
    });
  });

});
