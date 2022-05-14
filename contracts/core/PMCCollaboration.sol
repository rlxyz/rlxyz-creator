// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./../RhapsodyCreatorClaim.sol";

/// @title PMC x ArtistA Collaboration
/// @author rlxyz.eth

contract PMCCollaboration is RhapsodyCreatorClaim {
    constructor() RhapsodyCreatorClaim("PMC x ArtistA Collaboration", "PMC-A-COLLAB", 3000) {}
}
