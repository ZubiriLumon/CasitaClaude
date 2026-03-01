import { useState } from 'react';
import useStore from '../store/useStore';
import { t, paymentMethods, formatMoney } from '../theme';
import { currentPeriod } from '../services/periodService';
import { expenseFeedback } from '../services/tipsEngine';
import Icon from './Icon';

export default function AddExpense({ onClose }) {
  const { section, profile, addExpense, getCategoriesForSection, getExpensesForPeriod, getGlobalBudget, showFeedback } = useStore();
  const colors = t(section);
  const categories = getCategoriesForSection();

  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [categoryId, setCategoryId] = useState(null);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');

  const amountNum = parseFloat(amount.replace(',', '.')) || 0;
  const selectedCat = categories.find((c) => c.id === categoryId);

  const canStep1 = amountNum > 0;
  const canStep2 = categoryId != null;

  function handleSave() {
    if (!canStep1 || !canStep2) return;

    addExpense({
      amount: amountNum,
      description,
      date: new Date(date).toISOString(),
      categoryId,
      paymentMethod,
      tags,
      section,
    });

    // Feedback
    const period = currentPeriod(profile.billingCycleStartDay);
    const expenses = getExpensesForPeriod(period.start, period.end);
    const total = expenses.reduce((s, e) => s + e.amount, 0) + amountNum;
    const budget = getGlobalBudget();
    showFeedback(expenseFeedback(total, budget?.amount));

    onClose();
  }

  function addTag() {
    const trimmed = newTag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setNewTag('');
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        {/* Steps */}
        <div className="steps">
          {[1, 2, 3].map((s) => (
            <div key={s} className="step-bar" style={{ background: step >= s ? colors.primary : undefined }} />
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ color: colors.text, margin: 0 }}>
            {step === 1 ? '¿Cuánto gastaste?' : step === 2 ? '¿En qué categoría?' : 'Detalles (opcional)'}
          </h3>
          <button className="btn-ghost" onClick={onClose} style={{ color: colors.textSecondary }}>
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Step 1: Amount + Payment Method */}
        {step === 1 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', margin: '24px 0' }}>
              <span style={{ fontSize: 28, color: colors.textSecondary, fontWeight: 300 }}>$</span>
              <input
                className="input-big"
                style={{ color: colors.text }}
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                type="text"
                inputMode="decimal"
              />
            </div>

            <p style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 10, textAlign: 'center' }}>
              Método de pago
            </p>
            <div className="pm-row" style={{ justifyContent: 'center' }}>
              {paymentMethods.map((pm) => (
                <button
                  key={pm.id}
                  className={`pm-pill ${paymentMethod === pm.id ? 'selected' : ''}`}
                  style={paymentMethod === pm.id ? { background: colors.primary, color: '#fff', borderColor: 'transparent' } : {}}
                  onClick={() => setPaymentMethod(pm.id)}
                >
                  <Icon name={pm.icon} size={16} />
                  {pm.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Category */}
        {step === 2 && (
          <div className="cat-grid">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`cat-item ${categoryId === cat.id ? 'selected' : ''}`}
                style={{ color: cat.color, borderColor: categoryId === cat.id ? cat.color : 'transparent' }}
                onClick={() => setCategoryId(cat.id)}
              >
                <div
                  className="cat-icon"
                  style={{
                    background: categoryId === cat.id ? cat.color : `${cat.color}20`,
                  }}
                >
                  <Icon name={cat.icon} size={20} color={categoryId === cat.id ? '#fff' : cat.color} />
                </div>
                <span className="cat-label" style={{ color: colors.text }}>{cat.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Step 3: Details */}
        {step === 3 && (
          <div className="stack">
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: colors.textSecondary, display: 'block', marginBottom: 6 }}>
                Descripción
              </label>
              <input
                className="input"
                placeholder="¿En qué lo gastaste?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: colors.textSecondary, display: 'block', marginBottom: 6 }}>
                Fecha
              </label>
              <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: colors.textSecondary, display: 'block', marginBottom: 6 }}>
                Etiquetas
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="input"
                  placeholder="Agregar etiqueta"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTag()}
                />
                <button className="btn btn-sm" style={{ background: colors.primary, color: '#fff' }} onClick={addTag}>
                  <Icon name="Plus" size={16} />
                </button>
              </div>
              {tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {tags.map((tag) => (
                    <span key={tag} className="tag" style={{ background: `${colors.primary}15`, color: colors.primary }}>
                      {tag}
                      <button onClick={() => setTags(tags.filter((t) => t !== tag))}>
                        <Icon name="X" size={12} color={colors.primary} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="card" style={{ textAlign: 'center', background: `${colors.primary}08` }}>
              <p style={{ fontSize: 12, color: colors.textSecondary }}>Resumen</p>
              <p style={{ fontSize: 24, fontWeight: 800, color: colors.text, margin: '8px 0' }}>
                {formatMoney(amountNum)}
              </p>
              {selectedCat && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Icon name={selectedCat.icon} size={14} color={selectedCat.color} />
                  <span style={{ fontSize: 14, color: selectedCat.color, fontWeight: 500 }}>{selectedCat.name}</span>
                </div>
              )}
              <p style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
                {paymentMethods.find((m) => m.id === paymentMethod)?.name}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          {step > 1 && (
            <button
              className="btn btn-outline"
              style={{ borderColor: colors.primary, color: colors.primary, flex: 1 }}
              onClick={() => setStep(step - 1)}
            >
              Atrás
            </button>
          )}
          <button
            className="btn btn-primary btn-full"
            style={{
              background: (step === 1 && canStep1) || (step === 2 && canStep2) || step === 3
                ? colors.primary
                : '#D1D5DB',
              flex: 2,
            }}
            disabled={(step === 1 && !canStep1) || (step === 2 && !canStep2)}
            onClick={() => {
              if (step < 3) setStep(step + 1);
              else handleSave();
            }}
          >
            {step === 3 ? 'Guardar Gasto' : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  );
}
