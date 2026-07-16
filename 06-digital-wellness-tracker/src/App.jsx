import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import CustomCursor from './components/CustomCursor';
import MovingHeadline from './components/MovingHeadline';
import ProtectedPage from './components/ProtectedPage';
import GuidedWalkthrough from './components/GuidedWalkthrough';
import { AppProvider, useApp } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import Home from './pages/Home';
import WellnessMethod from './pages/WellnessMethod';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ProfileSetup from './pages/ProfileSetup';
import UsageHub from './pages/UsageHub';
import FocusMode from './pages/FocusMode';
import DigitalDetoxPlanner from './pages/DigitalDetoxPlanner';
import DailyCheckIn from './pages/DailyCheckIn';
import WellnessAnalytics from './pages/WellnessAnalytics';
import HealthGuide from './pages/HealthGuide';
import Settings from './pages/Settings';

function PrivateRoute({ children, allowIncomplete = false }) {
  return <ProtectedPage allowIncomplete={allowIncomplete}>{children}</ProtectedPage>;
}

function AppRoutes() {
  const { currentUser, toast, setToast } = useApp();
  return (
    <div className={`app-root ${currentUser ? 'private-app' : 'public-app'}`}>
      <Navbar />
      <MovingHeadline />
      <Routes>
        <Route path="/" element={currentUser ? <Navigate to="/dashboard" replace /> : <Home />} />
        <Route path="/wellness-method" element={<WellnessMethod />} />
        <Route path="/features" element={<Navigate to="/wellness-method" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/profile-setup" element={<PrivateRoute allowIncomplete><ProfileSetup /></PrivateRoute>} />
        <Route path="/usage" element={<PrivateRoute><UsageHub /></PrivateRoute>} />
        <Route path="/focus" element={<PrivateRoute><FocusMode /></PrivateRoute>} />
        <Route path="/detox" element={<PrivateRoute><DigitalDetoxPlanner /></PrivateRoute>} />
        <Route path="/check-in" element={<PrivateRoute><DailyCheckIn /></PrivateRoute>} />
        <Route path="/health-guide" element={<PrivateRoute><HealthGuide /></PrivateRoute>} />
        <Route path="/analytics" element={<PrivateRoute><WellnessAnalytics /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/screen-time" element={<Navigate to="/usage" replace />} />
        <Route path="/app-usage" element={<Navigate to="/usage" replace />} />
        <Route path="/mood" element={<Navigate to="/check-in" replace />} />
        <Route path="/sleep" element={<Navigate to="/check-in" replace />} />
        <Route path="/challenges" element={<Navigate to="/detox" replace />} />
        <Route path="/global-insights" element={<Navigate to="/health-guide" replace />} />
        <Route path="*" element={<Navigate to={currentUser ? '/dashboard' : '/'} replace />} />
      </Routes>
      <GuidedWalkthrough />
      <Toast toast={toast} onClose={() => setToast(null)} />
      <CustomCursor />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </ThemeProvider>
  );
}
