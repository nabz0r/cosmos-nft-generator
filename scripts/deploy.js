async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const PlanetNFT = await ethers.getContractFactory("PlanetNFT");
    const teamWallet = "YOUR_TEAM_WALLET_ADDRESS"; // Remplacer par votre adresse
    const planetNFT = await PlanetNFT.deploy(teamWallet);

    await planetNFT.deployed();

    console.log("PlanetNFT deployed to:", planetNFT.address);
    console.log("Team wallet set to:", teamWallet);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });