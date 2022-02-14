const transferOwnership = async (contract, newOwner) => {
    let tx = await contract.transferOwnership(newOwner);
    tx.wait(1);
};
exports.transferOwnership = transferOwnership;
