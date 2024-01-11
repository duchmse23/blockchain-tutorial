import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { SimpleEscrowEth } from "../typechain-types";
import { parseEther } from "ethers";

let deployer: HardhatEthersSigner
let user1: HardhatEthersSigner
let user2: HardhatEthersSigner
let user3: HardhatEthersSigner

describe("SimpleEscrowEth", () => {
  const DAY = 60 * 60 * 24;
  let contract: SimpleEscrowEth

  before(async () => {
    [deployer, user1, user2, user3] = await ethers.getSigners();
    const SimpleEscowEth = await ethers.getContractFactory('SimpleEscrowEth');
    contract = await SimpleEscowEth.deploy()
  }); 

  it("Init the right lender and borrower", async () => {
   await contract.fund(user1, (await time.latest()) + DAY, {value: parseEther("1")});

    expect(await contract.lender()).to.be.equal(deployer.address);
    expect(await contract.borrower()).to.be.equal(user1.address);
    expect(await contract.amount()).to.be.equal(parseEther("1"))
  })

  it("Release successful", async () => {
    await time.increase(DAY)

    await expect(contract.release()).to.changeEtherBalance(user1, parseEther("1"))
  })
})