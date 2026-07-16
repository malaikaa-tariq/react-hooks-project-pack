import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import ProtectedPage from './components/ProtectedPage'
import LoadingCard from './components/LoadingCard'
import './App.css'

const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const SearchWeather = lazy(() => import('./pages/SearchWeather'))
const SavedCities = lazy(() => import('./pages/SavedCities'))
const HourlyForecast = lazy(() => import('./pages/HourlyForecast'))
const WeeklyForecast = lazy(() => import('./pages/WeeklyForecast'))
const AirQuality = lazy(() => import('./pages/AirQuality'))
const ActivityPlanner = lazy(() => import('./pages/ActivityPlanner'))
const CompareCities = lazy(() => import('./pages/CompareCities'))
const Settings = lazy(() => import('./pages/Settings'))

const protect = (page) => <ProtectedPage>{page}</ProtectedPage>
const fallback = <div className="route-loading content-width"><LoadingCard lines={6} /></div>

export default function App() {
  return <Suspense fallback={fallback}><Routes><Route element={<AppShell />}><Route index element={<Home />} /><Route path="search" element={<SearchWeather />} /><Route path="compare" element={<CompareCities />} /><Route path="login" element={<Login />} /><Route path="signup" element={<Signup />} /><Route path="dashboard" element={protect(<Dashboard />)} /><Route path="saved-cities" element={protect(<SavedCities />)} /><Route path="hourly" element={protect(<HourlyForecast />)} /><Route path="weekly" element={protect(<WeeklyForecast />)} /><Route path="air-quality" element={protect(<AirQuality />)} /><Route path="activity-planner" element={protect(<ActivityPlanner />)} /><Route path="settings" element={protect(<Settings />)} /><Route path="*" element={<Navigate to="/" replace />} /></Route></Routes></Suspense>
}
