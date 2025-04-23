import { Solver } from "@2captcha/captcha-solver";
import axios from "axios";
import fs from "fs";
import path from "path";
import { logMessage } from "../utils/logger";
const configPath = path.resolve(__dirname, "../../config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));


export class CaptchaServices {
    private sitekey: string;
    private pageUrl: string;
    private cfSolved: string;
    private antiCaptchaApiUrl: string;

    constructor() {
        this.sitekey = "0x4AAAAAABDpOwOAt5nJkp9b";
        this.pageUrl = "https://app.flow3.tech/sign-up";
        this.cfSolved = `${config.captchaServices.urlPrivate}/cf-clearance-scraper`;
        this.antiCaptchaApiUrl = "https://api.anti-captcha.com";
    }

    async solveCaptcha(currentNum: number, total: number) {
        const provider = config.captchaServices.captchaUsing;
        if (provider === "2captcha") {
            return this.solveCaptcha2(currentNum, total);
        } else if (provider === "antiCaptcha") {
            return this.antiCaptcha(currentNum, total);
        } else if (provider === 'private') {
            return this.solvedPrivate(currentNum, total);
        } else {
            logMessage(null, null, "Invalid captcha provider.", "error");
            return null;
        }
    }

    async solvedPrivate(currentNum: number, total: number) {
        logMessage(currentNum, total, "Trying to solved captcha cloudflare with private...", "process");
        try {
            const response = await axios.post(
                this.cfSolved,
                {
                    url: "https://app.flow3.tech/sign-up",
                    siteKey: "0x4AAAAAABDpOwOAt5nJkp9b",
                    mode: "turnstile-min",
                },
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            if (!response.data || !response.data.token) {
                throw new Error("Failed to get token from Cloudflare");
            }
            logMessage(currentNum, total, "Captcha solved successfully!", "success");
            return response.data.token;
        } catch (error: any) {
            logMessage(currentNum, total, `Failed to solve captcha: ${error.message}`, "error");
            return null;
        }
    }

    async antiCaptcha(currentNum: number, total: number) {
        logMessage(currentNum, total, "Trying solving captcha Turnstile with anticaptcha...", "process");
        const apiKey = config.captchaServices.antiCaptchaApikey[0];

        try {
            const createTaskResponse = await axios.post(`${this.antiCaptchaApiUrl}/createTask`, {
                clientKey: apiKey,
                task: {
                    type: "TurnstileTaskProxyless",
                    websiteURL: this.pageUrl,
                    websiteKey: this.sitekey,
                },
                softId: 0,
            });

            const taskId = createTaskResponse.data.taskId;
            if (!taskId) throw new Error("Failed to get task ID");

            logMessage(currentNum, total, `Task created with ID: ${taskId}`, "process");
            let result = null;
            while (!result) {
                await new Promise(resolve => setTimeout(resolve, 5000));

                const getResultResponse = await axios.post(`${this.antiCaptchaApiUrl}/getTaskResult`, {
                    clientKey: apiKey,
                    taskId: taskId,
                });

                if (getResultResponse.data.status === "ready") {
                    result = getResultResponse.data.solution.token;
                    logMessage(currentNum, total, "Captcha solved successfully!", "success");
                }
            }

            return result;
        } catch (error: any) {
            logMessage(currentNum, total, `AntiCaptcha failed: ${error.message}`, "error");
            return null;
        }
    }

    async solveCaptcha2(currentNum: number, total: number) {
        logMessage(currentNum, total, "Trying solving captcha Turnstile with 2captcha...", "process");
        const apikey = config.captchaServices.captcha2Apikey[0];
        try {
            const res = await new Solver(apikey).cloudflareTurnstile({
                pageurl: this.pageUrl,
                sitekey: this.sitekey,
            });
            logMessage(currentNum, total, "Captcha solved successfully!", "success");
            return res.data;
        } catch (error) {
            logMessage(currentNum, total, `2Captcha failed`, "error");
            return null;
        }
    }
}