import { NavLink, Outlet } from 'react-router-dom'

// Tiny inline SVG nav icons with hand-drawn feel
function NavIcon({ type, active }) {
  const color = active ? '#1A4E7A' : '#5B7C97'
  const size = 22

  const icons = {
    home: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M4 12 L12 4 L20 12" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 11 L6 19 Q6 20 7 20 L10 20 L10 16 Q10 15 12 15 Q14 15 14 16 L14 20 L17 20 Q18 20 18 19 L18 11" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill={active ? '#6FB1DC30' : 'none'} />
      </svg>
    ),
    cart: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M3 3 L5 3 L8 16 L18 16" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 6 L20 6 L18 14 L7.5 14" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={active ? '#FF8C4230' : 'none'} />
        <circle cx="9" cy="19" r="1.5" fill={color} />
        <circle cx="17" cy="19" r="1.5" fill={color} />
      </svg>
    ),
    box: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M3 8 L12 4 L21 8 L21 18 L12 22 L3 18 Z" stroke={color} strokeWidth="2.5" strokeLinejoin="round" fill={active ? '#4A7FA820' : 'none'} />
        <path d="M3 8 L12 12 L21 8" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        <path d="M12 12 L12 22" stroke={color} strokeWidth="2" />
      </svg>
    ),
    clipboard: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="5" y="4" width="14" height="18" rx="2" stroke={color} strokeWidth="2.5" fill={active ? '#6FB1DC20' : 'none'} />
        <rect x="8" y="2" width="8" height="4" rx="1.5" fill={color} opacity="0.7" />
        <line x1="8" y1="11" x2="16" y2="11" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1="15" x2="14" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    chart: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="4" y="13" width="4" height="8" rx="1" fill={active ? '#4A7FA8' : color} opacity={active ? 0.8 : 0.5} />
        <rect x="10" y="8" width="4" height="13" rx="1" fill={active ? '#6FB1DC' : color} opacity={active ? 0.8 : 0.5} />
        <rect x="16" y="4" width="4" height="17" rx="1" fill={active ? '#FF8C42' : color} opacity={active ? 0.8 : 0.5} />
        <line x1="3" y1="21" x2="21" y2="21" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  }

  return icons[type] || null
}

const NAV_ITEMS = [
  { path: '/', type: 'home', label: 'Inicio' },
  { path: '/pos', type: 'cart', label: 'Vender' },
  { path: '/inventory', type: 'box', label: 'Inventario' },
  { path: '/orders', type: 'clipboard', label: 'Pedidos' },
  { path: '/reports', type: 'chart', label: 'Reportes' },
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
            {({ isActive }) => (
              <>
                <NavIcon type={item.type} active={isActive} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
