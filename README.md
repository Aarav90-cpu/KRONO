# KRONO

> **An Open-Source Decentralized Social Media Platform**  
> 🌐 **Live App:** [https://krono-social.duckdns.org/](https://krono-social.duckdns.org/)

---

## 📢 Developers & Testers Are Welcome!

KRONO is actively evolving, and we are opening our doors to **developers, beta testers, and open-source contributors**! 

Whether you want to try out the live platform, report bugs, build new features, or stress-test the interface and APIs, we'd love your feedback and contributions:

- 🚀 **Join the Live App:** Visit [https://krono-social.duckdns.org/](https://krono-social.duckdns.org/) to create an account, share casts, and test real-time social features.
- 🛠️ **Run & Test Locally:** Follow the quick start guide below to test the codebase on your machine.
- 💡 **Contribute:** Submit pull requests, report issues, or help refine our UI and backend services.

---

## 🧪 Testing It Yourself (Local Setup)

If you are a developer or tester who wants to run and test KRONO locally, follow these steps:

### 1. Prerequisites
- **Node.js 18+** installed on your system (or **Bun**)
- **npm** (comes with Node.js) or **pnpm** / **yarn**
- **Git**

*(Note: No external AI API key or complex setup is required to run and test the application!)*

---

### 2. Clone the Repository
```bash
git clone https://github.com/Aarav90-cpu/KRONO.git
cd KRONO
```

---

### 3. Install Dependencies
```bash
npm install
```

---

### 4. (Optional) Set Up Environment Configuration
The app runs out-of-the-box with built-in fallbacks. If you wish to customize your local port or connect your own Firebase project:
```bash
cp .env.example .env.local
```
Edit `.env.local` with your custom preferences if needed.

---

### 5. Launch the Development Server
```bash
npm run dev
```

Once started, open your browser and navigate to:
```
http://localhost:3000
```

---

### 6. Verify and Build
Before submitting changes or deploying, you can verify TypeScript types and test the production build:

- **Type Check & Linting:**
  ```bash
  npm run lint
  ```
- **Production Build:**
  ```bash
  npm run build
  ```
- **Run Production Server:**
  ```bash
  npm start
  ```

---

## 🔍 Features to Test & Explore

We encourage testers to explore and push the limits on:

- [x] **Authentication & Profiles**: Sign in, sign up, set custom avatars, update bios, and configure security preferences.
- [x] **Cast Creation & Feeds**: Create rich posts, add tags, and test chronological feed sorting.
- [x] **Large Media Uploads**: Support for images up to 100MB with client-side preview and safe server-side buffering.
- [x] **Interactions**: Liking, reposting, bookmarking, and nested comments.
- [x] **Explore & Discovery**: Real-time search across hashtags, users, and media posts.
- [x] **Responsive Layout**: Desktop, tablet, and mobile views with dark mode aesthetics.

---

## 📂 Project Architecture

```
├── public/                 # Static assets, logos, and icons
├── src/                    # Frontend React application
│   ├── components/         # Modular UI components (Feed, Explore, Auth, etc.)
│   ├── services/           # Firebase & local database API communication
│   ├── types.ts            # Core TypeScript models and interfaces
│   ├── firebaseConfig.ts   # Firebase client configuration with environment fallback
│   ├── firebase.ts         # Firebase initialization and authentication helpers
│   ├── App.tsx             # Root view and navigation orchestrator
│   └── main.tsx            # React application entry point
├── server.ts               # Express backend API and Vite middleware server
├── package.json            # Scripts and project dependencies
└── tsconfig.json           # Strict TypeScript configuration
```

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Express + Vite dev server at `http://localhost:3000` |
| `npm run build` | Compiles frontend assets and bundles `server.ts` with `esbuild` |
| `npm start` | Runs the compiled production server from `dist/server.cjs` |
| `npm run lint` | Runs `tsc --noEmit` to validate all TypeScript types strictly |
| `npm run clean` | Cleans build artifacts in `dist/` |

---

## 🤝 Contributing

We welcome contributions of all kinds!
1. **Fork** the repository.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a **Pull Request**.

If you discover a bug, feel free to open an issue on GitHub or reach out to the project maintainers!

---

## 📄 License

This project is open-source under the terms in the [LICENSE](LICENSE) file.
