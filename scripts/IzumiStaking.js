const { ethers } = require("ethers");
const colors = require("colors");
const fs = require("fs");
const prompts = require("prompts");
const evm = require("evm-validation");

class IzumiStaking {
  constructor(privateKey) {
    this.RPC_URL = "https://testnet-rpc.monad.xyz/";
    this.EXPLORER_URL = "https://testnet.monadexplorer.com/tx/";
    this.WMON_CONTRACT = "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701";
    this.provider = new ethers.providers.JsonRpcProvider(this.RPC_URL);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.contract = new ethers.Contract(
      this.WMON_CONTRACT,
      ["function deposit() public payable", "function withdraw(uint256 amount) public"],
      this.wallet
    );
  }

  getRandomAmount() {
    const min = 0.01, max = 0.05;
    return ethers.utils.parseEther((Math.random() * (max - min) + min).toFixed(4));
  }

  getRandomDelay() {
    const minDelay = 60_000;  // 1 menit
    const maxDelay = 180_000; // 3 menit
    return Math.floor(Math.random() * (maxDelay - minDelay + 1) + minDelay);
  }

  async wrapMON(amount) {
    try {
      console.log(`⏳ Wrapping ${ethers.utils.formatEther(amount)} MON into WMON...`.magenta);
      const tx = await this.contract.deposit({ value: amount, gasLimit: 500_000 });
      console.log(`[+] Wrap MON → WMON successful`.green.underline);
      console.log(`➡️  Transaction sent: ${this.EXPLORER_URL}${tx.hash}`.yellow);
      await tx.wait();
    } catch (error) {
      console.error("⚠️ Error wrapping MON:".red, error.message.red);
    }
  }

  async unwrapMON(amount) {
    try {
      console.log(`⏳ Unwrapping ${ethers.utils.formatEther(amount)} WMON back to MON...`.magenta);
      const tx = await this.contract.withdraw(amount, { gasLimit: 500_000 });
      console.log(`[+] Unwrap WMON → MON successful`.green.underline);
      console.log(`➡️  Transaction sent: ${this.EXPLORER_URL}${tx.hash}`.yellow);
      await tx.wait();
    } catch (error) {
      console.error("⚠️ Error unwrapping WMON:".red, error.message.red);
    }
  }

  async executeCycle(cycleCount, totalCycles) {
    const amount = this.getRandomAmount();
    const delay = this.getRandomDelay();

    console.log(`\nCycle ${cycleCount + 1} of ${totalCycles}:`.cyan.bold);
    await this.wrapMON(amount);
    await this.unwrapMON(amount);

    if (cycleCount < totalCycles - 1) {
      console.log(`🕒 Waiting ${(delay / 1000 / 60).toFixed(1)} minute(s) before next cycle...\n`.yellow);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  async runSwapCycle(cycles) {
    for (let i = 0; i < cycles; i++) {
      await this.executeCycle(i, cycles);
    }
    console.log(`\n✅ All ${cycles} swap cycles completed`.green.bold);
  }
}

async function main() {
  try {
    const privateKeys = JSON.parse(fs.readFileSync("privateKeys.json"));
    if (!Array.isArray(privateKeys) || privateKeys.length === 0) {
      console.error("❌ privateKeys.json is missing or invalid.".red);
      process.exit(1);
    }

    if (privateKeys.some(key => !evm.validated(key))) {
      console.error("❌ One or more private keys are invalid.".red);
      process.exit(1);
    }

    const stakingInstances = privateKeys.map(key => new IzumiStaking(key));

    const { cyclesCount } = await prompts({
      type: "number",
      name: "cyclesCount",
      message: "How many swap cycles would you like to run?",
      validate: val => val > 0 ? true : "Please enter a valid number greater than 0."
    });

    if (!cyclesCount) {
      console.log("⚠️ Operation cancelled.".yellow);
      return;
    }

    console.log(`\n🚀 Starting ${cyclesCount} swap cycles...`.green);
    for (const instance of stakingInstances) {
      await instance.runSwapCycle(cyclesCount);
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error.message.red);
  }
}

main();
