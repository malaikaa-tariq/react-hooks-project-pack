import { Navigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function ProtectedPage({ children }) {
  const { isAuthenticated } = useApp()
  const location = useLocation()
  return isAuthenticated ? children : <Navigate to="/login" replace state={{ from: location.pathname }} />
}
