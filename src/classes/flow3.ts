import { faker } from "@faker-js/faker";
import { Keypair } from "@solana/web3.js";
import axios, { AxiosResponse } from "axios";
import bs58 from "bs58";
import * as nacl from "tweetnacl";
import UserAgent from "user-agents";
import { CaptchaServices } from "../utils/captchaServices";
import { Generator } from "../utils/generator";
import { logMessage } from "../utils/logger";
import { getProxyAgent } from "./proxy";

export class Flow3Referral {
  private refCode: string;
  private currentNum: number;
  private total: number;
  private proxy: string | null;
  private wallet: Keypair;
  private axios: any;
  private generator: Generator = new Generator();
  private userAgent: string = new UserAgent().toString();
  private captchaService: CaptchaServices = new CaptchaServices();

  constructor(refCode: string, proxy: string | null = null, currentNum: number, total: number,) {
    this.refCode = refCode;
    this.proxy = proxy;
    this.currentNum = currentNum;
    this.total = total;
    this.wallet = Keypair.generate();
    this.axios = axios.create({
      httpsAgent: this.proxy ? getProxyAgent(this.proxy, this.currentNum, this.total) : undefined,
      timeout: 120000,
      headers: {
        "User-Agent": this.userAgent,
      },
    });
  }

  private async makeRequest(method: string, url: string, config: any = {}, retries: number = 3): Promise<AxiosResponse | null> {
    for (let i = 0; i < retries; i++) {
      try {
        return await this.axios({ method, url, ...config });
      } catch (error: any) {
        const errorData = error.response ? error.response.data : error.message;
        logMessage(
          this.currentNum,
          this.total,
          `Request failed: ${error.message}`,
          "error"
        );
        logMessage(
          this.currentNum,
          this.total,
          `Error response data: ${JSON.stringify(errorData, null, 2)}`,
          "error"
        );

        logMessage(
          this.currentNum,
          this.total,
          `Retrying... (${i + 1}/${retries})`,
          "process"
        );
        await new Promise((resolve) => setTimeout(resolve, 12000));
      }
    }
    return null;
  }

  private async getRandomDomain() {
    logMessage(
      this.currentNum,
      this.total,
      "Trying to get a random domain...",
      "process"
    );
    const vowels = "aeiou";
    const consonants = "bcdfghjklmnpqrstvwxyz";
    const keyword =
      consonants[Math.floor(Math.random() * consonants.length)] +
      vowels[Math.floor(Math.random() * vowels.length)];
    try {
      const response = await this.makeRequest(
        "GET",
        `https://generator.email/search.php?key=${keyword}`
      );

      if (!response) {
        logMessage(
          this.currentNum,
          this.total,
          "No response from API",
          "error"
        );
        return null;
      }
      const domains = response.data.filter((d: string) => /^[\x00-\x7F]*$/.test(d));
      if (domains.length) {
        const selectedDomain =
          domains[Math.floor(Math.random() * domains.length)];
        logMessage(
          this.currentNum,
          this.total,
          `Selected domain: ${selectedDomain}`,
          "success"
        );
        return selectedDomain;
      }

      logMessage(
        this.currentNum,
        this.total,
        "Could not find valid domain",
        "error"
      );
      return null;
    } catch (error: any) {
      logMessage(
        this.currentNum,
        this.total,
        `Error getting random domain: ${error.message}`,
        "error"
      );
      return null;
    }
  }

  private async generateEmail(domain: string) {
    logMessage(
      this.currentNum,
      this.total,
      "Trying to generate email...",
      "process"
    );

    const firstname = faker.person.firstName().toLowerCase();
    const lastname = faker.person.lastName().toLowerCase();
    const randomNums = Math.floor(Math.random() * 900 + 100).toString();

    const separator = Math.random() > 0.5 ? "" : ".";
    const email = `${firstname}${separator}${lastname}${randomNums}@${domain}`;

    logMessage(
      this.currentNum,
      this.total,
      `Generated email: ${email}`,
      "success"
    );
    return email;
  }

  private async registerAccount(email: string, password: string, captcha: string) {
    const headers = {
      "Content-Type": "application/json",
      origin: 'https://app.flow3.tech/',
      referer: 'https://app.flow3.tech/'
    }

    const payload = {
      email: email,
      password: password,
      captchaToken: captcha,
      referralCode: this.refCode,
    }

    try {
      const response = await this.makeRequest("POST", "https://api2.flow3.tech/api/user/register", { data: payload, headers: headers });
      if (!response) {
        logMessage(this.currentNum, this.total, "No response from API", "error");
        return null;
      }
      return response.data
    } catch (error: any) {
      logMessage(this.currentNum, this.total, `Error: ${error.message}`, "error");
      return null;
    }
  }

  private async checkingWalletAddress(accessToken: string, wallet: string) {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      origin: 'https://app.flow3.tech/',
      referer: 'https://app.flow3.tech/'
    }

    try {
      const response = await this.makeRequest("GET", `https://api2.flow3.tech/api/user/check-old-wallet?walletAddress=${wallet}`, { headers: headers });
      if (!response) {
        logMessage(this.currentNum, this.total, "No response from API", "error");
        return null;
      }
      return response.data
    } catch (error: any) {
      logMessage(this.currentNum, this.total, `Error: ${error.message}`, "error");
      return null;
    }
  }

  private async updateWalletAddress(accessToken: string, wallet: string) {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      origin: 'https://app.flow3.tech/',
      referer: 'https://app.flow3.tech/'
    }

    const payload = {
      walletAddress: wallet,
    }

    try {
      const response = await this.makeRequest("POST", 'https://api2.flow3.tech/api/user/update-wallet-address', { data: payload, headers: headers });
      if (!response) {
        logMessage(this.currentNum, this.total, "No response from API", "error");
        return null;
      }
      return response.data
    } catch (error: any) {
      logMessage(this.currentNum, this.total, `Error: ${error.message}`, "error");
      return null;

    }
  }

  public getWallet(): { publicKey: string; secretKey: string } {
    return {
      publicKey: this.wallet.publicKey.toBase58(),
      secretKey: bs58.encode(this.wallet.secretKey),
    };
  }

  async generateSignature(message: string) {
    const messageBuffer = Buffer.from(message);
    const signature = nacl.sign.detached(messageBuffer, this.wallet.secretKey);
    const encode = bs58.encode(signature);
    return encode;
  }

  async login() {
    logMessage(this.currentNum, this.total, `Trying Register Account...`, "process");
    const message = `Please sign this message to connect your wallet to Flow 3 and verifying your ownership only.`;
    const signature = await this.generateSignature(message);
    const payload = {
      message: message,
      walletAddress: this.wallet.publicKey.toBase58(),
      signature: signature,
      referralCode: this.refCode,
    };

    try {
      const response = await this.makeRequest("POST", "https://api.flow3.tech/api/v1/user/login", {
        data: payload,
      });
      if (response?.data.statusCode === 200) {
        logMessage(this.currentNum, this.total, 'Register Account Success', "success");
        return response.data.data.refreshToken
      }
      return null
    } catch (error: any) {
      logMessage(this.currentNum, this.total, `Login failed: ${error.message}`, "error");
      return null;
    }
  }

  public async singleProses() {
    try {
      const domain = await this.getRandomDomain();
      if (!domain) return
      const email = await this.generateEmail(domain);
      if (!email) return
      const password = this.generator.Password();
      const captcha = await this.captchaService.solveCaptcha(this.currentNum, this.total);
      if (!captcha) return
      const registerResponse = await this.registerAccount(email, password, captcha);
      if (!registerResponse) return
      const accessToken = registerResponse.data.accessToken;
      const wallet = this.wallet.publicKey.toBase58();
      const checkWallet = await this.checkingWalletAddress(accessToken, wallet);
      if (!checkWallet) return
      if (checkWallet.data.exist === false) {
        const updateWallet = await this.updateWalletAddress(accessToken, wallet);
        if (!updateWallet) return
      }
      return {
        dataAccount: {
          email: email,
          password: password,
          accessToken: accessToken,
          refreshToken: registerResponse.data.refreshToken,
        },
        dataWallet: {
          publicKey: this.wallet.publicKey.toBase58(),
          secretKey: bs58.encode(this.wallet.secretKey),
        }
      }
    } catch (error: any) {
      logMessage(this.currentNum, this.total, `Error: ${error.message}`, "error");
      return null;
    }
  }

}
