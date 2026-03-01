import { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { t } from '../theme';
import { currentPeriod, formatPeriod } from '../services/periodService';
import Icon from './Icon';

export default function Settings() {
  const { section, profile, updateProfile } = useStore();
  const colors = t(section);

  const [name, setName] = useState(profile.displayName);
  const [startDay, setStartDay] = useState(profile.billingCycleStartDay);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(profile.displayName);
    setStartDay(profile.billingCycleStartDay);
  }, [profile.displayName, profile.billingCycleStartDay]);

  function handleSave() {
    updateProfile({ displayName: name, billingCycleStartDay: startDay });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleReset() {
    if (!window.confirm('¿Estás seguro? Esto eliminará TODOS tus datos (gastos, presupuestos, progreso). No se puede deshacer.')) return;
    localStorage.removeItem('casita-claude-storage');
    window.location.reload();
  }

  const previewPeriod = currentPeriod(startDay);

  return (
    <div>
      <div className="page-header">
        <h2 style={{ color: colors.text }}>Configuración</h2>
      </div>

      <div className="stack" style={{ maxWidth: 520 }}>
        {/* Profile */}
        <div className="card">
          <p style={{ fontWeight: 700, fontSize: 15, color: colors.text, marginBottom: 14 }}>Perfil</p>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: colors.textSecondary, display: 'block', marginBottom: 6 }}>
              Nombre
            </label>
            <input
              className="input"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        {/* Billing Cycle */}
        <div className="card">
          <p style={{ fontWeight: 700, fontSize: 15, color: colors.text, marginBottom: 6 }}>
            Ciclo Financiero
          </p>
          <p style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 16, lineHeight: 1.5 }}>
            El ciclo financiero inicia el día que elijas de cada mes. Ideal para alinear con tu fecha de corte de tarjeta de crédito.
          </p>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: colors.textSecondary, display: 'block', marginBottom: 6 }}>
              Día de inicio del ciclo
            </label>
            <select
              className="input"
              value={startDay}
              onChange={(e) => setStartDay(parseInt(e.target.value))}
              style={{ cursor: 'pointer' }}
            >
              {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>Día {d}</option>
              ))}
            </select>
          </div>

          {/* Preview */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: 14, borderRadius: 'var(--radius-sm)',
            background: `${colors.primary}10`,
          }}>
            <Icon name="Calendar" size={18} color={colors.primary} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>
                Ciclo actual: {formatPeriod(previewPeriod.start, previewPeriod.end)}
              </p>
              <p style={{ fontSize: 11, color: colors.textSecondary }}>
                Los reportes y estadísticas se calcularán con este rango
              </p>
            </div>
          </div>
        </div>

        {/* Save */}
        <button className="btn btn-primary btn-full" style={{ background: colors.primary }} onClick={handleSave}>
          {saved ? (
            <><Icon name="Check" size={18} /> Guardado</>
          ) : (
            <><Icon name="Save" size={18} /> Guardar Cambios</>
          )}
        </button>

        {/* App Info */}
        <div className="card">
          <p style={{ fontWeight: 700, fontSize: 15, color: colors.text, marginBottom: 12 }}>Información</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
            <span style={{ fontSize: 14, color: colors.textSecondary }}>Versión</span>
            <span style={{ fontSize: 14, color: colors.text }}>1.0.0</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
            <span style={{ fontSize: 14, color: colors.textSecondary }}>Almacenamiento</span>
            <span style={{ fontSize: 14, color: colors.text }}>localStorage (local)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
            <span style={{ fontSize: 14, color: colors.textSecondary }}>Framework</span>
            <span style={{ fontSize: 14, color: colors.text }}>React + Vite</span>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card" style={{ borderLeft: `3px solid ${colors.danger}` }}>
          <p style={{ fontWeight: 700, fontSize: 15, color: colors.danger, marginBottom: 8 }}>Zona de peligro</p>
          <p style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 14, lineHeight: 1.5 }}>
            Esto eliminará todos los gastos, presupuestos, progreso de gamificación y configuraciones.
          </p>
          <button
            className="btn btn-sm"
            style={{ background: `${colors.danger}12`, color: colors.danger, border: 'none' }}
            onClick={handleReset}
          >
            <Icon name="Trash2" size={14} />
            Restablecer todos los datos
          </button>
        </div>
      </div>
    </div>
  );
}
