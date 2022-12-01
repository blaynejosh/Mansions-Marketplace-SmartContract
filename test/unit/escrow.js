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

          const chainId = network.config.chainId

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              inspector = (await getNamedAccounts()).inspector
              lender = (await getNamedAccounts()).lender
              buyer = (await getNamedAccounts()).buyer

              await deployments.fixture(["all"])

              mansions = await ethers.getContract("RealEstateVerifier", deployer)
              mockV3Aggregator = await ethers.getContractFactory("MockV3Aggregator", deployer)

              // Mint an NFT
              let transaction = await mansions
                  .connect(deployer)
                  .mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS")
              await transaction.wait()

              // Deploying the Escrow contract
              const Escrow = await ethers.getContract("Escrow")
              escrow = await Escrow.deploy(
                  mansions.address,
                  deployer.address,
                  inspector.address,
                  lender.address
              )

              // Approve property to be listed on escrow
              transaction = await mansions.connect(deployer).approve(escrow.address, 1)
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
                  assert.equal(result, mansions.address)
              })
          })
          describe("constructor", function () {
              it("sets the aggregator priceFeed correctly", async function () {
                  const response = await fundMe.getPriceFeed()
                  assert.equal(response, mockV3Aggregator.address)
              })
          })
      })
