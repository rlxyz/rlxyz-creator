const hardhat = require ('hardhat');

const setDeployerAsSigner = async () => {
  const {getNamedAccounts} = hardhat;
  const {deployer} = await getNamedAccounts ();
  return await ethers.provider.getSigner (deployer);
};
exports.setDeployerAsSigner = setDeployerAsSigner;
const setAdminAsSigner = async () => {
  const {getNamedAccounts} = hardhat;
  const {admin} = await getNamedAccounts ();
  return await ethers.provider.getSigner (admin);
};
exports.setAdminAsSigner = setAdminAsSigner;
