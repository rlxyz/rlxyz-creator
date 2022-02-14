const {
  createRawWhitelistMerkleRoot,
} = require ('@rhapsodylabs/whitelist-merkler');
const {parseUnits, solidityKeccak256} = require ('ethers/lib/utils');

const buildWhitelist = addresses => {
  const whitelisted = {whitelist: {}};
  addresses.forEach (address => {
    whitelisted['whitelist'][address[0]] = address[1];
  });
  return createRawWhitelistMerkleRoot (whitelisted);
};

const generateLeaf = (address, tokens) => {
  return Buffer.from (
    // Hash in appropriate Merkle format
    solidityKeccak256 (['address', 'uint256'], [address, tokens]).slice (2),
    'hex'
  );
};

module.exports = {buildWhitelist, generateLeaf};
