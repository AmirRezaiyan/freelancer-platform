import React, { useState } from "react";

export default function TagInput({ label, value, onChange }) {
  const [input, setInput] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && input.trim() !== "") {
      e.preventDefault();
      if (!value.includes(input.trim())) {
        onChange([...value, input.trim()]);
      }
      setInput("");
    }
    if (e.key === "Backspace" && input === "" && value.length > 0) {
      onChange(value.slice(0, value.length - 1));
    }
  };

  const removeTag = (tag) => {
    onChange(value.filter((t) => t !== tag));
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ fontWeight: 600 }}>{label}</label>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
          alignItems: "center",
          border: "1px solid #ccc",
          borderRadius: 8,
          padding: "8px",
          minHeight: 48,
          cursor: "text"
        }}
        onClick={() => document.getElementById(label).focus()}
      >
        {value.map((tag) => (
          <div
            key={tag}
            style={{
              background: "#e0e7ff",
              padding: "6px 10px",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 14
            }}
          >
            {tag}
            <span
              style={{
                cursor: "pointer",
                color: "red",
                marginLeft: 4,
                fontWeight: "bold"
              }}
              onClick={() => removeTag(tag)}
            >
              ×
            </span>
          </div>
        ))}

        <input
          id={label}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="برای افزودن Enter بزن"
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            padding: 6,
            fontSize: 14
          }}
        />
      </div>
    </div>
  );
}
