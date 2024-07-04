"use client";

import type { NextPage } from "next";
import { createPublicClient, encodeFunctionData, getContract, getContractAddress, http, parseUnits } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import { useScaffoldContract, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

const EP_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const FACTORY_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const FACTORY_NONCE = 1;

const LocalChain: NextPage = () => {
  const { data: entryPoint } = useScaffoldContract({
    contractName: "EntryPoint",
  });

  const { data: yourContract } = useScaffoldContract({
    contractName: "YourContract",
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

  // const createAccountEncoded = encodeFunctionData({
  //   abi: accountSimpleFactory?.abi,
  //   functionName: "createAccount",
  //   args: [signer.address],
  // });

  // const createUserOp = async () => {
  //   if (executeEncoded && createAccountEncoded) {
  //     // const initCode = "0x";
  //     const initCode = accountFactory?.address + createAccountEncoded.slice(2);

  //     console.log("InitCode", initCode);

  //     // const callData = "0x";
  //     const callData = executeEncoded;

  //     const userOp = {
  //       sender, // smart account address
  //       nonce: nonceFromEP, // nonce from the entrypoint nonce manager
  //       initCode,
  //       callData,
  //       callGasLimit: 500_000,
  //       verificationGasLimit: 500_000,
  //       preVerificationGas: 50_000,
  //       maxFeePerGas: ethers.parseUnits("10", "gwei"), //parseUnits("10", 9),
  //       maxPriorityFeePerGas: ethers.parseUnits("5", "gwei"),
  //       paymasterAndData: "0x",
  //       signature: "0x",
  //     };
  //     setUserOp(userOp);
  //     console.log(userOp);
  //   }
  // };

  return (
    <>
      <div className="text-center mt-8 bg-secondary p-10">
        <h1 className="text-4xl my-0">Local Chain</h1>
      </div>
      <button
        type="button"
        onClick={() => {
          console.log("Entrypoint address", entryPoint?.abi);
          console.log("Signer", signer.address);
          console.log({ sender });
        }}
      >
        Click Me
      </button>
    </>
  );
};

export default LocalChain;
