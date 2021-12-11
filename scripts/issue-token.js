const TokenFarm = artifacts.require("TokenFarm");

module.exports = async function(callback) {
  const tokenFarm = await TokenFarm.deployed();
  await tokenFarm.issueTokens();
  console.log('Tokens issued...')

  callback()
};
