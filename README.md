# LuckLab MVP

A static web MVP for an ad-supported daily chance-game platform.

## Product rules
- Coins are virtual game points only.
- Coins have no cash value and cannot be purchased, sold, transferred, or redeemed for money.
- Lifetime Coins unlock additional reveal/game styles.
- Each unlocked game can be played once per local calendar day in this MVP.
- Cash Scratches are displayed only as a separate "Coming Soon" feature.

## Included game styles
- Classic Scratch — unlocked immediately
- Lucky Wheel — 1,000 lifetime Coins
- Mystery Box — 5,000
- Lucky Numbers — 20,000
- Gold Scratch — 50,000
- Legendary Reveal — 100,000

## Ads
Two clearly separated advertisement placeholders are included. Replace these only after AdSense approval and keep ad placements away from high-interaction game controls.

## Running locally
No build step is required. Serve the folder with any static HTTP server, for example:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Important MVP limitation
State is stored in `localStorage`, so users can reset or manipulate it. Before public launch, move balances, daily-play eligibility, reward selection, anti-abuse logic, analytics, authentication, and leaderboard data to a server-side backend.
