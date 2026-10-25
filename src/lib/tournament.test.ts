* {
  box-sizing: border-box;
}

:root {
  font-family: Inter, 'Segoe UI', sans-serif;
  color: #e5edf8;
  background: #0b1020;
  line-height: 1.5;
  font-weight: 500;
}

body {
  margin: 0;
  background: linear-gradient(180deg, #0b1020 0%, #111b2e 100%);
}

button,
input {
  font: inherit;
}

button {
  border: none;
  border-radius: 0.8rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

button.primary {
  background: #4f8cff;
  color: white;
}

button.secondary {
  background: #1d2c46;
  color: #edf3ff;
}

button.ghost {
  background: transparent;
  color: #9ab0d2;
  border: 1px solid #2e446d;
}

button.warning {
  background: #d9465f;
  color: white;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.app-shell {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
}

.large-display {
  font-size: 1.1rem;
}

.topbar,
.tabs,
.title-row,
.action-row,
.round-header,
.preview-banner,
.preview-actions,
.header-actions,
.player-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.topbar {
  margin-bottom: 1.5rem;
}

.eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #8fb2ff;
  font-size: 0.7rem;
}

h1, h2, h3, p {
  margin-top: 0;
}

h1 {
  margin-bottom: 0;
  font-size: 2.2rem;
}

.tabs {
  justify-content: flex-start;
  margin-bottom: 1.5rem;
  background: rgba(17, 24, 39, 0.85);
  padding: 0.7rem;
  border-radius: 1rem;
  border: 1px solid rgba(128, 160, 255, 0.2);
}

.tabs button {
  background: transparent;
  color: #dfe9ff;
}

.tabs button.active {
  background: #223d6b;
}

.panel {
  background: rgba(14, 20, 30, 0.9);
  border: 1px solid rgba(128, 160, 255, 0.2);
  border-radius: 1.2rem;
  padding: 1.5rem;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.25);
}

.setup-section {
  display: grid;
  gap: 1.2rem;
}

.player-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(300px, 1fr));
  gap: 0.75rem;
}

.player-row {
  background: rgba(22, 31, 46, 0.9);
  padding: 0.75rem;
  border-radius: 0.8rem;
  border: 1px solid rgba(128, 160, 255, 0.15);
}

.player-label {
  min-width: 110px;
}

.player-row input {
  flex: 1;
  background: #0d1528;
  border: 1px solid #334d7a;
  color: white;
  padding: 0.7rem 0.8rem;
  border-radius: 0.7rem;
}

.info-box {
  padding: 1rem 1.2rem;
  background: rgba(70, 94, 144, 0.22);
  border: 1px solid rgba(137, 171, 255, 0.35);
  border-radius: 0.9rem;
}

.court-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(280px, 1fr));
  gap: 1rem;
}

.court-card {
  background: rgba(18, 27, 39, 0.95);
  border-radius: 1rem;
  border: 1px solid rgba(159, 180, 255, 0.15);
  padding: 1rem;
}

.team-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-top: 0.5rem;
  font-weight: 600;
}

.versus {
  text-align: center;
  margin: 0.75rem 0;
  color: #8fb2ff;
}

.score-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-top: 1rem;
}

.score-row input {
  width: 100%;
  background: #0d1528;
  color: white;
  border: 1px solid #334d7a;
  padding: 0.7rem 0.8rem;
  border-radius: 0.7rem;
}

.submit-area {
  margin-top: 1.5rem;
}

.bye-box {
  margin-bottom: 1rem;
  background: rgba(137, 95, 48, 0.18);
  border: 1px solid rgba(226, 171, 65, 0.35);
  border-radius: 0.9rem;
  padding: 0.85rem 1rem;
}

.bye-list {
  color: #ebd299;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th, td {
  border-bottom: 1px solid rgba(154, 173, 214, 0.12);
  padding: 0.7rem 0.6rem;
  text-align: left;
}

.top-three {
  background: rgba(240, 184, 67, 0.12);
}

.history-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.history-card,
.preview-banner {
  background: rgba(17, 25, 35, 0.85);
  border: 1px solid rgba(128, 160, 255, 0.2);
  border-radius: 1rem;
  padding: 1rem;
}

.preview-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.preview-actions {
  display: flex;
  gap: 0.75rem;
}

.history-match {
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
  border-top: 1px solid rgba(154, 173, 214, 0.12);
  padding-top: 0.5rem;
  margin-top: 0.5rem;
}

@media (max-width: 980px) {
  .player-grid,
  .court-grid {
    grid-template-columns: 1fr;
  }
}
