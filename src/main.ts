import './styles.css';
import { estimate } from './calculator';
import { exportSessions, importSessions } from './csv';
import { deleteState, loadState, saveState } from './storage';
import type { Difficulty, PlannerState, StudySession } from './types';

const appRoot = document.querySelector<HTMLDivElement>('#app');
if (!appRoot) throw new Error('App mount was not found.');
const root: HTMLDivElement = appRoot;

const defaultState: PlannerState = {
  version: 1,
  updatedAt: Date.now(),
  settings: { budgetMinutes: 20, dueReviews: 45, reviewSeconds: 9, difficulty: 'mixed', newCardSeconds: null },
  sessions: [],
};

const sampleState: PlannerState = {
  version: 1,
  updatedAt: Date.now(),
  settings: { budgetMinutes: 25, dueReviews: 55, reviewSeconds: 10, difficulty: 'mixed', newCardSeconds: null },
  sessions: [
    { id: 'sample-2026-09-05', date: '2026-09-05', totalMinutes: 23, reviewedCards: 50, newCards: 8, difficulty: 'easy', createdAt: Date.UTC(2026, 8, 5, 12) },
    { id: 'sample-2026-09-03', date: '2026-09-03', totalMinutes: 26, reviewedCards: 60, newCards: 6, difficulty: 'hard', createdAt: Date.UTC(2026, 8, 3, 12) },
    { id: 'sample-2026-09-02', date: '2026-09-02', totalMinutes: 24, reviewedCards: 55, newCards: 7, difficulty: 'mixed', createdAt: Date.UTC(2026, 8, 2, 12) },
  ],
};

const normalizedPath = location.pathname.replace(/\/$/, '');
const isDemo = normalizedPath === '/demo' || normalizedPath === '/demo/index.html';
let state: PlannerState = structuredClone(isDemo ? sampleState : defaultState);
let saveTimer = 0;
let refreshForUpdate = false;

function connectionLabel(): string {
  return !navigator.onLine || sessionStorage.getItem('time-budget-offline') === 'true'
    ? 'Offline — still working'
    : 'Online';
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function siteHeader(showConnection = false): string {
  return `
    <header class="site-header">
      <a class="brand" href="/" aria-label="Time Budget New Cards home"><span class="brand-mark" aria-hidden="true">● ◼ ●</span><span>Time Budget Cards</span></a>
      <nav aria-label="Main navigation"><a href="/#planner">Planner</a><a href="/demo/">Demo</a><a href="/privacy/">Privacy</a></nav>
      ${showConnection ? `<span class="connection" id="connection" role="status" aria-live="polite"><span aria-hidden="true">●</span> <span>${connectionLabel()}</span></span>` : '<span aria-hidden="true"></span>'}
    </header>`;
}

function siteFooter(): string {
  return `
    <footer class="site-footer">
      <div><strong>Time Budget New Cards</strong><p>Choose a new-card limit from your study time and session history.</p></div>
      <nav aria-label="Footer navigation"><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="https://github.com/B-Divyesh/sf-time-budget-new-cards" target="_blank" rel="noopener">Source code (opens GitHub)</a></nav>
      <p class="footer-meta">Built by Param Factory · Version 1.1.0</p>
      <p class="generated-note">The study desk artwork was generated for this product with Azure AI.</p>
    </footer>`;
}

function demoBanner(): string {
  if (!isDemo) return '';
  return `
    <aside class="demo-banner" aria-label="Demo status">
      <strong>Demo — sample data, nothing is saved</strong>
      <span>Changes stay in this tab and never touch your real planner.</span>
      <div><button class="button small" id="reset-demo" type="button">Reset demo</button><a class="button small" href="/">Start for real</a></div>
    </aside>`;
}

async function persistState(): Promise<void> {
  if (isDemo) return;
  await saveState(state);
}

function queueSave(): void {
  window.clearTimeout(saveTimer);
  state.updatedAt = Date.now();
  if (isDemo) {
    setMessage('Demo change applied for this tab. Nothing was saved.', 'quiet');
    return;
  }
  saveTimer = window.setTimeout(async () => {
    try {
      await persistState();
      setMessage('Saved in this browser.', 'quiet');
    } catch {
      setMessage('Could not save locally. Export a backup before closing.', 'error');
    }
  }, 180);
}

function setMessage(message: string, tone: 'quiet' | 'error' = 'quiet'): void {
  const element = document.querySelector<HTMLElement>('#app-message');
  if (!element) return;
  element.textContent = message;
  element.dataset.tone = tone;
}

function setImportMessage(message: string, tone: 'quiet' | 'error' = 'quiet'): void {
  const element = document.querySelector<HTMLElement>('#import-message');
  if (!element) return;
  element.textContent = message;
  element.dataset.tone = tone;
}

function legalPage(kind: 'privacy' | 'terms'): void {
  const privacy = kind === 'privacy';
  document.title = `${privacy ? 'Privacy' : 'Terms'} — Time Budget New Cards`;
  root.innerHTML = `
    ${siteHeader()}
    <main id="main" class="legal-shell">
      <h1 tabindex="-1">${privacy ? 'How your study data is handled' : 'Terms for using this planner'}</h1>
      ${privacy ? `
        <p><strong>Effective 6 September 2026.</strong> Time Budget New Cards works without an account.</p>
        <h2>Data stored in your browser</h2><p>Your settings, study history, and imports stay in IndexedDB in this browser. The app does not send entered data anywhere.</p>
        <h2>Site requests and hosting logs</h2><p>The app uses no analytics, ads, tracking pixels, third-party scripts, or remote fonts. It only requests files from this product site.</p><p>The browser app keeps no request log. Static hosting controls any security-log retention. Email <a href="mailto:privacy@sociobot.in">privacy@sociobot.in</a> to ask about current retention or request access or deletion.</p>
        <h2>Your controls</h2><p>Export CSV or JSON from the planner at any time. “Erase local data” deletes your settings and study history from this browser.</p>
        <h2>Offline files</h2><p>The service worker stores app files for offline use. Your study records remain separate in IndexedDB.</p>
      ` : `
        <p><strong>Effective 6 September 2026.</strong> This free tool estimates a new-card limit from the information you provide. It is offered as-is, without warranties.</p>
        <h2>Planning estimate</h2><p>The recommendation is not a promise of learning outcomes. Difficulty and interruptions vary.</p><p>Check the shown range, correct your inputs, and use your own judgment.</p>
        <h2>Your data</h2><p>You own imported and recorded data. The app stores it in your browser and requires no account.</p>
        <h2>Acceptable use</h2><p>Use the tool lawfully. Do not disrupt the hosted service.</p><p>The app is MIT-licensed. The license governs reuse of its source code.</p>
      `}
      <p><a class="text-link" href="/">Return to the planner</a></p>
    </main>
    ${siteFooter()}`;
}

function notFoundPage(): void {
  document.title = 'Page not found — Time Budget New Cards';
  root.innerHTML = `
    ${siteHeader()}
    <main id="main" class="not-found-shell">
      <p class="error-code">404</p>
      <h1 tabindex="-1">This page was not found</h1>
      <p>The address may be wrong, or the page may have moved.</p>
      <a class="button primary" href="/">Open the planner</a>
    </main>
    ${siteFooter()}`;
}

function difficultyOptions(selected: Difficulty, name: string): string {
  const labels: Record<Difficulty, string> = { easy: 'Easy or familiar', mixed: 'Mixed', hard: 'Hard or abstract' };
  return (Object.keys(labels) as Difficulty[]).map((value) => `
    <label class="difficulty-pill">
      <input type="radio" name="${name}" value="${value}" ${selected === value ? 'checked' : ''} />
      <span>${labels[value]}</span>
    </label>`).join('');
}

function renderPlanner(): void {
  document.title = isDemo ? 'Demo — Time Budget New Cards' : 'Time Budget New Cards — Plan a daily card limit';
  root.innerHTML = `
    ${siteHeader(true)}
    ${demoBanner()}
    <main id="main">
      <section class="hero" id="top" aria-labelledby="page-title">
        <div class="hero-copy">
          <p class="kicker">Plan by minutes, not card count</p>
          <h1 id="page-title" tabindex="-1">Choose how many new cards fit today</h1>
          <p class="lede">For Anki and CSV flashcard learners who need a safe new-card limit within today’s study time.</p>
          <div class="hero-actions">
            ${isDemo
              ? '<a class="button primary" href="#planner">View the sample result</a>'
              : '<a class="button primary" href="/demo/?sample=1">Try it with sample data</a><a class="text-link real-start" href="#planner">Plan with my data</a>'}
          </div>
          <p class="action-note">${isDemo ? 'Three sample sessions are loaded below.' : 'Loads three sample sessions and a result.'}</p>
          <ul class="trust-strip" aria-label="Product facts"><li>Study data stays here</li><li>Works offline after one visit</li><li>Free to use</li></ul>
        </div>
        <figure class="hero-art">
          <picture>
            <source srcset="/art/study-tape.avif" type="image/avif" />
            <source srcset="/art/study-tape.webp" type="image/webp" />
            <img src="/art/study-tape.png" width="768" height="512" fetchpriority="high" decoding="async" alt="A collage of a study timer and blank flashcards on a desk." />
          </picture>
          <figcaption>Reviews use part of the budget. New cards use what remains.</figcaption>
        </figure>
      </section>

      <section class="planner-section" id="planner" aria-labelledby="planner-title">
        <div class="section-heading">
          <p class="kicker">Plan today’s session</p><h2 id="planner-title">Enter your time and due reviews</h2>
        </div>
        <div class="planner-grid">
          <form id="settings-form" class="settings-panel" novalidate>
            <fieldset><legend><span>01</span> Time budget</legend>
              <label for="budget">Minutes available today</label>
              <div class="input-with-unit"><input id="budget" name="budgetMinutes" type="number" inputmode="decimal" min="1" max="360" step="1" value="${state.settings.budgetMinutes}" required aria-describedby="budget-error" /><span>min</span></div>
              <p class="field-error" id="budget-error" aria-live="polite"></p>
            </fieldset>
            <fieldset><legend><span>02</span> Reviews already due</legend>
              <div class="split-fields">
                <div><label for="due">Due cards</label><input id="due" name="dueReviews" type="number" inputmode="numeric" min="0" max="9999" step="1" value="${state.settings.dueReviews}" required aria-describedby="due-error" /><p class="field-error" id="due-error" aria-live="polite"></p></div>
                <div><label for="review-seconds">Average review</label><div class="input-with-unit"><input id="review-seconds" name="reviewSeconds" type="number" inputmode="decimal" min="1" max="300" step="0.5" value="${state.settings.reviewSeconds}" required aria-describedby="review-note review-seconds-error" /><span>sec</span></div><p class="field-error" id="review-seconds-error" aria-live="polite"></p></div>
              </div>
              <p class="field-note" id="review-note">In Anki, open Stats then Answer buttons. Use the average active answer time.</p>
            </fieldset>
            <fieldset><legend><span>03</span> New material</legend>
              <span class="label-like" id="difficulty-label">How difficult are today’s cards?</span>
              <div class="difficulty-group" role="radiogroup" aria-labelledby="difficulty-label">${difficultyOptions(state.settings.difficulty, 'difficulty')}</div>
              <label class="override-label" for="new-card-seconds">Set today’s new-card pace <span>(optional)</span></label>
              <div class="input-with-unit"><input id="new-card-seconds" name="newCardSeconds" type="number" inputmode="decimal" min="8" max="600" step="1" value="${state.settings.newCardSeconds ?? ''}" aria-describedby="new-card-note new-card-seconds-error" /><span>sec</span></div>
              <p class="field-error" id="new-card-seconds-error" aria-live="polite"></p>
              <p class="field-note" id="new-card-note">Use this for an unusual deck. Clear it to use the estimate from your history.</p>
            </fieldset>
          </form>
          <aside class="result-panel" aria-labelledby="result-title" aria-live="polite">
            <p id="result-warning" class="result-warning" role="status" hidden></p>
            <div id="recommendation"></div>
            <a class="button inverted" href="#log-session">Record the session later</a>
          </aside>
        </div>
        <p id="app-message" class="app-message" role="status" aria-live="polite">${isDemo ? 'Sample data is active. Nothing is saved.' : 'Changes save in this browser.'}</p>
      </section>

      <section class="log-section" id="log-session" aria-labelledby="log-title">
        <div class="section-heading"><p class="kicker">Improve the estimate</p><h2 id="log-title">Record what happened</h2><p>After a session, record the minutes and cards. Two useful logs replace the starter estimate with your evidence.</p></div>
        <form id="log-form" class="log-form" novalidate>
          <div><label for="log-date">Date</label><input id="log-date" name="date" type="date" value="${today()}" required aria-describedby="log-date-error" /><p class="field-error" id="log-date-error" aria-live="polite"></p></div>
          <div><label for="log-minutes">Total minutes</label><input id="log-minutes" name="totalMinutes" type="number" min="0.1" max="600" step="0.1" required aria-describedby="log-minutes-error" /><p class="field-error" id="log-minutes-error" aria-live="polite"></p></div>
          <div><label for="log-reviews">Reviews completed</label><input id="log-reviews" name="reviewedCards" type="number" min="0" max="9999" step="1" value="${state.settings.dueReviews}" required aria-describedby="log-reviews-error" /><p class="field-error" id="log-reviews-error" aria-live="polite"></p></div>
          <div><label for="log-new">New cards completed</label><input id="log-new" name="newCards" type="number" min="0" max="9999" step="1" value="${estimate(state.settings, state.sessions).cap}" required aria-describedby="log-new-error" /><p class="field-error" id="log-new-error" aria-live="polite"></p></div>
          <fieldset class="log-difficulty"><legend>Difficulty</legend><div class="difficulty-group">${difficultyOptions(state.settings.difficulty, 'logDifficulty')}</div></fieldset>
          <button class="button primary" type="submit">Add session</button>
        </form>
      </section>

      <section class="history-section" id="history" aria-labelledby="history-title">
        <div class="section-heading with-actions"><div><p class="kicker">Stored in this browser</p><h2 id="history-title">Your recent sessions</h2></div><div class="utility-actions"><button class="button small" id="export-csv" type="button">Export CSV</button><button class="button small" id="export-json" type="button">Back up JSON</button></div></div>
        <div id="history-content"></div>
        <div class="import-panel">
          <div><h3>Import session history</h3><p>Use this app’s CSV or Anki-style review rows. The file stays in this browser.</p></div>
          <div class="import-actions"><a class="text-link touch-link" id="template-link" download="time-budget-template.csv">Download CSV template</a><label class="button small file-button">Import CSV or JSON<input id="import-file" type="file" accept=".csv,.json,text/csv,application/json" /></label></div>
        </div>
        <p id="import-message" class="app-message" role="status" aria-live="polite"></p>
        ${isDemo ? '' : '<button class="danger-link" id="erase-data" type="button">Erase local data…</button>'}
      </section>

      <section class="method-section" id="method" aria-labelledby="method-title">
        <div><p class="kicker">How it works</p><h2 id="method-title">How the recommendation is calculated</h2></div>
        <ol class="method-list">
          <li><span>1</span><div><h3>Reserve review time</h3><p>Due reviews multiply by your average seconds per review. That time leaves today’s budget first.</p></div></li>
          <li><span>2</span><div><h3>Estimate new-card time</h3><p>Session logs show the time left after reviews. The estimate adjusts that time for difficulty.</p></div></li>
          <li><span>3</span><div><h3>Use the cautious end</h3><p>The recommendation uses the slower estimate. It keeps the wider likely range visible.</p></div></li>
        </ol>
        <p class="method-note">This estimate uses the inputs and session history you provide. Interruptions and unfamiliar material can change the result.</p>
      </section>

      <section class="limits-section" id="limits" aria-labelledby="limits-title">
        <div><p class="kicker">Privacy and limits</p><h2 id="limits-title">What this planner does not do</h2></div>
        <ul class="limits-list">
          <li><strong>It does not connect to or change Anki or FSRS.</strong> You choose what to enter or import.</li>
          <li><strong>It does not promise recall or assess health.</strong> Use the result only to plan session time.</li>
          <li><strong>It does not send entered study data off this site.</strong> Read the <a href="/privacy/">privacy policy</a> for storage details.</li>
        </ul>
      </section>
    </main>
    ${siteFooter()}
    ${isDemo ? '' : '<dialog id="erase-dialog" aria-labelledby="erase-title"><form method="dialog"><h2 id="erase-title">Erase your local planner data?</h2><p>This deletes settings and history from this browser. Export a backup first if you may need it.</p><div class="dialog-actions"><button class="button small" value="cancel">Keep my data</button><button class="button danger" id="confirm-erase" value="erase">Erase local data</button></div></form></dialog>'}
    <div id="update-toast" class="update-toast" role="status" aria-live="polite" hidden><span>An app update is ready.</span><button type="button">Update app</button></div>`;

  renderRecommendation();
  renderHistory();
  bindPlanner();
}

function renderRecommendation(): void {
  const target = document.querySelector<HTMLElement>('#recommendation');
  if (!target) return;
  const result = estimate(state.settings, state.sessions);
  const confidenceLabel = { starter: 'Starter estimate', learning: 'Learning from your history', personal: 'Personal estimate', manual: 'Manual correction' }[result.confidence];
  const fill = Math.min(100, (result.expectedMinutes / state.settings.budgetMinutes) * 100);
  target.innerHTML = `
    <p class="result-label" id="result-title">Today’s safe new-card limit</p>
    <div class="cap-line"><strong>${result.cap}</strong><span>new<br />cards</span></div>
    <p class="range">Likely range: <strong>${result.rangeLow}–${result.rangeHigh}</strong> cards <span class="confidence">${confidenceLabel}</span></p>
    <div class="tape-meter" role="img" aria-label="Expected session ${result.expectedMinutes.toFixed(1)} of ${state.settings.budgetMinutes} minutes"><span style="width:${fill}%"></span></div>
    <div class="time-readout"><span>Expected time</span><strong>${result.expectedMinutes.toFixed(1)} / ${state.settings.budgetMinutes} min</strong></div>
    <p class="result-reason">${result.reason}</p>
    <details class="estimate-details"><summary>Check the assumptions</summary><p>Each new card is estimated at ${Math.round(result.secondsPerNew)} seconds, with ±${Math.round(result.uncertaintySeconds)} seconds of variation.</p><p>The estimate uses ${result.sampleCount} useful ${result.sampleCount === 1 ? 'session' : 'sessions'}. Logs with unlikely new-card times are ignored.</p></details>`;
  const logNew = document.querySelector<HTMLInputElement>('#log-new');
  if (logNew && document.activeElement !== logNew) logNew.value = String(result.cap);
}

function renderHistory(): void {
  const target = document.querySelector<HTMLElement>('#history-content');
  if (!target) return;
  if (!state.sessions.length) {
    target.innerHTML = `<div class="empty-state"><span class="empty-reels" aria-hidden="true">◉ ─ ◉</span><h3>No sessions recorded yet</h3><p>Use the starter estimate, then record the real session. After two useful logs, the estimate uses your history.</p><a class="text-link touch-link" href="#log-session">Record the first session</a></div>`;
    return;
  }
  const sessions = [...state.sessions].sort((a, b) => b.createdAt - a.createdAt).slice(0, 30);
  target.innerHTML = `<div class="table-wrap"><table><caption class="sr-only">Recent study sessions</caption><thead><tr><th>Date</th><th>Minutes</th><th>Reviews</th><th>New</th><th>Difficulty</th><th><span class="sr-only">Actions</span></th></tr></thead><tbody>${sessions.map((session) => `<tr><td>${session.date}</td><td>${session.totalMinutes}</td><td>${session.reviewedCards}</td><td>${session.newCards}</td><td>${session.difficulty}</td><td><button class="row-delete" data-delete="${session.id}" type="button" aria-label="Delete session from ${session.date}">Delete</button></td></tr>`).join('')}</tbody></table></div>`;
}

function normalizedImportedState(value: unknown): PlannerState {
  if (!value || typeof value !== 'object') throw new Error('This is not a Time Budget New Cards JSON backup.');
  const candidate = value as Partial<PlannerState>;
  if (candidate.version !== 1 || !candidate.settings || !Array.isArray(candidate.sessions)) throw new Error('This is not a Time Budget New Cards JSON backup.');
  const difficulty = candidate.settings.difficulty;
  if (!['easy', 'mixed', 'hard'].includes(difficulty)) throw new Error('The backup has an unknown difficulty value.');
  const bounded = (input: unknown, min: number, max: number, label: string): number => {
    const number = Number(input);
    if (!Number.isFinite(number) || number < min || number > max) throw new Error(`The backup has an invalid ${label}.`);
    return number;
  };
  if (candidate.sessions.length > 10_000) throw new Error('This backup is too large to import safely.');
  const sessions = candidate.sessions.map((raw, index): StudySession => {
    if (!raw || typeof raw !== 'object') throw new Error(`Session ${index + 1} is invalid.`);
    const session = raw as Partial<StudySession>;
    if (!session.date || !/^\d{4}-\d{2}-\d{2}$/.test(session.date) || !['easy', 'mixed', 'hard'].includes(session.difficulty || '')) {
      throw new Error(`Session ${index + 1} has an invalid date or difficulty.`);
    }
    return {
      id: crypto.randomUUID(),
      date: session.date,
      totalMinutes: bounded(session.totalMinutes, 0.1, 600, `total minutes in session ${index + 1}`),
      reviewedCards: Math.floor(bounded(session.reviewedCards, 0, 9999, `review count in session ${index + 1}`)),
      newCards: Math.floor(bounded(session.newCards, 0, 9999, `new-card count in session ${index + 1}`)),
      difficulty: session.difficulty as Difficulty,
      createdAt: bounded(session.createdAt || Date.now() - index, 0, Number.MAX_SAFE_INTEGER, `timestamp in session ${index + 1}`),
    };
  });
  const override = candidate.settings.newCardSeconds;
  return {
    version: 1,
    updatedAt: Date.now(),
    settings: {
      budgetMinutes: bounded(candidate.settings.budgetMinutes, 1, 360, 'time budget'),
      dueReviews: Math.floor(bounded(candidate.settings.dueReviews, 0, 9999, 'due-review count')),
      reviewSeconds: bounded(candidate.settings.reviewSeconds, 1, 300, 'average review time'),
      difficulty,
      newCardSeconds: override === null || override === undefined ? null : bounded(override, 8, 600, 'new-card pace'),
    },
    sessions,
  };
}

function download(name: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

const plannerRanges: Record<string, { label: string; min: string; max: string }> = {
  budget: { label: 'Minutes available today', min: '1', max: '360' },
  due: { label: 'Due cards', min: '0', max: '9,999' },
  'review-seconds': { label: 'Average review', min: '1', max: '300' },
  'new-card-seconds': { label: 'New-card pace', min: '8', max: '600' },
};

const logRanges: Record<string, { empty: string; range?: string }> = {
  'log-date': { empty: 'Choose a session date.' },
  'log-minutes': { empty: 'Enter the total session minutes.', range: 'Total minutes must be between 0.1 and 600.' },
  'log-reviews': { empty: 'Enter the completed review count.', range: 'Reviews completed must be between 0 and 9,999.' },
  'log-new': { empty: 'Enter the completed new-card count.', range: 'New cards completed must be between 0 and 9,999.' },
};

function validatePlanner(form: HTMLFormElement): boolean {
  let valid = true;
  Object.entries(plannerRanges).forEach(([id, range]) => {
    const input = form.querySelector<HTMLInputElement>(`#${id}`);
    const error = document.querySelector<HTMLElement>(`#${id}-error`);
    if (!input || !error) return;
    const optionalEmpty = !input.required && input.value.trim() === '';
    if (!optionalEmpty && !input.validity.valid) {
      valid = false;
      input.setAttribute('aria-invalid', 'true');
      error.textContent = `${range.label} must be between ${range.min} and ${range.max}. The result still uses your last valid value.`;
    } else {
      input.removeAttribute('aria-invalid');
      error.textContent = '';
    }
  });
  const warning = document.querySelector<HTMLElement>('#result-warning');
  if (warning) {
    warning.hidden = valid;
    warning.textContent = valid ? '' : 'Result not updated. Fix the highlighted value.';
  }
  return valid;
}

function validateLog(form: HTMLFormElement, focusFirst = false): boolean {
  let firstInvalid: HTMLInputElement | undefined;
  Object.entries(logRanges).forEach(([id, messages]) => {
    const input = form.querySelector<HTMLInputElement>(`#${id}`);
    const error = document.querySelector<HTMLElement>(`#${id}-error`);
    if (!input || !error) return;
    const invalid = !input.validity.valid;
    if (invalid && !firstInvalid) firstInvalid = input;
    if (invalid) {
      input.setAttribute('aria-invalid', 'true');
      error.textContent = input.validity.valueMissing ? messages.empty : messages.range || messages.empty;
    } else {
      input.removeAttribute('aria-invalid');
      error.textContent = '';
    }
  });
  if (focusFirst) firstInvalid?.focus();
  return !firstInvalid;
}

function bindPlanner(): void {
  document.querySelector<HTMLFormElement>('#settings-form')?.addEventListener('input', (event) => {
    const form = event.currentTarget as HTMLFormElement;
    if (!validatePlanner(form)) {
      setMessage('A planner value is invalid. The result still uses your last valid settings.', 'error');
      return;
    }
    const data = new FormData(form);
    const newCardSeconds = String(data.get('newCardSeconds') || '').trim();
    state.settings = {
      budgetMinutes: Number(data.get('budgetMinutes')),
      dueReviews: Number(data.get('dueReviews')),
      reviewSeconds: Number(data.get('reviewSeconds')),
      difficulty: data.get('difficulty') as Difficulty,
      newCardSeconds: newCardSeconds ? Number(newCardSeconds) : null,
    };
    renderRecommendation();
    queueSave();
  });

  document.querySelector<HTMLFormElement>('#log-form')?.addEventListener('input', (event) => {
    validateLog(event.currentTarget as HTMLFormElement);
  });

  document.querySelector<HTMLFormElement>('#log-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    if (!validateLog(form, true)) {
      setMessage('Session not added. Fix the highlighted value.', 'error');
      return;
    }
    const data = new FormData(form);
    const session: StudySession = {
      id: crypto.randomUUID(),
      date: String(data.get('date')),
      totalMinutes: Number(data.get('totalMinutes')),
      reviewedCards: Number(data.get('reviewedCards')),
      newCards: Number(data.get('newCards')),
      difficulty: data.get('logDifficulty') as Difficulty,
      createdAt: Date.now(),
    };
    state.sessions.unshift(session);
    window.clearTimeout(saveTimer);
    try {
      await persistState();
    } catch {
      setMessage('Session added for now, but local storage failed. Export a backup.', 'error');
    }
    renderHistory();
    renderRecommendation();
    form.reset();
    const dateInput = form.elements.namedItem('date') as HTMLInputElement;
    dateInput.value = today();
    setMessage(isDemo ? 'Sample session added for this tab. Nothing was saved.' : 'Session added. The estimate now includes it.');
    document.querySelector('#history-title')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });

  document.querySelector('#history-content')?.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-delete]');
    if (!button) return;
    const session = state.sessions.find((candidate) => candidate.id === button.dataset.delete);
    if (!session || !window.confirm(`Delete the ${session.date} session? This cannot be undone.`)) return;
    state.sessions = state.sessions.filter((candidate) => candidate.id !== button.dataset.delete);
    renderHistory();
    renderRecommendation();
    queueSave();
    setMessage(isDemo ? 'Sample session removed for this tab.' : 'Session removed.');
  });

  document.querySelector('#export-csv')?.addEventListener('click', () => download(`time-budget-${today()}.csv`, exportSessions(state.sessions), 'text/csv'));
  document.querySelector('#export-json')?.addEventListener('click', () => download(`time-budget-backup-${today()}.json`, JSON.stringify(state, null, 2), 'application/json'));
  const template = document.querySelector<HTMLAnchorElement>('#template-link');
  if (template) template.href = `data:text/csv;charset=utf-8,${encodeURIComponent('date,total_minutes,reviewed_cards,new_cards,difficulty\n2026-09-05,23,50,8,easy')}`;

  document.querySelector<HTMLInputElement>('#import-file')?.addEventListener('change', async (event) => {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      if (file.name.toLowerCase().endsWith('.json')) {
        let parsed: unknown;
        try {
          parsed = JSON.parse(text) as unknown;
        } catch {
          throw new Error('This JSON file could not be read. Export it again and retry.');
        }
        state = normalizedImportedState(parsed);
      } else {
        const imported = importSessions(text);
        const ids = new Set(state.sessions.map((session) => `${session.date}|${session.totalMinutes}|${session.reviewedCards}|${session.newCards}`));
        state.sessions = [...imported.filter((session) => !ids.has(`${session.date}|${session.totalMinutes}|${session.reviewedCards}|${session.newCards}`)), ...state.sessions];
      }
      await persistState();
      renderPlanner();
      setImportMessage(`Import complete. History now has ${state.sessions.length} ${state.sessions.length === 1 ? 'session' : 'sessions'}.`);
    } catch (error) {
      setImportMessage(error instanceof Error ? error.message : 'The file could not be imported.', 'error');
      input.value = '';
    }
  });

  document.querySelector('#reset-demo')?.addEventListener('click', () => {
    state = structuredClone(sampleState);
    renderPlanner();
    document.querySelector('#planner')?.scrollIntoView();
    setMessage('Demo reset to the three sample sessions.');
  });

  const dialog = document.querySelector<HTMLDialogElement>('#erase-dialog');
  document.querySelector('#erase-data')?.addEventListener('click', () => {
    dialog?.showModal();
    window.setTimeout(() => dialog?.querySelector<HTMLButtonElement>('[value="cancel"]')?.focus());
  });
  document.querySelector('#confirm-erase')?.addEventListener('click', async (event) => {
    event.preventDefault();
    window.clearTimeout(saveTimer);
    try {
      await deleteState();
      state = structuredClone(defaultState);
      dialog?.close('erase');
      renderPlanner();
      setMessage('Local settings and study history were erased.');
    } catch (error) {
      dialog?.close('cancel');
      setMessage(error instanceof Error ? error.message : 'Local data could not be erased. Try again.', 'error');
    }
  });
}

function monitorConnection(): void {
  const update = (online = navigator.onLine): void => {
    if (online) sessionStorage.removeItem('time-budget-offline');
    else sessionStorage.setItem('time-budget-offline', 'true');
    const element = document.querySelector<HTMLElement>('#connection');
    if (element) element.innerHTML = `<span aria-hidden="true">●</span> <span>${connectionLabel()}</span>`;
  };
  addEventListener('online', () => update(true));
  addEventListener('offline', () => update(false));
  if (!navigator.onLine) {
    update(false);
    return;
  }
  fetch(`/online-check.txt?${Date.now()}`, { cache: 'no-store' })
    .then((response) => update(response.ok && response.headers.get('X-Time-Budget-Offline') !== '1'))
    .catch(() => update(false));
}

async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  const registration = await navigator.serviceWorker.register('/sw.js');
  if (registration.waiting) showUpdate(registration);
  registration.addEventListener('updatefound', () => {
    const worker = registration.installing;
    worker?.addEventListener('statechange', () => {
      if (worker.state === 'installed' && navigator.serviceWorker.controller) showUpdate(registration);
    });
  });
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshForUpdate && !refreshing) {
      refreshing = true;
      location.reload();
    }
  });
}

function showUpdate(registration: ServiceWorkerRegistration): void {
  const toast = document.querySelector<HTMLElement>('#update-toast');
  if (!toast) return;
  toast.hidden = false;
  toast.querySelector('button')?.addEventListener('click', () => {
    refreshForUpdate = true;
    registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
  });
}

async function start(): Promise<void> {
  const path = normalizedPath;
  if (path === '/privacy' || path === '/privacy/index.html' || path === '/terms' || path === '/terms/index.html') {
    legalPage(path.includes('privacy') ? 'privacy' : 'terms');
  } else if (path === '' || path === '/index.html' || isDemo) {
    root.innerHTML = `<main id="main" class="loading"><p>Loading your study budget…</p><h1>Choose how many new cards fit today</h1></main>`;
    if (!isDemo) {
      try {
        state = (await loadState()) || structuredClone(defaultState);
      } catch {
        renderPlanner();
        setMessage('Local storage is unavailable. The calculator works, but changes may not survive a refresh.', 'error');
        monitorConnection();
        registerServiceWorker().catch(() => undefined);
        return;
      }
    }
    renderPlanner();
    monitorConnection();
    if (isDemo && new URLSearchParams(location.search).get('sample') === '1') {
      requestAnimationFrame(() => document.querySelector(matchMedia('(max-width: 480px)').matches ? '#result-title' : '#planner')?.scrollIntoView());
    }
  } else {
    notFoundPage();
  }
  registerServiceWorker().catch(() => undefined);
}

void start();
