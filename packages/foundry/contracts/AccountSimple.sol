// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// import "/Users/philip/Programming/Ethereum/AABuild/PWAA/node_modules/@account-abstraction/contracts/core/EntryPoint.sol";
import "/Users/philip/Programming/Ethereum/AABuild/AA-SE/node_modules/@account-abstraction/contracts/interfaces/IAccount.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol"; 
import "forge-std/console.sol";

contract AccountSimple is IAccount {

    uint public count;
    address public owner;

    constructor(address _owner) {
        console.logString("AccountSimple constructor called");
        console.logAddress(_owner);
        owner = _owner;
    }

    function validateUserOp(UserOperation calldata userOp, bytes32 userOpHash, uint256 ) view external returns (uint256 validationData) {
        /// first we hash the message hello, then we use the EthSignedMessageHash to hash the message according to the Ethereum Standard
        /// then we use ECDSA.recover to recover the address that signed the message, therefore we provide the message hash and the signature
        address recovered = ECDSA.recover(MessageHashUtils.toEthSignedMessageHash(userOpHash), userOp.signature);
        /// not save because replay with signature possible, which can be found on chain
        // address recovered = ECDSA.recover(MessageHashUtils.toEthSignedMessageHash(keccak256("hi")), userOp.signature);
        console.logString("Recovered address: ");
        console.logAddress(recovered);
        /// 0 means valid, 1 means invalid (the other way around :))
        return owner == recovered ? 0 : 1;
        // /// if nothing should gets validated
        // return 0;
    }

    /// no verification in here, execute can be called form everywhere
    function execute() external {
        count++;
    }
}