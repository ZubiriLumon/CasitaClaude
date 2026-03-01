import { useState } from 'react';
import useStore from '../store/useStore';
import { t } from '../theme';
import Icon from './Icon';
import Dashboard from './Dashboard';
import ExpenseList from './ExpenseList';
import BudgetList from './BudgetList';
import MonthlyReport from './MonthlyReport';
import Profile from './Profile';
import Settings from './Settings';
import AddExpense from './AddExpense';

const navItems = [
  { id: 'dashboard', label: 'Inicio', icon: 'Home' },
  { id: 'expenses', label: 'Gastos', icon: 'Receipt' },
  { id: 'budget', label: 'Límites', icon: 'Gauge' },
  { id: 'reports', label: 'Reportes', icon: 'BarChart3' },
  { id: 'profile', label: 'Perfil', icon: 'User' },
  { id: 'settings', label: 'Configuración', icon: 'Settings' },
];

export default function Layout() {
  const [page, setPage] = useState('dashboard');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const { section, setSection, feedback, recentBadge, clearRecentBadge } = useStore();
  const colors = t(section);

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard onAddExpense={() => setShowAddExpense(true)} />;
      case 'expenses': return <ExpenseList onAddExpense={() => setShowAddExpense(true)} />;
      case 'budget': return <BudgetList />;
      case 'reports': return <MonthlyReport />;
      case 'profile': return <Profile />;
      case 'settings': return <Settings />;
      default: return <Dashboard onAddExpense={() => setShowAddExpense(true)} />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <nav className="sidebar" style={{ background: colors.bg }}>
        <div className="sidebar-header">
          <h1 style={{ color: colors.text }}>CasitaClaude</h1>
          <p style={{ color: colors.textSecondary }}>Finanzas inteligentes</p>
        </div>

        {/* Section Switcher */}
        <div className="section-switcher">
          <button
            className="section-btn"
            style={{
              background: section === 'personal' ? colors.primary : 'transparent',
              color: section === 'personal' ? '#fff' : colors.textSecondary,
            }}
            onClick={() => setSection('personal')}
          >
            <Icon name="User" size={15} />
            <span className="nav-text">Personal</span>
          </button>
          <button
            className="section-btn"
            style={{
              background: section === 'business' ? colors.primary : 'transparent',
              color: section === 'business' ? '#fff' : colors.textSecondary,
            }}
            onClick={() => setSection('business')}
          >
            <Icon name="Briefcase" size={15} />
            <span className="nav-text">Negocios</span>
          </button>
        </div>

        {/* Nav items */}
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${page === item.id ? 'active' : ''}`}
            style={{
              color: page === item.id ? colors.primary : colors.textSecondary,
              background: page === item.id ? `${colors.primary}12` : 'transparent',
            }}
            onClick={() => setPage(item.id)}
          >
            <Icon name={item.icon} size={18} />
            <span className="nav-text">{item.label}</span>
          </button>
        ))}

        {/* Add expense button */}
        <div style={{ marginTop: 'auto', padding: '12px 0' }}>
          <button
            className="btn btn-primary btn-full"
            style={{ background: colors.primary }}
            onClick={() => setShowAddExpense(true)}
          >
            <Icon name="Plus" size={18} />
            <span className="nav-text">Nuevo Gasto</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content" style={{ background: colors.bg }}>
        {renderPage()}
      </main>

      {/* Add Expense Modal */}
      {showAddExpense && <AddExpense onClose={() => setShowAddExpense(false)} />}

      {/* Feedback Toast */}
      {feedback && (
        <div className="toast">
          <Icon name="CheckCircle" size={18} color={colors.success} />
          <span style={{ color: colors.text }}>{feedback}</span>
        </div>
      )}

      {/* Badge Earned Overlay */}
      {recentBadge && (
        <div className="badge-overlay" onClick={clearRecentBadge}>
          <div className="badge-overlay-content">
            <Icon name={recentBadge.icon} size={56} color={colors.accent} />
            <h3 style={{ marginTop: 16, color: colors.text }}>Badge Desbloqueado!</h3>
            <p style={{ fontSize: 18, fontWeight: 700, color: colors.accent, marginTop: 8 }}>
              {recentBadge.name}
            </p>
            <p style={{ color: colors.textSecondary, marginTop: 8, fontSize: 14 }}>
              {recentBadge.desc}
            </p>
            <span
              style={{
                display: 'inline-block',
                marginTop: 16,
                padding: '6px 16px',
                borderRadius: 999,
                background: `${colors.accent}20`,
                color: colors.accent,
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              +{recentBadge.xp} XP
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
