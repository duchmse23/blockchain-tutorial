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
    const fund = await Fund.deploy()

    return {fund, unlockTime, lockedAmount, owner, acc1, acc2}
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
    // });



    it("Should deposit the right amount", async function() {
      const {fund, owner} = await loadFixture(deployOneYearLockFixture)

      const mintAmount = 1000;
      await fund.mint(mintAmount);
      expect(await fund.totalSupply()).to.equal(mintAmount)
      expect(await fund.balanceOf(owner)).to.equal(mintAmount)
      
      const depositAmount = 100
      const contractAddress = await fund.getAddress();
      // await expect(
      //   await fund.deposit(depositAmount)
      // ).to.changeTokenBalances(fund, [owner, contractAddress], [-100, 100]);

      await fund.withdraw()
    })
  })

  // it("Owner should not withdrawal now", async function() {

  // })
})