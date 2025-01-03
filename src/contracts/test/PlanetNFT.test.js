const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PlanetNFT", function () {
    let PlanetNFT;
    let planetNFT;
    let owner;
    let addr1;
    let addr2;
    let teamWallet;

    beforeEach(async function () {
        [owner, addr1, addr2, teamWallet] = await ethers.getSigners();
        PlanetNFT = await ethers.getContractFactory("PlanetNFT");
        planetNFT = await PlanetNFT.deploy(teamWallet.address);
        await planetNFT.deployed();
    });

    describe("Deployment", function () {
        it("Should set the right owner and team wallet", async function () {
            expect(await planetNFT.owner()).to.equal(owner.address);
            expect(await planetNFT.teamWallet()).to.equal(teamWallet.address);
        });
    });

    describe("Minting", function () {
        it("Should allow public minting with correct payment", async function () {
            await planetNFT.connect(addr1).mint({ value: ethers.utils.parseEther("1") });
            expect(await planetNFT.balanceOf(addr1.address)).to.equal(1);
        });

        it("Should fail if payment is insufficient", async function () {
            await expect(
                planetNFT.connect(addr1).mint({ value: ethers.utils.parseEther("0.5") })
            ).to.be.revertedWith("Insufficient payment");
        });
    });

    describe("Collaborator System", function () {
        it("Should allow adding collaborators", async function () {
            await planetNFT.addCollaborator(addr1.address);
            expect(await planetNFT.isCollaborator(addr1.address)).to.be.true;
        });

        it("Should allow collaborators to mint special NFTs", async function () {
            await planetNFT.addCollaborator(addr1.address);
            await planetNFT.connect(addr1).mintCollabNFT(addr2.address, "Special Planet");
            expect(await planetNFT.isCollabNFT(0)).to.be.true;
        });
    });

    describe("Team Reserve", function () {
        it("Should mint team reserve NFTs correctly", async function () {
            await planetNFT.mintTeamReserve();
            expect(await planetNFT.balanceOf(teamWallet.address)).to.equal(500);
        });

        it("Should not allow minting team reserve twice", async function () {
            await planetNFT.mintTeamReserve();
            await expect(planetNFT.mintTeamReserve()).to.be.revertedWith("Team reserve already minted");
        });
    });
});