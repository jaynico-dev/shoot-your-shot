# Shoot Your Shot

A small Valentine-themed browser game built with Phaser, React and Vite.

- Aim and shoot a heart-tipped arrow to win cute outcomes.
- Two scenes: `GameScene` (main gameplay) and `NoChallengeScene` (alternate mini-game).

## Quick Start

Prerequisites: Node.js and npm.

Install and run locally:

```bash
npm install
npm run dev
```

Build and preview:

```bash
npm run build
npm run preview
```

Deploy (uses `gh-pages`):

```bash
npm run deploy
```

## Project Structure

- `src/` — TypeScript source (Phaser scenes, React entry)
- `public/` — static assets (faces, images, gifs)
- `index.html` — game mount point (`#game`) and floating `#cat-gif`
- `vite.config.ts` — configured `base` for GitHub Pages

## How to Play

- Move / drag to aim (mouse or touch), release to shoot.
- Hit the `yes` target to win; different scenes show based on results.

## Notes & Credits

- Theme music (Mundian To Bach Ke - Panjabi MC (Marimba Indian Ringtone)) and images live in the project `public` and root asset files.
- Feel free to fork and customize — this is a small demo.