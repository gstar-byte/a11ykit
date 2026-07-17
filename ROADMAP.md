# A11yKit Development Roadmap

## Completed (v1.x)

- [x] 15 accessibility tools live
- [x] Color Blind Simulator — 8 vision types, severity slider, Daltonize, PNG download, palette mode, CSS variable output, UI preview
- [x] Contrast Checker — WCAG AA/AAA, APCA scoring, nearest compliant color suggestions, lightness slider, EyeDropper API
- [x] Statement Generator — 4 templates (basic/comprehensive/legal/developer), HTML/MD/TXT export, compliance certificate, scan result import, AI auto-generate
- [x] ARIA Generator — custom ID/class, required attribute validation, 4 Live Region modes
- [x] URL Scanner — single page + full-site crawl (max 10 pages), EAA compliance quick check, extended scan rules, localStorage export
- [x] WCAG Checklist, Heading Analyzer, Form Label Checker, HTML Scanner, Link Text Checker, Focus Order Checker, Alt Text Checker, PDF Checker, AI Alt Text Generator, Accessibility Monitor

## Pending (v2.0)

### 1. Browser Extension (Chrome + Firefox)
- **Priority:** High
- **Effort:** Medium (~2-3 days)
- **Cost:** Free (Chrome Web Store $5 one-time, Firefox Add-ons free)
- **Dependencies:** None
- **Description:** Package the URL Scanner and HTML Scanner as a browser extension. Users can scan any page they're viewing with one click, without navigating to a11ykit.site. Inject a sidebar showing issues overlaid on the page.
- **Competitors:** WAVE, Stark, axe DevTools
- **Key differentiator:** Free, no account, no scan limits

### 2. Figma Plugin
- **Priority:** Medium
- **Effort:** Large (~3-5 days)
- **Cost:** Free (Figma plugin API)
- **Dependencies:** Figma desktop app for testing
- **Description:** Figma plugin that checks contrast ratios, color blindness simulation, and alt text for design files. Helps designers catch accessibility issues before development.
- **Competitors:** Stark, Able
- **Key differentiator:** Free with no team plan paywall

### 3. Multi-language Support (i18n)
- **Priority:** Medium
- **Effort:** Large (~2-3 days for infrastructure + translation)
- **Cost:** Free (self-translated or community)
- **Dependencies:** Requires human translators or AI translation review
- **Description:** Add i18n infrastructure using next-intl or similar. Support at minimum: English, German, French, Spanish. Translate tool UI, tool descriptions, and generated statement templates.
- **Competitors:** W3C WAI (multi-language), accessProof
- **Key differentiator:** First free multi-language accessibility tool suite

### 4. Team Collaboration
- **Priority:** Low
- **Effort:** Very Large (~1-2 weeks)
- **Cost:** Requires backend (database, auth, hosting)
- **Dependencies:** Backend infrastructure, authentication system
- **Description:** Allow teams to share scan results, assign issues to members, track remediation progress, and generate team-level compliance reports. Requires user accounts and a backend API.
- **Competitors:** Stark Suite, accessibility-check.ai, AudioEye
- **Key differentiator:** Free tier with unlimited team members
- **Note:** This is the only feature requiring backend infrastructure. Consider using Supabase or similar BaaS to minimize server costs.
