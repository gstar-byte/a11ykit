import {
  Contrast,
  ListChecks,
  FileText,
  Accessibility,
  Heading,
  FormInput,
  Eye,
  Code2,
  Link2,
  MoveRight,
  Image,
  type LucideIcon,
} from "lucide-react";

export type ToolCategory =
  | "check"
  | "fix"
  | "generate"
  | "simulate";

export interface Tool {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  longDescription: string;
  icon: LucideIcon;
  category: ToolCategory;
  keywords: string[];
  status: "live" | "coming-soon";
}

export const categoryLabels: Record<ToolCategory, string> = {
  check: "Check",
  fix: "Fix",
  generate: "Generate",
  simulate: "Simulate",
};

export const tools: Tool[] = [
  {
    slug: "contrast-checker",
    title: "Color Contrast Checker",
    shortTitle: "Contrast Checker",
    description:
      "Check WCAG 2.1/2.2 contrast ratios for text and UI components. Supports AA and AAA levels with live preview.",
    longDescription:
      "Calculate contrast ratios between foreground and background colors. Get instant pass/fail results for WCAG 2.1 AA, WCAG 2.2 AA, and WCAG AAA standards. Preview text in real-time and copy CSS-ready values.",
    icon: Contrast,
    category: "check",
    keywords: ["contrast", "wcag", "color", "accessibility", "ratio", "aa", "aaa"],
    status: "live",
  },
  {
    slug: "wcag-checklist",
    title: "WCAG 2.2 Compliance Checklist",
    shortTitle: "WCAG Checklist",
    description:
      "Interactive checklist with all 86 WCAG 2.2 success criteria. Track progress, filter by level, and export your audit results.",
    longDescription:
      "Work through every WCAG 2.2 success criterion (Levels A, AA, and AAA) with an interactive checklist. Progress saves automatically in your browser. Filter by conformance level or POUR principle, and export results as Markdown or JSON.",
    icon: ListChecks,
    category: "check",
    keywords: ["wcag", "checklist", "compliance", "audit", "2.2", "level aa"],
    status: "live",
  },
  {
    slug: "accessibility-statement",
    title: "Accessibility Statement Generator",
    shortTitle: "Statement Generator",
    description:
      "Generate a compliant accessibility statement for EAA, ADA, and Section 508. Fill in the form, get a ready-to-publish statement.",
    longDescription:
      "Create a legally-aligned accessibility statement covering EAA (EU), ADA (US), and Section 508 requirements. The wizard walks you through organization details, conformance level, known limitations, and contact information, then outputs a ready-to-publish HTML statement.",
    icon: FileText,
    category: "generate",
    keywords: ["accessibility statement", "eaa", "ada", "section 508", "compliance", "declaration"],
    status: "live",
  },
  {
    slug: "aria-generator",
    title: "ARIA Role & Attribute Generator",
    shortTitle: "ARIA Generator",
    description:
      "Generate accessible ARIA roles, states, and properties for common UI patterns. Copy-paste ready HTML with proper ARIA markup.",
    longDescription:
      "Browse a library of common UI patterns (tabs, dialogs, menus, alerts, etc.) and generate properly structured ARIA markup. Each pattern includes the correct roles, states, properties, and keyboard interaction patterns per WAI-ARIA 1.2.",
    icon: Accessibility,
    category: "generate",
    keywords: ["aria", "roles", "attributes", "wai-aria", "screen reader", "html"],
    status: "live",
  },
  {
    slug: "heading-analyzer",
    title: "Heading Structure Analyzer",
    shortTitle: "Heading Analyzer",
    description:
      "Paste your HTML and visualize the heading hierarchy. Detect skipped levels, missing H1s, and structural issues.",
    longDescription:
      "Analyze the heading structure of any HTML document. The tool visualizes your heading tree, flags skipped levels (e.g., H1 to H3), detects missing or multiple H1s, and identifies headings used for styling instead of structure.",
    icon: Heading,
    category: "check",
    keywords: ["heading", "h1", "h2", "structure", "outline", "html", "semantic"],
    status: "live",
  },
  {
    slug: "form-label-checker",
    title: "Form Label Checker",
    shortTitle: "Form Checker",
    description:
      "Check HTML forms for missing labels, improper associations, and other WCAG form accessibility violations.",
    longDescription:
      "Paste your HTML form code and get an instant accessibility audit. The tool checks for missing labels, improper label-input associations, missing fieldset/legend groups, and other WCAG 2.1 form accessibility requirements.",
    icon: FormInput,
    category: "check",
    keywords: ["form", "label", "input", "fieldset", "legend", "wcag", "accessible"],
    status: "live",
  },
  {
    slug: "color-blind-simulator",
    title: "Color Blindness Simulator",
    shortTitle: "Color Blind Simulator",
    description:
      "Simulate how your website or image appears to users with 8 types of color vision deficiencies. Pure client-side Canvas processing.",
    longDescription:
      "Upload an image or paste a URL to see how it appears under 8 types of color vision deficiency: Protanopia, Protanomaly, Deuteranopia, Deuteranomaly, Tritanopia, Tritanomaly, Achromatopsia, and Achromatomaly. Uses the Brettel/Viénot/Mollon algorithm for accurate simulation.",
    icon: Eye,
    category: "simulate",
    keywords: ["color blind", "daltonism", "protanopia", "deuteranopia", "tritanopia", "simulation"],
    status: "live",
  },
  {
    slug: "html-scanner",
    title: "HTML Accessibility Scanner",
    shortTitle: "HTML Scanner",
    description:
      "Paste HTML and get an instant accessibility audit. Checks for missing alt text, ARIA issues, semantic HTML problems, and more.",
    longDescription:
      "Run a comprehensive accessibility scan on any HTML snippet or full page. The tool checks for missing alt text, improper ARIA usage, semantic HTML issues, landmark regions, skip links, and dozens of other WCAG requirements — all in your browser, no data sent to any server.",
    icon: Code2,
    category: "check",
    keywords: ["html", "scanner", "audit", "scan", "alt text", "aria", "semantic", "wcag"],
    status: "live",
  },
  {
    slug: "link-text-checker",
    title: "Link Text Checker",
    shortTitle: "Link Checker",
    description:
      "Find problematic link text like 'click here', 'read more', or empty links. Get suggestions for descriptive, accessible link text.",
    longDescription:
      "Scan your HTML for non-descriptive link text that violates WCAG 2.1 Success Criterion 2.4.4 (Link Purpose). Identifies 'click here', 'read more', 'learn more', empty links, URL-only links, and other common issues, with suggestions for improvement.",
    icon: Link2,
    category: "check",
    keywords: ["link", "anchor", "click here", "read more", "link text", "wcag 2.4.4"],
    status: "live",
  },
  {
    slug: "focus-order-checker",
    title: "Focus Order Checker",
    shortTitle: "Focus Checker",
    description:
      "Visualize the tab order of your HTML elements. Detect illogical focus sequences that confuse keyboard and screen reader users.",
    longDescription:
      "Paste your HTML and see a visual representation of the keyboard focus order. The tool detects elements that are focusable, shows their tab sequence, and flags any illogical ordering that would confuse keyboard-only users per WCAG 2.4.3 (Focus Order).",
    icon: MoveRight,
    category: "check",
    keywords: ["focus", "tab order", "keyboard", "navigation", "wcag 2.4.3", "focusable"],
    status: "live",
  },
  {
    slug: "alt-text-checker",
    title: "Alt Text Checker",
    shortTitle: "Alt Text Checker",
    description:
      "Check images in your HTML for missing, empty, or problematic alt text. Get WCAG-compliant suggestions for improvement.",
    longDescription:
      "Scan HTML for all img elements and evaluate their alt text. Flags missing alt attributes, empty alt text (which may be intentional for decorative images but is often an error), filename-based alt text, and overly long descriptions. Provides WCAG 1.1.1 compliance guidance.",
    icon: Image,
    category: "check",
    keywords: ["alt text", "alt attribute", "image", "img", "wcag 1.1.1", "non-text content"],
    status: "live",
  },
];

export const liveTools = tools.filter((t) => t.status === "live");
export const comingSoonTools = tools.filter((t) => t.status === "coming-soon");

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}
