"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { X, Shield, ShieldCheck, ChevronDown, ChevronUp, Check, Settings } from "lucide-react";

interface PrivacyBannerProps {
  position?: "left" | "right";
}

export function PrivacyBanner({ position = "right" }: PrivacyBannerProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [lang, setLang] = useState<"en" | "zh">("en");

  // Cookie 状态选择
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: false,
    marketing: false,
  });

  const bannerRef = useRef<HTMLDivElement>(null);

  // 多语言翻译词条
  const t = {
    zh: {
      title: "隐私与 Cookie 设置",
      description: "我们使用本地存储来优化您的体验。本站点的所有无障碍工具均 100% 在您浏览器本地运行，数据绝不会上传至任何服务器，隐私安全无虞。",
      essentialTitle: "必要功能 (必须)",
      essentialDesc: "用以保障核心功能正常运行，如保存您的隐私选择与主题偏好。",
      analyticsTitle: "分析与统计 (可选)",
      analyticsDesc: "帮助我们了解用户如何与网站交互，以提升产品体验（我们目前不使用任何第三方分析）。",
      marketingTitle: "个性化营销 (可选)",
      marketingDesc: "用以提供个性化体验（我们不展示广告，也绝不分享您的任何数据）。",
      acceptAll: "接受全部",
      declineAll: "仅必要",
      customize: "自定义设置",
      saveSettings: "保存我的设置",
      privacyPolicy: "了解更多隐私条款",
      badge: "客户端运行",
      reOpenTooltip: "管理隐私偏好",
    },
    en: {
      title: "Cookie & Privacy Settings",
      description: "We use local storage to optimize your experience. All accessibility tools run 100% client-side in your browser; your data never leaves your device.",
      essentialTitle: "Strictly Necessary (Required)",
      essentialDesc: "Required for core features, such as remembering your privacy preferences.",
      analyticsTitle: "Analytics (Optional)",
      analyticsDesc: "Helps us understand how visitors interact with the site (currently none are used).",
      marketingTitle: "Marketing (Optional)",
      marketingDesc: "Used for personalizing experience (we do not show ads or share any of your data).",
      acceptAll: "Accept All",
      declineAll: "Necessary Only",
      customize: "Customize Preferences",
      saveSettings: "Save My Choices",
      privacyPolicy: "Learn more about our policy",
      badge: "Client-side Safe",
      reOpenTooltip: "Manage Privacy Preferences",
    },
  };

  useEffect(() => {
    setMounted(true);

    // 浏览器语言检测
    const browserLang = navigator.language || "";
    if (browserLang.toLowerCase().includes("zh")) {
      setLang("zh");
    } else {
      setLang("en");
    }

    // 检查是否已经存储过用户的 Cookie 授权偏好
    const consent = localStorage.getItem("a11ykit-cookie-consent");
    if (consent) {
      try {
        const parsed = JSON.parse(consent);
        const isAnalyticsGranted = !!parsed.analytics;
        const isMarketingGranted = !!parsed.marketing;

        setPreferences({
          essential: true,
          analytics: isAnalyticsGranted,
          marketing: isMarketingGranted,
        });

        // 将读取到的偏好同步更新至 Google Analytics 授权状态
        if (typeof window !== "undefined" && (window as any).gtag) {
          (window as any).gtag("consent", "update", {
            analytics_storage: isAnalyticsGranted ? "granted" : "denied",
            ad_storage: isMarketingGranted ? "granted" : "denied",
          });
        }

        setSaved(true);
        setVisible(false);
      } catch (e) {
        // 如果解析出错，视作未授权
        setVisible(true);
        setSaved(false);
      }
    } else {
      setVisible(true);
      setSaved(false);
    }
  }, []);

  // 监听 Escape 键，符合 A11y 规范
  useEffect(() => {
    if (!visible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showPreferences) {
          setShowPreferences(false);
        } else {
          // 如果没有展开设置，则默认按必要配置保存并关闭
          handleSave(false, false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visible, showPreferences]);

  const handleSave = (analyticsVal: boolean, marketingVal: boolean) => {
    const newPrefs = {
      essential: true,
      analytics: analyticsVal,
      marketing: marketingVal,
    };
    setPreferences(newPrefs);
    localStorage.setItem("a11ykit-cookie-consent", JSON.stringify(newPrefs));

    // 用户保存设置时，动态更新 Google Analytics 授权状态
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("consent", "update", {
        analytics_storage: analyticsVal ? "granted" : "denied",
        ad_storage: marketingVal ? "granted" : "denied",
      });
    }

    setSaved(true);
    setVisible(false);
    setShowPreferences(false);
  };

  const handleAcceptAll = () => {
    handleSave(true, true);
  };

  const handleDeclineAll = () => {
    handleSave(false, false);
  };

  const handleCustomSave = () => {
    handleSave(preferences.analytics, preferences.marketing);
  };

  const togglePreference = (type: "analytics" | "marketing") => {
    setPreferences((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  // 重新打开弹窗
  const handleReOpen = () => {
    setVisible(true);
    setSaved(false);
    // 自动将焦点移入弹窗以增强 A11y
    setTimeout(() => {
      bannerRef.current?.focus();
    }, 100);
  };

  if (!mounted) return null;

  const currentLang = t[lang];
  const isRight = position === "right";

  return (
    <>
      {/* 1. 隐私合规弹窗主界面 */}
      {visible && (
        <div
          ref={bannerRef}
          role="dialog"
          aria-modal="false"
          aria-label={currentLang.title}
          tabIndex={-1}
          className={`fixed z-50 max-w-md w-[calc(100%-2rem)] md:w-96 p-5 rounded-2xl shadow-xl transition-all duration-300 ease-out border border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95
            bottom-4 animate-in slide-in-from-bottom-5 duration-300
            ${isRight ? "right-4" : "left-4"}
          `}
        >
          {/* 头部微小气泡徽章 */}
          <div className="flex justify-between items-center mb-3">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-400">
              <ShieldCheck className="h-3 w-3" />
              {currentLang.badge}
            </span>
            <button
              onClick={handleDeclineAll}
              className="p-1 rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              aria-label="Close cookie settings (essential only)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <h3 className="text-base font-bold text-slate-900 dark:text-slate-50 text-left">
            {currentLang.title}
          </h3>
          <p className="mt-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed text-left">
            {currentLang.description}
          </p>

          {/* 自定义首选项面板 (折叠容器) */}
          <div
            className={`overflow-hidden transition-all duration-300 ${
              showPreferences ? "max-h-[300px] mt-4 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              {/* Essential */}
              <div className="flex items-start justify-between gap-3 text-left">
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {currentLang.essentialTitle}
                  </h4>
                  <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-tight">
                    {currentLang.essentialDesc}
                  </p>
                </div>
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked
                    disabled
                    aria-label="Essential storage (always enabled)"
                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 accent-teal-600 cursor-not-allowed opacity-70"
                  />
                </div>
              </div>

              {/* Analytics */}
              <label className="flex items-start justify-between gap-3 text-left cursor-pointer group">
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {currentLang.analyticsTitle}
                  </h4>
                  <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-tight">
                    {currentLang.analyticsDesc}
                  </p>
                </div>
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={() => togglePreference("analytics")}
                    aria-label="Toggle analytics cookies"
                    className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-teal-600 focus:ring-teal-500 dark:bg-slate-800 accent-teal-600 cursor-pointer"
                  />
                </div>
              </label>

              {/* Marketing */}
              <label className="flex items-start justify-between gap-3 text-left cursor-pointer group">
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {currentLang.marketingTitle}
                  </h4>
                  <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-tight">
                    {currentLang.marketingDesc}
                  </p>
                </div>
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={() => togglePreference("marketing")}
                    aria-label="Toggle marketing cookies"
                    className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-teal-600 focus:ring-teal-500 dark:bg-slate-800 accent-teal-600 cursor-pointer"
                  />
                </div>
              </label>
            </div>
          </div>

          {/* 底部按钮栏 */}
          <div className="mt-4 flex flex-wrap gap-2 items-center justify-between">
            <Link
              href="/about"
              className="text-[11px] font-medium text-slate-600 hover:text-teal-600 dark:text-slate-300 dark:hover:text-teal-400 underline underline-offset-2 transition-colors"
            >
              {currentLang.privacyPolicy}
            </Link>

            <div className="flex gap-1.5 ml-auto">
              {!showPreferences ? (
                <>
                  <button
                    onClick={() => setShowPreferences(true)}
                    className="px-2.5 py-1.5 text-xs font-semibold rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
                  >
                    {currentLang.customize}
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-teal-600 hover:bg-teal-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm cursor-pointer"
                  >
                    {currentLang.acceptAll}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowPreferences(false)}
                    className="px-2.5 py-1.5 text-xs font-semibold rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
                  >
                    {lang === "zh" ? "返回" : "Back"}
                  </button>
                  <button
                    onClick={handleCustomSave}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-teal-600 hover:bg-teal-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm cursor-pointer"
                  >
                    {currentLang.saveSettings}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. 悬浮的隐私配置小图标 (唤醒触发按钮) */}
      {saved && !visible && (
        <button
          onClick={handleReOpen}
          className={`fixed z-40 p-3 rounded-full shadow-lg border border-slate-200/80 bg-white/90 dark:border-slate-800/80 dark:bg-slate-900/90 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:scale-110 active:scale-95 hover:shadow-xl transition-all duration-300 group cursor-pointer
            bottom-4
            ${isRight ? "right-4" : "left-4"}
          `}
          aria-label={currentLang.reOpenTooltip}
          title={currentLang.reOpenTooltip}
        >
          <Shield className="h-5 w-5 animate-pulse group-hover:scale-110 group-hover:animate-none transition-transform" />
          <span className="sr-only">{currentLang.reOpenTooltip}</span>
        </button>
      )}
    </>
  );
}
