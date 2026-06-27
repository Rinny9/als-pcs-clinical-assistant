# ALS PCS Clinical Assistant

A GitHub-ready React/Vite MVP for an Ontario ALS PCS 5.4 clinical calculation assistant.

## What it does

- Patient age/weight dashboard
- Pediatric estimated weight using ALS PCS convention `(age x 2) + 10`
- Pediatric hypotension and normotension thresholds
- Airway equipment suggestions: ETT size/depth, iGel size, blade, suction catheter
- Medication calculation cards for common ACP workflows
- ROSC/general fluid calculations
- Pediatric defibrillation energy calculations
- CPR timer
- Medication search/filter
- Mobile-friendly dark UI

## Critical disclaimer

This is **not** a certified medical device and must not be used clinically until validated by your service/base hospital. All calculations must be checked against the current ALS PCS, companion-document notes, local RBHP policy, service authorizations, equipment, and medication concentrations.

## Install

```bash
npm install
npm run dev
```

Then open the local URL shown by Vite.

## Build

```bash
npm run build
npm run preview
```

## Suggested GitHub workflow

```bash
git init
git add .
git commit -m "Initial ALS PCS clinical assistant MVP"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/als-pcs-clinical-assistant.git
git push -u origin main
```

## Recommended next steps before production

1. Move all medications into structured JSON with source page numbers.
2. Add the ALS PCS companion document notes as separate reference data.
3. Add unit tests for every calculation.
4. Add local medication concentration settings.
5. Add service-specific authorization toggles.
6. Add formal clinical validation and version control for every directive update.

## File structure

```text
src/main.jsx       Main app + calculation engine
src/styles.css     UI styling
```
