import { useState } from 'react'
import useBrownieStore from '../store/useStore'
import { playOrderSound, playSuccessSound, playDeleteSound } from '../services/sounds'
import { ClipboardDoodle, WavyUnderline } from './Doodles'
import { IconPlus, IconCheck, IconCoins, IconClipboard, IconTrash } from './Icons'

function formatMoney(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n)
}

export default function Orders() {
  const orders = useBrownieStore(s => s.orders)
  const addOrder = useBrownieStore(s => s.addOrder)
  const toggleOrderPaid = useBrownieStore(s => s.toggleOrderPaid)
  const markOrderDelivered = useBrownieStore(s => s.markOrderDelivered)
  const deleteOrder = useBrownieStore(s => s.deleteOrder)

  const [showAdd, setShowAdd] = useState(false)
  const [showDelivered, setShowDelivered] = useState(false)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [date, setDate] = useState('')
  const [amount, setAmount] = useState('')
  const [isPaid, setIsPaid] = useState(false)
  const [notes, setNotes] = useState('')

  const pending = orders.filter(o => !o.isDelivered)
  const delivered = orders.filter(o => o.isDelivered)
  const overdue = pending.filter(o => new Date(o.deliveryDate) < new Date())
  const unpaidTotal = pending.filter(o => !o.isPaid).reduce((s, o) => s + (o.totalAmount || 0), 0)

  function handleAdd() {
    if (!name.trim() || !desc.trim()) return
    addOrder({
      customerName: name.trim(),
      orderDescription: desc.trim(),
      deliveryDate: date || new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      totalAmount: parseFloat(amount) || 0,
      isPaid,
      notes: notes.trim(),
    })
    playOrderSound()
    setName(''); setDesc(''); setDate(''); setAmount(''); setIsPaid(false); setNotes('')
    setShowAdd(false)
  }

  function isOverdue(order) {
    return !order.isDelivered && new Date(order.deliveryDate) < new Date()
  }

  return (
    <div className="page flex-col gap-lg animate-in">
      <div className="section-header">
        <div>
          <h1 className="page-title" style={{ marginBottom: 0 }}>Pedidos</h1>
          <WavyUnderline width={110} color="#FFB067" />
        </div>
        <div className="flex items-center gap-sm">
          <div className="doodle-float-delay">
            <ClipboardDoodle size={45} />
          </div>
          <button className="btn btn--primary btn--sm" onClick={() => setShowAdd(true)}><IconPlus size={15} /> Nuevo</button>
        </div>
      </div>

      {/* Summary */}
      <div className="card card--accent">
        <div className="flex justify-between text-center">
          <div className="flex-col items-center" style={{ flex: 1 }}>
            <strong className="text-xl">{pending.length}</strong>
            <span className="text-xs text-secondary">Pendientes</span>
          </div>
          <div className="flex-col items-center" style={{ flex: 1 }}>
            <strong className="text-xl" style={{ color: overdue.length > 0 ? 'var(--danger)' : 'var(--success)' }}>
              {overdue.length}
            </strong>
            <span className="text-xs text-secondary">Atrasados</span>
          </div>
          <div className="flex-col items-center" style={{ flex: 1 }}>
            <strong className="text-lg" style={{ color: 'var(--accent-orange)' }}>{formatMoney(unpaidTotal)}</strong>
            <span className="text-xs text-secondary">Por cobrar</span>
          </div>
        </div>
      </div>

      {/* Pending Orders */}
      <div>
        <strong className="mb-md" style={{ display: 'block' }}>Pedidos Pendientes</strong>
        {pending.length === 0 ? (
          <div className="card card--subtle text-center text-secondary">
            <p className="flex items-center justify-center gap-sm"><IconCheck size={18} /> No hay pedidos pendientes</p>
          </div>
        ) : (
          <div className="flex-col gap-sm">
            {pending.map(order => (
              <div
                key={order.id}
                className={`card ${isOverdue(order) ? 'card--danger' : 'card--sm'}`}
              >
                <div className="flex items-center justify-between mb-md">
                  <strong>{order.customerName}</strong>
                  <span className={`badge ${order.isPaid ? 'badge--success' : 'badge--orange'}`}>
                    {order.isPaid ? '✓ Pagado' : 'Pendiente'}
                  </span>
                </div>
                <p>{order.orderDescription}</p>
                <div className="flex items-center justify-between mt-sm">
                  <span className="text-xs" style={{ color: isOverdue(order) ? 'var(--danger)' : 'var(--text-secondary)' }}>
                    {new Date(order.deliveryDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {isOverdue(order) && ' ¡ATRASADO!'}
                  </span>
                  {order.totalAmount > 0 && <strong className="text-primary">{formatMoney(order.totalAmount)}</strong>}
                </div>
                {order.notes && <p className="text-xs text-secondary mt-sm" style={{ fontStyle: 'italic' }}>{order.notes}</p>}

                <hr style={{ margin: '10px 0', borderColor: '#EFEBE9' }} />
                <div className="flex justify-between">
                  <button
                    className="btn btn--ghost btn--sm"
                    onClick={() => toggleOrderPaid(order.id)}
                  >
                    {order.isPaid ? '↩ Desmarcar pago' : 'Marcar pagado'}
                  </button>
                  <button
                    className="btn btn--success btn--sm"
                    onClick={() => { markOrderDelivered(order.id); playSuccessSound() }}
                  >
                    <IconCheck size={15} /> Entregado
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delivered */}
      <div>
        <button
          onClick={() => setShowDelivered(!showDelivered)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Nunito', fontWeight: 700, color: 'var(--text-secondary)' }}
        >
          Entregados ({delivered.length}) {showDelivered ? '▲' : '▼'}
        </button>
        {showDelivered && (
          <div className="flex-col gap-sm mt-sm">
            {delivered.slice(0, 10).map(order => (
              <div key={order.id} className="card card--subtle" style={{ opacity: 0.7 }}>
                <div className="flex items-center justify-between">
                  <div>
                    <strong>{order.customerName}</strong>
                    <p className="text-xs text-secondary">{order.orderDescription}</p>
                  </div>
                  <button
                    onClick={() => { deleteOrder(order.id); playDeleteSound() }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                  >
                    <IconTrash size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Order Modal */}
      {showAdd && (
        <div className="overlay" onClick={() => setShowAdd(false)}>
          <div className="modal animate-scale" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}><IconClipboard size={20} /> Nuevo Pedido</h3>
            <div className="flex-col gap-md">
              <div>
                <label>Nombre del cliente</label>
                <input className="input" placeholder="María García" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label>Pedido (ej: 6 Triple Chocolate, 4 Oreo)</label>
                <input className="input" placeholder="Descripción del pedido" value={desc} onChange={e => setDesc(e.target.value)} />
              </div>
              <div>
                <label>Monto total ($)</label>
                <input className="input" type="number" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} />
              </div>
              <div>
                <label>Fecha de entrega</label>
                <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div className="flex items-center gap-sm">
                <input type="checkbox" id="isPaid" checked={isPaid} onChange={e => setIsPaid(e.target.checked)} />
                <label htmlFor="isPaid" style={{ marginBottom: 0 }}>Ya está pagado</label>
              </div>
              <div>
                <label>Notas (opcional)</label>
                <input className="input" placeholder="Notas adicionales" value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
              <div className="flex gap-sm">
                <button className="btn btn--ghost btn--block" onClick={() => setShowAdd(false)}>Cancelar</button>
                <button className="btn btn--primary btn--block" onClick={handleAdd} disabled={!name.trim() || !desc.trim()}>Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
