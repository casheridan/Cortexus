# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

📂 Project Structure
This project follows a feature-based directory structure to keep the codebase organized and scalable.

```
src/
├── assets/
├── components/
│   ├── ui/
│   └── layout/
├── features/
│   └── machineDashboard/
├── hooks/
├── lib/
├── pages/
├── services/
├── styles/
├── utils/
├── App.tsx
└── main.tsx
```

### Directory Explanations
/assets: Contains static assets like images, fonts, and SVGs.

/components: Holds shared, reusable UI components like Button, Card, or Layout that are used across multiple features.

/features: Contains the core application features. Each feature folder (e.g., machineDashboard) is a self-contained module with its own specific components, hooks, and logic.

/hooks: Stores global, reusable React hooks that can be used by any component in the application.

/lib: A place for third-party library configurations or helper modules, like a pre-configured API client (apiClient.js).

/pages: Holds the top-level components that correspond to a specific URL route (e.g., /dashboard). These components assemble features and shared components into a full page view.

/services: Contains application-wide logic for interacting with external services, such as your backend API or WebSocket connections.

/styles: For global CSS files and style configurations.

/utils: A collection of global helper functions that can be used anywhere in the application (e.g., formatDate.js).
