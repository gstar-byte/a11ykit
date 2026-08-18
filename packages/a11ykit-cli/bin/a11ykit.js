#!/usr/bin/env node

/**
 * A11yKit CLI — Fast, 100% Client-Side Web Accessibility Utility
 * Official Website: https://a11ykit.site
 * GitHub: https://github.com/gstar-byte/a11ykit
 */

const args = process.argv.slice(2);
const command = args[0] || "help";

console.log("\n========================================================");
console.log("🛠️  A11yKit CLI — Web Accessibility (WCAG 2.2 / EAA)");
console.log("🌐 Official Web App: https://a11ykit.site");
console.log("========================================================\n");

function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const val = c / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function hexToRgb(hex) {
  hex = hex.replace("#", "");
  if (hex.length === 3) {
    hex = hex.split("").map((c) => c + c).join("");
  }
  const num = parseInt(hex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function calculateContrast(hex1, hex2) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return ((brightest + 0.05) / (darkest + 0.05)).toFixed(2);
}

if (command === "contrast") {
  const fg = args[1] || "#333333";
  const bg = args[2] || "#ffffff";
  const ratio = calculateContrast(fg, bg);
  const numRatio = parseFloat(ratio);

  console.log(`🎨 Color Contrast Check:`);
  console.log(`   Foreground: ${fg}`);
  console.log(`   Background: ${bg}`);
  console.log(`   ------------------------------------`);
  console.log(`   Contrast Ratio : ${ratio}:1`);
  console.log(`   WCAG AA (4.5:1): ${numRatio >= 4.5 ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`   WCAG AAA (7:1) : ${numRatio >= 7.0 ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`\n💡 Want APCA math & nearest-color auto-fix?`);
  console.log(`👉 Visit: https://a11ykit.site/tools/contrast-checker\n`);
} else if (command === "list") {
  console.log("📚 Available Free Tools in A11yKit:");
  console.log("  1. Contrast Checker (WCAG + APCA)   ➔ https://a11ykit.site/tools/contrast-checker");
  console.log("  2. Color Blind Simulator (8 modes)  ➔ https://a11ykit.site/tools/color-blind-simulator");
  console.log("  3. ARIA Pattern Generator           ➔ https://a11ykit.site/tools/aria-generator");
  console.log("  4. In-Browser URL Scanner           ➔ https://a11ykit.site/tools/url-scanner");
  console.log("  5. Interactive WCAG 2.2 Checklist   ➔ https://a11ykit.site/tools/wcag-checklist");
  console.log("  6. Accessibility Statement Maker    ➔ https://a11ykit.site/tools/accessibility-statement");
  console.log("  7. Top 50 Sites A11y Audit Report   ➔ https://a11ykit.site/accessibility-report\n");
} else {
  console.log("📖 Usage:");
  console.log("   npx a11ykit contrast <fgHex> <bgHex>   Test contrast ratio between two colors");
  console.log("   npx a11ykit list                      List all 15 free web accessibility tools");
  console.log("   npx a11ykit help                      Show this help menu\n");
  console.log("👉 Open full web app: https://a11ykit.site\n");
}
