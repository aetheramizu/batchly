import type { SVGProps } from "react";

export function LogoMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      className={className}
      {...props}
    >
      <rect x="4" y="16" width="12" height="12" rx="3.5" fill="currentColor" opacity="0.3" />
      <rect x="10" y="10" width="12" height="12" rx="3.5" fill="currentColor" opacity="0.6" />
      <rect x="16" y="4" width="12" height="12" rx="3.5" fill="currentColor" />
    </svg>
  );
}
