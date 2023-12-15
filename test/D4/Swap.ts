import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import {  Swap, Token } from "../../typechain-types";
import { parseEther, parseUnits } from "ethers";

let deployer: HardhatEthersSigner
let user1: HardhatEthersSigner
let user2: HardhatEthersSigner
let user3: HardhatEthersSigner

describe("Swap", () => {
  let contract: Swap
  let contractAddress: string
  let bnb: Token
  let usdt: Token
  

  before(async () => {
    [deployer, user1, user2, user3] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("Token");
    bnb = await Token.deploy("Bianance", "BNB", 6);
    usdt = await Token.deploy("USDT", "USDT", 18);

    // usdt.transfer(deployer, parseUnits("1000", await usdt.decimals()));

    const Swap = await ethers.getContractFactory('Swap');
    contract = await Swap.deploy(bnb, usdt)
    contractAddress = await contract.getAddress()
    await bnb.transfer(contractAddress, parseUnits("100", await bnb.decimals()))
  }); 

  it("Swap 100 BNB", async () => {
    const amount = parseUnits("10", await bnb.decimals()) //BNB
    // const exchangableAmount = 6000n;

    await bnb.approve(contractAddress, parseUnits("1000000000", await bnb.decimals()))
    await usdt.approve(contractAddress, parseUnits("1000000000", await usdt.decimals()))

    const usdtApprove = await usdt.allowance(deployer.address, contractAddress)

    console.log('usdtApprove=', usdtApprove)

    await contract.swap(amount)

    // expect(await bnb.balanceOf(deployer.address)).to.equal(swapAmount)
    // expect(await usdt.balanceOf(deployer.address)).to.equal(parseUnits("6000", await usdt.decimals()))
  })
})