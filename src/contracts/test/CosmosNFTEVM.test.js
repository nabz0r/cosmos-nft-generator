const { expect } = require('chai');
const { ethers } = require('hardhat');
const { time } = require('@openzeppelin/test-helpers');

describe('CosmosNFTEVM', function() {
    let CosmosNFTEVM, cosmosNFT;
    let owner, addr1, addr2, collaborator;
    let vrfCoordinator, linkToken;

    beforeEach(async function() {
        [owner, addr1, addr2, collaborator] = await ethers.getSigners();
        
        // Deploy mock VRF & LINK contracts
        const MockVRF = await ethers.getContractFactory('VRFCoordinatorMock');
        vrfCoordinator = await MockVRF.deploy();
        
        const MockLink = await ethers.getContractFactory('LinkToken');
        linkToken = await MockLink.deploy();

        // Deploy main contract
        CosmosNFTEVM = await ethers.getContractFactory('CosmosNFTEVM');
        cosmosNFT = await CosmosNFTEVM.deploy(
            vrfCoordinator.address,
            linkToken.address,
            ethers.utils.formatBytes32String('keyHash')
        );

        // Fund contract with LINK
        await linkToken.transfer(cosmosNFT.address, ethers.utils.parseEther('10'));
    });

    describe('Pause Emergency System', function() {
        it('Should pause all operations when owner calls pause', async function() {
            await cosmosNFT.pause();
            expect(await cosmosNFT.paused()).to.equal(true);

            await expect(
                cosmosNFT.connect(addr1).mint({ value: ethers.utils.parseEther('0.1') })
            ).to.be.revertedWith('Pausable: paused');
        });

        it('Should prevent non-owners from pausing', async function() {
            await expect(
                cosmosNFT.connect(addr1).pause()
            ).to.be.revertedWith('Ownable: caller is not the owner');
        });

        it('Should emit EmergencyPause event', async function() {
            await expect(cosmosNFT.pause())
                .to.emit(cosmosNFT, 'EmergencyPause')
                .withArgs(owner.address);
        });

        it('Should resume operations after unpause', async function() {
            await cosmosNFT.pause();
            await cosmosNFT.unpause();
            
            expect(await cosmosNFT.paused()).to.equal(false);

            await cosmosNFT.connect(addr1).mint({
                value: ethers.utils.parseEther('0.1')
            });

            expect(await cosmosNFT.balanceOf(addr1.address)).to.equal(1);
        });
    });

    describe('Mint Limits', function() {
        it('Should respect max supply limit', async function() {
            const maxMints = 5;
            
            for(let i = 0; i < maxMints; i++) {
                await cosmosNFT.connect(addr1).mint({
                    value: ethers.utils.parseEther('0.1')
                });
            }

            expect(await cosmosNFT.totalSupply()).to.equal(maxMints);
        });

        it('Should fail when max supply reached', async function() {
            // Mint up to limit
            for(let i = 0; i < 9400; i++) {
                await cosmosNFT.mint({ value: ethers.utils.parseEther('0.1') });
            }

            await expect(
                cosmosNFT.mint({ value: ethers.utils.parseEther('0.1') })
            ).to.be.revertedWith('Max supply reached');
        });
    });

    describe('Collaborator System', function() {
        it('Should allow collaborator to mint special NFT', async function() {
            await cosmosNFT.connect(owner).addCollaborator(collaborator.address);
            await cosmosNFT.connect(collaborator).mintCollabNFT(addr1.address, 'Special');
            
            const tokenId = 0;
            const tokenURI = await cosmosNFT.tokenURI(tokenId);
            expect(tokenURI).to.include('Special');
        });

        it('Should prevent non-collaborators from minting collab NFTs', async function() {
            await expect(
                cosmosNFT.connect(addr1).mintCollabNFT(addr2.address, 'Special')
            ).to.be.revertedWith('Not a collaborator');
        });

        it('Should respect collab reserve limit', async function() {
            await cosmosNFT.connect(owner).addCollaborator(collaborator.address);
            
            // Mint maximum collab NFTs
            for(let i = 0; i < 100; i++) {
                await cosmosNFT.connect(collaborator).mintCollabNFT(addr1.address, 'Special');
            }

            await expect(
                cosmosNFT.connect(collaborator).mintCollabNFT(addr1.address, 'Special')
            ).to.be.revertedWith('Collab reserve depleted');
        });
    });

    describe('Randomness & Rarity', function() {
        it('Should correctly calculate rarity tiers', async function() {
            const testCases = [
                { input: 49, expected: 0 }, // Common
                { input: 74, expected: 1 }, // Uncommon
                { input: 89, expected: 2 }, // Rare
                { input: 97, expected: 3 }, // Epic
                { input: 99, expected: 4 }  // Legendary
            ];

            for(const test of testCases) {
                const rarity = await cosmosNFT.testCalculateRarity(test.input);
                expect(rarity).to.equal(test.expected);
            }
        });
    });
});
