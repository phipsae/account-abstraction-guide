// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./AccountSimple.sol";
import "@openzeppelin/contracts/utils/Create2.sol";

contract AccountSimpleFactory {
    function createAccount(address owner) external returns (address) {
        // AccountSimple acc = new AccountSimple(owner);
        // return address(acc);
        /// create2 necessary for bundler, create1 not allowed (forbidden opcode)
        bytes32 salt = bytes32(uint256(uint160(owner)));
        /// from OZ Create2.sol, first creation code, then contructor arguments fo AccountSimple
        bytes bytecode = abi.encodePacked(type(AccountSimple).creationCode, abi.encode(owner));
        Create2.deploy(0, salt, bytecode);
    }
}