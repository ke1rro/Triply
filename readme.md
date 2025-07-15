# Project Structure

```bash
frontend/
│
├── public/
├── src/
│   ├── components/     # UI-elements, reusable components
│   ├── pages/          # Page-based routing
│   ├── lib/            # firebase.js and other libraries`
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── .env
├── .gitignore
├── prettier.config.cjs
├── postcss.config.cjs
├── tailwind.config.js
└── package.json
```

## Project Setup

1. Get Firebase credentials and create a `.env` file in the root directory based on `.env_example`.

    1.1. Project overview -> project settings -> General -> Your apps -> Firebase SDK snippet -> Config

2. Install dependencies:

```bash
cd frontend
npm install
```

3. Start the development server:

```bash
npm run dev
```

### Prettier usage

```bash
npm run format
npm run format:check
```
