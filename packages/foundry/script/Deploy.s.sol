// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../contracts/AccountSimple.sol";
import "../contracts/AccountFactorySimple.sol";
import "../contracts/Paymaster.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@account-abstraction/contracts/core/EntryPoint.sol";
import "./DeployHelpers.s.sol";

contract DeployScript is ScaffoldETHDeploy {
    error InvalidPrivateKey(string);

    function run() external {
        // Retrieve deployer's private key
        uint256 deployerPrivateKey = setupLocalhostEnv();

        // Check if private key is set
        if (deployerPrivateKey == 0) {
            revert InvalidPrivateKey(
                "You don't have a deployer account. Make sure you have set DEPLOYER_PRIVATE_KEY in .env or use `yarn generate` to generate a new random account"
            );
        }

        /// Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        /// Deploy EntryPoint contract -- 0x5FbDB2315678afecb367f032d93F642f64180aa3
        EntryPoint entryPoint = new EntryPoint();

        /// Deploy Account
        AccountSimple yourAccount =
            new AccountSimple(vm.addr(deployerPrivateKey));

        /// Deploy Simple Account Factory --- 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
        AccountFactorySimple accountFactorySimple = new AccountFactorySimple();

        /// Deploy Paymaster
        Paymaster paymaster = new Paymaster();

        /// Log deployment addresses
        console.logString(
            string.concat(
                "EntryPoint deployed at: ",
                vm.toString(address(entryPoint)),
                "\n",
                "AccountSimpleFactory deployed at: ",
                vm.toString(address(accountFactorySimple)),
                "\n",
                "Paymaster deployed at: ",
                vm.toString(address(paymaster))
            )
        );

        // /// Test.sol contract test --> to verify signing works correctly
        // bytes32 messageHash = keccak256(abi.encodePacked("hello"));
        // bytes32 ethSignedMessageHash = ECDSA.toEthSignedMessageHash(messageHash);

        // (uint8 v, bytes32 r, bytes32 s) = vm.sign(deployerPrivateKey, ethSignedMessageHash);
        // bytes memory signature = abi.encodePacked(r, s, v);

        // // string memory signatureStr = _toHexString(signature);
        // // console.logString(string.concat("Signature: ", signatureStr));

        // Test test = new Test(signature);

        // console.logString(string.concat("Signer Address: ", vm.toString(vm.addr(deployerPrivateKey))));

        /// Signature js 0xf16ea9a3478698f695fd1401bfe27e9e4a7e8e3da94aa72b021125e31fa899cc573c48ea3fe1d4ab61a9db10c19032026e3ed2dbccba5a178235ac27f94504311c

        // Stop broadcasting transactions
        vm.stopBroadcast();

        // Export contract deployments
        exportDeployments();
    }

    function test() public {}
}
