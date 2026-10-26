# Brandon Chan · Strength & Conditioning

A one-page website for Brandon Chan, an ESSA Accredited Exercise Scientist in Melbourne offering strength & conditioning, athletic development and injury-prevention programs for teams, schools, clubs and individual athletes.

I built this for my brother Brandon so he'd have somewhere to send people who want to train with him.

**Live:** https://williamchan24.github.io/brandon-chan-site/

## What's on the page
- **Hero** with the headline, credentials and an "Enquire about a program" button
- **Sports strip** listing the sports Brandon works with
- **About**, **Services** (five programs plus a call to action) and **Who / Why** cards
- **Experience** timeline of professional roles and placements
- **Contact** block with email, phone and social links

## Effects
- **Hero:** headline lines slide up on load, and a heart-rate (ECG) line draws itself along the bottom, then a glowing blip runs along it like a heart monitor
- **Photo box:** an animated running-track graphic, with lanes and orange streaks, until a real photo goes in
- **Sports strip:** scrolls on its own, speeds up and leans while you scroll, and reverses when you scroll back up
- **Section headings** slide up out of a mask as they come into view; other sections fade in
- **Smart header:** hides while scrolling down, comes back on scroll up, and underlines the section you're in (tablet and desktop)
- **Service cards:** an orange glow follows the cursor and the number nudges over on hover
- **Buttons:** colour sweeps in from the left on hover
- **Experience timeline** fills in orange as you scroll, lighting up each role
- **Scroll progress bar** along the top
- **Accessible:** everything that moves switches off for visitors who prefer reduced motion, and keyboard users get a visible focus outline

## Editing
The site is three files, with no build step and no dependencies apart from Google Fonts (Barlow Condensed and Instrument Sans):

| File | What's in it |
|---|---|
| `index.html` | The page content and layout |
| `styles.css` | Colours, animations and hover effects |
| `script.js` | Scroll progress, scroll reveals, the smart header, the sports strip and the service-card glow |

| To change | Where |
|---|---|
| Accent colour | `--accent` at the top of `styles.css` (currently `#FF6B2C`) |
| Hero photo | Replace the `<svg class="track-art">` inside `.hero-photo` in `index.html` with `<img src="brandon.jpg" alt="Brandon Chan coaching">` and add the image file next to `index.html` |
| Contact details | The `mailto:`, `tel:` and Instagram links in the **Contact** section; they're still placeholders |
| Sports in the strip | The `<div class="set">` inside `.strip`; keep both copies identical so the loop stays seamless |
| Services and experience | Edit the text in the **Services** and **Experience** sections |

## Run it locally
Open `index.html` in a browser, or serve the folder so it behaves exactly like the live site:

```bash
npx serve .
```

## Deploying
Every push to `main` publishes the site to GitHub Pages through `.github/workflows/deploy.yml`, usually within a minute. Pages is set to **Settings → Pages → Source: GitHub Actions**.
