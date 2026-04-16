# BTC Only Trading System

## Overview

The BTC Only Trading System is a production-oriented application designed to provide event-driven trading advice, narrative analysis, and confirmation signals specifically for Bitcoin (BTC). The system integrates various data sources and utilizes advanced machine learning models to deliver accurate and timely trading insights.

## Architecture

The application is built using a single TypeScript backend that consolidates ingestion, scoring, LLM orchestration, APIs, and shadow-book persistence. This architecture ensures that the system remains auditable and efficient, starting with deterministic rules and typed schemas before layering in LLM explanations.

## Tech Stack

- **Node.js**: Version 22
- **TypeScript**: Version 5
- **Fastify**: For building the server
- **better-sqlite3**: For database management
- **node-cron**: For scheduling tasks
- **Zod**: For schema validation
- **Vitest**: For testing

## External Services

The system integrates with several external services to fetch market data and events:

- **Binance Public API + WebSocket**: For BTC spot and futures market data.
- **OpenBB**: For macroeconomic data.
- **AKTools**: For ETF and stablecoin flow data.
- **Twitter API**: For capturing BTC-related events.
- **OpenAI**: For high-frequency classification tasks.
- **DeepSeek**: For deep reasoning tasks.

## Project Structure

The project is organized as follows:

```
trader42-btc
├── src
│   ├── app.ts
│   ├── server
│   │   └── buildServer.ts
│   ├── config
│   │   └── env.ts
│   ├── lib
│   │   ├── db.ts
│   │   ├── scheduler.ts
│   │   ├── stats.ts
│   │   └── llm.ts
│   ├── integrations
│   │   ├── binance
│   │   ├── openbb
│   │   ├── aktools
│   │   ├── twitter
│   │   └── llm
│   └── modules
├── db
│   ├── migrations
│   └── schema.sql
├── tests
│   ├── helpers
│   ├── fixtures
│   ├── integration-smoke
│   ├── market-regime
│   ├── driver-pool
│   ├── trigger-gate
│   ├── x-events
│   ├── narrative
│   ├── confirmation
│   ├── trade-advice
│   └── e2e
├── docs
│   └── plans
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── .env.example
└── README.md
```

## Setup Instructions

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd trader42-btc
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Configure environment variables**:
   Copy `.env.example` to `.env` and fill in the required values.

4. **Run the application**:
   ```
   npm start
   ```

5. **Run tests**:
   ```
   npm test
   ```

## Usage Guidelines

- The application is designed to be modular, allowing for easy updates and maintenance.
- Each module is responsible for a specific aspect of the trading system, ensuring clear separation of concerns.
- Follow the delivery phases outlined in the project plan to implement features incrementally.

## Contribution

Contributions are welcome! Please submit a pull request or open an issue for discussion.

## License

This project is licensed under the MIT License. See the LICENSE file for details.