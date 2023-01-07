// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

abstract contract OwnableWithdraw is Ownable, ReentrancyGuard {
    /// @notice withdraws the ether in the contract to owner
    function withdrawMoney() external onlyOwner nonReentrant {
        (bool success, ) = msg.sender.call{ value: address(this).balance }("");
        require(success, "RhapsodyCreatorGenerative/invalid-withdraw-money");
    }
}
