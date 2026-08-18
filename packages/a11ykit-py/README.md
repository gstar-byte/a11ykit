# A11yKit

[![PyPI version](https://img.shields.io/pypi/v/a11ykit.svg)](https://pypi.org/project/a11ykit/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> **15 Free, Client-Side Web Accessibility Tools for WCAG 2.2 & EAA Compliance with Zero Code Uploads.**

Official Web App: **[https://a11ykit.site](https://a11ykit.site)**

---

## ⚡ Quick Start

Install via pip:

```bash
pip install a11ykit
```

### 1. WCAG 2.2 Color Contrast Checker

```bash
a11ykit contrast "#2563eb" "#ffffff"
```

Output:
```text
🎨 A11yKit Contrast Results: #2563eb vs #ffffff
   Contrast Ratio: 4.54:1
   - WCAG AA (Normal Text >= 4.5:1): [PASS]
   - WCAG AA (Large Text >= 3.0:1):  [PASS]
   - WCAG AAA (Normal Text >= 7.0:1): [FAIL]
   Interactive Tool: https://a11ykit.site/tools/contrast-checker
```

### 2. List All 15 Accessibility Tools

```bash
a11ykit list
```

---

## 🛠️ Complete Suite on the Web

Explore all 15 free client-side tools at **[https://a11ykit.site](https://a11ykit.site)**:

1. **[Color Contrast Checker](https://a11ykit.site/tools/contrast-checker)** (WCAG 2.2 + APCA)
2. **[Color Blindness Simulator](https://a11ykit.site/tools/color-blind-simulator)** (8 visual deficiency modes)
3. **[ARIA Attribute Generator](https://a11ykit.site/tools/aria-generator)** (Accurate WAI-ARIA 1.2 patterns)
4. **[Heading Hierarchy Analyzer](https://a11ykit.site/tools/heading-analyzer)**
5. **[Form Label & Focus Checker](https://a11ykit.site/tools/form-label-checker)**
6. **[WCAG 2.2 Compliance Checklist](https://a11ykit.site/tools/wcag-checklist)**
7. **[Alt Text Tester](https://a11ykit.site/tools/alt-text-tester)**
8. **[Touch Target Spacing Checker](https://a11ykit.site/tools/touch-target-checker)**
9. **[Focus Trap & Keyboard Navigator](https://a11ykit.site/tools/focus-trap-generator)**
10. **[Global Accessibility Audit Benchmark](https://a11ykit.site/accessibility-report)**

---

## 🔒 Privacy First

A11yKit runs 100% in your local terminal and client-side in the browser. Zero source code or telemetry data is ever transmitted to remote servers.

- **Website**: [https://a11ykit.site](https://a11ykit.site)
- **GitHub**: [https://github.com/gstar-byte/a11ykit](https://github.com/gstar-byte/a11ykit)
- **NPM Package**: [https://www.npmjs.com/package/a11ykit-cli](https://www.npmjs.com/package/a11ykit-cli)
- **License**: MIT
