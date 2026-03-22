import { NavLink, Outlet } from 'react-router-dom'

const NAV_ITEMS = [
  { path: '/', icon: '🏠', label: 'Inicio' },
  { path: '/pos', icon: '🛒', label: 'Vender' },
  { path: '/inventory', icon: '📦', label: 'Inventario' },
  { path: '/orders', icon: '📋', label: 'Pedidos' },
  { path: '/reports', icon: '📊', label: 'Reportes' },
]

export default function Layout() {
  return (
    <div className="app-layout">
      <Outlet />

      <nav className="bottom-nav">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            end={item.path === '/'}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
