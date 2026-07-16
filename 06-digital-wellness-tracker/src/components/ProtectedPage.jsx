import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function ProtectedPage({ children, allowIncomplete = false }) {
  const { currentUser, profile } = useApp();
  const location = useLocation();
  if (!currentUser) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!allowIncomplete && !profile?.completed) return <Navigate to="/profile-setup" replace />;
  return children;
}
