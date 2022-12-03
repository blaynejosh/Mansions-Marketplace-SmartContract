require("@nomicfoundation/hardhat-toolbox")
require("hardhat-deploy")
require("dotenv").config()
require("hardhat-gas-reporter")
require("@nomiclabs/hardhat-etherscan")
require("solidity-coverage")

/** @type import('hardhat/config').HardhatUserConfig */

// const MAINNET_RPC_URL =
//     process.env.MAINNET_RPC_URL ||
//     process.env.ALCHEMY_MAINNET_RPC_URL ||
//     "https://eth-mainnet.alchemyapi.io/v2/your-api-key"
const ALCHEMY_POLYGON_MUMBAI_RPC_URL =
    process.env.ALCHEMY_POLYGON_MUMBAI_RPC_URL ||
    "https://polygon-mumbai.alchemyapi.io/v2/your-api-key"
// const POLYGON_MAINNET_RPC_URL =
//     process.env.POLYGON_MAINNET_RPC_URL || "https://polygon-mainnet.alchemyapi.io/v2/your-api-key"
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x"
// optional
const MNEMONIC = process.env.MNEMONIC || "your mnemonic"

// Your API key for Etherscan, obtain one at https://etherscan.io/
// const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "Your etherscan API key"
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || "Your polygonscan API key"
const REPORT_GAS = process.env.REPORT_GAS || false

module.exports = {
    solidity: {
        compilers: [
            {
                version: "0.6.2",
            },
            {
                version: "0.8.9",
            },
            {
                version: "0.4.24",
            },
            {
                version: "0.8.2",
            },
        ],
    },
    defaultNetwork: "hardhat",
    networks: {
        mumbai: {
            url: ALCHEMY_POLYGON_MUMBAI_RPC_URL,
            accounts: [PRIVATE_KEY],
            //   accounts: {
            //     mnemonic: MNEMONIC,
            //   },
            saveDeployments: true,
            chainId: 80001,
            blockConfirmations: 6,
            gas: 6000000,
        },
    },
    etherscan: {
        // yarn hardhat verify --network <NETWORK> <CONTRACT_ADDRESS> <CONSTRUCTOR_PARAMETERS>
        apiKey: {
            mumbai: POLYGONSCAN_API_KEY,
            polygon: POLYGONSCAN_API_KEY,
        },
    },
    gasReporter: {
        enabled: REPORT_GAS,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
        // coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    },
    contractSizer: {
        runOnCompile: false,
        only: ["RealEstateVerifier", "Escrow"],
    },
    namedAccounts: {
        deployer: {
            default: 0, // here this will by default take the first account as deployer
            // 1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
        },
        inspector: {
            default: 1,
        },
        lender: {
            default: 2,
        },
        buyer: {
            default: 3,
        },
    },

    // mocha: {
    //     timeout: 500000, // 500 seconds max for running tests
    // },

    paths: {
        test: "./test/escrow",
    },
}
