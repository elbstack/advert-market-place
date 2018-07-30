var Ownable = artifacts.require("./openzeppelin-solidity/contracts/ownership/Ownable.sol");
var AdvertMarket = artifacts.require("./AdvertMarket.sol");

module.exports = function(deployer) {
  deployer.deploy(Ownable);
  deployer.deploy(AdvertMarket);
};