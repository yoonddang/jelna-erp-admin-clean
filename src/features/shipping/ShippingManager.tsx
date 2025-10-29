import React, { useState } from "react";
import DataTable from "../../components/DataTable";
import MidMenu, { MidButton } from "./components/MidMenu";
import { downloadExcel, readExcel } from "../../utils/excel";
import { POST_OFFICE_HEADERS } from "../../utils/postOffice";
import { fmtDate } from "../../utils/date";
import {
    mapArrangeRow,
    mapPaldoRow,
    mapSmartstoreRow,
    toPostOfficeTemplateRows,
    parsePostOfficeResultRow,
} from "../../utils/mapping";

import type { UnifiedRow, Platform } from "../../utils/mapping";

type SortDir = "asc" | "desc";

export default function ShippingManager() {
    const [orders, setOrders] = useState<UnifiedRow[]>([]);
    const [sortBy, setSortBy] = useState<keyof UnifiedRow | null>(null);
    const [sortDir, setSortDir] = useState<SortDir>("asc");
    const [filters, setFilters] = useState<Partial<Record<keyof UnifiedRow, string>>>({});
    const [activeTab, setActiveTab] = useState("arrangeUpload");

    /** 정렬 핸들러 */
    const onSort = (key: keyof UnifiedRow) => {
        if (sortBy === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
        else {
            setSortBy(key);
            setSortDir("asc");
        }
    };

    /** 플랫폼별 업로드 */
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

    /** 우체국용 다운로드 */
    const handleDownloadPostOffice = () => {
        if (!orders.length) return alert("데이터가 없습니다.");
        const poRows = toPostOfficeTemplateRows(orders);
        downloadExcel(
            `우체국_업로드_${fmtDate()}.xls`,
            poRows,
            Array.from(POST_OFFICE_HEADERS as readonly string[])
        );
    };

    /** ✅ 우체국 결과 업로드: 송장 매핑 + 강조 표시 */
    const handleUploadPostOfficeResult = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const rows = await readExcel(file);
        const pairs = rows
            .map(parsePostOfficeResultRow)
            .filter((p: any) => p.internalOrderId || p.trackingNo);

        if (!pairs.length) {
            alert("매핑 가능한 데이터가 없습니다 (자체주문번호/송장번호).");
            e.target.value = "";
            return;
        }

        const map = new Map<string, string>(
            pairs.map((p: any) => [p.internalOrderId, p.trackingNo])
        );

        // 🔹 새로 매핑된 행은 _highlight 플래그 추가
        setOrders((prev) =>
            prev.map((r) => {
                const newTracking = map.get(r.internalOrderId);
                if (newTracking && newTracking !== r.trackingNo) {
                    return { ...r, trackingNo: newTracking, _highlight: true };
                }
                return { ...r, _highlight: false };
            })
        );

        e.target.value = "";
    };

    /** 플랫폼 송장 매핑 결과 다운로드 */
    const handleDownloadPlatformTracking = () => {
        if (!orders.length) return alert("데이터가 없습니다.");
        const header = [
            "플랫폼",
            "주문번호",
            "개별 주문번호",
            "상품주문번호",
            "배송방법",
            "배송사",
            "택배사",
            "송장번호",
            "상품명",
            "수량",
        ];
        const rows = orders.map((r) => ({
            "플랫폼": r.serviceName,
            "주문번호": r.platformOrderId,
            "개별 주문번호": r.platformProductOrderId,
            "상품주문번호": r.platformProductOrderId,
            "배송방법": "택배",
            "배송사": "우체국택배",
            "택배사": "우체국택배",
            "송장번호": r.trackingNo,
            "상품명": ("어레인지" == r.serviceName ? "" : "[" + r.serviceName + "] - " + r.optionName + " (" + r.qty + "개)"),
            "수량": r.qty,
        }));
        // ✅ [수정] 네 번째 인자로 시트명 "발송처리"를 추가합니다.
        downloadExcel(`플랫폼_송장매핑_${fmtDate()}.xls`, rows, header, "발송처리");
    };

    /** ✅ 배송정보 다운로드 */
    const handleDownloadShippingInfo = () => {
        if (!orders.length) return alert("데이터가 없습니다.");
        const header = [
            "플랫폼",
            "주문번호",
            "개별 주문번호",
            "상품주문번호",
            "상품(표기)",
            "보내는사람 (주문자)",
            "주문자 연락처",
            "우편번호",
            "받는분 주소",
            "받는분 연락처",
            "받는분",
            "상품(포장)",
            "송장번호",
        ];
        const rows = orders
            .filter((r) => r.trackingNo)
            .map((r) => ({
                "플랫폼": r.serviceName,
                "주문번호": r.platformOrderId,
                "개별 주문번호": r.platformProductOrderId,
                "상품주문번호": r.platformProductOrderId,
                "상품(표기)": r.productName,
                "보내는사람 (주문자)": r.buyerName?.trim() !== '' ? r.buyerName : r.receiverName,
                "주문자 연락처": r.buyerPhone,
                "우편번호": r.zipcode,
                "받는분 주소": r.receiverAddress,
                "받는분 연락처": r.receiverPhone,
                "받는분": r.receiverName,
                "상품(포장)": ("어레인지" == r.serviceName ? "" : "[" + r.serviceName + "] - " + r.optionName + " (" + r.qty + "개)"),
                "송장번호": r.trackingNo,
            }));

        if (!rows.length) return alert("송장번호가 매핑된 주문이 없습니다.");
        downloadExcel(`배송정보_${fmtDate()}.xlsx`, rows, header);
    };

    return (
        <div style={{ display: "grid", gap: 16 }}>
            <MidMenu>
                {/* 업로드 */}
                <MidButton id="arrangeUpload" activeId={activeTab} label="어레인지 업로드">
                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={(e) => handleUpload(e, "arrange")}
                        style={{ marginLeft: 8, fontSize: 12 }}
                    />
                </MidButton>
                <MidButton id="paldoUpload" activeId={activeTab} label="팔도감 업로드">
                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={(e) => handleUpload(e, "paldo")}
                        style={{ marginLeft: 8, fontSize: 12 }}
                    />
                </MidButton>
                <MidButton id="smartUpload" activeId={activeTab} label="스마트스토어 업로드">
                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={(e) => handleUpload(e, "smartstore")}
                        style={{ marginLeft: 8, fontSize: 12 }}
                    />
                </MidButton>

                {/* 우체국 관련 */}
                <MidButton
                    id="poDownload"
                    activeId={activeTab}
                    label="우체국용 다운로드"
                    onClick={() => {
                        setActiveTab("poDownload");
                        handleDownloadPostOffice();
                    }}
                />
                <MidButton id="poUpload" activeId={activeTab} label="우체국 결과 업로드">
                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleUploadPostOfficeResult}
                        style={{ marginLeft: 8, fontSize: 12 }}
                    />
                </MidButton>

                {/* 플랫폼/팔도감용 다운로드 */}
                <MidButton
                    id="dlTracking"
                    activeId={activeTab}
                    label="플랫폼 송장 다운로드"
                    onClick={() => {
                        setActiveTab("dlTracking");
                        handleDownloadPlatformTracking();
                    }}
                />
                <MidButton
                    id="dlShipping"
                    activeId={activeTab}
                    label="전체 배송정보 다운로드"
                    onClick={() => {
                        setActiveTab("dlShipping");
                        handleDownloadShippingInfo();
                    }}
                />
            </MidMenu>

            <div
                style={{
                    padding: 12,
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    background: "#fff",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 12,
                    }}
                >
                    <div style={{ fontSize: 12, color: "#6b7280" }}>총 {orders.length}건</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>
                        송장 매핑된 행은 파란색으로 강조됩니다.
                    </div>
                </div>
                <DataTable
                    rows={orders}
                    onSort={onSort}
                    sortBy={sortBy}
                    sortDir={sortDir}
                    filters={filters}
                    setFilters={setFilters}
                />
            </div>
        </div>
    );
}
