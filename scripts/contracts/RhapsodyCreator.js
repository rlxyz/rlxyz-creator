const setBaseURI = async (contract, baseURI) => {
  let tx = await contract.setBaseURI (baseURI);
  tx.wait (1);
};

const setMintTime = async (contract, claimTime, presaleTime, publicTime) => {
  let tx = await contract.setMintTime (claimTime, presaleTime, publicTime);
  tx.wait (1);
};

const setPromotionMint = async (contract, amount) => {
  let tx = await contract.promotionMint (amount);
  tx.wait (1);
};

const setClaimMerkleRoot = async (contract, claimMerkleRoot) => {
  let tx = await contract.setClaimMerkleRoot (claimMerkleRoot);
  tx.wait (1);
};

const setPresaleMerkleRoot = async (contract, presaleMerkleRoot) => {
  let tx = await contract.setPresaleMerkleRoot (presaleMerkleRoot);
  tx.wait (1);
};

exports.setPresaleMerkleRoot = setPresaleMerkleRoot;
exports.setClaimMerkleRoot = setClaimMerkleRoot;
exports.setBaseURI = setBaseURI;
exports.setPromotionMint = setPromotionMint;
exports.setMintTime = setMintTime;
