"use client";

export function ContactButton({
  className,
  onClick,
  children = "Contact",
}: {
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        window.dispatchEvent(new Event("open-contact-modal"));
        onClick?.();
      }}
    >
      {children}
    </button>
  );
}
