import { ethers } from "hardhat";
import chai from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { solidity } from "ethereum-waffle";

import { Implementation, Malicious, Proxy } from "../typechain";

chai.use(solidity);
const { expect } = chai;

describe("Malicious Contract", () => {
  let deployer: SignerWithAddress;
  let attacker: SignerWithAddress;

  let implementation: Implementation;
  let proxy: Proxy;
  let malicious: Malicious;

  beforeEach(async () => {
    [deployer, attacker] = await ethers.getSigners();

    const ImplementationFactory = await ethers.getContractFactory(
      "Implementation",
      deployer,
    );

    implementation = await ImplementationFactory.deploy();

    const ProxyFactory = await ethers.getContractFactory("Proxy", deployer);

    proxy = await ProxyFactory.deploy(implementation.address, deployer.address);

    const MaliciousFactory = await ethers.getContractFactory(
      "Malicious",
      attacker,
    );

    malicious = await MaliciousFactory.deploy();
  });

  it("should 0", async () => {
    try {
      await malicious.attackImpl(implementation.address);
    } catch (e) {
      console.log(`attackImpl: ${e}`);
    }

    const implCode = await ethers.provider.getCode(implementation.address);
    expect(implCode).to.not.equal("0x");
  });

  it("should 1", async () => {
    try {
      await malicious.attackProxy(proxy.address);
    } catch (e) {
      console.log(`attackImpl: ${e}`);
    }

    const implCode = await ethers.provider.getCode(implementation.address);
    expect(implCode).to.not.equal("0x");
  });

  it("should 2", async () => {
    try {
      await malicious.attack2(implementation.address);
    } catch (e) {
      console.log(`attackImpl: ${e}`);
    }

    const implCode = await ethers.provider.getCode(implementation.address);
    expect(implCode).to.not.equal("0x");
  });

  it("should 3", async () => {
    try {
      let ABI = ["function destruct()"];
      let iface = new ethers.utils.Interface(ABI);
      implementation.delegatecallContract(
        malicious.address,
        iface.encodeFunctionData("destruct"),
      );
    } catch (e) {
      console.log(`attack simple: ${e}`);
    }

    const implCode = await ethers.provider.getCode(implementation.address);
    expect(implCode).to.not.equal("0x");
  });
});
