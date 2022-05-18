import { defaultAbiCoder, keccak256 } from 'ethers/lib/utils';

export const generateKeccak256Hash = (value: number) => {
  return keccak256(defaultAbiCoder.encode(['uint256'], [value]));
};

export const keccak256Hashes = {
  0: generateKeccak256Hash(0),
  1: generateKeccak256Hash(1),
  2: generateKeccak256Hash(2),
  3: generateKeccak256Hash(3),
  4: generateKeccak256Hash(4),
  5: generateKeccak256Hash(5),
};
