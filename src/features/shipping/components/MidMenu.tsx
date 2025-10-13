import React from "react";

export default function MidMenu(props: { children: React.ReactNode }) {
  return <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{props.children}</div>;
}

export function MidButton(props: { id: string; activeId: string; label: string; onClick?: () => void; children?: React.ReactNode }) {
  const active = props.activeId === props.id;
  return (
    <button
      onClick={props.onClick}
      style={{
        padding: "8px 12px",
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        background: active ? "#000" : "#fff",
        color: active ? "#fff" : "#000",
      }}
    >
      {props.label} {props.children}
    </button>
  );
}
