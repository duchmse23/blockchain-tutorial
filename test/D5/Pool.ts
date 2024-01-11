import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { LiquidityPool, Token } from "../../typechain-types";
import { parseUnits } from "ethers";

let deployer: HardhatEthersSigner
let user1: HardhatEthersSigner
let user2: HardhatEthersSigner
let user3: HardhatEthersSigner

describe("LiquidityPool", () => {
  let contract: LiquidityPool
  let contractAddress: string
  let bnb: Token
  let usdt: Token
  let bnbDecimals: bigint
  let usdtDecimals: bigint


  before(async () => {
    [deployer, user1, user2, user3] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("Token");
    bnb = await Token.deploy("Binance", "BNB", 18)
    usdt = await Token.deploy("USDT", "USDT", 6);

    const LiquidityPool = await ethers.getContractFactory('LiquidityPool');
    contract = await LiquidityPool.deploy(bnb, usdt, deployer)
    contractAddress = await contract.getAddress()
    bnbDecimals = await bnb.decimals();
    usdtDecimals = await usdt.decimals();

    await bnb.transfer(contractAddress, parseUnits("100", bnbDecimals))
    await usdt.transfer(contractAddress, parseUnits("20000", usdtDecimals))

    await contract.lock();

    bnb.approve(deployer, parseUnits("100000", bnbDecimals))
    bnb.approve(contractAddress, parseUnits("100000", bnbDecimals))
    bnb.approve(user1, parseUnits("100000", bnbDecimals))
    bnb.approve(user2, parseUnits("100000", bnbDecimals))

    usdt.approve(contractAddress, parseUnits("100000", usdtDecimals))
    usdt.approve(deployer, parseUnits("100000", usdtDecimals))
    usdt.approve(user1, parseUnits("100000", usdtDecimals))
    usdt.approve(user2, parseUnits("100000", usdtDecimals))
  });

  it("User1:Buy 1 BNB", async () => {
    await contract.connect(user1).buy(parseUnits("1", bnbDecimals))
    console.log("bnb:", await contract.x())
  }) 

  it("User1:Sell 1 BNB", async () => {
    contract.connect(user1).sell(parseUnits("1", bnbDecimals))
  })
})