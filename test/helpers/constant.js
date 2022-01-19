const {ethers} = require ('ethers');

const overrides = {gasLimit: 9500000};
const parseEther = value => ethers.utils.parseEther (value.toString ());
const now = () => (new Date ().getTime () / 1000) | 0;
const AddressZero = '0x0000000000000000000000000000000000000000';
module.exports = {AddressZero, parseEther, overrides, now};
