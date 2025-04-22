# Flow3 Network Auto Referral

This bot automates the process of creating accounts and using referral codes for the Flow3 Website

## Features

- Automatically generates wallet.
- Automatically generates email address and password.
- Uses proxies to avoid IP bans.
- Logs the created accounts.

## Requirements

- Node.js v18.20.6 LTS [Download](https://nodejs.org/dist/v18.20.6/node-v18.20.6-x64.msi).
- Account Flow3 [Flow3](https://dashboard.flow3.tech/?ref=UVRKPHgSp)
- Captcha Services Anti Captcha / 2 Captcha Or cf-cloudflarance
- Proxy (Optional). Best Proxy [Cherry Proxy](https://center.cherryproxy.com/Login/Register?invite=029ad2d3)

## Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/ahlulmukh/flow3-autoref.git
   cd flow3-autoref
   ```

2. Install the dependencies:

   ```sh
   npm install
   npm run build
   ```

3. Create a `proxy.txt` file in the root directory and add your proxies (one per line).
   ```
   http://user:pass@host:port
   http://user:pass@host:port
   http://user:pass@host:port
   ```
4. Make config and put your apikey `cp config.json.example config.json`. `captchaUsing` can be `antiCaptcha` or `2captcha` or you can using your private captcha solved `private` [Using this for private captcha](https://github.com/ZFC-Digital/cf-clearance-scraper/)

   ```json
   {
     "captchaServices": {
       "captchaUsing": "private",
       "urlPrivate": "url_services_private",
       "antiCaptchaApikey": [""],
       "captcha2Apikey": [""]
     }
   }
   ```

## Usage

1. Run the bot:

   ```sh
   npm run start
   ```

2. Follow the prompts to enter your referral code

## Output

- The created accounts will be saved in `accounts.txt`.

## Notes

- Make sure to use valid proxies to avoid IP bans.

## Stay Connected

- Channel Telegram : [Telegram](https://t.me/elpuqus)
- Channel WhatsApp : [Whatsapp](https://whatsapp.com/channel/0029VavBRhGBqbrEF9vxal1R)
- Discord : [Discord](https://discord.com/invite/uKM4UCAccY)

## Donation

If you would like to support the development of this project, you can make a donation using the following addresses:

- Solana: `FdHsx8He55QgRCSv6NMEpFfkjXFsXFEeWEpJpo7sUQZe`
- EVM: `0x406de5ec09201002c45fdd408ab23159cd12fa3e`
- BTC: `bc1prze475lgalevngrhwq6r9wyng3rl3zskyru4rn4k6j8kwzmmczmqcd7u7y`

## Disclaimer

This tool is for educational purposes only. Use it at your own risk.
