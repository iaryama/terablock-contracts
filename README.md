# Terablock Contracts

<img alt="Solidity" src="https://img.shields.io/badge/Solidity-e6e6e6?style=for-the-badge&logo=solidity&logoColor=black"/> <img alt="Javascript" src="https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E"/>

This repository contains the Solidity Smart Contracts for Terablock.

## Prerequisites

-   git
-   npm
-   truffle
-   Ganache (optional)

## Getting started

-   Clone the repository

```sh
git clone https://github.com/nonceblox/terablock-contracts
```

-   Navigate to `terablock-contracts` directory

```sh
cd terablock-contracts
```

-   Install dependencies

```sh
npm install
```

### Configure project

-   Configure the .env

```sh
cp .example.env .env
```

## Run tests

-   Start ganache
-   Run Tests

```sh
npm test
```

## Deploy smart contracts

### on Ganche

```sh
npm run deploy:ganache
```

### on BSC Testnet

```sh
npm run deploy:bsc_testnet
```

### on BSC Mainnet

```sh
npm run deploy:bsc_mainnet
```

### on Rinkeby Testnet

```sh
npm run deploy:rinkeby_testnet
```

### on Ethereum Mainnet

```sh
npm run deploy:ethereum_mainnet
```
