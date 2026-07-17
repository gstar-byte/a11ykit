import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PrivacyBanner } from "@/components/privacy-banner";
import { ServiceWorkerRegister } from "@/components/sw-register";

/* ── 字体优化：使用 next/font 本地化托管，消除渲染阻塞 ── */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "A11yKit — Free WCAG & EAA Accessibility Tools",
  description:
    "11 free online accessibility tools for WCAG 2.2 and EAA compliance. Contrast checker, WCAG checklist, accessibility statement generator, ARIA generator, and more. No signup, 100% client-side.",
  metadataBase: new URL("https://a11ykit.site"),
  alternates: {
    canonical: "https://a11ykit.site",
  },
  robots: { index: true, follow: true },
  openGraph: {
    title: "A11yKit — Free WCAG & EAA Accessibility Tools",
    description:
      "11 free online accessibility tools for WCAG 2.2 and EAA compliance. No signup, 100% client-side.",
    type: "website",
    url: "https://a11ykit.site",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "A11yKit — Free WCAG & EAA Accessibility Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "A11yKit — Free WCAG & EAA Accessibility Tools",
    description:
      "11 free online accessibility tools for WCAG 2.2 and EAA compliance. No signup, 100% client-side.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover"
        />
        <meta name="theme-color" content="#28151a" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Sitemap 声明（GEO 规范） */}
        <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />

        {/* Structured Data / 结构化数据 (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "A11yKit",
              "url": "https://a11ykit.site",
              "description": "11 free online accessibility tools for WCAG 2.2 and EAA compliance. Contrast checker, WCAG checklist, accessibility statement generator, and more. No signup, 100% client-side.",
              "applicationCategory": "DeveloperApplication",
              "operatingSystem": "All",
              "screenshot": "https://a11ykit.site/og-image.jpg",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "creator": {
                "@type": "Organization",
                "name": "A11yKit Team",
                "url": "https://a11ykit.site"
              }
            })
          }}
        />

        {/* Google tag (gtag.js) */}
        <script
          async
          defer
          src="https://www.googletagmanager.com/gtag/js?id=G-T1R22CCHQK"
        />
        <script
          defer
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              
              // 默认拒绝分析与广告的 Cookie 存储 (GDPR 合规最优解)
              gtag('consent', 'default', {
                'analytics_storage': 'denied',
                'ad_storage': 'denied'
              });
              
              gtag('js', new Date());
              gtag('config', 'G-T1R22CCHQK');
            `
          }}
        />
      </head>
      <body className="min-h-screen w-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        {/* Skip-to-content 无障碍跳转链接 */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-teal-700 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main-content" className="flex-grow w-full">{children}</main>
        <Footer />
        <PrivacyBanner />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
