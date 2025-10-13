import React from "react";
import { Platform } from "../../utils/mapping";

export default function UploadControls(props: {
  onUpload: (e: React.ChangeEvent<HTMLInputElement>, platform: Platform) => void;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 12 }}>
      <UploadCard title="어레인지 업로드">
        <input type="file" accept=".xlsx,.xls" onChange={(e) => props.onUpload(e, "arrange")} />
      </UploadCard>
      <UploadCard title="팔도감 업로드">
        <input type="file" accept=".xlsx,.xls" onChange={(e) => props.onUpload(e, "paldo")} />
      </UploadCard>
      <UploadCard title="스마트 스토어 업로드">
        <input type="file" accept=".xlsx,.xls" onChange={(e) => props.onUpload(e, "smartstore")} />
      </UploadCard>
    </div>
  );
}

function UploadCard(props: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: 12, border: "1px solid #e5e7eb", borderRadius: 12, background: "#fff", display: "flex", justifyContent: "space-between" }}>
      <div>
        <div style={{ fontWeight: 600 }}>{props.title}</div>
        <div style={{ fontSize: 12, color: "#6b7280" }}>엑셀(.xlsx/.xls)</div>
      </div>
      {props.children}
    </div>
  );
}
