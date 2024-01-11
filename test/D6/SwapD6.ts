import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { parseUnits } from "ethers";
import { ethers } from "hardhat";
import { SwapD6, Token } from "../../typechain-types";

let deployer: HardhatEthersSigner
let user1: HardhatEthersSigner
let user2: HardhatEthersSigner
let user3: HardhatEthersSigner

describe("SwapD6", function () {
  let contract: SwapD6
  let contractAddress: string
  let bnb: Token
  let usdt: Token

  before(async () => {
    [deployer, user1, user2, user3] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("Token");
    bnb = await Token.deploy("Bianance", "BNB", 6);
    usdt = await Token.deploy("USDT", "USDT", 18);

    // usdt.transfer(deployer, parseUnits("1000", await usdt.decimals()));

    const SwapD6 = await ethers.getContractFactory('SwapD6');
    contract = await SwapD6.deploy(bnb, usdt)
    contractAddress = await contract.getAddress()
    await bnb.transfer(contractAddress, parseUnits("100", await bnb.decimals()))
    await usdt.transfer(user1, parseUnits('1000000', await usdt.decimals()))

    await bnb.approve(contractAddress, parseUnits("1000000000", await bnb.decimals()))
    await bnb.approve(deployer, parseUnits("1000000000", await bnb.decimals()))
    await bnb.approve(user1, parseUnits("1000000000", await bnb.decimals()))
    await usdt.connect(user1).approve(contractAddress, parseUnits("1000000000", await usdt.decimals()))
    await usdt.approve(contractAddress, parseUnits("1000000000", await usdt.decimals()))
    await usdt.approve(deployer, parseUnits("1000000000", await usdt.decimals()))
    await usdt.approve(user1, parseUnits("1000000000", await usdt.decimals()))
  })

  it("Init", async () => {
    expect(await contract.token0()).to.be.equal(await bnb.getAddress())

    expect(await contract.init(parseUnits("100", 6), parseUnits("20000", 18))).to.be.changeTokenBalance(
      bnb, contractAddress, parseUnits("100", 6)
    );

    const balances = await contract.balanceOf(deployer)
    expect(balances).to.be.equal(parseUnits("100", 18))
  })

  it("Init twice failed, expected revert", async () => {
    await expect(contract.init(parseUnits("100", 6), parseUnits("20000", 18)))
    .to.be.revertedWith("Can not init again");
  })

  it("User1 buys 10 bnb",async () => {
    await expect(contract.connect(user1).buy(parseUnits('10', 6)))
    .to.be.changeTokenBalance(
      bnb,user1, parseUnits('10', 6)
    )
  })

  it("Deposit 10bnb", async () => {
   expect ( contract.deposit(parseUnits("10", await bnb.decimals()))).to.be.changeTokenBalance(
    bnb, contractAddress, parseUnits('100', await bnb.decimals())
   )

   expect(contract.amount1).to.be.changeTokenBalance(
    usdt, contractAddress, parseUnits('')
   )
  })
});
