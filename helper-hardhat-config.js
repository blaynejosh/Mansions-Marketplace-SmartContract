const { ethers } = require("hardhat")

const networkConfig = {
    80001: {
        name: "Mumbai",
        maticUsdPriceFeed: "0x7bAC85A8a13A4BcD8abb3eB7d6b4d632c5a57676",
        // vrfCoordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
        // entranceFee: ethers.utils.parseEther("0.01"),
        // gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        // subscriptionId: "3759",
        // callbackGasLimit: "500000",
        // interval: "30",
    },
    31337: {
        name: "hardhat",
        //     entranceFee: ethers.utils.parseEther("0.01"),
        //     gasLane: "0xcc294a196eeeb44da2888d17c0625cc88d70d9760a69d58d853ba6581a9ab0cd",
        //     callbackGasLimit: "500000",
        //     interval: "30",
    },
    137: {
        name: "polygon",
        maticUsdPriceFeed: "0x7bAC85A8a13A4BcD8abb3eB7d6b4d632c5a57676",
        //     vrfCoordinatorV2: "0xAE975071Be8F8eE67addBC1A82488F1C24858067",
        //     entranceFee: ethers.utils.parseEther("0.01"),
        //     gasLane: "0xcc294a196eeeb44da2888d17c0625cc88d70d9760a69d58d853ba6581a9ab0cd",
        //     subscriptionId: "0",
        //     callbackGasLimit: "500000",
        //     interval: "30",
    },
}

const developmentChains = ["hardhat", "localhost"]
const DECIMALS = 8
const INITIAL_ANSWER = 200000000000

module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
}
