// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol"; 
import "forge-std/console.sol";

contract Test {
    constructor(bytes memory sig) {
        address recovered = ECDSA.recover(MessageHashUtils.toEthSignedMessageHash(keccak256("hello")), sig);
        console.logAddress(recovered);
    }
}