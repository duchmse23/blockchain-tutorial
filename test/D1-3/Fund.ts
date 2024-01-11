import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Fund" , function() {
  async function deployOneYearLockFixture() {
    const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    const ONE_GWEI = 1_000_000_000;

    const lockedAmount = ONE_GWEI;
    const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;

    const [owner, acc1, acc2] = await ethers.getSigners();

    const Fund = await ethers.getContractFactory("Fund")
    const fund = await Fund.deploy(unlockTime)

    return {fund, unlockTime, lockedAmount, owner, acc1, acc2}
  }

  async function deployOneYearLock2Fixture() {
    const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    // const ONE_GWEI = 1_000_000_000;

    // const lockedAmount = ONE_GWEI;
    const lockedAmount = 1000;
    const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;

    const [owner, acc1, acc2] = await ethers.getSigners();

    const Fund = await ethers.getContractFactory("Fund")
    const fund = await Fund.deploy(unlockTime)
    const contractAddress = await fund.getAddress();
    await fund.mint(lockedAmount);
    return {fund, unlockTime, lockedAmount,contractAddress, owner, acc1, acc2}
  }

  async function deployOneYearLock3Fixture() {
    const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    // const ONE_GWEI = 1_000_000_000;

    // const lockedAmount = ONE_GWEI;
    const lockedAmount = 1000;
    const depositAmount = 100;
    const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;

    const [owner, acc1, acc2] = await ethers.getSigners();
    const Fund = await ethers.getContractFactory("Fund")
    const fund = await Fund.deploy(unlockTime)
    const contractAddress = await fund.getAddress();
    await fund.mint(lockedAmount);
    await fund.deposit(depositAmount);
    return {fund, unlockTime, lockedAmount, contractAddress, depositAmount, owner, acc1, acc2}
  }

  describe("Deployment", function () {
    it("Should set the right unlockTime", async function () {
      const { fund, unlockTime } = await loadFixture(deployOneYearLockFixture);

      expect(await fund.unlockTime()).to.equal(unlockTime);
    });

    it("Should set the right owner", async function () {
      const { fund, owner } = await loadFixture(deployOneYearLockFixture);

      expect(await fund.owner()).to.equal(owner.address);
    });  

    // it("Should receive and store the funds to lock", async function () {
    //   const { fund, lockedAmount } = await loadFixture(
    //     deployOneYearLockFixture
    //   );

    //   expect(await ethers.provider.getBalance(fund.target)).to.equal(
    //     lockedAmount
    //   );
    // });s

    it("Should deposit the right amount", async function() {
      const {fund, owner, contractAddress} = await loadFixture(deployOneYearLock2Fixture)
      const depositAmount = 100
      // await expect(
      //   fund.deposit(depositAmount)
      // ).to.changeTokenBalances(fund, [owner, contractAddress], [-100, 100]);

      expect(fund.deposit(depositAmount)).to.changeEtherBalances([owner, contractAddress], [-100, 100]);
    })

    it("Owner should not withdrawal now", async function() {
      const {fund, owner} = await loadFixture(deployOneYearLock3Fixture)
    

      await expect(fund.withdraw(100)).to.be.reverted;
    })

    it("Owner can withdraw after unlock time", async function() {
      const {fund, owner, unlockTime, lockedAmount, contractAddress} = await loadFixture(deployOneYearLock3Fixture)
      
      await time.increaseTo(unlockTime)

      // await expect(fund.withdraw()).to.emit(fund, "Transfer").withArgs(contractAddress, owner, lockedAmount);
       await expect(fund.withdraw(100)).to.changeEtherBalances(
        [owner, contractAddress],
        [100, -100]
      );
    })
  })

  // describe("Transaction", function() {
  //   it("Should not withdraw if account not authorized", async function() {
  //     const {fund, owner, acc1} = await loadFixture(deployOneYearLock3Fixture)
  //   })
  // })
})