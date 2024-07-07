"use client";

import { useState } from "react";
import { ethers } from "ethers";
import type { NextPage } from "next";
import {
  createPublicClient,
  createWalletClient,
  encodeFunctionData,
  getContractAddress,
  http,
  parseUnits,
  toBytes,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { foundry } from "viem/chains";
import { useScaffoldContract, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

// const EP_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const FACTORY_NONCE = 1;
const FACTORY_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
const PM_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

const LocalChain: NextPage = () => {
  const { data: entryPoint } = useScaffoldContract({
    contractName: "EntryPoint",
  });

  const account1 = privateKeyToAccount(process.env.NEXT_PUBLIC_FOUNDRY_PRIVATE_KEY_1 as `0x${string}`);
  // const account2 = privateKeyToAccount(process.env.NEXT_PUBLIC_FOUNDRY_PRIVATE_KEY_2 as `0x${string}`);

  const [signature, setSignature] = useState<string>("");
  const [userOp, setUserOp] = useState({} as any);

  const { writeContractAsync: handleOpsAsync } = useScaffoldWriteContract("EntryPoint");
  const { writeContractAsync: depositToAsync } = useScaffoldWriteContract("EntryPoint");

  const { data: accountSimple } = useScaffoldContract({
    contractName: "AccountSimple",
  });

  const { data: accountSimpleFactory } = useScaffoldContract({
    contractName: "AccountSimpleFactory",
  });

  // const { data: paymaster } = useScaffoldContract({
  //   contractName: "Paymaster",
  // });

  // FACTORY_ADDRESS = accountSimpleFactory?.address as `0x${string}`;
  // PM_ADDRESS = paymaster?.address as `0x${string}`;

  const sender = getContractAddress({
    // bytecode: "0x6394198df16000526103ff60206004601c335afa6040516060f3",
    from: FACTORY_ADDRESS as `0x${string}`,
    nonce: BigInt(FACTORY_NONCE),
    opcode: "CREATE",
    // salt: "0x7c5ea36004851c764c44143b1dcb59679b11c9a68e5f41497f6cf3d480715331",
  });

  const SMART_ACCOUNT = sender;

  const { data: nonceFromEP } = useScaffoldReadContract({
    contractName: "EntryPoint",
    functionName: "getNonce",
    args: [sender, BigInt(0)],
  });

  let createAccountEncoded = "";

  if (accountSimpleFactory) {
    createAccountEncoded = encodeFunctionData({
      abi: accountSimpleFactory?.abi,
      functionName: "createAccount",
      args: [account1.address as `0x${string}`],
    });
  }

  let executeEncoded = "";

  if (accountSimple) {
    executeEncoded = encodeFunctionData({
      abi: accountSimple?.abi,
      functionName: "execute",
    });
  }

  /// create userOP without signature -- append sig later after signed UserOp
  const createUserOp = async () => {
    if (executeEncoded && createAccountEncoded) {
      /// if already SA created then use 0x
      const initCode = "0x";
      // const initCode = accountSimpleFactory?.address + createAccountEncoded.slice(2);

      // console.log("InitCode", initCode);

      // const callData = "0x";
      const callData = executeEncoded;

      const userOp = {
        sender, // smart account address
        nonce: nonceFromEP, // nonce from the entrypoint nonce manager
        initCode,
        callData,
        callGasLimit: 500_000,
        verificationGasLimit: 500_000,
        preVerificationGas: 50_000,
        maxFeePerGas: ethers.parseUnits("10", "gwei"), //parseUnits("10", 9),
        maxPriorityFeePerGas: ethers.parseUnits("5", "gwei"),
        paymasterAndData: PM_ADDRESS,
        signature: "0x",
      };
      console.log("User Op", userOp);
      setUserOp(userOp);
    }
  };

  const [userOpHash, setUserOpHash] = useState<`0x${string}`>();

  const createUserOpHash = async () => {
    console.log(userOp);
    const userOpHash = await entryPoint?.read.getUserOpHash([userOp]);
    console.log("User Op Hash", userOpHash);
    setUserOpHash(userOpHash);
  };

  // /// Create Signature viem
  const client = createWalletClient({
    account: account1,
    chain: foundry,
    // mode: "anvil",
    transport: http(),
  });

  const createSignature = async () => {
    console.log("Signer", account1);
    // /// only for messages like "hi" which are not secure
    // const message = toBytes(keccak256(toBytes(userOpHash as `0x${string}`)));
    /// for userOpHash
    const message = toBytes(userOpHash as `0x${string}`);
    console.log("Message viem", message);
    const signature = await client.signMessage({
      // account: account1,
      // prettier-ignore
      message: {raw: message},
    });
    console.log(signature);
    setSignature(signature);
  };

  /// use ethers.js to create signature
  const createSignatureEthers = async () => {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const wallet = new ethers.Wallet(process.env.NEXT_PUBLIC_FOUNDRY_PRIVATE_KEY_1 as `0x${string}`);
    const signer = wallet.connect(provider);
    console.log("Signer", signer);
    // /// very important!!! thats why viem is not working with just hi as a message
    // const message = ethers.getBytes(ethers.id(`hi`));
    /// to make it more secure
    const message = ethers.getBytes(userOpHash as `0x${string}`);
    console.log("Message ethers", message);
    const signature = await signer.signMessage(message);
    console.log("Signature", signature);
    setSignature(signature);
  };

  /// read count from account
  const publicClient = createPublicClient({
    chain: foundry,
    transport: http(),
  });

  const getCount = async () => {
    if (accountSimple) {
      const data = await publicClient.readContract({
        address: SMART_ACCOUNT as `0x${string}`,
        abi: accountSimple?.abi,
        functionName: "count",
      });
      console.log(data);
    }
  };

  return (
    <>
      <div className="text-center mt-8 bg-secondary p-10">
        <h1 className="text-4xl my-0">Local Chain</h1>
      </div>
      <button
        className="btn btn-primary"
        onClick={() => {
          // console.log("Entrypoint address", accountSimple?.abi);
          console.log("SMART ACCOUNT address", SMART_ACCOUNT);
          console.log("Sender (Smart Account created)", sender);
          console.log("Signature", signature);
          console.log(userOp);
        }}
      >
        Click Me for Info
      </button>
      <button
        className="btn btn-secondary"
        onClick={async () => {
          try {
            console.log("Deposit To Sender", sender);
            await depositToAsync({
              functionName: "depositTo",
              args: [PM_ADDRESS],
              value: parseUnits("100", 18),
            });
          } catch (e) {
            console.error("Error setting greeting:", e);
          }
        }}
      >
        1. Deposit to Account / Paymaster
      </button>
      <button className="btn btn-secondary" onClick={() => createUserOp()}>
        2. Create User OP
      </button>
      <button className="btn btn-secondary" onClick={() => createUserOpHash()}>
        3. Create User OP Hash
      </button>
      <button className="btn btn-secondary" onClick={() => createSignatureEthers()}>
        4. Sign User OP with Ethers
      </button>
      <button className="btn btn-secondary" onClick={() => createSignature()}>
        4. Sign User OP with Viem
      </button>
      <button
        className="btn btn-primary"
        onClick={async () => {
          try {
            console.log("User Op", userOp);
            console.log("Account 1", account1.address);
            /// add signature to userOp
            userOp.signature = signature;
            console.log("User Op with Signature attached", userOp);
            await handleOpsAsync({
              functionName: "handleOps",
              args: [[userOp], account1.address],
            });
          } catch (e) {
            console.error("Error setting greeting:", e);
          }
        }}
      >
        5. Run handleOps in the EntryPoint contract
      </button>
      <button className="btn btn-secondary" onClick={() => getCount()}>
        6. Check - Get count of smart contract {SMART_ACCOUNT}
      </button>
    </>
  );
};

export default LocalChain;
