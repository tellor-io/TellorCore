var Migrations = artifacts.require("./Migrations.sol");
var Reader = artifacts.require("./Reader.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(Reader);
};
