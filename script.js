// ============================================================================
// RELOGIFACT HISTORY DATA (EASY FOR NOVICES TO EDIT & MANAGE)
// ============================================================================
// How to add a new Relogifact of the week:
// 1. Copy one of the blocks below { date: "...", fact: "..." },
// 2. Paste it at the TOP of the RELOGIFACTS_HISTORY list so the newest is first.
// 3. Update the date and the fact text!
// ============================================================================

const RELOGIFACTS_HISTORY = [
  {
    date: "July 26, 2026",
    fact: "1729 is the smallest number which can be expressed as the sum of two cubes in two different ways: 1729 = 1³ + 12³ = 9³ + 10³. This number is known as the Hardy-Ramanujan number, or Ramanujan's Constant, named after the mathematicians G.H. Hardy and Srinivasa Ramanujan."
  },
  {
    date: "July 19, 2026",
    fact: "Euler's Identity connects five of the most fundamental mathematical constants in a single elegant equation: e^(iπ) + 1 = 0."
  },
  {
    date: "July 12, 2026",
    fact: "A topological coffee mug and a doughnut (torus) are homeomorphic—you can smoothly deform one into the other without tearing or gluing because both have exactly one hole."
  },
  {
    date: "July 5, 2026",
    fact: "Light traveling through a vacuum always moves at exactly 299,792,458 meters per second, regardless of the speed of the observer or source—the foundational postulate of Special Relativity."
  },
  {
    date: "June 28, 2026",
    fact: "The Banach-Tarski Paradox shows that in theoretical geometry, a solid ball can be partitioned into a finite number of pieces and reassembled into two identical copies of the original ball."
  }
];

// ============================================================================
// RELOGIFACT HISTORY POPUP MODAL LOGIC
// ============================================================================
const openHistoryBtn = document.getElementById('openHistoryBtn');
const closeHistoryBtn = document.getElementById('closeHistoryBtn');
const historyModal = document.getElementById('historyModal');
const historyModalBody = document.getElementById('historyModalBody');

function renderRelogifactsHistory() {
  if (!historyModalBody) return;
  historyModalBody.innerHTML = '';
  
  RELOGIFACTS_HISTORY.forEach(item => {
    const card = document.createElement('div');
    card.className = 'history-card';
    card.innerHTML = `
      <div class="history-date">${item.date}</div>
      <div class="history-fact">${item.fact}</div>
    `;
    historyModalBody.appendChild(card);
  });
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