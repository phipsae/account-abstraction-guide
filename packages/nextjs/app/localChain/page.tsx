"use client";

import { useEffect, useState } from "react";
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
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldContract, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

/// change manually to create different smart accounts for EOA
/// (not how it should be done in production) - normally Create2
const FACTORY_NONCE = 1;

const LocalChain: NextPage = () => {
  const { data: entryPoint } = useScaffoldContract({
    contractName: "EntryPoint",
  });

  /// change between different accounts (EOAs)
  const account1 = privateKeyToAccount(process.env.NEXT_PUBLIC_FOUNDRY_PRIVATE_KEY_1 as `0x${string}`);
  // const account2 = privateKeyToAccount(process.env.NEXT_PUBLIC_FOUNDRY_PRIVATE_KEY_2 as `0x${string}`);

  const [accountFactoryAddress, setAccountFactoryAddress] = useState<any>();
  const [paymasterAddress, setPaymasterAddress] = useState<any>();
  const [created, setCreated] = useState<boolean>(false);
  const [userOp, setUserOp] = useState({} as any);
  const [userOpHash, setUserOpHash] = useState<`0x${string}`>();
  const [count, setCount] = useState<number | undefined>(undefined);

  const { writeContractAsync: entryPointWriteAsync } = useScaffoldWriteContract("EntryPoint");

  const { data: accountSimple } = useScaffoldContract({
    contractName: "AccountSimple",
  });

  const { data: accountFactorySimple } = useScaffoldContract({
    contractName: "AccountFactorySimple",
  });

  const { data: paymaster } = useScaffoldContract({
    contractName: "Paymaster",
  });

  useEffect(() => {
    setPaymasterAddress(paymaster?.address);
  }, [paymaster]);

  useEffect(() => {
    setAccountFactoryAddress(accountFactorySimple?.address);
  }, [accountFactorySimple]);

  /// Create clients with viem
  const publicClient = createPublicClient({
    chain: foundry,
    transport: http(),
  });

  const walletClient = createWalletClient({
    account: account1,
    chain: foundry,
    transport: http(),
  });

  /// determine smart account address (sender) upfront (counterfactual) with normal Create method
  /// does not with bundler, therefore Create2 is necessacry because Create is a forbidden opcode
  /// because the nonce can change from inception to execution
  let sender = "";

  if (accountFactoryAddress) {
    sender = getContractAddress({
      from: accountFactoryAddress as `0x${string}`,
      nonce: BigInt(FACTORY_NONCE),
      opcode: "CREATE",
    });
  }

  const smartAccountAddress = sender;

  useEffect(() => {
    getCode(smartAccountAddress as `0x${string}`);
  });

  const { data: nonceFromEP } = useScaffoldReadContract({
    contractName: "EntryPoint",
    functionName: "getNonce",
    args: [sender as `0x${string}`, BigInt(0)],
  });

  const getCode = async (_address: `0x${string}`) => {
    try {
      if (accountSimple) {
        const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
        if (!ethers.isAddress(_address)) {
          throw new Error(`Invalid Ethereum address: ${_address}`);
        }
        const code = await provider.getCode(_address as `0x${string}`);
        setCreated(code !== "0x");
        return code;
      }
    } catch (error) {
      console.error("Error fetching contract code:", error);
    }
  };

  /// determine part for initCode for smart account creation
  let createAccountEncoded = "";

  if (accountFactorySimple) {
    createAccountEncoded = encodeFunctionData({
      abi: accountFactorySimple?.abi,
      functionName: "createAccount",
      args: [account1.address as `0x${string}`],
    });
  }

  /// determine call data for userOp, which function should be called of smart account
  let executeEncoded = "";

  if (accountSimple) {
    executeEncoded = encodeFunctionData({
      abi: accountSimple?.abi,
      functionName: "execute",
    });
  }

  /// create userOP without signature -- append sig after UserOp is signed
  const createUserOp = async () => {
    if (executeEncoded && createAccountEncoded) {
      /// check if smart account already exists if not set initCode for userOp
      const code = await getCode(smartAccountAddress as `0x${string}`);
      let initCode = "0x";
      if (code === "0x") {
        initCode = accountFactoryAddress + createAccountEncoded.slice(2);
      }

      /// set Calldata for userOp
      const callData = executeEncoded;

      const userOp = {
        sender, // smart account address
        nonce: nonceFromEP, // nonce from the entrypoint nonce manager
        initCode,
        callData,
        callGasLimit: 500_000,
        verificationGasLimit: 500_000,
        preVerificationGas: 50_000,
        maxFeePerGas: ethers.parseUnits("10", "gwei"),
        maxPriorityFeePerGas: ethers.parseUnits("5", "gwei"),
        paymasterAndData: paymasterAddress,
        signature: "0x",
      };
      console.log("User Op", userOp);
      setUserOp(userOp);
    }
  };

  /// hash userOp, requirement to create signature
  const createUserOpHash = async () => {
    console.log(userOp);
    const userOpHash = await entryPoint?.read.getUserOpHash([userOp]);
    console.log("User Op Hash", userOpHash);
    setUserOpHash(userOpHash);
  };

  /// sign userOp
  const createSignature = async () => {
    const message = toBytes(userOpHash as `0x${string}`);
    const signature = await walletClient.signMessage({
      message: { raw: message },
    });
    /// add signature to userOp
    userOp.signature = signature;
  };

  /// read count from account
  const getCount = async () => {
    if (accountSimple) {
      const data = await publicClient.readContract({
        address: smartAccountAddress as `0x${string}`,
        abi: accountSimple?.abi,
        functionName: "count",
      });
      console.log(data);
      setCount(Number(data));
    }
  };

  return (
    <>
      <div className="max-w-md mx-auto mt-10">
        <div className="flex flex-col gap-1 mt-2 p-4 border-2 border-blue-100 bg-blue-100 rounded-3xl">
          <div className="flex flex-row items-center gap-1 mb-2">
            <div>Signer Address: </div>
            <Address address={account1.address} />
          </div>
          <div className="flex flex-row items-center gap-1 mb-2">
            <div>Paymaster Address:</div>
            <Address address={paymasterAddress} />
          </div>
          <div className="flex flex-row items-center gap-1 mb-2">
            <div>Paymaster Address:</div>
            <Address address={accountFactoryAddress} />
          </div>
          <div className="flex flex-row items-center gap-1 mb-2">
            <div>SmartAcc. Address:</div>
            <Address address={smartAccountAddress as `0x${string}`} />
            <div>{created ? "✅ (Created)" : "❌(Not Created)"}</div>
          </div>
        </div>
        <button
          className="btn btn-primary block w-full mb-2 mt-2"
          onClick={async () => {
            try {
              console.log("Deposit To Sender", sender);
              await entryPointWriteAsync({
                functionName: "depositTo",
                args: [paymasterAddress],
                value: parseUnits("100", 18),
              });
            } catch (e) {
              console.error("Error setting greeting:", e);
            }
          }}
        >
          1. Deposit to Paymaster
        </button>
        <button className="btn btn-secondary block w-full mb-2" onClick={() => createUserOp()}>
          2. Create User OP
        </button>
        <button className="btn btn-primary block w-full mb-2" onClick={() => createUserOpHash()}>
          3. Hash User OP
        </button>
        <button className="btn btn-secondary block w-full mb-2" onClick={() => createSignature()}>
          4. Sign User OP
        </button>
        <button
          className="btn btn-primary block w-full mb-2"
          onClick={async () => {
            try {
              await entryPointWriteAsync({
                functionName: "handleOps",
                args: [[userOp], account1.address],
              });
            } catch (e) {
              console.error("Error setting greeting:", e);
            }
          }}
        >
          5. Exeute transaction (Run handleOps in EntryPoint)
        </button>
        <button className="btn btn-secondary block w-full mb-2" onClick={() => getCount()}>
          6. Get count of smart contract
        </button>
        {count && (
          <div className="mt-4 bg-gray-100 border border-gray-100 rounded-3xl shadow-md text-center">
            <p className="text-sm">Count: {count}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default LocalChain;
