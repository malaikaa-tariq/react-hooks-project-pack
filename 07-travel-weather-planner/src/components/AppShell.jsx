import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import CustomCursor from './CustomCursor'
import Toast from './Toast'
import { useApp } from '../context/AppContext'

export default function AppShell() {
  const { isAuthenticated, toast, hideToast } = useApp()
  return (
    <div className="app-root">
      <div className="ambient-bg" aria-hidden="true"><span /><span /><span /></div>
      <CustomCursor />
      <Navbar />
      <div className={isAuthenticated ? 'app-frame private-frame' : 'app-frame'}>
        <main className="main-content"><Outlet /></main>
      </div>
      {!isAuthenticated && <Footer />}
      {toast && <Toast key={toast.id} toast={toast} onClose={hideToast} />}
    </div>
  )
}
