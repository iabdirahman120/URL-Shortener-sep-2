import { Routes, Route } from 'react-router-dom'
import Login from './pages/login'
import Register from './pages/register'
import Dashboard from './pages/dashboard'
import Forside from './pages/forside'
import Settings from './pages/settings'
import Admin from './pages/admin'
import PasswordPage from './pages/password'
import Docs from './pages/docs'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Forside/>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard/>} />
      <Route path="/settings" element={<Settings/>} />
      <Route path="/admin" element={<Admin/>} />
      <Route path="/password/:short_code" element={<PasswordPage />} />
      <Route path="/docs" element={<Docs />} />
    </Routes>
  )
}

export default App
