import Link from "next/link";
import { Accessibility } from "lucide-react";
import { liveTools, comingSoonTools } from "@/lib/tools";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 font-bold text-lg text-slate-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white">
                <Accessibility className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                A11y<span className="text-teal-600">Kit</span>
              </span>
            </div>
            <p className="mt-4 max-w-md text-sm text-slate-600">
              Free accessibility tools for WCAG 2.2 and EAA compliance. Built for
              developers and designers who care about digital inclusion. No
              signup, no tracking, 100% client-side.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Tools</h3>
            <ul className="mt-4 space-y-2">
              {liveTools.map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="text-sm text-slate-600 hover:text-teal-600"
                  >
                    {tool.shortTitle}
                  </Link>
                </li>
              ))}
              {comingSoonTools.slice(0, 3).map((tool) => (
                <li key={tool.slug}>
                  <span className="text-sm text-slate-600">
                    {tool.shortTitle} (soon)
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Resources</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-slate-600 hover:text-teal-600"
                >
                  About
                </Link>
              </li>
              <li>
                <a
                  href="https://www.w3.org/WAI/standards-guidelines/wcag/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-600 hover:text-teal-600"
                >
                  WCAG 2.2 Guidelines ↗
                </a>
              </li>
              <li>
                <a
                  href="https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/disability/european-accessibility-act-eaa_en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-600 hover:text-teal-600"
                >
                  European Accessibility Act ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-8">
          <p className="text-sm text-slate-600">
            © {new Date().getFullYear()} A11yKit. Free accessibility tools for
            everyone. WCAG is a trademark of W3C. EAA refers to Directive (EU)
            2019/882.
          </p>
        </div>
      </div>
    </footer>
  );
}
