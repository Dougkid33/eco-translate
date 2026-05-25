<p align="center">
  <img src="https://img.shields.io/badge/EcoTranslate%20OCR-AI--Powered-007AFF?style=for-the-badge&logo=google-gemini&logoColor=white" alt="Logo Provisório" width="400" />
</p>

<p align="center">
  A high-performance, real-time OCR translation mobile ecosystem powered by <b>Bun</b>, <b>Google Gemini 2.5</b>, and <b>React Native</b>, built using <b>Hexagonal Architecture</b>.
</p>

<p align="center">
  <a href="https://github.com/bun-community" target="_blank"><img src="https://img.shields.io/badge/Runtime-Bun%20v1.x-fbf0df?style=flat&logo=bun&logoColor=black" alt="Bun Version" /></a>
  <a href="https://reactnative.dev/" target="_blank"><img src="https://img.shields.io/badge/Framework-React%20Native%20%2F%20Expo-61DAFB?style=flat&logo=react&logoColor=black" alt="React Native" /></a>
  <a href="https://ai.google.dev/" target="_blank"><img src="https://img.shields.io/badge/AI%20Engine-Gemini%202.5%20Flash-4285F4?style=flat&logo=google-gemini&logoColor=white" alt="Gemini Engine" /></a>
  <a href="https://github.com/naptha/tesseract.js" target="_blank"><img src="https://img.shields.io/badge/OCR-Tesseract.js%20Local-orange?style=flat" alt="Tesseract OCR" /></a>
  <img src="https://img.shields.io/badge/Architecture-Hexagonal%20%28Ports%20%26%20Adapters%29-41B883?style=flat" alt="Architecture" />
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="Package License" />
</p>

---

## 🎯 Project Purpose & Study Goals

**EcoTranslate OCR** is a project built to bridge the gap between high-speed mobile user experiences and decoupled, bulletproof backend engineering. The app aims to solve the problem of contextual translation of text from the physical world. 

Instead of simple literal translations, it uses local edge OCR to capture frames from a camera stream in real-time, pipelines the raw strings to a decentralized Node/Bun backend, and leverages Generative AI to return **context-aware translations** alongside **cultural and idiomatic notes**.

### 🧠 Core Concepts Evaluated:
* **Hexagonal Architecture (Ports & Adapters):** Keeping the core business logic completely isolated from third-party tools like Google Gemini SDK, Express, or runtime frameworks.
* **Agentic Dev Workflow Readiness:** Entirely developed using bleeding-edge tooling (**Bun runtime**), skipping legacy bundling issues and ensuring sub-millisecond execution times.
* **Asynchronous Mobile Lifecycles:** Managing high-frequency device camera snapshots, handling edge text recognition latency with Tesseract.js, and streamlining payload transfer to remote web APIs.

---

## 📐 Hexagonal Architecture Layout

The backend system is strictly decoupled. If Google Gemini needs to be swapped out for Anthropic's Claude or an offline LLM tomorrow, **zero lines of business logic are changed**.

```text
src/
├── domain/
│   ├── entities/      # Pure business data models (Translation.ts)
│   └── ports/         # Outbound interface contracts (IAProviderPort.ts)
├── application/       # Orchestrates the user actions (TranslateUseCase.ts)
└── infrastructure/
    ├── adapters/      # Real implementation of the Gemini 2.5 SDK
    └── web/           # REST Layer entrypoint using Express Controllers

```
⚙️ Project Setup & InstallationThis project is a Monorepo. You will need Bun installed on your machine.🟢 1. Backend SetupBash# Navigate to backend folder
$ cd ecotranslate-backend

# Install modern dependencies via Bun
$ bun install
Create a .env file inside ecotranslate-backend/:Snippet de códigoGEMINI_API_KEY=your_actual_google_ai_studio_key
PORT=3000
📱 2. Mobile SetupBash# Navigate to mobile folder
$ cd ../ecotranslate-mobile

# Install mobile dependencies
$ bun install
⚠️ Development Note: Update the backendUrl variable inside ecotranslate-mobile/App.tsx with your computer's local network IP address (e.g., http://192.168.x.x:3000/api/translate) so your physical device can handshake with the local server.🚀 Running the EcosystemStart the Backend Server (Watch Mode)Bash$cd ecotranslate-backend$ bun dev
Start the React Native App via ExpoBash$cd ecotranslate-mobile$ bun expo start
Press w to spin it up in your desktop browser.Use the Expo Go application or setup native USB debugging on your physical Android/iOS device to unlock real-time camera stream OCR capabilities.🛠️ Tech Stack BreakdownLayerTechnologyKey Reason for SelectionRuntime EngineBun v1.xNative TS support, blazingly fast dependency resolution, replaces heavy Webpack setups.Backend FrameworkExpress + TypeScriptLightweight REST routing layer running within our infrastructure adapter.AI ModelGemini 2.5 FlashZero-latency structured JSON processing capability (responseMimeType).Mobile CoreReact Native + ExpoCross-platform runtime executing native mobile viewports without overhead.Client OCR EngineTesseract.jsRuns directly on the device container, offloading computational stress from the API.📄 LicenseThis project is MIT licensed.
