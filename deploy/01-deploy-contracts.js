const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network, ethers } = require("hardhat")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    // Setting up accounts
    const { deployer, inspector, lender, buyer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let maticUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const maticUsdAggregator = await ethers.getContractFactory("MockV3Aggregator")
        maticUsdPriceFeedAddress = maticUsdAggregator.address
    } else {
        maticUsdPriceFeedAddress = networkConfig[chainId]["maticUsdPriceFeed"]
    }

    // Deploying RealEstateVerifier
    const name_ = "Mansions MarketPlace"
    const symbol_ = "MMP"
    const realEstateVerifier = await deploy("RealEstateVerifier", {
        from: deployer,
        log: true,
        args: [name_, symbol_],
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    console.log(`Deployed Escrow Contract at: ${realEstateVerifier.address}`)
    console.log(`Listing 3 properties...\n`)

    for (let i = 0; i < 3; i++) {
        const transaction = await realEstateVerifier
            .connect(deployer)
            .mint(
                `https://ipfs.io/ipfs/QmQVcpsjrA6cr1iJjZAodYwmPekYgbnXGo4DFubJiLc2EB/${i + 1}.json`
            )
        //     await transaction.wait()
        // }

        // Deploying Escrow
        const escrow = await deploy("Escrow", {
            from: deployer,
            log: true,
            args: [
                maticUsdPriceFeedAddress,
                realEstateVerifier.address,
                deployer.address,
                inspector.address,
                lender.address,
            ],
            waitConfirmations: network.config.blockConfirmations || 1,
        })

        console.log(`Deployed Escrow Contract at: ${escrow.address}`)
        console.log(`Listing 3 properties...\n`)

        // for (let i = 0; i < 3; i++) {
        //     // Approve properties...
        //     let transaction = await realEstateVerifier.connect(deployer).approve(escrow.address, i + 1)
        //     await transaction.wait()
        // }

        // Listing properties...
        // transaction = await escrow.connect(deployer).list(1, buyer.address, tokens(20), tokens(10))
        // await transaction.wait()

        // transaction = await escrow.connect(deployer).list(2, buyer.address, tokens(15), tokens(5))
        // await transaction.wait()

        // transaction = await escrow.connect(deployer).list(3, buyer.address, tokens(10), tokens(5))
        // await transaction.wait()

        // console.log(`Finished.`)

        // Verifying on the blockchain
        if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
            await verify(realEstateVerifier.address, args)
            await verify(escrow.address, args)
        }
        log("------------------------------------------------------------------")
    }
}
module.exports.tags = ["all", "realEstateVerifier", "escrow"]
