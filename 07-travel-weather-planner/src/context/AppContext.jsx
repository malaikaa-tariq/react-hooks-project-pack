import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import useUndo from '../hooks/useUndo'
import { createDefaultUserData } from '../data/demoData'
import { fallbackCity, fallbackWeather } from '../data/fallbackWeather'
import { createId } from '../utils/helpers'

const AppContext = createContext(null)
const GUEST_KEY = '__guest__'

const savedCitiesReducer = (state, action) => {
  switch (action.type) {
    case 'RESET': return action.payload || []
    case 'ADD': return [action.payload, ...state.filter((city) => city.id !== action.payload.id)]
    case 'DELETE': return state.filter((city) => city.id !== action.payload)
    case 'DELETE_MANY': return state.filter((city) => !action.payload.includes(city.id))
    default: return state
  }
}

const ensureData = (data, profile = {}) => ({ ...createDefaultUserData(profile), ...(data || {}), profile: { ...createDefaultUserData(profile).profile, ...(data?.profile || {}) } })

export function AppProvider({ children }) {
  const [users, setUsers] = useLocalStorage('skysense_users', [])
  const [sessionEmail, setSessionEmail] = useLocalStorage('skysense_session', '')
  const [dataMap, setDataMap] = useLocalStorage('skysense_user_data_v2', () => ({ [GUEST_KEY]: createDefaultUserData({ defaultCity: 'Karachi' }) }))
  const [toast, setToast] = useState(null)
  const [activeCity, setActiveCity] = useState(fallbackCity)
  const [activeWeather, setActiveWeather] = useState(fallbackWeather)
  const currentKey = sessionEmail || GUEST_KEY
  const dataMapRef = useRef(dataMap)
  const { pushUndo, undoLast, clearUndo, canUndo } = useUndo()

  useEffect(() => { dataMapRef.current = dataMap }, [dataMap])

  const currentUser = useMemo(() => users.find((user) => user.email === sessionEmail) || null, [sessionEmail, users])
  const rawCurrentData = useMemo(() => ensureData(dataMap[currentKey], currentUser || {}), [currentKey, currentUser, dataMap])
  const [savedCities, dispatchSavedCities] = useReducer(savedCitiesReducer, rawCurrentData.savedCities || [])

  // Reset only when the signed-in identity changes. This avoids the old storage/render feedback loop.
  useEffect(() => {
    const next = ensureData(dataMapRef.current[currentKey], currentUser || {})
    dispatchSavedCities({ type: 'RESET', payload: next.savedCities || [] })
  }, [currentKey, currentUser])

  const showToast = useCallback((config) => setToast({ id: createId('toast'), duration: 4300, ...config }), [])
  const hideToast = useCallback(() => setToast(null), [])

  const updateCurrentData = useCallback((updater) => {
    setDataMap((map) => {
      const previous = ensureData(map[currentKey], currentUser || {})
      const next = typeof updater === 'function' ? updater(previous) : { ...previous, ...updater }
      return { ...map, [currentKey]: next }
    })
  }, [currentKey, currentUser, setDataMap])

  const applySavedAction = useCallback((action) => {
    dispatchSavedCities(action)
    setDataMap((map) => {
      const previous = ensureData(map[currentKey], currentUser || {})
      return { ...map, [currentKey]: { ...previous, savedCities: savedCitiesReducer(previous.savedCities || [], action) } }
    })
  }, [currentKey, currentUser, setDataMap])

  const signup = useCallback((form) => {
    const email = form.email.trim().toLowerCase()
    if (users.some((user) => user.email === email)) return { ok: false, message: 'An account already uses this email.' }
    const user = { id: createId('user'), fullName: form.fullName.trim(), email, password: form.password, defaultCity: form.defaultCity.trim(), unit: form.unit, interest: form.interest, createdAt: new Date().toISOString() }
    setUsers((items) => [...items, user])
    setDataMap((map) => ({ ...map, [email]: createDefaultUserData(user) }))
    setSessionEmail(email)
    return { ok: true }
  }, [setDataMap, setSessionEmail, setUsers, users])

  const login = useCallback(({ email, password }) => {
    const normalized = email.trim().toLowerCase()
    const user = users.find((item) => item.email === normalized)
    if (!user) return { ok: false, field: 'email', message: 'No account is registered with this email.' }
    if (user.password !== password) return { ok: false, field: 'password', message: 'The password is incorrect.' }
    setSessionEmail(normalized)
    return { ok: true }
  }, [setSessionEmail, users])

  const logout = useCallback(() => {
    setSessionEmail('')
    setActiveCity(fallbackCity)
    setActiveWeather(fallbackWeather)
    clearUndo()
  }, [clearUndo, setSessionEmail])

  const updateProfile = useCallback((profile) => {
    updateCurrentData((data) => ({ ...data, profile: { ...data.profile, ...profile } }))
    if (sessionEmail) setUsers((items) => items.map((user) => user.email === sessionEmail ? { ...user, fullName: profile.fullName, defaultCity: profile.defaultCity, unit: profile.unit, interest: profile.interest } : user))
    showToast({ type: 'success', title: 'Preferences saved', message: 'Your weather workspace has been updated.' })
  }, [sessionEmail, setUsers, showToast, updateCurrentData])

  const addRecentSearch = useCallback((city, weather) => {
    const item = { ...city, searchedAt: new Date().toISOString(), temperature: weather?.current?.temperature, weatherCode: weather?.current?.weatherCode, rainChance: weather?.current?.rainChance, windSpeed: weather?.current?.windSpeed }
    updateCurrentData((data) => ({ ...data, recentSearches: [item, ...(data.recentSearches || []).filter((entry) => entry.id !== item.id)].slice(0, 8) }))
  }, [updateCurrentData])

  const saveCity = useCallback((city, weather) => {
    const item = { ...city, savedAt: new Date().toISOString(), temperature: weather?.current?.temperature, weatherCode: weather?.current?.weatherCode, rainChance: weather?.current?.rainChance, windSpeed: weather?.current?.windSpeed }
    const exists = savedCities.some((entry) => entry.id === item.id)
    applySavedAction({ type: 'ADD', payload: item })
    showToast({ type: exists ? 'info' : 'success', title: exists ? 'City refreshed' : 'City saved', message: `${city.name} is ready in Saved Cities.` })
  }, [applySavedAction, savedCities, showToast])

  const removeSavedCity = useCallback((id) => {
    const item = savedCities.find((city) => city.id === id)
    if (!item) return
    applySavedAction({ type: 'DELETE', payload: id })
    pushUndo(() => applySavedAction({ type: 'ADD', payload: item }))
    showToast({ type: 'warning', title: 'City removed', message: `${item.name} was removed.`, actionLabel: 'Undo', onAction: undoLast })
  }, [applySavedAction, pushUndo, savedCities, showToast, undoLast])

  const removeManySavedCities = useCallback((ids) => {
    const removed = savedCities.filter((city) => ids.includes(city.id))
    if (!removed.length) return
    applySavedAction({ type: 'DELETE_MANY', payload: ids })
    pushUndo(() => removed.slice().reverse().forEach((item) => applySavedAction({ type: 'ADD', payload: item })))
    showToast({ type: 'warning', title: 'Cities removed', message: `${removed.length} selected cities were removed.`, actionLabel: 'Undo', onAction: undoLast })
  }, [applySavedAction, pushUndo, savedCities, showToast, undoLast])

  const addActivityPlan = useCallback((plan) => {
    const saved = { id: createId('plan'), createdAt: new Date().toISOString(), ...plan }
    updateCurrentData((data) => ({ ...data, activityPlans: [saved, ...(data.activityPlans || [])].slice(0, 20) }))
    showToast({ type: 'success', title: 'Plan saved', message: 'Your weather-ready activity plan is available below.' })
  }, [showToast, updateCurrentData])

  const deleteActivityPlan = useCallback((id) => {
    const list = rawCurrentData.activityPlans || []
    const item = list.find((plan) => plan.id === id)
    if (!item) return
    updateCurrentData((data) => ({ ...data, activityPlans: (data.activityPlans || []).filter((plan) => plan.id !== id) }))
    pushUndo(() => updateCurrentData((data) => ({ ...data, activityPlans: [item, ...(data.activityPlans || [])] })))
    showToast({ type: 'warning', title: 'Plan deleted', message: 'The activity plan was removed.', actionLabel: 'Undo', onAction: undoLast })
  }, [pushUndo, rawCurrentData.activityPlans, showToast, undoLast, updateCurrentData])

  const clearCurrentData = useCallback(() => {
    const empty = createDefaultUserData(rawCurrentData.profile)
    setDataMap((map) => ({ ...map, [currentKey]: empty }))
    dispatchSavedCities({ type: 'RESET', payload: [] })
    clearUndo()
    showToast({ type: 'success', title: 'Saved data cleared', message: 'Your profile remains, while saved weather items were removed.' })
  }, [clearUndo, currentKey, rawCurrentData.profile, setDataMap, showToast])

  const handleUndo = useCallback(() => {
    const restored = undoLast()
    showToast(restored ? { type: 'success', title: 'Action undone', message: 'The previous item was restored.' } : { type: 'info', title: 'Nothing to undo', message: 'There is no recent deletion to restore.' })
  }, [showToast, undoLast])

  useEffect(() => {
    const onKeyDown = (event) => {
      const editing = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target?.isContentEditable
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && !editing) {
        event.preventDefault()
        handleUndo()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleUndo])

  const currentData = useMemo(() => ({ ...rawCurrentData, savedCities }), [rawCurrentData, savedCities])
  const value = useMemo(() => ({
    users, currentUser, isAuthenticated: Boolean(currentUser), currentData, profile: currentData.profile,
    savedCities, recentSearches: currentData.recentSearches || [], activityPlans: currentData.activityPlans || [],
    toast, activeCity, activeWeather, canUndo,
    signup, login, logout, updateProfile, showToast, hideToast, setActiveCity, setActiveWeather,
    addRecentSearch, saveCity, removeSavedCity, removeManySavedCities, addActivityPlan, deleteActivityPlan,
    handleUndo, clearCurrentData,
  }), [activeCity, activeWeather, addActivityPlan, addRecentSearch, canUndo, clearCurrentData, currentData, currentUser, deleteActivityPlan, handleUndo, hideToast, login, logout, removeManySavedCities, removeSavedCity, saveCity, savedCities, showToast, signup, toast, updateProfile, users])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used inside AppProvider')
  return context
}
