import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import 'bootstrap/dist/css/bootstrap.min.css'

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function App() {

  return (
  <Router>
    <Routes>
      {}
      <Route path="/" element={<Navigate to="/Login" />} />
      {}
      <Route path="/Login" element={<Login />} />
      {}
      <Route path="/Dashboard/*" element={<Dashboard />} />
    </Routes>
  </Router>
  )
}

export default App
