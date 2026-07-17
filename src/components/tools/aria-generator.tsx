"use client";

import { useState } from "react";
import { Copy, Check, ChevronDown, ChevronRight, Keyboard } from "lucide-react";

interface Pattern {
  id: string;
  name: string;
  description: string;
  html: string;
  keyboard: string[];
  ariaRoles: string[];
  ariaAttributes: string[];
}

const patterns: Pattern[] = [
  {
    id: "tabs",
    name: "Tabs",
    description: "A tabbed interface with tab list and tab panels.",
    html: `<div class="tabs">
  <div role="tablist" aria-label="Settings">
    <button role="tab" id="tab-account" aria-selected="true" aria-controls="panel-account" tabindex="0">Account</button>
    <button role="tab" id="tab-profile" aria-selected="false" aria-controls="panel-profile" tabindex="-1">Profile</button>
    <button role="tab" id="tab-security" aria-selected="false" aria-controls="panel-security" tabindex="-1">Security</button>
  </div>
  <div role="tabpanel" id="panel-account" aria-labelledby="tab-account" tabindex="0">
    <h3>Account Settings</h3>
    <p>Manage your account preferences.</p>
  </div>
  <div role="tabpanel" id="panel-profile" aria-labelledby="tab-profile" tabindex="0" hidden>
    <h3>Profile</h3>
    <p>Edit your profile information.</p>
  </div>
  <div role="tabpanel" id="panel-security" aria-labelledby="tab-security" tabindex="0" hidden>
    <h3>Security</h3>
    <p>Update your security settings.</p>
  </div>
</div>`,
    keyboard: [
      "Tab: Move focus to the selected tab",
      "Left/Right Arrow: Switch between tabs",
      "Home/End: Move to first/last tab",
      "Enter/Space: Activate the focused tab (if not automatic)",
    ],
    ariaRoles: ["tablist", "tab", "tabpanel"],
    ariaAttributes: ["aria-selected", "aria-controls", "aria-labelledby", "tabindex"],
  },
  {
    id: "dialog",
    name: "Dialog / Modal",
    description: "A modal dialog with proper focus trapping and labeling.",
    html: `<div role="dialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="dialog-desc">
  <h2 id="dialog-title">Confirm Action</h2>
  <p id="dialog-desc">Are you sure you want to delete this item? This cannot be undone.</p>
  <div class="dialog-actions">
    <button type="button">Cancel</button>
    <button type="button">Delete</button>
  </div>
</div>`,
    keyboard: [
      "Tab: Move focus within dialog (focus is trapped)",
      "Escape: Close the dialog",
      "Focus should return to the triggering element on close",
    ],
    ariaRoles: ["dialog"],
    ariaAttributes: ["aria-modal", "aria-labelledby", "aria-describedby"],
  },
  {
    id: "alert",
    name: "Alert",
    description: "An alert message that is announced by screen readers.",
    html: `<div role="alert" aria-live="assertive">
  Your changes have been saved successfully.
</div>`,
    keyboard: [
      "No specific keyboard interactions — alerts are announced automatically",
    ],
    ariaRoles: ["alert"],
    ariaAttributes: ["aria-live"],
  },
  {
    id: "menu",
    name: "Menu / Menu Bar",
    description: "A menu widget with menu items and keyboard navigation.",
    html: `<div role="menubar" aria-label="Actions">
  <button role="menuitem" aria-haspopup="false" tabindex="0">File</button>
  <button role="menuitem" aria-haspopup="false" tabindex="-1">Edit</button>
  <button role="menuitem" aria-haspopup="false" tabindex="-1">View</button>
  <button role="menuitem" aria-haspopup="false" tabindex="-1">Help</button>
</div>`,
    keyboard: [
      "Tab: Move into and out of the menu",
      "Left/Right Arrow: Move between menu items",
      "Home/End: Move to first/last item",
      "Enter/Space: Activate the menu item",
    ],
    ariaRoles: ["menubar", "menuitem"],
    ariaAttributes: ["aria-haspopup", "tabindex"],
  },
  {
    id: "combobox",
    name: "Combobox / Autocomplete",
    description: "A combobox with a listbox of suggestions.",
    html: `<div class="combobox">
  <label for="combo-input">Country</label>
  <div role="combobox" aria-expanded="false" aria-haspopup="listbox" aria-owns="combo-list">
    <input type="text" id="combo-input" aria-autocomplete="list" aria-controls="combo-list" aria-activedescendant="" />
  </div>
  <ul role="listbox" id="combo-list" aria-label="Country suggestions">
    <li role="option" id="option-1" aria-selected="false">United States</li>
    <li role="option" id="option-2" aria-selected="false">Canada</li>
    <li role="option" id="option-3" aria-selected="false">Mexico</li>
  </ul>
</div>`,
    keyboard: [
      "Down Arrow: Open listbox and move to first option",
      "Up/Down Arrow: Navigate options",
      "Enter: Select the focused option",
      "Escape: Close the listbox",
      "Type: Filter options",
    ],
    ariaRoles: ["combobox", "listbox", "option"],
    ariaAttributes: ["aria-expanded", "aria-haspopup", "aria-autocomplete", "aria-controls", "aria-activedescendant", "aria-selected"],
  },
  {
    id: "accordion",
    name: "Accordion",
    description: "An accordion with expandable sections.",
    html: `<div class="accordion">
  <h3>
    <button aria-expanded="false" aria-controls="section-1" id="accordion-header-1">
      Section 1
    </button>
  </h3>
  <div id="section-1" role="region" aria-labelledby="accordion-header-1" hidden>
    <p>Content for section 1.</p>
  </div>
  <h3>
    <button aria-expanded="false" aria-controls="section-2" id="accordion-header-2">
      Section 2
    </button>
  </h3>
  <div id="section-2" role="region" aria-labelledby="accordion-header-2" hidden>
    <p>Content for section 2.</p>
  </div>
</div>`,
    keyboard: [
      "Tab: Move between accordion headers",
      "Enter/Space: Toggle the section",
      "Down/Up Arrow: Move between headers (optional)",
    ],
    ariaRoles: ["region"],
    ariaAttributes: ["aria-expanded", "aria-controls", "aria-labelledby"],
  },
  {
    id: "breadcrumb",
    name: "Breadcrumb",
    description: "A breadcrumb navigation trail.",
    html: `<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/products">Products</a></li>
    <li><a href="/products/widgets">Widgets</a></li>
    <li aria-current="page">Widget Pro</li>
  </ol>
</nav>`,
    keyboard: [
      "Tab: Move through breadcrumb links",
      "Enter: Navigate to the linked page",
    ],
    ariaRoles: ["nav"],
    ariaAttributes: ["aria-label", "aria-current"],
  },
  {
    id: "live-region",
    name: "Live Region",
    description: "A live region for dynamic content updates.",
    html: `<!-- For polite announcements (waits for screen reader to pause) -->
<div role="status" aria-live="polite" aria-atomic="true">
  Loading results...
</div>

<!-- For urgent announcements (interrupts screen reader) -->
<div role="alert" aria-live="assertive" aria-atomic="true">
  Error: Connection lost.
</div>`,
    keyboard: [
      "No keyboard interactions — live regions announce content changes automatically",
    ],
    ariaRoles: ["status", "alert"],
    ariaAttributes: ["aria-live", "aria-atomic"],
  },
  {
    id: "tooltip",
    name: "Tooltip",
    description: "A tooltip associated with a focusable element.",
    html: `<button aria-describedby="tooltip-info">
  Help
</button>
<span role="tooltip" id="tooltip-info">
  Click here for more information about this feature.
</span>`,
    keyboard: [
      "Tab: Focus the trigger element to show the tooltip",
      "Escape: Hide the tooltip (optional)",
    ],
    ariaRoles: ["tooltip"],
    ariaAttributes: ["aria-describedby"],
  },
  {
    id: "tree",
    name: "Tree View",
    description: "A hierarchical tree widget with expandable nodes.",
    html: `<div role="tree" aria-label="File Explorer">
  <div role="treeitem" aria-expanded="true" aria-level="1" tabindex="0">
    📁 Documents
    <div role="group">
      <div role="treeitem" aria-expanded="false" aria-level="2" tabindex="-1">
        📁 Projects
      </div>
      <div role="treeitem" aria-level="2" tabindex="-1">
        📄 Resume.pdf
      </div>
    </div>
  </div>
  <div role="treeitem" aria-expanded="false" aria-level="1" tabindex="-1">
    📁 Photos
  </div>
</div>`,
    keyboard: [
      "Up/Down Arrow: Move between tree items",
      "Right Arrow: Expand or move to first child",
      "Left Arrow: Collapse or move to parent",
      "Enter/Space: Activate the tree item",
      "Home/End: Move to first/last item",
    ],
    ariaRoles: ["tree", "treeitem", "group"],
    ariaAttributes: ["aria-expanded", "aria-level", "tabindex"],
  },
  {
    id: "slider",
    name: "Slider",
    description: "A slider control for selecting a value within a range.",
    html: `<div role="group" aria-labelledby="slider-label">
  <label id="slider-label">Volume</label>
  <div
    role="slider"
    tabindex="0"
    aria-valuenow="50"
    aria-valuemin="0"
    aria-valuemax="100"
    aria-valuetext="50 percent"
    aria-labelledby="slider-label"
  ></div>
</div>`,
    keyboard: [
      "Left/Down Arrow: Decrease value by one step",
      "Right/Up Arrow: Increase value by one step",
      "Home: Move to minimum value",
      "End: Move to maximum value",
      "Page Down/Up: Decrease/Increase by larger step",
    ],
    ariaRoles: ["slider", "group"],
    ariaAttributes: ["aria-valuenow", "aria-valuemin", "aria-valuemax", "aria-valuetext", "aria-labelledby", "tabindex"],
  },
  {
    id: "switch",
    name: "Switch",
    description: "A toggle switch (on/off) control.",
    html: `<div class="switch">
  <span id="switch-label">Notifications</span>
  <button
    role="switch"
    aria-checked="false"
    aria-labelledby="switch-label"
    tabindex="0"
  ></button>
</div>`,
    keyboard: [
      "Enter/Space: Toggle the switch",
    ],
    ariaRoles: ["switch"],
    ariaAttributes: ["aria-checked", "aria-labelledby", "tabindex"],
  },
];

export function AriaGenerator() {
  const [selectedId, setSelectedId] = useState(patterns[0].id);
  const [copied, setCopied] = useState(false);
  const [outputFormat, setOutputFormat] = useState<"html" | "jsx">("html");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["html"]));

  const selected = patterns.find((p) => p.id === selectedId)!;

  const htmlToJsx = (html: string): string => {
    return html
      .replace(/\bclass=/g, "className=")
      .replace(/\bfor=/g, "htmlFor=")
      .replace(/\btabindex=/g, "tabIndex=")
      .replace(/\baria-([a-z]+)=/g, (_, attr) => `aria${attr.charAt(0).toUpperCase() + attr.slice(1)}=`)
      .replace(/\brole=/g, "role=");
  };

  const displayCode = outputFormat === "jsx" ? htmlToJsx(selected.html) : selected.html;

  const handleCopy = () => {
    navigator.clipboard.writeText(displayCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
      {/* Pattern list */}
      <div className="space-y-1">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">UI Patterns</h3>
        {patterns.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setSelectedId(p.id)}
            className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition ${
              selectedId === p.id
                ? "bg-teal-50 font-semibold text-teal-800 ring-1 ring-teal-200"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Pattern detail */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{selected.name}</h3>
          <p className="mt-1 text-sm text-slate-600">{selected.description}</p>
        </div>

        {/* ARIA roles & attributes */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">ARIA Roles</h4>
            <div className="flex flex-wrap gap-2">
              {selected.ariaRoles.map((role) => (
                <code key={role} className="rounded bg-teal-100 px-2 py-1 text-xs font-medium text-teal-800">
                  {role}
                </code>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">ARIA Attributes</h4>
            <div className="flex flex-wrap gap-2">
              {selected.ariaAttributes.map((attr) => (
                <code key={attr} className="rounded bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-800">
                  {attr}
                </code>
              ))}
            </div>
          </div>
        </div>

        {/* HTML/JSX code */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => toggleSection("html")}
                className="flex items-center gap-2 text-sm font-semibold text-slate-900"
              >
                {expandedSections.has("html") ? (
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                )}
                Code
              </button>
              <div className="flex rounded-md border border-slate-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOutputFormat("html")}
                  className={`px-2.5 py-1 text-xs font-medium ${
                    outputFormat === "html" ? "bg-teal-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  HTML
                </button>
                <button
                  type="button"
                  onClick={() => setOutputFormat("jsx")}
                  className={`px-2.5 py-1 text-xs font-medium ${
                    outputFormat === "jsx" ? "bg-teal-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  JSX/React
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-md bg-teal-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-500"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" aria-hidden="true" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" /> Copy
                </>
              )}
            </button>
          </div>
          {expandedSections.has("html") && (
            <pre className="overflow-x-auto p-4 text-sm text-slate-800">
              <code>{displayCode}</code>
            </pre>
          )}
        </div>

        {/* Keyboard interactions */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-3">
            <Keyboard className="h-4 w-4 text-teal-700" aria-hidden="true" />
            Keyboard Interactions
          </h4>
          <ul className="space-y-2">
            {selected.keyboard.map((k, i) => (
              <li key={i} className="text-sm text-slate-700">
                <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-700">{k}</code>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
