const prompts = require("prompts");
const displayHeader = require("./src/displayHeader.js");

const scripts = {
  rubic: "./scripts/RubicStaking.js",
  magma: "./scripts/MagmaStaking.js",
  izumi: "./scripts/IzumiStaking.js",
  apriori: "./scripts/AprioriStaking.js",
};

const availableScripts = [
  { title: "Rubic Script", value: "rubic" },
  { title: "Magma Script", value: "magma" },
  { title: "Izumi Script", value: "izumi" },
  { title: "Apriori Script", value: "apriori" },
  { title: "▶ Run All Scripts", value: "all" }, // ✅ Tambahan
  { title: "Exit", value: "exit" },
];

async function run() {
  await displayHeader();

  const { script } = await prompts({
    type: "select",
    name: "script",
    message: "Select the script to run:",
    choices: availableScripts,
  });

  if (!script || script === "exit") {
    console.log("Exiting bot...");
    process.exit(0);
  }

  if (script === "all") {
    console.log("\n🚀 Running all scripts sequentially...\n".green);
    for (const key of ["rubic", "magma", "izumi", "apriori"]) {
      console.log(`\n=== Starting ${key.toUpperCase()} ===`.cyan.bold);
      require(scripts[key]); // panggil masing-masing script
    }
  } else {
    console.log(`Running ${script.charAt(0).toUpperCase() + script.slice(1)}...`);
    require(scripts[script]);
  }
}

run().catch((error) => console.error("Error occurred:", error));
