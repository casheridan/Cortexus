import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'

import AppWithAuth from './AppWithAuth.tsx'
import { Provider } from 'react-redux'
import { store } from './store'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <AppWithAuth />
    </Provider>
  </StrictMode>,
)
