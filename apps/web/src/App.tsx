import { Link, Route, Routes } from 'react-router-dom';

import { APP_NAME, GOAL_TYPES, SLOGAN } from '@onward/contracts';
import { colors, radii, spacing, typography } from '@onward/design-tokens';
import { calculateCompletionRate } from '@onward/domain';

const sampleCompletionRate = Math.round(calculateCompletionRate(5, 7) * 100);

function HomeScreen() {
  return (
    <section className="card">
      <span className="eyebrow">Milestone 0</span>
      <h1>{APP_NAME}</h1>
      <p>{SLOGAN}</p>
      <p>
        Vite 기반 서비스 웹의 기본 골격이 준비되었습니다. 다음 단계에서는
        인증, Goal, Record, Insights 흐름을 이 위에 쌓습니다.
      </p>
      <div className="stats">
        <div>
          <strong>{sampleCompletionRate}%</strong>
          <span>sample completion</span>
        </div>
        <div>
          <strong>{GOAL_TYPES.length}</strong>
          <span>goal types</span>
        </div>
      </div>
    </section>
  );
}

function SettingsScreen() {
  return (
    <section className="card">
      <span className="eyebrow">Workspace</span>
      <h2>Shared foundations are connected</h2>
      <ul className="list">
        <li>contracts: shared product enums and copy</li>
        <li>domain: reusable product logic</li>
        <li>design-tokens: base visual tokens</li>
      </ul>
    </section>
  );
}

export default function App() {
  return (
    <main
      className="app-shell"
      style={{
        ['--color-background' as string]: colors.background,
        ['--color-panel' as string]: colors.panel,
        ['--color-text' as string]: colors.text,
        ['--color-muted' as string]: colors.textMuted,
        ['--color-accent' as string]: colors.accent,
        ['--space-lg' as string]: `${spacing.lg}px`,
        ['--space-xl' as string]: `${spacing.xl}px`,
        ['--radius-lg' as string]: `${radii.lg}px`,
        ['--title-size' as string]: `${typography.title}px`,
      }}
    >
      <header className="topbar">
        <div>
          <span className="brand-mark" />
          <span className="brand-name">{APP_NAME}</span>
        </div>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/settings">Settings</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
      </Routes>
    </main>
  );
}
