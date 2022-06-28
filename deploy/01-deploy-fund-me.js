// import
// main function
// calling of main function

const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

// getNamedAccounts and deployments are coming from hre-> hardhat runtime environment
module.exports = async ({ getNamedAccounts, deployments }) => {
    // same as
    // hre.getNamedAccounts
    // hre.deployments
    const { deploy, log, get } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // When going for a localhost or hardhat network we want to use a mock

    // const address = "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e"
    // If ChainId is X use Y
    // If chainId is Z use address A
    // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    // If the contract doesn't exist we will deploy a minimal version for our local testing

    // Well what happens when we want to change chains
    // When going for localhost or hardhat network we want to use a mock

    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, // put price feed address
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        // Verify Part
        await verify(fundMe.address, [ethUsdPriceFeedAddress])
    }

    log("-------------------------------------------")
}

module.exports.tags = ["all", "fundme"]
