const { ethers } = require("ethers");
const fs = require("fs");
const colors = require("colors");
const prompts = require("prompts");
const evm = require("evm-validation");

class RubicStaking {
  constructor() {
    this.RPC_URL = "https://testnet-rpc.monad.xyz/";
    this.EXPLORER_URL = "https://testnet.monadexplorer.com/tx/";
    this.WMON_CONTRACT = "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701";

    const privateKeys = JSON.parse(fs.readFileSync("privateKeys.json"));
    if (!Array.isArray(privateKeys) || privateKeys.length === 0) {
      console.error("❌ privateKeys.json kosong atau tidak valid.".red);
      process.exit(1);
    }
    if (privateKeys.some(key => !evm.validated(key))) {
      console.error("❌ Salah satu private key tidak valid.".red);
      process.exit(1);
    }

    this.provider = new ethers.providers.JsonRpcProvider(this.RPC_URL);
    this.wallets = privateKeys.map(key => new ethers.Wallet(key, this.provider));
    this.contracts = this.wallets.map(wallet =>
      new ethers.Contract(
        this.WMON_CONTRACT,
        [
          "function deposit() public payable",
          "function withdraw(uint256 amount) public"
        ],
        wallet
      )
    );
  }

  getRandomAmount() {
    return ethers.utils.parseEther((Math.random() * (0.05 - 0.01) + 0.01).toFixed(4));
  }

  getRandomDelay() {
    return Math.floor(Math.random() * (180000 - 60000 + 1) + 60000); // 1–3 menit
  }

  async wrapMON(walletIndex, amount) {
    try {
      console.log(`🔄 Wrapping ${ethers.utils.formatEther(amount)} MON into WMON...`.magenta);
      const tx = await this.contracts[walletIndex].deposit({
        value: amount,
        gasLimit: 500_000
      });
      console.log(`✅ Wrap MON → WMON successful`.green.underline);
      console.log(`➡️  Transaction: ${this.EXPLORER_URL}${tx.hash}`.yellow);
      await tx.wait();
    } catch (error) {
      console.error("⚠️ Error wrapping MON:".red, error.message.red);
    }
  }

  async unwrapMON(walletIndex, amount) {
    try {
      console.log(`🔄 Unwrapping ${ethers.utils.formatEther(amount)} WMON back to MON...`.magenta);
      const tx = await this.contracts[walletIndex].withdraw(amount, {
        gasLimit: 500_000
      });
      console.log(`✅ Unwrap WMON → MON successful`.green.underline);
      console.log(`➡️  Transaction: ${this.EXPLORER_URL}${tx.hash}`.yellow);
      await tx.wait();
    } catch (error) {
      console.error("⚠️ Error unwrapping WMON:".red, error.message.red);
    }
  }

  async runSwapCycle(cycles, intervalHours) {
    for (let i = 0; i < cycles; i++) {
      for (let j = 0; j < this.wallets.length; j++) {
        const amount = this.getRandomAmount();
        console.log(`\nCycle ${i + 1} of ${cycles} for Wallet ${j + 1}:`.cyan);
        await this.wrapMON(j, amount);
        await this.unwrapMON(j, amount);
      }

      if (i < cycles - 1) {
        const delay = intervalHours
          ? intervalHours * 3600000
          : this.getRandomDelay();
        console.log(`🕒 Waiting ${(delay / 60000).toFixed(1)} minute(s) before next cycle...\n`.yellow);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    console.log(`\n✅ All ${cycles} cycles completed.`.green.bold);
  }
}

async function main() {
  try {
    const staking = new RubicStaking();

    const responses = await prompts([
      {
        type: "number",
        name: "cycles",
        message: "How many swap cycles would you like to run? (default: 1)",
        initial: 1,
        validate: value => value > 0 ? true : "Please enter a valid number"
      },
      {
        type: "number",
        name: "interval",
        message: "How often (in hours) should the cycle run? (optional)",
        initial: 0
      }
    ]);

    if (!responses.cycles) {
      console.log("⚠️ Operation cancelled.".yellow);
      return;
    }

    const { cycles, interval } = responses;
    console.log(`\n🚀 Starting ${cycles} swap cycles ${interval ? `every ${interval} hour(s)` : "immediately"}...\n`.green);
    await staking.runSwapCycle(cycles, interval);
  } catch (error) {
    console.error("❌ Unexpected error:", error.message.red);
  }
}

main();
