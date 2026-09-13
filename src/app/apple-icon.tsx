import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f7f6f3",
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="120" height="120">
          <rect x="4" y="16" width="12" height="12" rx="3.5" fill="#d24127" opacity="0.3" />
          <rect x="10" y="10" width="12" height="12" rx="3.5" fill="#d24127" opacity="0.6" />
          <rect x="16" y="4" width="12" height="12" rx="3.5" fill="#d24127" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
