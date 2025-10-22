# Jelna Farm Admin

Jelna Farm Admin is a React + TypeScript dashboard that helps Jelna Farm teams manage crops, inventory, shipping, and customer orders from a single workspace.

## Getting started

```bash
yarn install
yarn dev
```

Open the development server in your browser and you will be greeted with the Jelna Farm navigation experience. The main sections of the admin include:

- **홈** – Overview of current farm operations.
- **재고관리** – Manage harvested produce, supplies, and stock levels.
- **배송관리** – Track outbound shipments and delivery schedules.
- **주문조회** – Review customer orders and fulfillment status.
- **상품관리** – Maintain the Jelna Farm product catalog.

## Available scripts

The project is powered by Vite. The most common scripts are:

- `yarn dev` – Start the development server.
- `yarn build` – Generate a production build.
- `yarn preview` – Preview the production build locally.
- `yarn lint` – Run ESLint across the codebase.

## Project structure

```
src/
├── pages/        # Feature pages for each admin section
├── routes/       # Application routing
└── styles/       # Global styles and variables
```

Feel free to customize the modules to match Jelna Farm's operational needs.
