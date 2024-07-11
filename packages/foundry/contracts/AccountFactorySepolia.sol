// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./AccountSimple.sol";
import "@openzeppelin/contracts/utils/Create2.sol";
import "forge-std/console.sol";

contract AccountFactorySepolia {
    function createAccount(address owner) external returns (address) {
        /// create2 necessary for bundler, create1 not allowed (forbidden opcode)
        bytes32 salt = bytes32(uint256(uint160(owner)));
        /// from OZ Create2.sol, first creation code, then contructor arguments fo AccountSimple
        bytes memory bytecode = abi.encodePacked(type(AccountSimple).creationCode, abi.encode(owner));
        
        address addr = Create2.computeAddress(salt, keccak256(bytecode));

        console.logBytes(bytecode);
        console.logString("Computed address from Factory: ");
        console.logAddress(addr);
        if (addr.code.length > 0) {
            return addr;
        }

        return Create2.deploy(0, salt, bytecode);
    }
}