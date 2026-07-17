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
  Globe,
  FileSearch,
  Sparkles,
  Activity,
  type LucideIcon,
} from "lucide-react";

export type ToolCategory =
  | "check"
  | "fix"
  | "generate"
  | "simulate"
  | "monitor";

export interface FAQItem {
  question: string;
  answer: string;
}

export interface HowToStep {
  step: string;
  description: string;
}

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
  faq?: FAQItem[];
  howToUse?: HowToStep[];
  whyItMatters?: string;
}

export const categoryLabels: Record<ToolCategory, string> = {
  check: "Check",
  fix: "Fix",
  generate: "Generate",
  simulate: "Simulate",
  monitor: "Monitor",
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
    whyItMatters: "Color contrast affects readability for users with low vision, color blindness, or situational impairments like bright sunlight. WCAG 2.1 AA requires a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text. Poor contrast is one of the most common WCAG violations found on the web.",
    howToUse: [
      { step: "Enter colors", description: "Type hex values or use the color pickers for foreground and background colors." },
      { step: "Review results", description: "The tool instantly shows the contrast ratio and pass/fail status for WCAG AA and AAA levels." },
      { step: "Adjust if needed", description: "Use the lightness slider or click 'Suggest compliant color' to get a nearest compliant alternative." },
      { step: "Copy CSS", description: "Copy the ready-to-use CSS color values for your stylesheet." },
    ],
    faq: [
      { question: "What is a good contrast ratio?", answer: "WCAG AA requires 4.5:1 for normal text and 3:1 for large text (18pt or 14pt bold). WCAG AAA requires 7:1 for normal text and 4.5:1 for large text. UI components and graphics need at least 3:1 under WCAG 2.1." },
      { question: "What is APCA?", answer: "APCA (Accessible Perceptual Contrast Algorithm) is a proposed WCAG 3.0 contrast model that accounts for how humans actually perceive contrast, including text size and weight. It is more accurate than the current WCAG 2.x ratio but not yet a legal standard." },
      { question: "Does this tool support alpha transparency?", answer: "Yes. Enter an alpha value (0-1) for the foreground color and the tool will compute the effective blended color against the background before calculating the contrast ratio." },
      { question: "Is my data sent to a server?", answer: "No. All calculations happen entirely in your browser. No color values are transmitted or stored." },
    ],
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
    whyItMatters: "WCAG 2.2 is the current W3C recommendation, adding 9 new success criteria over 2.1. An interactive checklist helps you systematically verify each criterion rather than guessing what needs testing. It also serves as documentation of your audit process.",
    howToUse: [
      { step: "Choose a level", description: "Filter by Level A, AA, or AAA depending on your target conformance level." },
      { step: "Review each criterion", description: "Read the plain-language description and click the checkbox when you've verified compliance." },
      { step: "Filter by principle", description: "Use the POUR filter (Perceivable, Operable, Understandable, Robust) to focus on one area at a time." },
      { step: "Export results", description: "Download your checklist as Markdown or JSON for documentation and issue tracking." },
    ],
    faq: [
      { question: "What's the difference between WCAG 2.1 and 2.2?", answer: "WCAG 2.2 adds 9 new success criteria including focus appearance (2.4.11), target size (2.5.8), and accessible authentication (3.3.7). Level AA is still the most commonly required conformance level." },
      { question: "Which WCAG level should I target?", answer: "Level AA is the standard referenced by most laws including the ADA, Section 508, and the European Accessibility Act. Level AAA is ideal for critical content but may not be achievable for all content types." },
      { question: "Does my progress save?", answer: "Yes. Your checklist state is saved in your browser's localStorage. It persists across sessions on the same device. No data is sent to any server." },
      { question: "How many criteria are in WCAG 2.2?", answer: "WCAG 2.2 has 86 success criteria across Levels A (30), AA (50), and AAA (28). Some criteria at higher levels supersede lower-level versions." },
    ],
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
    whyItMatters: "An accessibility statement is a public declaration of your commitment to digital inclusion. The European Accessibility Act requires it for in-scope services. In the US, having one demonstrates good faith effort under the ADA. It gives users a clear channel to report barriers and sets expectations about your conformance level.",
    howToUse: [
      { step: "Choose a template", description: "Select from Basic, Comprehensive, Legal-focused, or Developer-friendly templates." },
      { step: "Fill in organization details", description: "Enter your organization name, website URL, contact information, and conformance level." },
      { step: "Add measures and limitations", description: "Describe accessibility measures you've taken and any known limitations. You can import scan results or use AI to generate content." },
      { step: "Export and publish", description: "Download as HTML, Markdown, or TXT and publish on your website, ideally linked from the footer." },
    ],
    faq: [
      { question: "Is an accessibility statement legally required?", answer: "Under the EU Web Accessibility Directive and European Accessibility Act, yes. In the US, the ADA does not explicitly require one, but having one demonstrates good faith compliance effort and provides users a way to report issues." },
      { question: "Where should I publish my statement?", answer: "Place it in an easily discoverable location, typically linked from your website footer. Use a clear link text like 'Accessibility Statement' — not buried in a privacy policy." },
      { question: "How often should I update it?", answer: "Update your statement whenever you complete a new audit, fix major issues, or at least annually. Always include the date of the last review." },
      { question: "Can I use AI to generate the content?", answer: "Yes. Enter your OpenAI API key and the tool will generate measures and limitations based on your organization info and any scan results you've imported. Always review AI-generated content before publishing." },
      { question: "Is my data private?", answer: "Yes. The statement is generated entirely in your browser. No organization details are sent to our server. When using AI, your API key is used directly from your browser to call OpenAI." },
    ],
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
    whyItMatters: "ARIA (Accessible Rich Internet Applications) attributes bridge the gap between custom widgets and assistive technologies. But misused ARIA does more harm than good — the first rule of ARIA is 'No ARIA is better than bad ARIA.' This tool helps you generate correct, complete ARIA markup following WAI-ARIA 1.2 patterns.",
    howToUse: [
      { step: "Select a pattern", description: "Choose from common UI patterns like tabs, dialogs, menus, alerts, live regions, and more." },
      { step: "Configure attributes", description: "Fill in the form with your element's ID, CSS classes, and ARIA attribute values. Required attributes are marked." },
      { step: "Review the code", description: "The generated HTML or JSX updates in real-time with proper roles, states, and properties." },
      { step: "Copy and paste", description: "Switch between HTML and JSX output, then copy the code into your project." },
    ],
    faq: [
      { question: "When should I use ARIA?", answer: "Use ARIA when semantic HTML alone cannot convey the role, state, or property of a custom widget. If a native HTML element exists (e.g., <button>), use it instead of adding role=\"button\" to a <div>." },
      { question: "What are ARIA live regions?", answer: "Live regions announce dynamic content changes to screen reader users. Use aria-live=\"polite\" for non-critical updates and aria-live=\"assertive\" for urgent changes. This tool supports 4 live region patterns." },
      { question: "What's the difference between HTML and JSX output?", answer: "HTML uses kebab-case attributes (aria-label) while JSX uses camelCase (ariaLabel). The tool lets you toggle between both formats." },
      { question: "Are the generated patterns keyboard-accessible?", answer: "Yes. Each pattern includes the correct tabindex values and keyboard interaction patterns per WAI-ARIA Authoring Practices. The code comments include keyboard guidance." },
    ],
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
    whyItMatters: "Headings are the backbone of page navigation for screen reader users. Users navigate by jumping between headings to understand page structure. Skipped heading levels (e.g., H1 to H3) or multiple H1s break this navigation model. WCAG 2.1 requires logical heading order (1.3.1, 2.4.6).",
    howToUse: [
      { step: "Paste HTML", description: "Paste your full HTML document or a section of markup into the textarea." },
      { step: "View heading tree", description: "The tool visualizes your heading hierarchy as an indented outline." },
      { step: "Review issues", description: "Skipped levels, missing H1s, multiple H1s, and empty headings are flagged." },
      { step: "Fix and re-check", description: "Adjust your HTML and paste again to verify your fixes." },
    ],
    faq: [
      { question: "Can I use multiple H1s on a page?", answer: "While HTML5 allows multiple H1s, best practice is one H1 per page. Multiple H1s can confuse screen reader users who rely on headings for navigation. The W3C recommends a single H1 as the main heading." },
      { question: "Should I use headings for styling?", answer: "No. Headings should reflect document structure, not visual appearance. Use CSS for styling and reserve headings for semantic hierarchy. Using an H3 because it 'looks right' breaks the outline." },
      { question: "What is a heading outline?", answer: "A heading outline is the hierarchical structure created by H1-H6 elements. Screen readers can display this outline to help users navigate. A well-structured outline goes from H1 to H2 to H3 without skipping levels." },
    ],
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
    whyItMatters: "Forms are one of the most common barriers for screen reader users. Unlabeled inputs are announced as 'edit text' or 'blank', making forms impossible to complete. WCAG 2.1 requires accessible labels (3.3.2), proper name-role-value (4.1.2), and error identification (3.3.1).",
    howToUse: [
      { step: "Paste form HTML", description: "Paste your HTML form code including all input, select, and textarea elements." },
      { step: "Review findings", description: "The tool checks for missing labels, improper associations, missing fieldset/legend, and more." },
      { step: "Fix issues", description: "Each issue includes the WCAG criterion and a suggestion for how to fix it." },
    ],
    faq: [
      { question: "What's the difference between label and aria-label?", answer: "A <label> element is the preferred method — it creates a visible label and a programmatic association. aria-label provides an accessible name when a visible label isn't possible, but it doesn't create a visible label." },
      { question: "Do placeholder attributes count as labels?", answer: "No. Placeholders disappear on focus and are not reliable accessible names. WCAG 2.1 does not consider placeholders as sufficient labels (3.3.2)." },
      { question: "When should I use fieldset and legend?", answer: "Use fieldset/legend to group related form controls, such as radio buttons for a single question or a shipping/billing address group. The legend provides a group label that screen readers announce." },
    ],
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
    whyItMatters: "About 1 in 12 men (8%) and 1 in 200 women (0.5%) have some form of color vision deficiency. If your website relies on color alone to convey information, a significant portion of users may miss it. WCAG 2.1 requires that color is not the only means of conveying information (1.4.1).",
    howToUse: [
      { step: "Upload an image", description: "Drag and drop or select an image file (PNG, JPG, GIF, WebP)." },
      { step: "Choose a vision type", description: "Select from 8 types: Protanopia, Protanomaly, Deuteranopia, Deuteranomaly, Tritanopia, Tritanomaly, Achromatopsia, Achromatomaly." },
      { step: "Adjust severity", description: "Use the severity slider to simulate partial color vision loss." },
      { step: "Download or copy CSS", description: "Download the simulated image as PNG or copy CSS filter variables for your stylesheet." },
    ],
    faq: [
      { question: "What is Daltonize?", answer: "Daltonize is a technique that shifts color information lost in a particular type of color blindness into color channels the person can still see. It helps colorblind viewers distinguish colors they would otherwise confuse." },
      { question: "What's the difference between -opia and -omaly?", answer: "'-opia' (e.g., Protanopia) means complete absence of a cone type. '-omaly' (e.g., Protanomaly) means weakened sensitivity. The severity slider lets you simulate the full range from mild anomaly to complete dichromacy." },
      { question: "Does this tool process my image on a server?", answer: "No. All image processing happens in your browser using Canvas. Your images are never uploaded to any server." },
      { question: "What is the CSS variable output?", answer: "The tool generates CSS filter variables that you can apply to any element on your website to simulate color blindness in real-time, without needing to process images." },
    ],
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
    whyItMatters: "Automated accessibility scanning catches a large share of WCAG violations quickly. This tool checks for missing alt text, improper ARIA usage, semantic HTML issues, landmark regions, skip links, and dozens of other requirements — all in your browser, with no data sent to any server.",
    howToUse: [
      { step: "Paste HTML", description: "Paste your HTML snippet or full page source into the textarea." },
      { step: "Review instant results", description: "The tool immediately shows errors, warnings, and passes with WCAG criterion references." },
      { step: "Run axe-core deep scan", description: "Click 'Deep scan with axe-core' for a comprehensive 50+ rule WCAG 2.2 A/AA analysis." },
      { step: "Export results", description: "Download results as JSON, Markdown, or HTML for documentation." },
    ],
    faq: [
      { question: "What's the difference between the instant scan and axe-core scan?", answer: "The instant scan uses our built-in rules for quick feedback on common issues. The axe-core deep scan runs the industry-standard axe-core engine with 50+ WCAG 2.2 A/AA rules for comprehensive coverage." },
      { question: "Can this replace manual testing?", answer: "No. Automated tools catch 20-30% of WCAG issues. Manual testing is needed for keyboard navigation, screen reader compatibility, reading order, and content clarity. Use this tool as a first pass, not a final audit." },
      { question: "Is my HTML sent to a server?", answer: "No. All scanning happens entirely in your browser. Your HTML is never transmitted or stored." },
    ],
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
    whyItMatters: "Screen reader users often navigate by listing all links on a page. If links say 'click here' or 'read more', the list is meaningless. WCAG 2.4.4 requires that link purpose is clear from the link text alone, or from its context.",
    howToUse: [
      { step: "Paste HTML", description: "Paste your HTML containing anchor tags into the textarea." },
      { step: "Review link issues", description: "The tool identifies non-descriptive text, empty links, URL-only links, and duplicate link text." },
      { step: "Fix and re-check", description: "Update your link text and paste again to verify." },
    ],
    faq: [
      { question: "Why is 'click here' bad?", answer: "'Click here' doesn't describe the destination. Screen reader users who skim links hear only the link text — 'click here' tells them nothing. It's also bad for SEO and mobile users who scan content." },
      { question: "Can I use 'read more' if it's in context?", answer: "WCAG allows ambiguous link text if the context makes the purpose clear (2.4.4). However, best practice is to make every link text descriptive on its own, such as 'Read more about our pricing plans'." },
      { question: "What about icon-only links?", answer: "Icon-only links need an aria-label or visually hidden text describing their purpose. A link with only a magnifying glass icon should have aria-label=\"Search\" or similar." },
    ],
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
    whyItMatters: "Keyboard users navigate pages using the Tab key. If the focus order jumps around the page unpredictably, it creates confusion and makes interaction impossible. WCAG 2.4.3 requires that focusable elements receive focus in an order that preserves meaning and operability.",
    howToUse: [
      { step: "Paste HTML", description: "Paste your HTML containing interactive elements (links, buttons, inputs, etc.)." },
      { step: "View focus order", description: "The tool visualizes the tab sequence with numbered badges on each focusable element." },
      { step: "Review issues", description: "Positive tabindex values, focusable non-interactive elements, and illogical order are flagged." },
      { step: "Fix and re-check", description: "Adjust tabindex and DOM order, then paste again to verify." },
    ],
    faq: [
      { question: "What is a logical focus order?", answer: "A logical focus order means elements receive focus in a sequence that matches the visual layout and reading order. Typically this is top-to-bottom, left-to-right. The DOM order should naturally produce this without needing tabindex adjustments." },
      { question: "Should I use tabindex?", answer: "Avoid positive tabindex values (e.g., tabindex=\"1\") as they override natural DOM order and create maintenance problems. Use tabindex=\"0\" to make non-interactive elements focusable, and tabindex=\"-1\" to remove elements from the tab order." },
      { question: "Why are my divs focusable?", answer: "A <div> with a tabindex attribute is focusable. This is sometimes intentional (e.g., for custom widgets) but often accidental. Remove tabindex from non-interactive elements unless you're building a custom component." },
    ],
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
    whyItMatters: "Missing alt text is the single most common WCAG violation. Screen readers skip images without alt attributes entirely, leaving users unaware of important content. WCAG 1.1.1 requires text alternatives for all non-text content. Even decorative images need an explicit empty alt (alt=\"\") to indicate they should be skipped.",
    howToUse: [
      { step: "Paste HTML", description: "Paste your HTML containing <img> elements into the textarea." },
      { step: "Review findings", description: "The tool flags missing alt, empty alt, filename-based alt, and overly long descriptions." },
      { step: "Fix and re-check", description: "Add or improve alt text and paste again to verify." },
    ],
    faq: [
      { question: "When should alt text be empty?", answer: "Use empty alt (alt=\"\") only for purely decorative images that convey no information — spacer GIFs, decorative borders, background-style images. Screen readers will skip these. If the image conveys any meaning, it needs descriptive alt text." },
      { question: "How long should alt text be?", answer: "Aim for 100-125 characters. Focus on the purpose and content of the image in context. For complex images like charts, consider a longer description in the surrounding text or a details element." },
      { question: "Should I use 'Image of' or 'Picture of'?", answer: "No. Screen readers already announce 'image' before the alt text. Starting with 'Image of' is redundant. Describe what the image shows directly, e.g., 'A customer using the mobile app' not 'Image of a customer using the mobile app'." },
    ],
  },
  {
    slug: "url-scanner",
    title: "URL Website Scanner",
    shortTitle: "URL Scanner",
    description:
      "Enter any public URL and get an instant accessibility scan. Checks lang, title, landmarks, headings, alt text, form labels, links, and more.",
    longDescription:
      "Scan any public website by URL. The page HTML is fetched via a CORS proxy and analyzed entirely in your browser. Checks for missing lang, title, skip links, landmark regions, heading hierarchy, image alt text, form labels, link text, button names, iframe titles, tabindex issues, and more — all against WCAG 2.2 criteria.",
    icon: Globe,
    category: "check",
    keywords: ["url", "website", "scanner", "scan", "online", "wcag", "audit", "check"],
    status: "live",
    whyItMatters: "URL scanning is the fastest way to audit a live website. This tool fetches the page HTML via a CORS proxy and runs 20+ WCAG checks entirely in your browser. For comprehensive analysis, use the axe-core deep scan option for 50+ WCAG 2.2 A/AA rules. You can also crawl up to 10 pages on the same domain.",
    howToUse: [
      { step: "Enter URL", description: "Type any public URL (e.g., https://example.com)." },
      { step: "Choose scan mode", description: "Select single-page scan or crawl mode (up to 10 pages on the same domain)." },
      { step: "Review results", description: "Errors, warnings, and passes are displayed with WCAG criterion references." },
      { step: "Run axe-core scan", description: "For deeper analysis, click 'Run axe-core scan' to get 50+ WCAG 2.2 A/AA rule results." },
      { step: "Export results", description: "Download as JSON, Markdown, or HTML, or save to the Accessibility Monitor." },
    ],
    faq: [
      { question: "Why can't the scanner access my site?", answer: "The scanner uses CORS proxies to fetch page HTML. If your site blocks cross-origin requests, the proxy may fail. Try the HTML Scanner instead — paste your page source directly." },
      { question: "Does the scanner run JavaScript?", answer: "No. The scanner fetches the static HTML source. Single-page applications (React, Vue, etc.) may show minimal content. For JS-rendered pages, use the browser extension or paste the rendered HTML." },
      { question: "What's the difference between single-page and crawl mode?", answer: "Single-page scans one URL. Crawl mode follows same-domain links from the starting page, scanning up to 10 pages. Each page is scanned individually with results combined." },
      { question: "Is the scan data sent to a server?", answer: "No. The HTML is fetched via a public CORS proxy but all analysis happens in your browser. No data is stored on our servers." },
    ],
  },
  {
    slug: "pdf-checker",
    title: "PDF Accessibility Checker",
    shortTitle: "PDF Checker",
    description:
      "Upload a PDF and check for tagging, language, title, bookmarks, and extractable text. Uses pdf.js for 100% client-side parsing.",
    longDescription:
      "Check PDF files for accessibility issues using pdf.js, entirely in your browser. Verifies PDF tagging (Marked flag), document language, title metadata, bookmark/outline structure for navigation, and whether pages contain extractable text or are scanned images needing OCR. Supports WCAG and PDF/UA requirements.",
    icon: FileSearch,
    category: "check",
    keywords: ["pdf", "pdf/ua", "tagged pdf", "document", "accessibility", "screen reader", "ocr"],
    status: "live",
    whyItMatters: "PDF accessibility is critical for government, education, and legal documents. Untagged PDFs read as a wall of text to screen readers. WCAG and PDF/UA require proper tagging, document language, title metadata, and navigable structure. The DOJ ADA Title II rule references PDF/UA-1 as the conformance target for digital documents.",
    howToUse: [
      { step: "Upload PDF", description: "Drag and drop or select a PDF file. Processing happens entirely in your browser." },
      { step: "Review checks", description: "The tool checks for tagging, document language, title metadata, bookmarks, and extractable text." },
      { step: "Fix issues", description: "Each issue includes guidance on how to fix it in Adobe Acrobat or your authoring tool." },
    ],
    faq: [
      { question: "What is a tagged PDF?", answer: "A tagged PDF contains a structure tree of headings, lists, tables, and figures that screen readers can navigate. Without tags, a PDF reads as unstructured text. Tags are added in authoring tools like Word, InDesign, or Acrobat." },
      { question: "Does this tool check PDF/UA compliance?", answer: "This tool checks the most critical PDF/UA requirements: tagging, language, title, bookmarks, and text extractability. For a full PDF/UA-1 conformance audit, use a dedicated tool like veraPDF or PAC." },
      { question: "Is my PDF uploaded to a server?", answer: "No. The PDF is parsed entirely in your browser using pdf.js. Your file is never transmitted or stored." },
    ],
  },
  {
    slug: "alt-text-generator",
    title: "AI Alt Text Generator",
    shortTitle: "AI Alt Text",
    description:
      "Upload an image and generate descriptive alt text using AI. Uses your own OpenAI API key — no server involved.",
    longDescription:
      "Generate alt text for images using OpenAI's vision API. Upload an image, enter your API key, and get a concise, WCAG-compliant alt text suggestion. Your API key is used directly from your browser and never sent to our server. Always review AI-generated text before publishing.",
    icon: Sparkles,
    category: "generate",
    keywords: ["alt text", "ai", "openai", "image", "automatic", "generate", "gpt-4o"],
    status: "live",
    whyItMatters: "Writing alt text manually doesn't scale — most websites have hundreds or thousands of images. AI alt text generation helps bridge this gap by producing descriptive, context-aware text alternatives. It supports 30+ languages and batch processing. Always review AI-generated content before publishing.",
    howToUse: [
      { step: "Enter API key", description: "Paste your OpenAI API key. It's used directly from your browser and never sent to our server." },
      { step: "Choose language and detail", description: "Select from 30+ output languages and 3 detail levels (concise, detailed, comprehensive)." },
      { step: "Upload images", description: "Drag and drop or select multiple images for batch generation." },
      { step: "Generate and review", description: "Click generate, then review each alt text. Copy individual results or download all as CSV." },
    ],
    faq: [
      { question: "Do I need to pay for this?", answer: "You need an OpenAI account with API credits. The tool uses your own API key directly, so there's no subscription or platform fee. Each image costs approximately $0.01-0.03 depending on the detail level." },
      { question: "Is my API key safe?", answer: "Your API key is used directly from your browser to call OpenAI's API. It is never sent to our server, stored, or shared. The key is cleared when you close the page." },
      { question: "How many languages are supported?", answer: "30+ languages including English, Chinese, Spanish, French, German, Japanese, Korean, Arabic, Hindi, and more. Select your output language before generating." },
      { question: "Can I generate alt text for multiple images at once?", answer: "Yes. Upload multiple images by dragging them or selecting multiple files. The tool processes them sequentially and shows progress. Download all results as CSV when done." },
    ],
  },
  {
    slug: "accessibility-monitor",
    title: "Accessibility Monitor",
    shortTitle: "Monitor",
    description:
      "Track your website's accessibility score over time. Scan any URL and save results to your browser to monitor progress.",
    longDescription:
      "Monitor your website's accessibility over time. Each scan is saved to your browser's local storage with a timestamp, score, and issue counts. Scan the same URL periodically to track improvements or regressions, with trend indicators showing whether your score went up or down.",
    icon: Activity,
    category: "monitor",
    keywords: ["monitor", "tracking", "history", "score", "progress", "trend", "dashboard"],
    status: "live",
    whyItMatters: "Accessibility is not a one-time fix — it requires ongoing monitoring. New content, design changes, and third-party widgets can introduce barriers at any time. Regular scanning with trend tracking helps you catch regressions early and demonstrate continuous improvement to stakeholders.",
    howToUse: [
      { step: "Scan a URL", description: "Use the URL Scanner to scan any website. Results are automatically saved to the Monitor." },
      { step: "View history", description: "The Monitor dashboard shows all past scans with timestamps, scores, and issue counts." },
      { step: "Track trends", description: "Compare scores over time to see if your accessibility is improving or regressing." },
      { step: "Export data", description: "Download scan history as JSON for reporting and documentation." },
    ],
    faq: [
      { question: "Where is my scan data stored?", answer: "All scan results are stored in your browser's localStorage. No data is sent to any server. This means your data is device-specific and won't sync across devices." },
      { question: "How many scans can I save?", answer: "The tool keeps the 10 most recent scans per URL. Older scans are automatically removed to stay within localStorage limits." },
      { question: "Can I monitor multiple URLs?", answer: "Yes. Scan different URLs and each will appear in your dashboard with its own trend history." },
    ],
  },
];

export const liveTools = tools.filter((t) => t.status === "live");
export const comingSoonTools = tools.filter((t) => t.status === "coming-soon");

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}
