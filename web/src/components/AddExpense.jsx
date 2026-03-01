import { useState, useCallback } from 'react';
import useStore from '../store/useStore';
import { t, paymentMethods, formatMoney } from '../theme';
import { currentPeriod } from '../services/periodService';
import { expenseFeedback } from '../services/tipsEngine';
import { playSuccess, playStep, playPop } from '../services/sounds';
import Icon from './Icon';
import Confetti from './Confetti';

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
  const [showConfetti, setShowConfetti] = useState(false);
  const [saved, setSaved] = useState(false);

  const amountNum = parseFloat(amount.replace(',', '.')) || 0;
  const selectedCat = categories.find((c) => c.id === categoryId);

  const canStep1 = amountNum > 0;
  const canStep2 = categoryId != null;

  function handleSave() {
    if (!canStep1 || !canStep2) return;

    addExpense({
      amount: amountNum,
      description,
      date: new Date(date + 'T12:00:00').toISOString(),
      categoryId,
      paymentMethod,
      tags,
      section,
    });

    // Sound + confetti
    playSuccess();
    setShowConfetti(true);
    setSaved(true);

    // Feedback
    const period = currentPeriod(profile.billingCycleStartDay);
    const expenses = getExpensesForPeriod(period.start, period.end);
    const total = expenses.reduce((s, e) => s + e.amount, 0) + amountNum;
    const budget = getGlobalBudget();
    showFeedback(expenseFeedback(total, budget?.amount));

    // Close after celebration
    setTimeout(() => onClose(), 1400);
  }

  function nextStep() {
    if (step < 3) {
      playStep();
      setStep(step + 1);
    } else {
      handleSave();
    }
  }

  function prevStep() {
    playStep();
    setStep(step - 1);
  }

  function addTag() {
    const trimmed = newTag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      playPop();
    }
    setNewTag('');
  }

  const handleConfettiDone = useCallback(() => setShowConfetti(false), []);

  if (saved) {
    return (
      <>
        <Confetti active={showConfetti} onDone={handleConfettiDone} />
        <div className="modal-backdrop">
          <div className="modal" style={{ textAlign: 'center', padding: '60px 36px' }}>
            <div
              className="bounce-in"
              style={{
                width: 80, height: 80, borderRadius: '50%',
                background: colors.success, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: `0 8px 24px ${colors.success}40`,
              }}
            >
              <Icon name="Check" size={40} color="#fff" />
            </div>
            <h3 className="bounce-in" style={{ color: colors.text, margin: 0, fontSize: 24, fontWeight: 900 }}>
              Gasto Registrado
            </h3>
            <p className="amount-display" style={{ fontSize: 32, fontWeight: 900, color: colors.primary, margin: '12px 0' }}>
              {formatMoney(amountNum)}
            </p>
            {selectedCat && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Icon name={selectedCat.icon} size={16} color={selectedCat.color} />
                <span style={{ color: selectedCat.color, fontWeight: 700 }}>{selectedCat.name}</span>
              </div>
            )}
            <p style={{ color: colors.textSecondary, fontSize: 13, marginTop: 12 }}>+10 XP</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        {/* Steps */}
        <div className="steps">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="step-bar"
              style={{
                background: step >= s ? colors.primary : undefined,
                boxShadow: step >= s ? `0 0 8px ${colors.primary}40` : undefined,
              }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h3 style={{ color: colors.text, margin: 0, fontSize: 22 }}>
              {step === 1 ? '¿Cuánto gastaste?' : step === 2 ? '¿En qué categoría?' : 'Detalles (opcional)'}
            </h3>
            <p style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>
              {step === 1 ? 'Ingresa el monto' : step === 2 ? 'Selecciona una categoría' : 'Agrega más info si quieres'}
            </p>
          </div>
          <button className="btn-ghost" onClick={onClose} style={{ color: colors.textSecondary }}>
            <Icon name="X" size={22} />
          </button>
        </div>

        {/* Step 1: Amount + Payment Method */}
        {step === 1 && (
          <div>
            <div
              style={{
                display: 'flex', alignItems: 'baseline', justifyContent: 'center',
                margin: '28px 0', padding: '20px',
                background: `${colors.primary}06`, borderRadius: 'var(--radius-lg)',
              }}
            >
              <span style={{ fontSize: 32, color: colors.textSecondary, fontWeight: 300, marginRight: 4 }}>$</span>
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

            <p style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 12, textAlign: 'center', fontWeight: 600 }}>
              Método de pago
            </p>
            <div className="pm-row" style={{ justifyContent: 'center' }}>
              {paymentMethods.map((pm) => (
                <button
                  key={pm.id}
                  className={`pm-pill ${paymentMethod === pm.id ? 'selected' : ''}`}
                  style={paymentMethod === pm.id ? { background: colors.primary, color: '#fff', borderColor: 'transparent' } : {}}
                  onClick={() => { setPaymentMethod(pm.id); playPop(); }}
                >
                  <Icon name={pm.icon} size={18} />
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
                onClick={() => { setCategoryId(cat.id); playPop(); }}
              >
                <div
                  className="cat-icon"
                  style={{
                    background: categoryId === cat.id ? cat.color : `${cat.color}18`,
                    boxShadow: categoryId === cat.id ? `0 4px 12px ${cat.color}40` : 'none',
                  }}
                >
                  <Icon name={cat.icon} size={22} color={categoryId === cat.id ? '#fff' : cat.color} />
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
              <label style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary, display: 'block', marginBottom: 6 }}>
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
              <label style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary, display: 'block', marginBottom: 6 }}>
                Fecha
              </label>
              <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary, display: 'block', marginBottom: 6 }}>
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
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                  {tags.map((tag) => (
                    <span key={tag} className="tag" style={{ background: `${colors.primary}12`, color: colors.primary }}>
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
            <div
              className="card"
              style={{
                textAlign: 'center',
                background: `linear-gradient(135deg, ${colors.primary}08, ${colors.accent}08)`,
                border: `2px solid ${colors.primary}15`,
              }}
            >
              <p style={{ fontSize: 12, color: colors.textSecondary, fontWeight: 600, letterSpacing: 0.5 }}>RESUMEN</p>
              <p className="amount-display" style={{ fontSize: 28, fontWeight: 900, color: colors.text, margin: '10px 0', letterSpacing: -1 }}>
                {formatMoney(amountNum)}
              </p>
              {selectedCat && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: selectedCat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={selectedCat.icon} size={13} color="#fff" />
                  </div>
                  <span style={{ fontSize: 14, color: selectedCat.color, fontWeight: 700 }}>{selectedCat.name}</span>
                </div>
              )}
              <p style={{ fontSize: 12, color: colors.textSecondary, marginTop: 6 }}>
                {paymentMethods.find((m) => m.id === paymentMethod)?.name}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
          {step > 1 && (
            <button
              className="btn btn-outline"
              style={{ borderColor: colors.primary, color: colors.primary, flex: 1 }}
              onClick={prevStep}
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
              fontSize: step === 3 ? 16 : 15,
            }}
            disabled={(step === 1 && !canStep1) || (step === 2 && !canStep2)}
            onClick={nextStep}
          >
            {step === 3 ? (
              <>
                <Icon name="Sparkles" size={18} />
                Guardar Gasto
              </>
            ) : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  );
}
