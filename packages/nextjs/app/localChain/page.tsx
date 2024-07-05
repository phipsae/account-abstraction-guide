"use client";

import { ethers } from "ethers";
import type { NextPage } from "next";
import { createPublicClient, encodeFunctionData, getContract, getContractAddress, http, parseUnits } from "viem";
import { foundry } from "viem/chains";
import { useAccount, useWriteContract } from "wagmi";
import { useScaffoldContract, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

const EP_ADDRESS = "0x4826533B4897376654Bb4d4AD88B7faFD0C98528";
const FACTORY_ADDRESS = "0x0E801D84Fa97b50751Dbf25036d067dCf18858bF";
const FACTORY_NONCE = 1;
const SMART_ACCOUNT = "0xD4eF5bFBe5925B905BD3EC0921bFe28b04ac61aE";
const PM_ADDRESS = "0x8f86403A4DE0BB5791fa46B8e795C547942fE4Cf";

const LocalChain: NextPage = () => {
  const { data: entryPoint } = useScaffoldContract({
    contractName: "EntryPoint",
  });

  const { writeContractAsync: handleOpsAsync } = useScaffoldWriteContract("EntryPoint");
  const { writeContractAsync: depositToAsync } = useScaffoldWriteContract("EntryPoint");

  const { data: accountSimple } = useScaffoldContract({
    contractName: "AccountSimple",
  });

  const { data: accountSimpleFactory } = useScaffoldContract({
    contractName: "AccountSimpleFactory",
  });

  const signer = useAccount();

  const sender = getContractAddress({
    // bytecode: "0x6394198df16000526103ff60206004601c335afa6040516060f3",
    from: FACTORY_ADDRESS,
    nonce: BigInt(FACTORY_NONCE),
    opcode: "CREATE",
    // salt: "0x7c5ea36004851c764c44143b1dcb59679b11c9a68e5f41497f6cf3d480715331",
  });

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
      args: [signer.address as `0x${string}`],
    });
  }

  let executeEncoded = "";

  if (accountSimple) {
    executeEncoded = encodeFunctionData({
      abi: accountSimple?.abi,
      functionName: "execute",
    });
  }

  let userOp = {} as any;

  // const createUserOp = async () => {
  if (executeEncoded && createAccountEncoded) {
    /// if already SA created then use 0x
    const initCode = "0x";
    // const initCode = accountSimpleFactory?.address + createAccountEncoded.slice(2);

    // console.log("InitCode", initCode);

    // const callData = "0x";
    const callData = executeEncoded;

    userOp = {
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
  }
  // };

  /// read count from account
  const publicClient = createPublicClient({
    chain: foundry,
    transport: http(),
  });

  const getCount = async () => {
    if (accountSimple) {
      const data = await publicClient.readContract({
        address: SMART_ACCOUNT,
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
          console.log("Entrypoint address", accountSimple?.abi);
          console.log("Signer", signer.address);
          console.log("Sender (Smart Account created)", sender);
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
            console.log("Signer", signer.address);
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
      <button
        className="btn btn-primary"
        onClick={async () => {
          try {
            console.log("User Op", userOp);
            console.log("Signer", signer.address);
            await handleOpsAsync({
              functionName: "handleOps",
              args: [[userOp], signer.address],
            });
          } catch (e) {
            console.error("Error setting greeting:", e);
          }
        }}
      >
        2. Run handleOps in the EntryPoint contract
      </button>
      <button className="btn btn-secondary" onClick={() => getCount()}>
        3. get count of smart contract {SMART_ACCOUNT}
      </button>
    </>
  );
};

export default LocalChain;
