import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initTg } from './shared/utils'

import App from './app/App.tsx'
import '@/app/scss/index.scss'
import 'primereact/resources/themes/lara-light-blue/theme.css'
import 'primereact/resources/primereact.min.css'


initTg()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
