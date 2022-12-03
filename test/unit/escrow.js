const { assert, expect } = require("chai")
const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), "ether")
}

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Mansions Unit Tests", function () {
          let mansions, escrow, deployer, inspector, lender, buyer, minimumEarnest, mockV3Aggregator

          //   const chainId = network.config.chainId

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              inspector = (await getNamedAccounts()).inspector
              lender = (await getNamedAccounts()).lender
              buyer = (await getNamedAccounts()).buyer

              await deployments.fixture(["all"])

              mansions = await ethers.getContractFactory("RealEstateVerifier")
              const mansionsContract = await mansions.deploy()
              mockV3Aggregator = await ethers.getContractFactory("MockV3Aggregator")
              const MockV3Aggregator = await mockV3Aggregator.deploy()

              // Mint an NFT
              let transaction = await mansionsContract
                  .connect(deployer)
                  .mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS")
              await transaction.wait()

              // Deploying the Escrow contract
              const Escrow = await ethers.getContractFactory("Escrow")
              escrow = await Escrow.deploy(
                  mansionsContract.address,
                  deployer.address,
                  inspector.address,
                  lender.address
                  //   MockV3Aggregator.address
              )

              // Approve property to be listed on escrow
              transaction = await mansionsContract.connect(deployer).approve(escrow.address, 1)
              await transaction.wait()

              // List the property on escrow
              transaction = await escrow
                  .connect(deployer)
                  .list(1, tokens(10), tokens(5), buyer.address)
              await transaction.wait()
          })

          describe("deployment", function () {
              it("returns NFT address", async function () {
                  const result = await escrow.nftAddress()
                  assert.equal(result, mansionsContract.address)
              })
          })
      })
