import WETHABI from "../config/weth.abi.json";
import ERC20ABI from "../config/erc20.abi.json";
import { ethers, upgrades } from "hardhat";
import { Contract, Signer } from "ethers";

const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

describe("vault V1", () => {
  let vault: Contract, deployer: Signer, user: Signer;

  beforeEach(async () => {
    [vault, deployer, user] = await deployContract();
    console.log(`second user: ${await user.getAddress()}`);
  });

  it("preview deposit", async () => {
    const amount = "1.0";
    const shares = await vault.previewDeposit(ethers.utils.parseEther(amount), { gasLimit: 1000000 });
    console.log(`will get shares: ${shares}`);
  });

  it("accepts deposit", async () => {
    const amount = "1.0";
    await wrapEther(deployer, amount);

    await approveTransfers(vault.address, deployer, amount);

    const tx = await vault.deposit(ethers.utils.parseEther(amount), await deployer.getAddress(), { gasLimit: 1000000 });
    const rec = await tx.wait();
    console.log(`deposit tx: ${rec.transactionHash}`);

    const assets = await vault.totalAssets();
    console.log(`Total assets: ${assets}`);
  });

  it("can withdraw", async () => {
    const amount = "1.0";
    await wrapEther(deployer, amount);

    await approveTransfers(vault.address, deployer, amount);

    const tx = await vault.deposit(ethers.utils.parseEther(amount), await deployer.getAddress(), { gasLimit: 1000000 });
    const rec = await tx.wait();
    console.log(`deposit tx: ${rec.transactionHash}`);

    const withdrTx = await vault.withdraw(
      ethers.utils.parseEther("0.5"),
      await deployer.getAddress(),
      await deployer.getAddress(),
      { gasLimit: 1000000 },
    );
    const withdrRec = await withdrTx.wait();
    console.log(`withdraw tx: ${withdrRec.transactionHash}`);

    const assets = await vault.totalAssets();
    console.log(`Total assets: ${assets}`);
  });
});

async function deployContract(): Promise<[Contract, Signer, Signer]> {
  const [deployer, user] = await ethers.getSigners();

  const factory = await ethers.getContractFactory("SimpleVault");
  const proxy = await upgrades.deployProxy(factory, [WETH_ADDRESS]);
  await proxy.deployed();

  const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxy.address);

  console.log("Proxy contract address: " + proxy.address);

  console.log("Implementation contract address: " + implementationAddress);
  return [proxy, deployer, user];
}

async function wrapEther(user: Signer, amount: string) {
  const WETH = new ethers.Contract(WETH_ADDRESS, WETHABI, user);
  const tx = await WETH.deposit({
    value: ethers.utils.parseEther(amount),
  });
  const receipt = await tx.wait();
  console.log(`wrapper tx: ${receipt.transactionHash}`);
}

async function approveTransfers(contract: string, user: Signer, amount: string) {
  const WETH = new ethers.Contract(WETH_ADDRESS, ERC20ABI, user);
  const appr = await WETH.approve(contract, ethers.utils.parseEther(amount));
  const res = await appr.wait();
  console.log(`Approved to spend WETH. ${res.transactionHash}`);
}
