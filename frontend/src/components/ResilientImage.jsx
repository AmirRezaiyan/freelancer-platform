import { useState } from "react";
import { ImageOff } from "lucide-react";

export default function ResilientImage({ src, alt = "", fallback, style, className, ...props }) {
  const [failedSource, setFailedSource] = useState(null);
  const normalizedSource = typeof src === "string" && src.trim() ? src : null;

  if (!normalizedSource || normalizedSource === failedSource) {
    return (
      <div
        {...props}
        className={className}
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
        style={{
          ...style,
          display: "grid",
          placeItems: "center",
          color: "var(--muted, #68716c)",
        }}
      >
        {fallback || <ImageOff size={20} aria-hidden="true" />}
      </div>
    );
  }

  return (
    <img
      {...props}
      src={normalizedSource}
      alt={alt}
      className={className}
      style={style}
      onError={() => setFailedSource(normalizedSource)}
    />
  );
}