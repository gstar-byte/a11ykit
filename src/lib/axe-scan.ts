"use client";

interface AxeIssue {
  type: "error" | "warning" | "info" | "pass";
  message: string;
  wcag?: string;
}

export async function runAxeScan(html: string): Promise<AxeIssue[]> {
  const axe = await import("axe-core");

  const iframe = document.createElement("iframe");
  iframe.style.position = "absolute";
  iframe.style.left = "-9999px";
  iframe.style.width = "1024px";
  iframe.style.height = "768px";
  iframe.setAttribute("aria-hidden", "true");
  iframe.setAttribute("title", "axe scan context");
  document.body.appendChild(iframe);

  try {
    const doc = iframe.contentDocument!;
    doc.open();
    doc.write(html);
    doc.close();

    await new Promise((r) => setTimeout(r, 100));

    const results = await axe.run(iframe.contentDocument!.body, {
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"],
      },
      resultTypes: ["violations", "passes"],
    });

    const issues: AxeIssue[] = [];

    for (const v of results.violations) {
      const wcag = v.tags
        .filter((t) => t.startsWith("wcag"))
        .map((t) => t.replace("wcag2", "2.").replace("wcag", "").replace("a", " A").replace("aa", " AA"))
        .join(", ");
      issues.push({
        type: v.impact === "critical" || v.impact === "serious" ? "error" : "warning",
        message: `${v.help} (${v.nodes.length} element${v.nodes.length > 1 ? "s" : ""} affected)`,
        wcag: wcag || undefined,
      });
    }

    for (const p of results.passes) {
      issues.push({
        type: "pass",
        message: `${p.help} (${p.nodes.length} element${p.nodes.length > 1 ? "s" : ""} passed)`,
      });
    }

    return issues;
  } finally {
    document.body.removeChild(iframe);
  }
}
