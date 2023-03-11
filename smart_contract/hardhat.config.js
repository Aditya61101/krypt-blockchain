//https://eth-goerli.g.alchemy.com/v2/fKVIeoK0w6--M8KLQHNNFofbpOaLBgHX
//1842d04aa66ed00467aebab026f2d591a2a965e1e79bbd15c49da56d3cc4504e
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  networks: {
    goerli: {
      url: "https://eth-goerli.alchemyapi.io/v2/fKVIeoK0w6--M8KLQHNNFofbpOaLBgHX",
      accounts: ['1842d04aa66ed00467aebab026f2d591a2a965e1e79bbd15c49da56d3cc4504e']
    }
  }
};
