const setBaseURI = async (contract, baseURI) => {
  let tx = await contract.setBaseURI (baseURI);
  tx.wait (1);
};

const setMintTime = async (contract, presaleTime, publicTime) => {
  let tx = await contract.setMintTime (presaleTime, publicTime);
  tx.wait (1);
};

exports.setBaseURI = setBaseURI;
exports.setMintTime = setMintTime;
