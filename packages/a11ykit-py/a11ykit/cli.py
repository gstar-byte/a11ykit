import sys
import re

def hex_to_rgb(hex_str):
    hex_clean = hex_str.lstrip("#")
    if len(hex_clean) == 3:
        hex_clean = "".join([c * 2 for c in hex_clean])
    if len(hex_clean) != 6:
        raise ValueError(f"Invalid hex color: {hex_str}")
    return [int(hex_clean[i:i+2], 16) for i in (0, 2, 4)]

def get_luminance(r, g, b):
    def channel(v):
        v = v / 255.0
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)

def get_contrast_ratio(hex1, hex2):
    c1 = hex_to_rgb(hex1)
    c2 = hex_to_rgb(hex2)
    l1 = get_luminance(*c1)
    l2 = get_luminance(*c2)
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)

TOOLS = [
    ("Contrast Checker", "https://a11ykit.site/tools/contrast-checker"),
    ("Color Blind Simulator", "https://a11ykit.site/tools/color-blind-simulator"),
    ("ARIA Generator", "https://a11ykit.site/tools/aria-generator"),
    ("Heading Analyzer", "https://a11ykit.site/tools/heading-analyzer"),
    ("Form Label Checker", "https://a11ykit.site/tools/form-label-checker"),
    ("WCAG 2.2 Checklist", "https://a11ykit.site/tools/wcag-checklist"),
    ("Alt Text Tester", "https://a11ykit.site/tools/alt-text-tester"),
    ("Touch Target Checker", "https://a11ykit.site/tools/touch-target-checker"),
    ("Focus Trap Generator", "https://a11ykit.site/tools/focus-trap-generator"),
    ("Accessibility Audit Report", "https://a11ykit.site/accessibility-report"),
]

def main():
    args = sys.argv[1:]
    if not args or args[0] in ("-h", "--help", "help"):
        print("\n==================================================")
        print("  A11yKit - Free Web Accessibility CLI Toolkit")
        print("  Official Web App: https://a11ykit.site")
        print("==================================================\n")
        print("Usage:")
        print("  a11ykit contrast <color1> <color2>   Check WCAG 2.2 contrast ratio")
        print("  a11ykit list                         List all 15 accessibility tools")
        print("  a11ykit web                          Open official web application\n")
        print("Examples:")
        print("  a11ykit contrast '#2563eb' '#ffffff'")
        print("  a11ykit contrast '#000000' '#ffffff'\n")
        return

    cmd = args[0]
    if cmd == "contrast":
        if len(args) < 3:
            print("Error: Missing colors. Usage: a11ykit contrast <color1> <color2>")
            sys.exit(1)
        c1, c2 = args[1], args[2]
        try:
            ratio = get_contrast_ratio(c1, c2)
            aa_normal = "PASS" if ratio >= 4.5 else "FAIL"
            aa_large = "PASS" if ratio >= 3.0 else "FAIL"
            aaa_normal = "PASS" if ratio >= 7.0 else "FAIL"
            print(f"\n🎨 A11yKit Contrast Results: {c1} vs {c2}")
            print(f"   Contrast Ratio: {ratio:.2f}:1")
            print(f"   - WCAG AA (Normal Text >= 4.5:1): [{aa_normal}]")
            print(f"   - WCAG AA (Large Text >= 3.0:1):  [{aa_large}]")
            print(f"   - WCAG AAA (Normal Text >= 7.0:1): [{aaa_normal}]")
            print(f"   Interactive Tool: https://a11ykit.site/tools/contrast-checker\n")
        except Exception as e:
            print(f"Error calculating contrast: {e}")
            sys.exit(1)
    elif cmd == "list":
        print("\n🛠️  A11yKit - 15 Free Client-Side Accessibility Tools:")
        for name, url in TOOLS:
            print(f"   • {name:28} ➔ {url}")
        print("\n🌐 Visit the complete suite at https://a11ykit.site\n")
    elif cmd == "web":
        print("Opening https://a11ykit.site ...")
        import webbrowser
        webbrowser.open("https://a11ykit.site")
    else:
        print(f"Unknown command '{cmd}'. Run 'a11ykit --help' for usage.")

if __name__ == "__main__":
    main()
