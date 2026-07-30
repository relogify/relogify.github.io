// ============================================================================
// RELOGIFACT HISTORY POPUP MODAL LOGIC (LOADED FROM weeklyfact.txt)
// ============================================================================
// How to manage the Relogifact weekly history:
// Open weeklyfact.txt and add one fact per line with the fact in quotation marks
// and the date.
// Example:
//   "example" July 30, 2026
// ============================================================================

const openHistoryBtn = document.getElementById('openHistoryBtn');
const closeHistoryBtn = document.getElementById('closeHistoryBtn');
const historyModal = document.getElementById('historyModal');
const historyModalBody = document.getElementById('historyModalBody');

async function renderRelogifactsHistory() {
  if (!historyModalBody) return;
  historyModalBody.innerHTML = '<div class="history-card">Loading history...</div>';

  try {
    const response = await fetch('weeklyfact.txt');
    if (!response.ok) throw new Error('Could not load weeklyfact.txt');
    const text = await response.text();

    const lines = text.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0 && !l.startsWith('#'));

    historyModalBody.innerHTML = '';

    if (lines.length === 0) {
      historyModalBody.innerHTML = '<div class="history-card">No weekly facts found.</div>';
      return;
    }

    lines.forEach(line => {
      // Extract text inside quotation marks as the fact
      const match = line.match(/"([^"]+)"/);
      let fact = 'No fact text specified';
      let date = line;

      if (match) {
        fact = match[1];
        // Remove the quoted fact from the line to obtain the remaining date text
        date = line.replace(match[0], '').replace(/^-+|-+$/g, '').trim();
      }

      const card = document.createElement('div');
      card.className = 'history-card';
      card.innerHTML = `
        <div class="history-date">${date || 'Unknown Date'}</div>
        <div class="history-fact">${fact}</div>
      `;
      historyModalBody.appendChild(card);
    });
  } catch (err) {
    historyModalBody.innerHTML = '<div class="history-card">Unable to load history archive.</div>';
  }
}

if (openHistoryBtn && historyModal) {
  openHistoryBtn.addEventListener('click', () => {
    renderRelogifactsHistory();
    historyModal.classList.add('open');
  });
}

if (closeHistoryBtn && historyModal) {
  closeHistoryBtn.addEventListener('click', () => {
    historyModal.classList.remove('open');
  });
}

// Close modal when clicking on overlay outside the box
if (historyModal) {
  historyModal.addEventListener('click', (e) => {
    if (e.target === historyModal) {
      historyModal.classList.remove('open');
    }
  });

  // Close modal on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && historyModal.classList.contains('open')) {
      historyModal.classList.remove('open');
    }
  });
}

// ============================================================================
// MOBILE NAVIGATION & UTILITIES
// ============================================================================

// Mobile nav toggle
const toggle = document.getElementById('mobileToggle');
const sidebar = document.querySelector('.sidebar');

if (toggle && sidebar) {
  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  // Close sidebar when clicking outside
  document.addEventListener('click', (e) => {
    if (sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) &&
        e.target !== toggle) {
      sidebar.classList.remove('open');
    }
  });
}

// Dynamic copyright year
document.querySelectorAll('.copyright-year').forEach(el => {
  el.textContent = new Date().getFullYear();
});