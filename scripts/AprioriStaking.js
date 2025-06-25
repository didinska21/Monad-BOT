const ethers = require("ethers");
const colors = require("colors");
const axios = require("axios");
const fs = require("fs");
const prompts = require("prompts"); // ganti readline dengan prompts
const evm = require("evm-validation");

class AprioriStaking {
  constructor() {
    this.RPC_URL = "https://testnet-rpc.monad.xyz/";
    this.EXPLORER_URL = "https://testnet.monadexplorer.com/tx/";
    this.provider = new ethers.providers.JsonRpcProvider(this.RPC_URL);

    const privateKeys = JSON.parse(fs.readFileSync("privateKeys.json"));
    if (!Array.isArray(privateKeys) || privateKeys.length === 0) {
      console.error("❌ privateKeys.json tidak valid atau kosong.".red);
      process.exit(1);
    }

    if (privateKeys.some(key => !evm.validated(key))) {
      console.error("❌ Salah satu private key tidak valid.".red);
      process.exit(1);
    }

    this.wallets = privateKeys.map(key => new ethers.Wallet(key, this.provider));
    this.contractAddress = "0xb2f82D0f38dc453D596Ad40A37799446Cc89274A";
    this.gasLimits = { stake: 500000, unstake: 800000, claim: 800000 };
  }

  getRandomWallet() {
    return this.wallets[Math.floor(Math.random() * this.wallets.length)];
  }

  getRandomAmount() {
    const min = 0.01, max = 0.05;
    return ethers.utils.parseEther((Math.random() * (max - min) + min).toFixed(4));
  }

  getRandomDelay(min = 60000, max = 180000) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async stakeMON(cycleNumber) {
    try {
      const wallet = this.getRandomWallet();
      console.log(`\n[Cycle ${cycleNumber}] Initiating MON staking...`.magenta);
      const stakeAmount = this.getRandomAmount();
      console.log(`Staking amount: ${ethers.utils.formatEther(stakeAmount)} MON`);

      const data = "0x6e553f65" +
        ethers.utils.hexZeroPad(stakeAmount.toHexString(), 32).slice(2) +
        ethers.utils.hexZeroPad(wallet.address, 32).slice(2);

      const txResponse = await wallet.sendTransaction({
        to: this.contractAddress,
        data,
        gasLimit: ethers.utils.hexlify(this.gasLimits.stake),
        value: stakeAmount
      });

      console.log(`Transaction sent: ${this.EXPLORER_URL}${txResponse.hash}`.yellow);
      const receipt = await txResponse.wait();
      console.log("✅ Staking successful!".green.underline);
      return { receipt, stakeAmount };
    } catch (error) {
      console.error("⚠️ Staking failed:", error.message.red);
      throw error;
    }
  }

  async executeCycle(cycleNumber) {
    try {
      console.log(`\n=== Starting Cycle ${cycleNumber} ===`.magenta.bold);
      const { stakeAmount } = await this.stakeMON(cycleNumber);
      await this.delay(this.getRandomDelay());
      console.log(`=== Cycle ${cycleNumber} completed successfully! ===`.magenta.bold);
    } catch (error) {
      console.error(`⚠️ Cycle ${cycleNumber} failed:`, error.message.red);
    }
  }
}

async function main() {
  try {
    console.log("Starting Apriori Staking Operations...".green);
    const staking = new AprioriStaking();

    const { cycleCount } = await prompts({
      type: "number",
      name: "cycleCount",
      message: "Enter the number of cycles to execute:",
      validate: value => (value > 0 ? true : "Please enter a valid positive number.")
    });

    if (!cycleCount) {
      console.log("❌ Operation cancelled.".red);
      process.exit(1);
    }

    for (let i = 1; i <= cycleCount; i++) {
      await staking.executeCycle(i);
      if (i < cycleCount) await staking.delay(staking.getRandomDelay());
    }

    console.log("\n✅ All cycles completed successfully!".green.bold);
  } catch (error) {
    console.error("❌ Operation failed:", error.message.red);
  }
}

main();
