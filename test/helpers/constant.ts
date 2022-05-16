const { ethers } = require('ethers');

export const overrides = { gasLimit: 9500000 };
export const parseEther = (value: number) => ethers.utils.parseEther(value.toString());
export const now = () => (new Date().getTime() / 1000) | 0;
export const AddressZero = '0x0000000000000000000000000000000000000000';
