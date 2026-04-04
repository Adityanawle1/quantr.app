import React from "react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  isLink?: boolean;
}

export function Logo({ 
  className = "", 
  size = "md", 
  showText = true,
  isLink = true 
}: LogoProps) {
  const sizeMap = {
    sm: { text: "text-lg", char: "w-5 h-5", space: "gap-1.5" },
    md: { text: "text-xl", char: "w-6 h-6", space: "gap-2" },
    lg: { text: "text-3xl", char: "w-8 h-8", space: "gap-2.5" },
    xl: { text: "text-5xl", char: "w-12 h-12", space: "gap-3" },
  };

  const { text, space } = sizeMap[size];

  const content = (
    <div className={`flex items-center ${space} ${className} select-none group transition-opacity hover:opacity-90`}>
      <span className={`${text} font-black tracking-widest flex items-center`}>
        <span className="text-t1">Q</span>
        <span className="text-[#2563eb]">U</span>
        {showText && <span className="text-t1">ANTR</span>}
      </span>
    </div>
  );

  if (isLink) {
    return (
      <Link href="/" className="inline-block no-underline">
        {content}
      </Link>
    );
  }

  return content;
}
