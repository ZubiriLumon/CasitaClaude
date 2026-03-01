// Design system — dual-palette theme for Personal/Business sections

export const theme = {
  personal: {
    primary: '#6C63FF',
    primaryLight: '#A78BFA',
    accent: '#34D399',
    bg: '#F8F7FF',
    card: '#FFFFFF',
    text: '#1E1B4B',
    textSecondary: '#6B7280',
    danger: '#EF4444',
    warning: '#F59E0B',
    success: '#10B981',
    gradient: 'linear-gradient(135deg, #6C63FF, #A78BFA)',
  },
  business: {
    primary: '#0F766E',
    primaryLight: '#14B8A6',
    accent: '#F59E0B',
    bg: '#F0FDFA',
    card: '#FFFFFF',
    text: '#134E4A',
    textSecondary: '#6B7280',
    danger: '#DC2626',
    warning: '#D97706',
    success: '#059669',
    gradient: 'linear-gradient(135deg, #0F766E, #14B8A6)',
  },
};

export function t(section) {
  return theme[section] || theme.personal;
}

export const defaultPersonalCategories = [
  { name: 'Alimentación', icon: 'UtensilsCrossed', color: '#F59E0B' },
  { name: 'Transporte', icon: 'Car', color: '#3B82F6' },
  { name: 'Entretenimiento', icon: 'Gamepad2', color: '#8B5CF6' },
  { name: 'Salud', icon: 'Heart', color: '#EF4444' },
  { name: 'Hogar', icon: 'Home', color: '#10B981' },
  { name: 'Educación', icon: 'BookOpen', color: '#6366F1' },
  { name: 'Ropa', icon: 'Shirt', color: '#EC4899' },
  { name: 'Servicios', icon: 'Zap', color: '#F97316' },
  { name: 'Suscripciones', icon: 'Repeat', color: '#06B6D4' },
  { name: 'Otros', icon: 'MoreHorizontal', color: '#6B7280' },
];

export const defaultBusinessCategories = [
  { name: 'Ingredientes', icon: 'Egg', color: '#D97706' },
  { name: 'Chocolate', icon: 'Cookie', color: '#78350F' },
  { name: 'Empaque', icon: 'Package', color: '#14B8A6' },
  { name: 'Delivery/Envíos', icon: 'Truck', color: '#3B82F6' },
  { name: 'Gas/Electricidad', icon: 'Zap', color: '#F59E0B' },
  { name: 'Marketing', icon: 'Megaphone', color: '#8B5CF6' },
  { name: 'Equipo de Cocina', icon: 'ChefHat', color: '#0F766E' },
  { name: 'Renta/Local', icon: 'Building2', color: '#6366F1' },
  { name: 'Impuestos', icon: 'FileText', color: '#DC2626' },
  { name: 'Otros', icon: 'MoreHorizontal', color: '#6B7280' },
];

export const defaultPersonalIncomeCategories = [
  { name: 'Nómina', icon: 'Landmark', color: '#059669' },
  { name: 'Freelance', icon: 'Laptop', color: '#6366F1' },
  { name: 'Transferencias', icon: 'ArrowLeftRight', color: '#3B82F6' },
  { name: 'Regalos', icon: 'Gift', color: '#EC4899' },
  { name: 'Inversiones', icon: 'TrendingUp', color: '#0F766E' },
  { name: 'Otros Ingresos', icon: 'MoreHorizontal', color: '#6B7280' },
];

export const defaultBusinessIncomeCategories = [
  { name: 'Venta Individual', icon: 'ShoppingBag', color: '#059669' },
  { name: 'Pedidos Especiales', icon: 'Star', color: '#D97706' },
  { name: 'Ventas por Mayor', icon: 'Package', color: '#0F766E' },
  { name: 'Eventos/Ferias', icon: 'PartyPopper', color: '#8B5CF6' },
  { name: 'Delivery', icon: 'Truck', color: '#3B82F6' },
  { name: 'Otros Ingresos', icon: 'MoreHorizontal', color: '#6B7280' },
];

export const paymentMethods = [
  { id: 'cash', name: 'Efectivo', icon: 'Banknote' },
  { id: 'debit', name: 'Débito', icon: 'CreditCard' },
  { id: 'credit', name: 'Crédito', icon: 'CreditCard' },
  { id: 'transfer', name: 'Transferencia', icon: 'ArrowLeftRight' },
  { id: 'wallet', name: 'Wallet Digital', icon: 'Smartphone' },
  { id: 'other', name: 'Otro', icon: 'CircleEllipsis' },
];

export const badgeDefinitions = [
  { id: 'first_expense', name: 'Primer Paso', desc: 'Registra tu primer gasto', icon: 'Star', xp: 50, type: 'expenses', target: 1 },
  { id: 'ten_expenses', name: 'En Racha', desc: 'Registra 10 gastos', icon: 'Flame', xp: 100, type: 'expenses', target: 10 },
  { id: 'fifty_expenses', name: 'Registrador Pro', desc: 'Registra 50 gastos', icon: 'Trophy', xp: 250, type: 'expenses', target: 50 },
  { id: 'streak_7', name: 'Semana Perfecta', desc: '7 días seguidos', icon: 'CalendarCheck', xp: 150, type: 'streak', target: 7 },
  { id: 'streak_30', name: 'Mes Disciplinado', desc: '30 días seguidos', icon: 'CalendarClock', xp: 500, type: 'streak', target: 30 },
  { id: 'budget_1', name: 'Presupuesto OK', desc: 'Respeta tu presupuesto 1 mes', icon: 'ShieldCheck', xp: 200, type: 'budget', target: 1 },
  { id: 'level_5', name: 'Organizador', desc: 'Alcanza el nivel 5', icon: 'CircleDot', xp: 100, type: 'level', target: 5 },
  { id: 'level_10', name: 'Estratega', desc: 'Alcanza el nivel 10', icon: 'Crown', xp: 300, type: 'level', target: 10 },
  { id: 'categories_5', name: 'Diversificador', desc: 'Usa 5 categorías', icon: 'LayoutGrid', xp: 75, type: 'categories', target: 5 },
  { id: 'report_1', name: 'Analista', desc: 'Revisa tu primer reporte', icon: 'BarChart3', xp: 100, type: 'reports', target: 1 },
];

export function formatMoney(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
}

export function getLevelTitle(level) {
  if (level <= 3) return 'Principiante';
  if (level <= 6) return 'Organizado';
  if (level <= 10) return 'Estratega';
  if (level <= 15) return 'Experto';
  if (level <= 20) return 'Maestro Financiero';
  return 'Leyenda';
}
