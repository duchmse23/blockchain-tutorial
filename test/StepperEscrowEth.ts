import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { SimpleEscrowEth, StepperEscrowEth } from "../typechain-types";
import { parseEther } from "ethers";

let deployer: HardhatEthersSigner
let user1: HardhatEthersSigner
let user2: HardhatEthersSigner
let user3: HardhatEthersSigner

describe("StepperEscrowEth", () => {
  const WEEK = 60 * 60 * 24 * 7;
  let contract: StepperEscrowEth
  const amount = parseEther("1")
  const steps = 10;
  

  before(async () => {
    [deployer, user1, user2, user3] = await ethers.getSigners();
    const StepperEscrowEth = await ethers.getContractFactory('StepperEscrowEth');
    contract = await StepperEscrowEth.deploy()
  }); 

  it("Init the right lender and borrower", async () => {
   await contract.fund(user1, (await time.latest()) + 10 * WEEK, {value: parseEther("1")});

    expect(await contract.lender()).to.be.equal(deployer.address);
    expect(await contract.borrower()).to.be.equal(user1.address);
    expect(await contract.amount()).to.be.equal(parseEther("1"))
  })

  it("Release first week successful", async () => {
    await time.increase(WEEK)
    const expectResult = BigInt(1e17);
    await expect(contract.release()).to.changeEtherBalance(user1, expectResult)
  })

  it("Release third week successful", async () => {
    await time.increase(2 * WEEK)
    const expectResult = BigInt(1e17 * 2);
    await expect(contract.release()).to.changeEtherBalance(user1, expectResult)
  })

  it("Release final week successful", async () => {
    await time.increase(7 * WEEK)
    const expectResult = BigInt(1e17 * 7);
    await expect(contract.release()).to.changeEtherBalance(user1, expectResult)
  })

  it("Try release again failed", async () => {
    await time.increase(WEEK)
    await expect(contract.release()).to.be.revertedWith("Late")
  })
})