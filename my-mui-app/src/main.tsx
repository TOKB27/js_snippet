import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

// 必要最小限のテーマ設定（デフォルト設定を使用）
const theme = createTheme()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      {/* 画面全体のスタイルをMUI仕様にリセット */}
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)