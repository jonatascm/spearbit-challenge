import { ethers } from "hardhat";
import chai from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { solidity } from "ethereum-waffle";

import { Implementation, Malicious } from "../typechain";

chai.use(solidity);
const { expect } = chai;

describe("Malicious Contract", () => {
  let deployer: SignerWithAddress;
  let attacker: SignerWithAddress;

  let implementation: Implementation;
  let malicious: Malicious;

  beforeEach(async () => {
    [deployer, attacker] = await ethers.getSigners();

    const ImplementationFactory = await ethers.getContractFactory(
      "Implementation",
      deployer,
    );

    implementation = await ImplementationFactory.deploy();

    const MaliciousFactory = await ethers.getContractFactory(
      "Malicious",
      attacker,
    );

    malicious = await MaliciousFactory.deploy();
  });

  it("should destruct implementation contract", async () => {
    await malicious.attack(implementation.address);
    expect(await ethers.provider.getCode(implementation.address)).to.equal(
      "0x",
    );
  });
});
