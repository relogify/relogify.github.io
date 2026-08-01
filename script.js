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

// Fetch all weekly fact text files from weekly-facts/ (dynamic date indexing + index.txt)
async function fetchWeeklyFacts() {
  if (cachedFacts.length > 0) return cachedFacts;

  const filenameSet = new Set();

  // 1. Check index.txt if available
  try {
    const idxRes = await fetch('weekly-facts/index.txt');
    if (idxRes.ok) {
      const idxText = await idxRes.text();
      idxText.split('\n')
        .map(l => l.trim())
        .filter(l => l.endsWith('.txt') && !l.startsWith('#'))
        .forEach(f => filenameSet.add(f));
    }
  } catch (err) {
    console.warn('Could not read index.txt, falling back to dynamic date probe');
  }

  // 2. Dynamically probe Sunday US date filenames around current local date (past 16 weeks, future 6 weeks)
  const nowForProbe = new Date();
  for (let offset = -112; offset <= 42; offset += 7) {
    const d = new Date(nowForProbe.getTime() + offset * 86400000);
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const yy = d.getFullYear() % 100;
    const candidate = `${m}-${day}-${yy}.txt`;
    if (!filenameSet.has(candidate)) {
      try {
        const probeRes = await fetch(`weekly-facts/${candidate}`, { method: 'HEAD' });
        if (probeRes.ok) filenameSet.add(candidate);
      } catch (e) {
        // file not present
      }
    }
  }

  const facts = [];
  const filenames = Array.from(filenameSet);

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

  // Filter to only released facts where the US filename date is on or before today
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  const releasedFacts = facts.filter(f => f.dateObj <= now);

  // Sort descending (newest released US filename date first)
  releasedFacts.sort((a, b) => b.dateObj - a.dateObj);
  cachedFacts = releasedFacts;
  return releasedFacts;
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
  if (currentWeeklyFactText) currentWeeklyFactText.innerHTML = `"${latest.factText}"`;
  if (currentWeeklyFactDate) currentWeeklyFactDate.textContent = latest.dateString;

  if (!latestFactModal) return;
  const hiddenFact = localStorage.getItem('relogify_hide_fact');

  if (hiddenFact !== latest.filename) {
    if (latestFactDate) latestFactDate.textContent = `${latest.dateString} (${latest.filename})`;
    if (latestFactText) latestFactText.innerHTML = `"${latest.factText}"`;
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
// INTERACTIVE HOMEPAGE CONCEPT EXPLORER (SPARK AN INTUITION)
// ============================================================================

// ============================================================================
// FULLY DYNAMIC CONCEPT EXPLORER (SPARK AN INTUITION)
// Dynamically scans all added (non-WIP) articles on the site and extracts concepts!
// ============================================================================

let dynamicConceptsList = [];
let conceptIndex = 0;

const nextConceptBtn = document.getElementById('nextConceptBtn');
const conceptTag = document.getElementById('conceptTag');
const conceptTitle = document.getElementById('conceptTitle');
const conceptDesc = document.getElementById('conceptDesc');
const conceptLink = document.getElementById('conceptLink');

// Dynamically discover all non-WIP article links from section index pages
async function discoverNonWipArticles() {
  const sectionPages = ['math.html', 'physics.html', 'additional.html'];
  const articleUrls = new Set();

  for (const page of sectionPages) {
    try {
      const res = await fetch(page);
      if (!res.ok) continue;
      const htmlText = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');

      const links = doc.querySelectorAll('.article-list a[href$=".html"]');
      links.forEach(link => {
        const url = link.getAttribute('href');
        if (!url || url === 'index.html' || url.startsWith('http')) return;

        // Check if article is marked as WIP
        const isWipClass = link.classList.contains('wip');
        const hasWipBadge = link.querySelector('.wip-badge') !== null || link.textContent.includes('WIP');

        if (!isWipClass && !hasWipBadge) {
          articleUrls.add(url);
        }
      });
    } catch (err) {
      console.warn('Could not scan section page:', page, err);
    }
  }

  // Ensure known finished articles are included
  articleUrls.add('euclidean-algorithm.html');
  articleUrls.add('linear-algebra.html');

  return Array.from(articleUrls);
}

// Automatically extract conceptual intuitions from any finished article page
async function extractConceptsFromArticle(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const htmlText = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');

    const pageTitleEl = doc.querySelector('.page-title') || doc.querySelector('title');
    const articleTitle = pageTitleEl ? pageTitleEl.textContent.replace(/\|.*$/, '').trim().toUpperCase() : 'SCIENCE & MATH';
    const concepts = [];

    // 1. Check for explicitly tagged concept items (<p data-concept-title="...">)
    const customItems = doc.querySelectorAll('[data-concept-title]');
    customItems.forEach(el => {
      const title = el.getAttribute('data-concept-title');
      const desc = el.textContent.trim();
      if (title && desc) {
        concepts.push({
          tag: articleTitle,
          title: title,
          desc: desc,
          link: url
        });
      }
    });

    // 2. Automatically extract from subheadings (.section-label-big, .subheading-purple, .subheading-red, .subheading-yellow, .section-text-3)
    const headings = doc.querySelectorAll('.section-label-big, .subheading-purple, .subheading-red, .subheading-yellow');
    headings.forEach(heading => {
      const title = heading.textContent.trim();
      if (!title || title.length < 3 || title.toUpperCase() === 'PROOF') return;

      // Find the next paragraph after this heading
      let nextEl = heading.nextElementSibling;
      while (nextEl && nextEl.tagName !== 'P' && nextEl.tagName !== 'DIV') {
        nextEl = nextEl.nextElementSibling;
      }
      if (nextEl) {
        const desc = nextEl.textContent.replace(/\s+/g, ' ').trim();
        if (desc.length > 25) {
          concepts.push({
            tag: articleTitle,
            title: title,
            desc: desc.length > 240 ? desc.substring(0, 237) + '...' : desc,
            link: url
          });
        }
      }
    });

    // Include core concepts for Euclidean Algorithm and Linear Algebra
    if (url === 'linear-algebra.html') {
      concepts.push({
        tag: "LINEAR ALGEBRA",
        title: "Linearity preserves grid lines, origin, and geometric symmetry",
        desc: "In a linear transformation, grid lines remain parallel and evenly spaced, and the origin never moves—allowing any transformed vector to be described by tracking basis vectors i-hat and j-hat.",
        link: "linear-algebra.html"
      });
      concepts.push({
        tag: "LINEAR ALGEBRA",
        title: "The determinant measures how much a transformation scales area",
        desc: "By observing how the 1x1 Unit Square defined by basis vectors i-hat and j-hat changes after a transformation, the determinant determines the multiplier effect on any area in the plane.",
        link: "linear-algebra.html"
      });
    }
    if (url === 'euclidean-algorithm.html') {
      concepts.push({
        tag: "EUCLIDEAN ALGORITHM",
        title: "Euclid's Algorithm systematically computes the Greatest Common Divisor",
        desc: "By expressing the larger number in terms of the smaller divisor and inspecting the remainder (a = b * q + r), we can systematically repeat the division until the remainder is 0 without trial and error.",
        link: "euclidean-algorithm.html"
      });
      concepts.push({
        tag: "EUCLIDEAN ALGORITHM",
        title: "Why the GCD of two numbers equals the GCD of divisor and remainder",
        desc: "Because any divisor that divides both a and b must also divide their remainder r = a - b * q, the foundational building blocks of {a, b} and {b, r} are identical.",
        link: "euclidean-algorithm.html"
      });
    }

    return concepts;
  } catch (err) {
    console.warn('Could not extract concepts from article:', url, err);
    return [];
  }
}

// Load concepts from all non-WIP articles
async function initDynamicConceptExplorer() {
  if (!nextConceptBtn || !conceptTitle || !conceptDesc) return;

  const articleUrls = await discoverNonWipArticles();
  let allConcepts = [];

  for (const url of articleUrls) {
    const extracted = await extractConceptsFromArticle(url);
    allConcepts = allConcepts.concat(extracted);
  }

  // Remove duplicates by title
  const uniqueMap = new Map();
  allConcepts.forEach(c => {
    if (c.title && !uniqueMap.has(c.title)) {
      uniqueMap.set(c.title, c);
    }
  });

  dynamicConceptsList = Array.from(uniqueMap.values());
  if (dynamicConceptsList.length === 0) {
    dynamicConceptsList = [
      {
        tag: "LINEAR ALGEBRA",
        title: "Linearity preserves grid lines, origin, and geometric symmetry",
        desc: "In a linear transformation, grid lines remain parallel and evenly spaced, and the origin never moves—allowing any transformed vector to be described by tracking basis vectors i-hat and j-hat.",
        link: "linear-algebra.html"
      }
    ];
  }

  const showConcept = (index) => {
    const item = dynamicConceptsList[index % dynamicConceptsList.length];
    if (conceptTag) conceptTag.textContent = item.tag;
    conceptTitle.textContent = item.title;
    conceptDesc.textContent = item.desc;
    if (conceptLink) conceptLink.href = item.link;
  };

  showConcept(0);

  nextConceptBtn.addEventListener('click', () => {
    conceptIndex = (conceptIndex + 1) % dynamicConceptsList.length;
    showConcept(conceptIndex);
  });
}

// Initialize dynamic concept explorer on load
window.addEventListener('DOMContentLoaded', () => {
  initDynamicConceptExplorer();
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