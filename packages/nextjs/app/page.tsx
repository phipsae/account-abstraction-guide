"use client";

import LocalChain from "./localChain/page";
import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Account Abstraction Tutorial</span>
            <span className="block text-3xl mt-2">with Scaffold-ETH 2</span>
          </h1>
          <LocalChain />
        </div>
      </div>
    </>
  );
};

export default Home;
