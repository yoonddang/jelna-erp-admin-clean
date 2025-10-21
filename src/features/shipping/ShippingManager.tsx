import React, { useState } from "react";
import DataTable from "../../components/DataTable";
import MidMenu, { MidButton } from "./components/MidMenu";
import { downloadExcel, readExcel } from "../../utils/excel";
import { POST_OFFICE_HEADERS } from "../../utils/postOffice";
import { fmtDate } from "../../utils/date";
// 값으로 사용하는 것들만 "일반 import"로
import { mapArrangeRow, mapPaldoRow, mapSmartstoreRow, toPostOfficeTemplateRows, parsePostOfficeResultRow } from "../../utils/mapping";

// 타입은 "type-only import"로
import type { UnifiedRow, Platform } from "../../utils/mapping";


type SortDir = "asc" | "desc";

export default function ShippingManager() {
  const [orders, setOrders] = useState<UnifiedRow[]>([]);
  const [sortBy, setSortBy] = useState<keyof UnifiedRow | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [filters, setFilters] = useState<Partial<Record<keyof UnifiedRow, string>>>({});
  const [activeTab, setActiveTab] = useState("arrangeUpload");

  const onSort = (key: keyof UnifiedRow) => {
    if (sortBy === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortBy(key);
      setSortDir("asc");
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, platform: Platform) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const rows = await readExcel(file);
    const mapped: UnifiedRow[] = rows.map((raw: any) => {
      if (platform === "arrange") return mapArrangeRow(raw);
      if (platform === "paldo") return mapPaldoRow(raw);
      return mapSmartstoreRow(raw);
    });
    setOrders((prev) => [...mapped, ...prev]);
    e.target.value = "";
  };

  const handleDownloadPostOffice = () => {
    if (!orders.length) return alert("데이터가 없습니다.");
    const poRows = toPostOfficeTemplateRows(orders);
    downloadExcel(`우체국_업로드_${fmtDate()}.xls`, poRows, Array.from(POST_OFFICE_HEADERS as readonly string[]));
  };

  const handleUploadPostOfficeResult = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const rows = await readExcel(file);
    const pairs = rows.map(parsePostOfficeResultRow).filter((p: any) => p.internalOrderId || p.trackingNo);
    if (!pairs.length) {
      alert("매핑 가능한 데이터가 없습니다 (자체주문번호/송장번호).");
      e.target.value = "";
      return;
    }
    const map = new Map<string, string>(pairs.map((p: any) => [p.internalOrderId, p.trackingNo]));
    setOrders((prev) => prev.map((r) => ({ ...r, trackingNo: map.get(r.internalOrderId) || r.trackingNo })));
    e.target.value = "";
  };

  const handleDownloadPlatformTracking = () => {
    if (!orders.length) return alert("데이터가 없습니다.");
    const header = ["플랫폼", "서비스주문번호", "송장번호", "자체주문번호", "상품명", "수량"];
    const rows = orders.map((r) => ({
      플랫폼: r.serviceName,
      서비스주문번호: r.platformOrderId,
      송장번호: r.trackingNo,
      자체주문번호: r.internalOrderId,
      상품명: r.productName,
      수량: r.qty,
    }));
    downloadExcel(`플랫폼_송장매핑_${fmtDate()}.xlsx`, rows, header);
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <MidMenu>
        {/* 1~3: 업로드-파일선택 */}
        <MidButton id="arrangeUpload" activeId={activeTab} label="어레인지 업로드-파일선택">
          <input type="file" accept=".xlsx,.xls" onChange={(e) => handleUpload(e, "arrange")} style={{ marginLeft: 8, fontSize: 12 }} />
        </MidButton>
        <MidButton id="paldoUpload" activeId={activeTab} label="팔도감 업로드-파일선택">
          <input type="file" accept=".xlsx,.xls" onChange={(e) => handleUpload(e, "paldo")} style={{ marginLeft: 8, fontSize: 12 }} />
        </MidButton>
        <MidButton id="smartUpload" activeId={activeTab} label="스마트 스토어 업로드-파일선택">
          <input type="file" accept=".xlsx,.xls" onChange={(e) => handleUpload(e, "smartstore")} style={{ marginLeft: 8, fontSize: 12 }} />
        </MidButton>

        {/* 4: 우체국용 다운로드 */}
        <MidButton id="poDownload" activeId={activeTab} label="우체국용 다운로드" onClick={() => { setActiveTab("poDownload"); handleDownloadPostOffice(); }} />

        {/* 5: 우체국용 업로드-파일 선택 */}
        <MidButton id="poUpload" activeId={activeTab} label="우체국용 업로드-파일 선택">
          <input type="file" accept=".xlsx,.xls" onChange={handleUploadPostOfficeResult} style={{ marginLeft: 8, fontSize: 12 }} />
        </MidButton>

        {/* 6: 배송 정보 다운로드 */}
        <MidButton id="dlTracking" activeId={activeTab} label="배송 정보 다운로드" onClick={() => { setActiveTab("dlTracking"); handleDownloadPlatformTracking(); }} />
      </MidMenu>

      

      <div style={{ padding: 12, border: "1px solid #e5e7eb", borderRadius: 12, background: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: "#6b7280" }}>총 {orders.length}건</div>
          <div style={{ fontSize: 11, color: "#9ca3af" }}>필드별 검색 시 매칭 행이 상단/강조됩니다.</div>
        </div>
        <DataTable rows={orders} onSort={onSort} sortBy={sortBy} sortDir={sortDir} filters={filters} setFilters={setFilters} />
      </div>
    </div>
  );
}
