// const { expect, assert } = require("chai")
// const { ethers } = require("hardhat")

// const tokens = (n) => {
//     return ethers.utils.parseUnits(n.toString(), "ether")
// }

// describe("Escrow", () => {
//     let mansionsEth, escrow
//     let buyer, seller, inspector, lender

//     beforeEach(async () => {
//         const accounts = await ethers.getSigners()
//         buyer = accounts[0]
//         seller = accounts[1]
//         inspector = accounts[2]
//         lender = accounts[3]

//         realEstate = await ethers.getContractFactory("RealEstateVerifier")
//         mansionsEth = await realEstate.deploy()

//         // Mint
//         let transaction = await mansionsEth
//             .connect(seller)
//             .mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS")
//         await transaction.wait()

//         const Escrow = await ethers.getContractFactory("Escrow")
//         escrow = await Escrow.deploy(
//             mansionsEth.address,
//             seller.address,
//             inspector.address,
//             lender.address
//         )

//         // Approve property to be listed on escrow
//         transaction = await mansionsEth.connect(seller).approve(escrow.address, 1)
//         await transaction.wait()

//         // List the property on escrow
//         transaction = await escrow.connect(seller).list(1, tokens(10), tokens(5), buyer.address)
//         await transaction.wait()
//     })
//     describe("deployment", function () {
//         it("returns NFT address", async function () {
//             const result = await escrow.nftAddress()
//             expect(result).to.be.equal(mansionsEth.address)
//         })
//         it("returns seller address", async function () {
//             const result = await escrow.seller()
//             expect(result).to.be.equal(seller.address)
//         })
//         it("returns inspector address", async function () {
//             const result = await escrow.inspector()
//             expect(result).to.be.equal(inspector.address)
//         })
//         it("returns lender address", async function () {
//             const result = await escrow.lender()
//             expect(result).to.be.equal(lender.address)
//         })
//     })
//     describe("listing", function () {
//         it("updates as listed", async function () {
//             const result = await escrow.isListed(1)
//             expect(result).to.equal(true)
//         })
//         it("updates ownership", async function () {
//             expect(await mansionsEth.ownerOf(1)).to.be.equal(escrow.address)
//         })
//         it("returns purchasePrice", async function () {
//             const result = await escrow.purchasePriceToNFTId(1)
//             expect(result).to.equal(tokens(10))
//         })
//         it("returns escrow amount", async function () {
//             const result = await escrow.escrowAmountToNFTId(1)
//             expect(result).to.equal(tokens(5))
//         })
//         it("returns buyer", async function () {
//             const result = await escrow.buyerToNFTId(1)
//             expect(result).to.equal(buyer.address)
//         })
//     })
//     describe("deposit", function () {
//         it("updates contract balance", async function () {
//             const transaction = await escrow.connect(buyer).depositEarnest(1, { value: tokens(5) })
//             await transaction.wait()
//             const result = await escrow.getBalance()
//             expect(result).to.be.equal(tokens(5))
//             // assert.equal(result.toString(), "5000000000000000000")
//         })
//     })
//     describe("Inspection", function () {
//         it("updates inspector status", async function () {
//             const transaction = await escrow.connect(inspector).updateInspectionStatus(1, true)
//             await transaction.wait()
//             const result = await escrow.inspectionPassed(1)
//             // expect(result).to.be.equal(true)
//             assert.equal(result, true)
//         })
//     })
//     describe("Approval", function () {
//         it("updates approval status", async function () {
//             let transaction = await escrow.connect(buyer).approveSale(1)
//             await transaction.wait()

//             transaction = await escrow.connect(seller).approveSale(1)
//             await transaction.wait()

//             transaction = await escrow.connect(lender).approveSale(1)
//             await transaction.wait()

//             expect(await escrow.approval(1, buyer.address)).to.be.equal(true)
//             expect(await escrow.approval(1, seller.address)).to.be.equal(true)
//             expect(await escrow.approval(1, lender.address)).to.be.equal(true)
//         })
//     })
//     describe("Sale", function () {
//         beforeEach(async function () {
//             let transaction = await escrow.connect(buyer).depositEarnest(1, { value: tokens(5) })
//             await transaction.wait()

//             transaction = await escrow.connect(inspector).updateInspectionStatus(1, true)
//             await transaction.wait()

//             transaction = await escrow.connect(buyer).approveSale(1)
//             await transaction.wait()

//             transaction = await escrow.connect(seller).approveSale(1)
//             await transaction.wait()

//             transaction = await escrow.connect(lender).approveSale(1)
//             await transaction.wait()

//             await lender.sendTransaction({ to: escrow.address, value: tokens(5) })

//             transaction = await escrow.connect(seller).finalizeSale(1)
//             await transaction.wait()
//         })
//         it("transfers the funds to the seller", async function () {
//             expect(await mansionsEth.ownerOf(1)).to.be.equal(buyer.address)
//         })
//         it("transfers the NFT to the buyer", async function () {
//             expect(await escrow.getBalance()).to.be.equal(0)
//         })
//     })
// })
