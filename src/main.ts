import './style.css'
import TECHNOLOGIES_DATA from './technologies.json';

type Category = 
  | 'Frontend Frameworks' | 'Meta-Frameworks' | 'Styling' | 'Mobile Frameworks' | 'Desktop Frameworks'
  | 'Backend Languages' | 'Runtimes' | 'Backend Frameworks' | 'Task Queues'
  | 'Relational DB' | 'NoSQL DB' | 'Time-Series DB' | 'Graph DB' | 'Vector DB' | 'Object Storage' | 'Search Engines'
  | 'API Architectures' | 'API Gateways' | 'Message Brokers'
  | 'Operating Systems' | 'Containerization' | 'Virtualization' | 'IaC' | 'CI/CD' | 'Cloud Providers' | 'PaaS / Serverless'
  | 'Metrics' | 'Logging' | 'Error Tracking'
  | 'Auth' | 'Secrets'
  | 'ML Frameworks' | 'LLM Orchestration' | 'Model Providers';

const LAYER_GROUPS: Record<string, Category[]> = {
  'Frontend Layer': ['Frontend Frameworks', 'Meta-Frameworks', 'Styling', 'Mobile Frameworks', 'Desktop Frameworks'],
  'Backend Layer': ['Backend Languages', 'Runtimes', 'Backend Frameworks', 'Task Queues'],
  'Database Layer': ['Relational DB', 'NoSQL DB', 'Time-Series DB', 'Graph DB', 'Vector DB', 'Object Storage', 'Search Engines'],
  'API Layer': ['API Architectures', 'API Gateways', 'Message Brokers'],
  'DevOps Layer': ['Operating Systems', 'Containerization', 'Virtualization', 'IaC', 'CI/CD', 'Cloud Providers', 'PaaS / Serverless'],
  'Monitoring Layer': ['Metrics', 'Logging', 'Error Tracking'],
  'Security Layer': ['Auth', 'Secrets'],
  'AI & ML Layer': ['ML Frameworks', 'LLM Orchestration', 'Model Providers']
};

interface Technology {
  id: string;
  name: string;
  category: Category;
  firstLetter: string;
  iconUrl: string;
  description: string;
  compatibleWith: string[];
  isLocked?: boolean;
}

const TECHNOLOGIES: Technology[] = TECHNOLOGIES_DATA as any;

type AppMode = 'Standard' | 'Acronym';
let currentMode: AppMode = 'Standard';
let isUsableMode = true;
let activeCategories: Category[] = Object.values(LAYER_GROUPS).flat();
let generatedStack: Technology[] = [];
let acronymInput = '';
let shouldAnimate = false;
let sidebarScrollTop = 0;
let resultsScrollTop = 0;

const LAYER_COLORS: Record<string, string> = {
  'Frontend Layer': '#3b82f6',
  'Backend Layer': '#10b981',
  'Database Layer': '#8b5cf6',
  'API Layer': '#f59e0b',
  'DevOps Layer': '#ef4444',
  'Monitoring Layer': '#ec4899',
  'Security Layer': '#6366f1',
  'AI & ML Layer': '#f97316'
};

const getLayerForCategory = (cat: Category): string => {
  for (const [layer, subCats] of Object.entries(LAYER_GROUPS)) {
    if (subCats.includes(cat)) return layer;
  }
  return 'Frontend Layer';
};

const PALETTE = ['#91a6ff', '#d9480f', '#faff7f', '#ffffff', '#ff5154'];
const appElement = document.getElementById('app')!;

const PRESETS = [
  {
    id: 'fs-pro',
    name: 'Full Stack',
    techs: ['typescript', 'react', 'tailwind', 'node-js', 'express-js', 'postgresql', 'docker', 'github-actions', 'aws']
  },
  {
    id: 'ai-saas',
    name: 'AI SaaS',
    techs: ['typescript', 'react', 'next-js', 'tailwind', 'python', 'fastapi', 'mongodb', 'openai-api', 'langchain', 'vercel']
  },
  {
    id: 'mvp',
    name: 'MVP',
    techs: ['typescript', 'node-js', 'express-js', 'svelte', 'tailwind', 'supabase', 'netlify', 'github-actions']
  }
];

function render() {
  const sidebar = document.getElementById('sidebar-controls');
  if (sidebar) sidebarScrollTop = sidebar.scrollTop;

  const results = document.getElementById('results-stage');
  if (results) resultsScrollTop = results.scrollTop;

  appElement.innerHTML = `
    <div class="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-brand-orange selection:text-white overflow-hidden">
      <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 h-[90vh]">
        <aside class="lg:col-span-4 space-y-6 flex flex-col min-h-0">
          <header class="flex items-center gap-3 shrink-0">
            <div class="w-8 h-8 bg-brand-orange/20 rounded-lg flex items-center justify-center border border-brand-orange/30"><span class="text-xl">🌱</span></div>
            <h1 class="text-2xl font-black tracking-tighter text-white">StackSprout</h1>
          </header>
          <section class="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-sm flex flex-col flex-1 min-h-0">
            <div class="shrink-0 space-y-4 mb-6">
              <div class="grid grid-cols-3 gap-2">
                ${PRESETS.map(p => `<button data-preset="${p.id}" class="preset-btn py-2 px-1 rounded-xl bg-slate-950 border border-slate-800 text-[9px] font-black uppercase tracking-tighter text-slate-500 hover:text-brand-orange hover:border-brand-orange/50 transition-all">${p.name}</button>`).join('')}
              </div>
              <div class="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
                <button id="btn-standard" class="flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${currentMode === 'Standard' ? 'bg-brand-orange text-white' : 'text-slate-500 hover:text-slate-300'}">Standard</button>
                <button id="btn-acronym" class="flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${currentMode === 'Acronym' ? 'bg-brand-orange text-white' : 'text-slate-500 hover:text-slate-300'}">Acronym</button>
              </div>
            </div>
            <div class="flex flex-col flex-1 min-h-0 space-y-6">
              ${currentMode === 'Acronym' ? `
              <div class="shrink-0">
                <div class="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
                  <span class="text-xs font-medium text-slate-400 uppercase tracking-widest">Cohesion Mode</span>
                  <button id="toggle-usable" class="relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${isUsableMode ? 'bg-brand-orange' : 'bg-slate-700'}">
                    <span class="inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isUsableMode ? 'translate-x-6' : 'translate-x-1'}"></span>
                  </button>
                </div>
              </div>` : ''}
              <div class="flex-1 min-h-0 overflow-hidden">
                ${currentMode === 'Standard' ? renderStandardControls() : renderAcronymControls()}
              </div>
              <div class="shrink-0 pt-4 border-t border-slate-800">
                <button id="sprout-btn" class="w-full py-5 bg-brand-orange hover:bg-orange-600 text-white font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95 shadow-lg shadow-brand-orange/20 mb-4">Sprout Stack</button>
                <p class="text-[10px] text-center text-slate-600 uppercase tracking-widest">Press <span class="text-brand-orange font-black">Space</span> to sprout</p>
              </div>
            </div>
          </section>
        </aside>
        <div class="lg:col-span-8 flex flex-col min-h-0 h-full">
          <div id="results-stage" class="flex-1 bg-slate-900/30 border border-slate-800 rounded-[2.5rem] p-6 flex flex-col gap-3 overflow-y-auto custom-scrollbar">
            ${generatedStack.length === 0 ? renderEmptyState() : renderStack()}
          </div>
        </div>
      </div>
    </div>
  `;
  attachEventListeners();
  shouldAnimate = false;
}

function renderStandardControls() {
  return `
    <div id="sidebar-controls" class="flex flex-col h-full overflow-y-auto custom-scrollbar pr-2 space-y-6">
      ${Object.entries(LAYER_GROUPS).map(([layer, subCats]) => `
        <div class="space-y-2">
          <h3 class="text-[10px] font-black uppercase tracking-widest text-brand-orange ml-1">${layer}</h3>
          <div class="grid grid-cols-1 gap-1.5">
            ${subCats.map(cat => {
              const isActive = activeCategories.includes(cat);
              return `
                <label class="flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/50 cursor-pointer hover:border-brand-orange/30 transition-all group">
                  <span class="text-xl font-bold text-slate-400 group-hover:text-slate-200">${cat}</span>
                  <div class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" value="${cat}" class="cat-checkbox sr-only" ${isActive ? 'checked' : ''}>
                    <div class="w-12 h-6 bg-slate-800 rounded-full transition-colors group-hover:bg-slate-700 ${isActive ? '!bg-brand-orange' : ''}">
                      <div class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isActive ? 'translate-x-6' : ''}"></div>
                    </div>
                  </div>
                </label>
              `;
            }).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderAcronymControls() {
  return `<div><h3 class="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Acronym Engine</h3><input id="acronym-input" type="text" placeholder="ENTER ACRONYM" maxlength="${isUsableMode ? 8 : ''}" value="${acronymInput}" class="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-brand-orange uppercase font-mono tracking-widest"></div>`;
}

function renderEmptyState() {
  return `<div class="flex-1 flex flex-col items-center justify-center opacity-20"><div class="text-8xl mb-6 text-brand-orange">🌱</div><p class="text-xs font-black uppercase tracking-[0.3em]">System Standby</p></div>`;
}

function renderStack() {
  return generatedStack.map((tech, i) => {
    const layer = getLayerForCategory(tech.category);
    const accentColor = LAYER_COLORS[layer] || PALETTE[i % PALETTE.length];
    return `
      <div class="coolors-row min-h-[84px] flex items-center px-6 bg-slate-900/80 border border-slate-800/50 rounded-3xl relative group overflow-hidden transition-all hover:border-slate-700 shadow-xl shrink-0 ${shouldAnimate ? 'scramble-effect' : ''}" style="animation-delay: ${i * 50}ms">
        <div class="absolute left-0 top-0 bottom-0 w-1.5" style="background-color: ${accentColor}"></div>
        <div class="flex items-center gap-6 z-10 w-full">
          <div class="w-12 h-12 p-2.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform overflow-hidden">
            <img src="${tech.iconUrl}" alt="${tech.name}" class="w-full h-full object-contain" />
          </div>
          <div class="flex-1"><h3 class="text-xl font-black uppercase tracking-tighter text-white group-hover:text-brand-orange transition-colors">${tech.name}</h3><p class="text-[11px] font-black opacity-40 uppercase tracking-[0.1em] text-slate-400 mt-0.5">${tech.category}</p></div>
          <div class="row-actions flex items-center gap-2">
            <button data-id="${tech.id}" class="info-btn p-3 rounded-xl bg-slate-950/50 text-slate-500 hover:text-brand-yellow hover:bg-slate-950 border border-transparent hover:border-slate-800 transition-all"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></button>
            <button data-id="${tech.id}" class="lock-btn p-3 rounded-xl bg-slate-950/50 border border-transparent hover:border-slate-800 transition-all ${tech.isLocked ? 'text-brand-orange bg-slate-950 border-slate-800' : 'text-slate-500 hover:text-brand-orange hover:bg-slate-950'}">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">${tech.isLocked ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>' : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/>'}</svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

const handleKeydown = (e: KeyboardEvent) => { 
  if (e.code === 'Space') {
    const active = document.activeElement;
    if (active && (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement)) return;
    e.preventDefault(); 
    sprout(); 
  } 
};

function attachEventListeners() {
  document.getElementById('btn-standard')?.addEventListener('click', () => { currentMode = 'Standard'; render(); });
  document.getElementById('btn-acronym')?.addEventListener('click', () => { currentMode = 'Acronym'; render(); });
  document.getElementById('toggle-usable')?.addEventListener('click', () => { isUsableMode = !isUsableMode; render(); });
  document.querySelectorAll('.cat-checkbox').forEach(cb => cb.addEventListener('change', (e) => {
    const val = (e.target as HTMLInputElement).value as Category;
    if ((e.target as HTMLInputElement).checked) { if (!activeCategories.includes(val)) activeCategories.push(val); }
    else { activeCategories = activeCategories.filter(c => c !== val); }
    render();
  }));
  const acr = document.getElementById('acronym-input') as HTMLInputElement;
  if (acr) acr.addEventListener('input', (e) => { acronymInput = (e.target as HTMLInputElement).value.toUpperCase(); });
  document.getElementById('sprout-btn')?.addEventListener('click', sprout);
  document.querySelectorAll('.lock-btn').forEach(btn => btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const id = (e.currentTarget as HTMLElement).dataset.id;
    const t = generatedStack.find(x => x.id === id);
    if (t) { t.isLocked = !t.isLocked; render(); }
  }));
  document.querySelectorAll('.info-btn').forEach(btn => btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const id = (e.currentTarget as HTMLElement).dataset.id;
    const t = generatedStack.find(x => x.id === id);
    if (t) alert(`${t.name} (${t.category})\n\n${t.description}`);
  }));
  document.querySelectorAll('.preset-btn').forEach(btn => btn.addEventListener('click', (e) => {
    const id = (e.currentTarget as HTMLElement).dataset.preset;
    const preset = PRESETS.find(p => p.id === id);
    if (preset) applyPreset(preset);
  }));

  window.removeEventListener('keydown', handleKeydown);
  window.addEventListener('keydown', handleKeydown);

  const sidebarAfter = document.getElementById('sidebar-controls');
  if (sidebarAfter) sidebarAfter.scrollTop = sidebarScrollTop;

  const resultsAfter = document.getElementById('results-stage');
  if (resultsAfter) resultsAfter.scrollTop = resultsScrollTop;
}

function sprout() {
  shouldAnimate = true;
  if (currentMode === 'Standard') generateStandardStack();
  else generateAcronymStack();
  render();
}

function generateStandardStack() {
  const allowed = TECHNOLOGIES.filter(t => activeCategories.includes(t.category));
  if (allowed.length === 0) { generatedStack = []; return; }
  const next: Technology[] = [];
  
  activeCategories.forEach((cat) => {
    const locked = generatedStack.find(s => s.isLocked && s.category === cat);
    if (locked) next.push(locked);
    else {
      const techs = allowed.filter(t => t.category === cat);
      if (techs.length === 0) return;
      
      // Smart compatibility logic
      let filtered = techs;
      if (next.length > 0) {
        const related = next.flatMap(n => n.compatibleWith);
        const comp = techs.filter(t => related.includes(t.id) || t.compatibleWith.some(cid => next.some(n => n.id === cid)));
        if (comp.length > 0) filtered = comp;
      }
      
      next.push({...filtered[Math.floor(Math.random() * filtered.length)]});
    }
  });
  generatedStack = next;
}

function generateAcronymStack() {
  if (!acronymInput) return;
  const chars = acronymInput.split('');
  const next: Technology[] = [];
  chars.forEach((char, i) => {
    const locked = (generatedStack[i] && generatedStack[i].isLocked && generatedStack[i].firstLetter.toUpperCase() === char) ? generatedStack[i] : null;
    if (locked) next.push(locked);
    else {
      let matches = TECHNOLOGIES.filter(t => t.firstLetter.toUpperCase() === char);
      if (isUsableMode && i > 0) {
        const prev = next[i-1];
        const comp = matches.filter(t => prev.compatibleWith.includes(t.id) || t.compatibleWith.includes(prev.id));
        if (comp.length > 0) matches = comp;
      }
      if (matches.length > 0) next.push({...matches[Math.floor(Math.random() * matches.length)]});
      else next.push({ id: `fake-${char}-${i}`, name: `${char}${['enon','flow','grid','byte','core','sync'][Math.floor(Math.random()*6)]}`, category: 'Backend Languages' as any, firstLetter: char, iconUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${char}&backgroundColor=d9480f`, description: 'Quantum microservice.', compatibleWith: [] });
    }
  });
  generatedStack = next;
}

function applyPreset(preset: typeof PRESETS[0]) {
  shouldAnimate = true;
  currentMode = 'Standard';
  const presetTechs = TECHNOLOGIES.filter(t => preset.techs.includes(t.id));
  generatedStack = presetTechs.map(t => ({...t}));
  activeCategories = [...new Set(presetTechs.map(t => t.category))];
  render();
}

render();
