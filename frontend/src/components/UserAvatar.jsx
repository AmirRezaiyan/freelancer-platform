import React from "react";

export default function UserAvatar({ src, size = 40, alt = "user", onClick }) {
  const style = {
    width: size,
    height: size,
    borderRadius: "50%",
    objectFit: "cover",
    display: "inline-block",
    background: "#0b0b0d",
    border: "2px solid rgba(255,255,255,0.04)",
    cursor: onClick ? "pointer" : "default",
  };

  const placeholder = (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="12" fill="#111827"/>
      <path d="M12 12c1.933 0 3.5-1.567 3.5-3.5S13.933 5 12 5 8.5 6.567 8.5 8.5 10.067 12 12 12z" fill="#374151"/>
      <path d="M4 19c0-3.866 3.582-7 8-7s8 3.134 8 7v1H4v-1z" fill="#374151"/>
    </svg>
  );

  if (src) {
    return <img src={src} alt={alt} style={style} onClick={onClick} />;
  }
  return <div style={{ ...style, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClick}>{placeholder}</div>;
}
