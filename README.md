# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  # signup-login

  React + TypeScript + Vite app with Firebase Authentication and Firestore.

  ## Features

  - Login and registration pages
  - Protected dashboard after sign-in
  - Personalized greeting on the dashboard
  - Firestore-backed project notifications per user
  - Clean interview-ready UI

  ## Setup

  1. Install dependencies:

  ```bash
  npm install
  ```

  2. Create a local `.env` file from [.env.example](.env.example) and fill in your Firebase web app values.

  3. Make sure Email/Password authentication is enabled in Firebase Console.

  4. Start the app:

  ```bash
  npm run dev
  ```

  ## Build

  ```bash
  npm run build
  ```

  ## Netlify Deploy

  This project includes Netlify SPA routing support so browser refreshes on login, register, and dashboard pages do not 404.

  Deploy settings:

  - Build command: `npm run build`
  - Publish directory: `dist`

  The redirect is configured in [netlify.toml](netlify.toml) and [public/_redirects](public/_redirects).

  ## Notes

  - `.env` files are ignored by git.
  - `.env.example` is committed as the local environment template.
      reactX.configs['recommended-typescript'],
