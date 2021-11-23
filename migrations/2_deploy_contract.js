const CryptoSuits = artifacts.require("CryptoSuits");

module.exports = async function(deployer) {
  deployer.deploy(CryptoSuits);
};
