import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { expect } from "chai";
import { parseUnits } from "ethers";
import { ethers } from "hardhat";
import { SCV, Token } from "../../typechain-types";


let deployer: HardhatEthersSigner
let user1: HardhatEthersSigner
let user2: HardhatEthersSigner
let user3: HardhatEthersSigner

describe("SCV: Simple claim verification", function () {
  let contract: SCV
  let contractAddr: string
  // let bnb: Token
  let usdt: Token

  let tree: StandardMerkleTree<(bigint | string)[]>

  function parseUsdt(amount: string) {
    return parseUnits(amount, 18)
  }

  function getProofByAddr(address: string) {
    for (const [i, [addr, amount]] of tree.entries()) {
      if (addr === address) {
        const proof = tree.getProof(i)
        return proof;
      }
    }
  }

  function getProofByValue(value: (string | bigint)[]) {
    return tree.getProof(value)
  }

  before(async () => {
    [deployer, user1, user2, user3] = await ethers.getSigners();

    const values = [
      [deployer.address, parseUsdt('10')],
      [user1.address, parseUsdt('10')],
      [user2.address, parseUsdt('10')],
    ]

    const Token = await ethers.getContractFactory("Token");
    // bnb = await Token.deploy("Bianance", "BNB", 6);
    usdt = await Token.deploy("USDT", "USDT", 18);

    tree = StandardMerkleTree.of(values, ['address', 'uint256'])
    const SCV = await ethers.getContractFactory('SCV');
    contract = await SCV.deploy(tree.root)
    contractAddr = await contract.getAddress()
    // await bnb.transfer(contractAddress, parseUnits("100", await bnb.decimals()))
    await usdt.approve(contractAddr, parseUsdt('100'));
    await usdt.approve(deployer, parseUsdt('100'));
    await usdt.approve(user1, parseUsdt('100'))
    await usdt.approve(user2, parseUsdt('100'))
    await usdt.approve(user3, parseUsdt('100'))

    await usdt.transfer(contractAddr, parseUsdt('100'));
  })

  it("Deployer can claim 10 usdt: should success", async () => {
    const proof = getProofByValue([deployer.address, parseUsdt('10')])
    await contract.claim(parseUsdt('10'), proof);
    expect(await contract.test()).equal(deployer.address)
  })

  it("User 1 fake claim 20 usdt: should fail", async () => {
    const proof = getProofByValue([user1.address, parseUsdt('10')])
    await expect(contract.connect(user1).claim(parseUsdt('20'), proof)).to.be.revertedWith('Invalid proof');
  })

  it("User 2 claim 20 usdt: should success", async () => {
    const proof = getProofByValue([user2.address, parseUsdt('10')])
    await contract.connect(user2).claim(parseUsdt('10'), proof)
    expect(await contract.test()).equal(user2.address);
  })
});
