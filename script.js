// ============================================================================
// WEEKLY FACTS & ARCHIVE MODAL LOGIC (LOADED FROM weekly-facts/ FOLDER)
// ============================================================================
// How to add a new weekly Relogifact:
// 1. Create a text file in weekly-facts/ named with the US date (e.g. 8-6-26.txt).
// 2. Inside the file, put the fact in quotation marks and the date:
//    "Your fact text here" August 6, 2026
// 3. Add the filename (8-6-26.txt) to weekly-facts/index.txt.
// ============================================================================

const openHistoryBtn = document.getElementById('openHistoryBtn');
const closeHistoryBtn = document.getElementById('closeHistoryBtn');
const historyModal = document.getElementById('historyModal');
const historyModalBody = document.getElementById('historyModalBody');
const sortHistoryBtn = document.getElementById('sortHistoryBtn');

const latestFactModal = document.getElementById('latestFactModal');
const closeLatestFactBtn = document.getElementById('closeLatestFactBtn');
const closeLatestFactActionBtn = document.getElementById('closeLatestFactActionBtn');
const dontShowAgainCheckbox = document.getElementById('dontShowAgainCheckbox');
const latestFactDate = document.getElementById('latestFactDate');
const latestFactText = document.getElementById('latestFactText');
const currentWeeklyFactText = document.getElementById('currentWeeklyFactText');
const currentWeeklyFactDate = document.getElementById('currentWeeklyFactDate');

let cachedFacts = [];
let sortOrder = 'desc'; // 'desc' = Newest first, 'asc' = Oldest first

// Parse US format filename date (e.g., 7-30-26.txt or 07/30/2026.txt) into a JS Date
function parseUSFilenameDate(filename) {
  const clean = filename.replace(/\.txt$/i, '').replace(/[_\/]/g, '-').trim();
  const parts = clean.split('-');
  if (parts.length >= 3) {
    const month = parseInt(parts[0], 10) - 1; // 0-based month in JS
    const day = parseInt(parts[1], 10);
    let year = parseInt(parts[2], 10);
    if (year < 100) year += 2000;
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date(0);
}

// Fetch all weekly fact text files listed in weekly-facts/index.txt
async function fetchWeeklyFacts() {
  if (cachedFacts.length > 0) return cachedFacts;

  try {
    const idxRes = await fetch('weekly-facts/index.txt');
    if (!idxRes.ok) throw new Error('Could not load weekly-facts/index.txt');
    const idxText = await idxRes.text();

    const filenames = idxText.split('\n')
      .map(line => line.trim())
      .filter(line => line.endsWith('.txt') && !line.startsWith('#'));

    const facts = [];

    for (const fname of filenames) {
      try {
        const fileRes = await fetch(`weekly-facts/${fname}`);
        if (!fileRes.ok) continue;
        const text = await fileRes.text();
        const firstLine = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)[0] || '';

        const match = firstLine.match(/"([^"]+)"/);
        let factText = 'No fact text specified';
        let dateString = firstLine;

        if (match) {
          factText = match[1];
          dateString = firstLine.replace(match[0], '').replace(/^-+|-+$/g, '').trim();
        }

        const dateObj = parseUSFilenameDate(fname);
        facts.push({
          filename: fname,
          dateObj: dateObj,
          dateString: dateString || fname,
          factText: factText
        });
      } catch (err) {
        console.warn(`Could not read weekly-facts/${fname}`, err);
      }
    }

    // Sort descending (newest US filename date first)
    facts.sort((a, b) => b.dateObj - a.dateObj);
    cachedFacts = facts;
    return facts;
  } catch (err) {
    console.error('Error loading weekly facts archive:', err);
    return [];
  }
}

// Render archive list in "View History" modal
function renderArchiveModal(facts) {
  if (!historyModalBody) return;
  historyModalBody.innerHTML = '';

  if (facts.length === 0) {
    historyModalBody.innerHTML = '<div class="history-card">No archived weekly facts found.</div>';
    return;
  }

  const listToRender = [...facts];
  listToRender.sort((a, b) => {
    return sortOrder === 'desc' ? b.dateObj - a.dateObj : a.dateObj - b.dateObj;
  });

  listToRender.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'history-card';
    const badgeHtml = (sortOrder === 'desc' && index === 0) ? 
      ' <span class="wip-badge" style="border-color:rgb(133,167,235); color:rgb(133,167,235); background:rgba(133,167,235,0.12);">LATEST</span>' : '';
    
    card.innerHTML = `
      <div class="history-date">${item.dateString}${badgeHtml}</div>
      <div class="history-fact">${item.factText}</div>
    `;
    historyModalBody.appendChild(card);
  });
}

// Toggle sort order in archive modal
if (sortHistoryBtn) {
  sortHistoryBtn.addEventListener('click', async () => {
    sortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    sortHistoryBtn.innerHTML = sortOrder === 'desc' ? 
      'Sort: Newest First &#8595;' : 'Sort: Oldest First &#8593;';
    const facts = await fetchWeeklyFacts();
    renderArchiveModal(facts);
  });
}

// Open "View History" Archive Modal
if (openHistoryBtn && historyModal) {
  openHistoryBtn.addEventListener('click', async () => {
    if (historyModalBody) {
      historyModalBody.innerHTML = '<div class="history-card">Loading archive...</div>';
    }
    historyModal.classList.add('open');
    const facts = await fetchWeeklyFacts();
    renderArchiveModal(facts);
  });
}

// Close "View History" Archive Modal
if (closeHistoryBtn && historyModal) {
  closeHistoryBtn.addEventListener('click', () => {
    historyModal.classList.remove('open');
  });
}

// Automatically pop up latest weekly fact if not hidden by "Don't show again"
async function checkAndShowLatestFact() {
  const facts = await fetchWeeklyFacts();
  if (facts.length === 0) return;

  // The latest fact is the first item when sorted descending by US filename date
  const latest = facts[0];

  // Update the homepage current fact display so it matches the latest fact and appears in archive
  if (currentWeeklyFactText) currentWeeklyFactText.textContent = `"${latest.factText}"`;
  if (currentWeeklyFactDate) currentWeeklyFactDate.textContent = latest.dateString;

  if (!latestFactModal) return;
  const hiddenFact = localStorage.getItem('relogify_hide_fact');

  if (hiddenFact !== latest.filename) {
    if (latestFactDate) latestFactDate.textContent = `${latest.dateString} (${latest.filename})`;
    if (latestFactText) latestFactText.textContent = `"${latest.factText}"`;
    if (dontShowAgainCheckbox) dontShowAgainCheckbox.checked = false;

    setTimeout(() => {
      latestFactModal.classList.add('open');
    }, 350);
  }
}

function dismissLatestFactModal() {
  if (!latestFactModal) return;
  if (dontShowAgainCheckbox && dontShowAgainCheckbox.checked && cachedFacts.length > 0) {
    localStorage.setItem('relogify_hide_fact', cachedFacts[0].filename);
  }
  latestFactModal.classList.remove('open');
}

if (closeLatestFactBtn) {
  closeLatestFactBtn.addEventListener('click', dismissLatestFactModal);
}

if (closeLatestFactActionBtn) {
  closeLatestFactActionBtn.addEventListener('click', dismissLatestFactModal);
}

// Close modals when clicking on overlay outside the box
document.addEventListener('click', (e) => {
  if (e.target === historyModal) {
    historyModal.classList.remove('open');
  }
  if (e.target === latestFactModal) {
    dismissLatestFactModal();
  }
});

// Close modals on Escape key press
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (historyModal && historyModal.classList.contains('open')) {
      historyModal.classList.remove('open');
    }
    if (latestFactModal && latestFactModal.classList.contains('open')) {
      dismissLatestFactModal();
    }
  }
});

// Run check on page load
window.addEventListener('DOMContentLoaded', () => {
  checkAndShowLatestFact();
});

// ============================================================================
// MOBILE NAVIGATION & UTILITIES
// ============================================================================

const toggle = document.getElementById('mobileToggle');
const sidebar = document.querySelector('.sidebar');

if (toggle && sidebar) {
  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) &&
        e.target !== toggle) {
      sidebar.classList.remove('open');
    }
  });
}

document.querySelectorAll('.copyright-year').forEach(el => {
  el.textContent = new Date().getFullYear();
});