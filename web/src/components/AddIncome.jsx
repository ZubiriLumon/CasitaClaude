import { useState, useCallback } from 'react';
import useStore from '../store/useStore';
import { t, formatMoney } from '../theme';
import { playSuccess, playStep, playPop } from '../services/sounds';
import Icon from './Icon';
import Confetti from './Confetti';

export default function AddIncome({ onClose }) {
  const { addIncome, getIncomeCategories, showFeedback } = useStore();
  const colors = t('business');
  const incomeCategories = getIncomeCategories();

  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(null);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [quantity, setQuantity] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [saved, setSaved] = useState(false);

  const amountNum = parseFloat(amount.replace(',', '.')) || 0;
  const selectedCat = incomeCategories.find((c) => c.id === categoryId);
  const quantityNum = parseInt(quantity) || 0;

  const canStep1 = amountNum > 0;
  const canStep2 = categoryId != null;

  function handleSave() {
    if (!canStep1 || !canStep2) return;

    addIncome({
      amount: amountNum,
      description,
      date: new Date(date + 'T12:00:00').toISOString(),
      source: selectedCat?.name || '',
      incomeCategoryId: categoryId,
      quantity: quantityNum || null,
      section: 'business',
    });

    playSuccess();
    setShowConfetti(true);
    setSaved(true);
    showFeedback('Venta registrada +15 XP');
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
              <Icon name="TrendingUp" size={40} color="#fff" />
            </div>
            <h3 className="bounce-in" style={{ color: colors.text, margin: 0, fontSize: 24, fontWeight: 900 }}>
              Venta Registrada
            </h3>
            <p className="amount-display" style={{ fontSize: 32, fontWeight: 900, color: colors.success, margin: '12px 0' }}>
              +{formatMoney(amountNum)}
            </p>
            {selectedCat && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Icon name={selectedCat.icon} size={16} color={selectedCat.color} />
                <span style={{ color: selectedCat.color, fontWeight: 700 }}>{selectedCat.name}</span>
              </div>
            )}
            <p style={{ color: colors.textSecondary, fontSize: 13, marginTop: 12 }}>+15 XP</p>
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
                background: step >= s ? colors.success : undefined,
                boxShadow: step >= s ? `0 0 8px ${colors.success}40` : undefined,
              }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h3 style={{ color: colors.text, margin: 0, fontSize: 22 }}>
              {step === 1 ? '¿Cuánto vendiste?' : step === 2 ? '¿Tipo de venta?' : 'Detalles (opcional)'}
            </h3>
            <p style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>
              {step === 1 ? 'Ingresa el monto de la venta' : step === 2 ? 'Selecciona el tipo de ingreso' : 'Agrega más info si quieres'}
            </p>
          </div>
          <button className="btn-ghost" onClick={onClose} style={{ color: colors.textSecondary }}>
            <Icon name="X" size={22} />
          </button>
        </div>

        {/* Step 1: Amount */}
        {step === 1 && (
          <div>
            <div
              style={{
                display: 'flex', alignItems: 'baseline', justifyContent: 'center',
                margin: '28px 0', padding: '20px',
                background: `${colors.success}08`, borderRadius: 'var(--radius-lg)',
              }}
            >
              <span style={{ fontSize: 32, color: colors.success, fontWeight: 300, marginRight: 4 }}>+$</span>
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
              Cantidad de brownies (opcional)
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <input
                className="input"
                style={{ maxWidth: 160, textAlign: 'center' }}
                placeholder="Ej: 12"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                type="text"
                inputMode="numeric"
              />
            </div>
          </div>
        )}

        {/* Step 2: Income Category */}
        {step === 2 && (
          <div className="cat-grid">
            {incomeCategories.map((cat) => (
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
                placeholder="Ej: 6 brownies de Nutella para pedido de María"
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

            {/* Summary */}
            <div
              className="card"
              style={{
                textAlign: 'center',
                background: `linear-gradient(135deg, ${colors.success}08, ${colors.accent}08)`,
                border: `2px solid ${colors.success}15`,
              }}
            >
              <p style={{ fontSize: 12, color: colors.textSecondary, fontWeight: 600, letterSpacing: 0.5 }}>RESUMEN DE VENTA</p>
              <p className="amount-display" style={{ fontSize: 28, fontWeight: 900, color: colors.success, margin: '10px 0', letterSpacing: -1 }}>
                +{formatMoney(amountNum)}
              </p>
              {selectedCat && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: selectedCat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={selectedCat.icon} size={13} color="#fff" />
                  </div>
                  <span style={{ fontSize: 14, color: selectedCat.color, fontWeight: 700 }}>{selectedCat.name}</span>
                </div>
              )}
              {quantityNum > 0 && (
                <p style={{ fontSize: 13, color: colors.textSecondary, marginTop: 6 }}>
                  {quantityNum} brownie{quantityNum !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
          {step > 1 && (
            <button
              className="btn btn-outline"
              style={{ borderColor: colors.success, color: colors.success, flex: 1 }}
              onClick={prevStep}
            >
              Atrás
            </button>
          )}
          <button
            className="btn btn-primary btn-full"
            style={{
              background: (step === 1 && canStep1) || (step === 2 && canStep2) || step === 3
                ? colors.success
                : '#D1D5DB',
              flex: 2,
              fontSize: step === 3 ? 16 : 15,
            }}
            disabled={(step === 1 && !canStep1) || (step === 2 && !canStep2)}
            onClick={nextStep}
          >
            {step === 3 ? (
              <>
                <Icon name="TrendingUp" size={18} />
                Registrar Venta
              </>
            ) : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  );
}
