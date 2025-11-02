import './App.css'
import { Provider as ReduxProvider } from 'react-redux'
import store from './store/store'
import { QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { createQueryClient } from './config/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from './theme/theme-provider'
import { CssBaseline } from '@mui/material'
import { Router } from './routes/sections'
import { ToastContainer } from 'react-toastify';


function App() {
  const [queryClient] = useState(createQueryClient)

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <ThemeProvider>
          <CssBaseline />
          <Router />
          <ToastContainer />
        </ThemeProvider>
      </QueryClientProvider>
    </ReduxProvider>
  )
}

export default App
