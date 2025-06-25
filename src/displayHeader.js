const figlet = require("figlet");
require("colors");

function displayHeader() {
  return new Promise((resolve) => {
    process.stdout.write("\x1Bc");
    console.log(
      figlet.textSync("MONAD BOT", { font: "Cyberlarge" }).cyan
    );
    console.log("═".repeat(80).magenta);
    startLoadingSequence(resolve); // kirim callback resolve
  });
}

const steps = [
  { text: "Initializing system core", errorChance: 0 },
  { text: "Connecting to Monad Testnet RPC", errorChance: 0.2 },
  { text: "Loading wallet credentials", errorChance: 0 },
  { text: "Syncing block headers", errorChance: 0.3 },
  { text: "All systems online. Ready", errorChance: 0 },
];

let currentProgress = 0;
const progressStep = Math.floor(100 / steps.length);

function startLoadingSequence(finalCallback) {
  let totalDelay = 0;

  steps.forEach((step, i) => {
    totalDelay += 1200;
    setTimeout(() => {
      runStepWithRetry(step.text, progressStep, step.errorChance, i === steps.length - 1, finalCallback);
    }, totalDelay);
  });
}

function runStepWithRetry(text, progressStep, errorChance, isFinal, callback) {
  const shouldFail = Math.random() < errorChance;

  if (shouldFail) {
    animateStep(`ERROR: ${text}`, 0, false, true, () => {
      setTimeout(() => {
        animateStep(`Retrying: ${text}`, 0, false, false, () => {
          animateStep(text, progressStep, isFinal, false, callback);
        });
      }, 1000);
    });
  } else {
    animateStep(text, progressStep, isFinal, false, callback);
  }
}

function animateStep(text, stepProgress, isFinal, isError, callback) {
  const spinnerFrames = ["|", "/", "-", "\\"];
  let frameIndex = 0;

  const timestamp = () => `[${new Date().toLocaleTimeString()}]`;

  const spinner = setInterval(() => {
    const glitch = applyGlitch(text);
    const color = isError ? "red" : "brightYellow";
    process.stdout.write(`\r${spinnerFrames[frameIndex]} ${timestamp()} >> ${glitch}`[color]);
    frameIndex = (frameIndex + 1) % spinnerFrames.length;
  }, 60);

  setTimeout(() => {
    clearInterval(spinner);
    currentProgress += stepProgress;

    const line = `${timestamp()} >> ${text} ✓`;
    const final = isFinal && !isError;
    const bar = generateProgressBar(final ? 100 : currentProgress);

    if (final) {
      console.log(`\r✔ ${line}`.green);
      console.log(bar.green);
      console.log("═".repeat(80).magenta + "\n" + "\x07");
      if (callback) callback(); // resolve() dipanggil
    } else if (!isError) {
      console.log(`\r✔ ${line}`.brightCyan);
      console.log(bar.yellow);
      if (callback && isFinal) callback();
    } else {
      console.log(`\r✖ ${line}`.red);
      if (callback && isFinal) callback();
    }
  }, 1200);
}

function generateProgressBar(percent) {
  const total = 40;
  const filled = Math.round((percent / 100) * total);
  const empty = total - filled;
  return `[${"=".repeat(filled)}${" ".repeat(empty)}] ${String(percent).padStart(3)}%`;
}

function applyGlitch(text) {
  return text
    .split("")
    .map((char) => (Math.random() < 0.04 ? String.fromCharCode(33 + Math.random() * 94) : char))
    .join("");
}

module.exports = displayHeader;
