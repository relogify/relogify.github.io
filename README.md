# relogify (relogify.github.io)

An informational website which serves to provide an alternative way to think about and conceptualize challenging scientific and mathematical ideas. Updated every Sunday.

- **Author & Founder:** Prajwal Sharma-Gaire
- **Web Admin & Frontend Developer:** John Cummiskey
- **Live Website:** [https://relogify.vibeotter.com/](https://relogify.vibeotter.com/) (and GitHub Pages)

---

## Minimal & Basic Framework Architecture

This repository is built as a **minimal, hardcoded static website** designed to be super simple to manage and work on without any build tools, bundlers, Node.js dependencies, or compilation steps.
Everything is built with clean, documented **HTML5**, **CSS3**, and **Vanilla JavaScript**. Novice maintainers can edit files directly on GitHub or on any local computer.

---

## Quick Reference Guide

For a comprehensive step-by-step guide on how to add articles, format equations, manage images, use WIP badges, and update the weekly RelogiFact history, see **[DOCUMENTATION.md](./DOCUMENTATION.md)**.

### Key Features Summary:
- **Spaced Image Layout System:** Easily pair text paragraphs with their associated images on the right using `<div class="article-layout">`, and make proof/diagram images large using `<div class="article-img-box big">`.
- **Readable Monospace Math Equations:** Clear typography for standalone equations (`<div class="math-equation">...</div>`) and inline math variables (`<span class="math-inline">...</span>`).
- **WIP Symbol for Unfinished Articles:** Easily mark in-progress articles on index pages with `<span class="wip-badge">🚧 WIP</span>` or `class="wip"`.
- **Weekly RelogiFact Popups & Archive:** Automatic homepage modal popup showing the latest weekly fact (determined by US filename date in `weekly-facts/` like `7-30-26.txt`) with a "Don't show again" `localStorage` option, plus a date-sortable archive modal.
- **Scheduled Future Weekly Facts:** Schedule facts for future Sundays (e.g., `8-2-26.txt`) in advance—the site automatically releases them only when their date arrives.
- **Interactive Homepage & Suggestion Email:** Features an interactive *Spark an Intuition* concept explorer widget and an embedded community suggestion email card (`suggestions@relogify.vibeotter.com`).
- **Creator Profile Cards:** Upgraded Creators & Contact section with photo avatar placeholders, bios, and resume/portfolio links.

---

## License

This repository is licensed under the **GNU Affero General Public License Version 3.0 (AGPL-3.0)**. See the [`LICENSE`](./LICENSE) file for details.
