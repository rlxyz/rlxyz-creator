const { createRawWhitelistMerkleRoot } = require('@rhapsodylabs/whitelist-merkler');
const { parseUnits, solidityKeccak256 } = require('ethers/lib/utils');

export const buildWhitelist = (addresses: [string, number][]) => {
  const whitelisted: { whitelist: { [address: string]: number } } = { whitelist: {} };
  addresses.forEach((address) => {
    whitelisted['whitelist'][address[0]] = address[1];
  });
  return createRawWhitelistMerkleRoot(whitelisted);
};

export const generateLeaf = (address: string, tokens: number) => {
  return Buffer.from(
    // Hash in appropriate Merkle format
    solidityKeccak256(['address', 'uint256'], [address, tokens]).slice(2),
    'hex'
  );
};
