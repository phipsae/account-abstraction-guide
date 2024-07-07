// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol"; 
import "forge-std/console.sol";

/// to test if ECDSA.recover works
contract Test {
    constructor(bytes memory sig) {
        /// first we hash the message hello, then we use the EthSignedMessageHash to hash the message according to the Ethereum Standard
        /// then we use ECDSA.recover to recover the address that signed the message, therefore we provide the message hash and the signature
        address recovered = ECDSA.recover(MessageHashUtils.toEthSignedMessageHash(keccak256("hello")), sig);
        console.logAddress(recovered);
    }
}