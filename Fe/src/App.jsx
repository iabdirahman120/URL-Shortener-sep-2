import { Routes, Route } from 'react-router-dom'
import Login from './pages/login'
import Register from './pages/register'
import Dashboard from './pages/dashboard'
import Forside from './pages/forside'
import Settings from './pages/settings'
import Admin from './pages/admin'
import PasswordPage from './pages/password'
import Docs from './pages/docs'
import ForgotPassword from './pages/forgot-password'
import ResetPassword from './pages/reset-password'
import NotFound from './pages/not-found'
import Privacy from './pages/privacy'
import Terms from './pages/terms'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Forside />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/password/:short_code" element={<PasswordPage />} />
      <Route path="/docs" element={<Docs />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/not-found" element={<NotFound />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
