import useStore from '../store/useStore';
import { t, getLevelTitle, badgeDefinitions } from '../theme';
import Icon from './Icon';

export default function Profile() {
  const { section, profile } = useStore();
  const colors = t(section);

  const xpForNext = profile.level * 150;
  let accumulated = 0;
  for (let l = 1; l < profile.level; l++) accumulated += l * 150;
  const xpInLevel = profile.xp - accumulated;
  const levelProgress = xpForNext > 0 ? xpInLevel / xpForNext : 0;
  const xpRemaining = xpForNext - xpInLevel;

  const badges = badgeDefinitions.map((b) => ({
    ...b,
    earned: profile.earnedBadges.includes(b.id),
  }));
  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div>
      <div className="page-header" style={{ textAlign: 'center' }}>
        {/* Avatar */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: colors.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 12px',
        }}>
          <Icon name="User" size={36} color="#fff" />
        </div>

        {profile.displayName && (
          <h2 style={{ color: colors.text }}>{profile.displayName}</h2>
        )}

        <span style={{
          display: 'inline-block', padding: '5px 16px', borderRadius: 999, marginTop: 8,
          background: `${colors.primary}12`, color: colors.primary, fontSize: 13, fontWeight: 600,
        }}>
          {getLevelTitle(profile.level)}
        </span>
      </div>

      <div className="stack">
        {/* Level Progress */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 20, color: colors.text }}>Nivel {profile.level}</p>
              <p style={{ fontSize: 12, color: colors.textSecondary }}>{profile.xp} XP Total</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 12, color: colors.textSecondary }}>Siguiente nivel</p>
              <p style={{ fontWeight: 600, fontSize: 15, color: colors.primary }}>{xpRemaining} XP</p>
            </div>
          </div>
          <div className="progress-track" style={{ height: 10 }}>
            <div
              className="progress-fill"
              style={{ width: `${Math.min(levelProgress * 100, 100)}%`, background: colors.success }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid-3">
          <div className="card" style={{ textAlign: 'center' }}>
            <Icon name="Flame" size={24} color="#F97316" style={{ margin: '0 auto 8px' }} />
            <p style={{ fontWeight: 700, fontSize: 22, color: colors.text }}>{profile.streakDays}</p>
            <p style={{ fontSize: 11, color: colors.textSecondary }}>Racha</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <Icon name="Award" size={24} color={colors.accent} style={{ margin: '0 auto 8px' }} />
            <p style={{ fontWeight: 700, fontSize: 22, color: colors.text }}>{earnedCount}/{badges.length}</p>
            <p style={{ fontSize: 11, color: colors.textSecondary }}>Badges</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <Icon name="Zap" size={24} color={colors.primary} style={{ margin: '0 auto 8px' }} />
            <p style={{ fontWeight: 700, fontSize: 22, color: colors.text }}>{profile.xp}</p>
            <p style={{ fontSize: 11, color: colors.textSecondary }}>XP Total</p>
          </div>
        </div>

        {/* Badges */}
        <div>
          <p style={{ fontWeight: 700, fontSize: 16, color: colors.text, marginBottom: 14 }}>Badges</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 12 }}>
            {badges.map((badge) => (
              <div key={badge.id} className={`badge-card ${badge.earned ? 'earned' : 'locked'}`}>
                <Icon name={badge.icon} size={28} color={badge.earned ? colors.accent : '#D1D5DB'} />
                <span className="badge-name" style={{ color: badge.earned ? colors.text : colors.textSecondary }}>
                  {badge.name}
                </span>
                <span className="badge-desc" style={{ color: colors.textSecondary }}>
                  {badge.earned ? badge.desc : badge.desc}
                </span>
                {badge.earned && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: colors.accent }}>+{badge.xp} XP</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
