"use client";

export function ContactButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event("open-contact-modal"))}
    >
      Contact
    </button>
  );
}
