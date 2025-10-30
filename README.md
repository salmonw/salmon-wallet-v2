# Salmon Wallet

![React 18.2.0](https://img.shields.io/badge/React-18.2.0-61dafb?logo=react&logoColor=white)
![React Native 0.70.5](https://img.shields.io/badge/React%20Native-0.70.5-61dafb?logo=react&logoColor=white)
![Node.js 18+](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![Solana Web3.js 1.95.4](https://img.shields.io/badge/@solana%2Fweb3.js-1.95.4-9945FF?logo=solana&logoColor=white)
![GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)

<img width="160" alt="logo-gmail-salmon" src="https://github.com/salmonw/salmon-wallet-v2/assets/35810074/ac99529f-aff7-47c6-b443-4a58b41a998d">

**Self-custodial, open-source & community-owned Solana wallet**

Salmon is a self-custodial wallet focused on transparency, resiliency, and a friendly user experience across devices. What started as a fork of Sollet evolved into a ground-up rewrite powered by React, React Native, and a browser-extension layer that keeps private keys on the client at all times. The project earned a Serum Foundation grant after being showcased at the Solana Riptide hackathon and continues to be maintained in the open.

Open-source code keeps the community empowered to audit, extend, and secure their own assets. We invite everyone to explore the codebase, submit improvements, and help us deliver a sustainable wallet ecosystem for the Solana network.


## Quick Start

1. Clone this repository and install dependencies:
   ```bash
   yarn install
   ```
2. (iOS only) Install native pods:
   ```bash
   cd ios && pod install
   ```
3. Configure environment variables as needed (see below).
4. Pick a target (web, native, or extension) and use the scripts listed in the next sections.


## Environment configuration

Environment templates live at the repository root (`env.local.json`, `env.develop.json`, `env.main.json`, `env.prod.json`). Use them to define RPC endpoints, feature flags, and other runtime settings. Set the `REACT_APP_SALMON_ENV` variable or copy the appropriate file into `env.local.json` before launching the app.


## Run the web client

- Development mode:
  ```bash
  yarn start:web
  ```
  This boots the CRA development server on port 3006 (overridable through `PORT`). Hot-reload is enabled and lint errors display in the console.

- Alternate environments:
  ```bash
  yarn start:web:local
  yarn start:web:main
  yarn start:web:prod
  ```
  Each command sets `REACT_APP_SALMON_ENV` to target the desired cluster.


## Browser extension builds

- Build both Chrome/Brave and Firefox packages:
  ```bash
  yarn build:extension
  ```
  Artifacts are written to:
  - Chromium-based browsers: `build-extension/`
  - Firefox: `build-extension-mozilla/`

- Individual targets are available through `yarn build:extension:chrome` and `yarn build:extension:mozilla`. Use the accompanying `upload:bundle:*` scripts to sync bundles to the Salmon S3 buckets when releasing.


## Additional scripts

- Web production builds: `yarn build`, `yarn build:main`, `yarn build:prod`
- Test suites: `yarn test` (web) and `yarn test:native` (React Native)
- Linting: `yarn lint` / `yarn lint:fix`
- Serverless deployment helpers: `yarn serverless:deploy[:stage]` and `yarn serverless:remove[:stage]`

Refer to `package.json` for the complete script catalog.


## Project structure

- `src/` – shared React components, hooks, screens, and Solana integration logic.
- `extension/` – background scripts, content scripts, and manifests used by the browser extension.
- `android/`, `ios/` – native project scaffolding managed by React Native.
- `assets/`, `public/` – static assets consumed across platforms.


## Contributing

Contributions of all kinds are welcome—bug fixes, features, documentation, or localization updates. Please read `CONTRIBUTION-AGREEMENT.md` before submitting a pull request. Issues and feature requests help us prioritize work; feel free to open one if you discover a problem or have an idea to discuss.


## Security

If you discover a vulnerability or have a security concern, please avoid filing a public issue. Instead, reach out to the maintainers directly so we can coordinate a responsible disclosure and patch timeline.


## License

Salmon Wallet is released under the [GNU GPL v3.0](https://www.gnu.org/licenses/gpl-3.0.html).
