pragma solidity ^0.8.0;

interface ISeller {
    /// @notice mint tokens in batches
    /// @param to address to mint to
    /// @param invocations number of tokens to mint
    // virtual
    function _mintMany(address to, uint256 invocations) external;
}
