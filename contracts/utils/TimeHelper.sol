// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

abstract contract TimeHelper {
    /// @notice returns the current block timestamp
    /// @dev this function is overriden in testing for time-dependent testing
    function _currentTime() internal view virtual returns (uint256) {
        return block.timestamp;
    }
}
