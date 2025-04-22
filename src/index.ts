import chalk from "chalk";
import fs from "fs";
import { Flow3Referral } from "./classes/flow3";
import { getRandomProxy, loadProxies } from "./classes/proxy";
import { logMessage, prompt, rl } from "./utils/logger";

async function main(): Promise<void> {
  console.log(
    chalk.cyan(`
░█▀▀░█░░░█▀█░█░█░▀▀█
░█▀▀░█░░░█░█░█▄█░░▀▄
░▀░░░▀▀▀░▀▀▀░▀░▀░▀▀░
     By : El Puqus Airdrop
     github.com/ahlulmukh
  `)
  );

  const refCode = await prompt(chalk.yellow("Enter Referral Code: "));
  const count = parseInt(await prompt(chalk.yellow("How many do you want? ")));
  const proxiesLoaded = loadProxies();
  if (!proxiesLoaded) {
    console.log(chalk.yellow("No proxy available. Using default IP."));
  }
  let successful = 0;
  const accountsFlow = fs.createWriteStream("accounts.txt", { flags: "a" });
  const tokenAccount = fs.createWriteStream("token.txt", { flags: "a" });

  try {
    let retryCount = 0;
    const maxRetries = 3;
    while (successful < count) {
      console.log(chalk.white("-".repeat(85)));
      const currentProxy = await getRandomProxy(successful + 1, count);
      const flow = new Flow3Referral(refCode, currentProxy, successful + 1, count);

      try {
        const data = await flow.singleProses();
        if (data) {
          logMessage(successful + 1, count, `Email Address: ${data.dataAccount.email}`, "success");
          accountsFlow.write(`Email Address : ${data.dataAccount.email}\n`);
          accountsFlow.write(`Password : ${data.dataAccount.password}\n`);
          accountsFlow.write(`Wallet Address : ${data.dataWallet.publicKey}\n`);
          accountsFlow.write(`Secret Key : ${data.dataWallet.secretKey}\n`);
          accountsFlow.write(`===================================================================\n`);
          tokenAccount.write(`${data.dataAccount.refreshToken}\n`);
          successful++;
          retryCount = 0;
        }
      } catch (error) {
        logMessage(successful + 1, count, `Error: ${(error as Error).message}, retrying...`, "error");
        retryCount++;
        if (retryCount >= maxRetries) {
          console.log(chalk.red("Max retries reached, skipping..."));
          successful++;
          retryCount = 0;
        } else {
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      }
    }

  } finally {
    accountsFlow.end();
    tokenAccount.end();
    console.log(chalk.magenta("\n[*] Done!"));
    rl.close();
  }
}

main().catch((err) => {
  console.error(chalk.red("Error occurred:"), err);
  process.exit(1);
});