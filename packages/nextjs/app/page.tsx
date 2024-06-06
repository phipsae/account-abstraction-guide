"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import type { NextPage } from "next";
import { encodeFunctionData, getContractAddress, parseUnits } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldContract, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

// const SMART_ACCOUNT = "0x75537828f2ce51be7289709686A69CbFDbB714F1";

const FACTORY_NONCE = 1; // to deploy a new smart account change nonce to 2, etc.
const FACTORY_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  // const EP_ADDRESS = "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1";
  // const ACCOUNT_ADDRESS = "0x0B306BF915C4d645ff596e518fAf3F9669b97016";
  // const [txCount, setTxCount] = useState<bigint>();
  const [userOp, setUserOp] = useState({} as any);
  const [createAccountEncoded, setCreateAccountEncoded] = useState("");
  const [executeEncoded, setExecuteEncoded] = useState("");
  // const [testSender, setTestSender] = useState<string>();

  const { data: entryPoint } = useScaffoldContract({
    contractName: "EntryPoint",
  });

  const { data: accountFactory } = useScaffoldContract({
    contractName: "Account123Factory",
  });

  const { data: account } = useScaffoldContract({
    contractName: "Account123",
  });

  /// Get address of smart account that gets created
  const getAddressAA = async () => {
    const sender = ethers.getCreateAddress({
      from: FACTORY_ADDRESS,
      nonce: FACTORY_NONCE,
    });
    console.log("Sender from getAddressAA", sender);
    // setTestSender(sender);
  };
  // CREATE: hash(deployer + nonce)
  // CREATE2: hash(0xff + deployer + salt + bytecode)
  const sender = getContractAddress({
    // bytecode: "0x6394198df16000526103ff60206004601c335afa6040516060f3",
    from: FACTORY_ADDRESS,
    nonce: BigInt(FACTORY_NONCE),
    opcode: "CREATE",
    // salt: "0x7c5ea36004851c764c44143b1dcb59679b11c9a68e5f41497f6cf3d480715331",
  });

  const signer = useAccount();

  const { writeContractAsync: handleOpsAsync } = useScaffoldWriteContract("EntryPoint");
  const { writeContractAsync: depositToAsync, data: hash } = useScaffoldWriteContract("EntryPoint");

  useEffect(() => {
    if (accountFactory) {
      const createAccountEncoded = encodeFunctionData({
        abi: accountFactory?.abi,
        functionName: "createAccount",
        args: [signer.address || ""],
      });
      setCreateAccountEncoded(createAccountEncoded);
    }

    if (account) {
      const executeEncoded = encodeFunctionData({
        abi: account?.abi,
        functionName: "execute",
      });

      setExecuteEncoded(executeEncoded);
    }
  }, [accountFactory, account, signer]);

  const { data: nonceAccountFactory } = useScaffoldReadContract({
    contractName: "EntryPoint",
    functionName: "getNonce",
    args: [sender, BigInt(0)],
  });

  const createUserOp = async () => {
    if (executeEncoded && createAccountEncoded) {
      // const initCode = "0x";
      const initCode = accountFactory?.address + createAccountEncoded.slice(2);

      console.log("InitCode", initCode);

      const callData = "0x";
      // const callData = executeEncoded;

      const userOp = {
        sender, // smart account address
        nonce: nonceAccountFactory,
        initCode,
        callData,
        callGasLimit: 1_000_000,
        verificationGasLimit: 500_000,
        preVerificationGas: 50_000,
        maxFeePerGas: ethers.parseUnits("100000", "gwei"), //parseUnits("10", 9),
        maxPriorityFeePerGas: ethers.parseUnits("50000", "gwei"),
        paymasterAndData: "0x",
        signature: "0x",
      };
      setUserOp(userOp);
      console.log(userOp);
    }
  };

  const { writeContract } = useWriteContract();

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Scaffold-ETH 2</span>
          </h1>
          <div className="flex justify-center items-center space-x-2">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            console.log("Entrypoint address", entryPoint?.abi);
            // console.log("Nonce", txCount);
            console.log("Signer", signer.address);
            console.log("UserOp", userOp);
            console.log("Sender", sender, "AccountFactory", accountFactory?.address);
          }}
        >
          Click Me
        </button>
        <button
          type="button"
          onClick={() => {
            createUserOp();
          }}
        >
          Create User Op
        </button>
        <button
          className="btn btn-primary"
          onClick={async () => {
            try {
              console.log("Deposit To Sender", sender);
              console.log("Signer", signer.address);
              await depositToAsync({
                functionName: "depositTo",
                args: [sender],
                value: parseUnits("1", 18),
              });
            } catch (e) {
              console.error("Error setting greeting:", e);
            }
          }}
        >
          Deposit to Account
        </button>

        <button
          className="btn btn-primary"
          onClick={async () => {
            try {
              console.log("Deposit To Sender", sender);

              writeContract({
                address: entryPoint?.address,
                abi: entryPoint?.abi,
                functionName: "depositTo",
                args: [sender],
              });
            } catch (e) {
              console.error("Error setting greeting:", e);
            }
          }}
        >
          Deposit to Account WAGMI
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
          Run handleOps
        </button>
        <button
          onClick={() => {
            getAddressAA();
          }}
        >
          Get Sender AA
        </button>

        {hash && <div>Transaction Hash: {hash}</div>}
      </div>
    </>
  );
};

export default Home;
