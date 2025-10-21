import { useMemo } from "react";
import type { UnifiedRow } from "../utils/mapping";
import "../styles/global.scss";

import * as ReactWindow from 'react-window';
const List = (ReactWindow as any).FixedSizeList;

type SortDir = "asc" | "desc";

export default function DataTable(props: {
  rows: UnifiedRow[];
  onSort: (key: keyof UnifiedRow) => void;
  sortBy: keyof UnifiedRow | null;
  sortDir: SortDir;
  filters: Partial<Record<keyof UnifiedRow, string>>;
  setFilters: (f: Partial<Record<keyof UnifiedRow, string>>) => void;
}) {
  const { rows, onSort, sortBy, sortDir, filters, setFilters } = props;

  const headers = useMemo(
    () => [
      { key: "serviceName", label: "서비스명" },
      { key: "internalOrderId", label: "자체주문번호" },
      { key: "platformOrderId", label: "서비스 주문번호" },
      { key: "orderDatetime", label: "주문일시" },
      { key: "buyerName", label: "주문자" },
      { key: "buyerPhone", label: "주문자 연락처" },
      { key: "receiverName", label: "받는분" },
      { key: "receiverPhone", label: "받는분 연락처" },
      { key: "receiverAddress", label: "받는분 주소" },
      { key: "zipcode", label: "우편번호" },
      { key: "productName", label: "상품명" },
      { key: "qty", label: "수량" },
      { key: "trackingNo", label: "송장번호" },
    ],
    []
  ) as { key: keyof UnifiedRow; label: string }[];

  const VIRTUAL_THRESHOLD = 500;
  const ROW_HEIGHT = 40;
  const TABLE_MAX_HEIGHT = 520;

  const filteredAndSorted = useMemo(() => {
    const hasFilter = Object.values(filters).some((v) => v && String(v).trim() !== "");
    let arr = [...rows];

    if (hasFilter) {
      const matches: UnifiedRow[] = [];
      const others: UnifiedRow[] = [];
      for (const r of arr) {
        const ok = headers.every(({ key }) => {
          const q = String((filters[key] as string) || "").trim().toLowerCase();
          if (!q) return true;
          return String((r as any)[key] || "").toLowerCase().includes(q);
        });
        if (ok) matches.push(r);
        else others.push(r);
      }
      arr = [...matches, ...others];
    }

    if (sortBy) {
      const dir = sortDir === "desc" ? -1 : 1;
      arr.sort((a: any, b: any) => {
        const av = a[sortBy];
        const bv = b[sortBy];
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
        return String(av).localeCompare(String(bv)) * dir;
      });
    }
    return arr;
  }, [rows, filters, sortBy, sortDir, headers]);

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead className="data-thead">
          <tr>
            {headers.map((h) => (
              <th key={h.key} className="data-th">
                <button onClick={() => onSort(h.key)} className="sort-btn">
                  {h.label}
                  {sortBy === h.key && <span className="sort-caret">{sortDir === "asc" ? "▲" : "▼"}</span>}
                </button>
                <div>
                  <input
                    placeholder={`${h.label} 검색`}
                    value={(filters[h.key] as string) || ""}
                    onChange={(e) => setFilters({ ...filters, [h.key]: e.target.value })}
                    style={{ width: "100%", marginTop: 6, fontSize: 11, padding: "4px 6px" }}
                  />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
  {filteredAndSorted.length <= VIRTUAL_THRESHOLD ? (
    filteredAndSorted.map((r, idx) => {
      const isMatch = Object.entries(filters).some(
        ([k, v]) => v && String((r as any)[k] || "").toLowerCase().includes(String(v).toLowerCase())
      );
      return (
        <tr key={r.internalOrderId + "_" + idx} className={isMatch ? "row-match" : undefined}>
          {headers.map((h) => (
            <td key={h.key} className="data-td">
              {String((r as any)[h.key] == null ? "" : (r as any)[h.key])}
            </td>
          ))}
        </tr>
      );
    })
  ) : (
    <tr>
      <td colSpan={headers.length} style={{ padding: 0 }}>
        <div style={{ height: TABLE_MAX_HEIGHT, overflow: "auto" }}>
          <List
            height={TABLE_MAX_HEIGHT}
            itemCount={filteredAndSorted.length}
            itemSize={ROW_HEIGHT}
            width={"100%"}
          >
            {({ index, style }) => {
              const r = filteredAndSorted[index];
              const isMatch = Object.entries(filters).some(
                ([k, v]) => v && String((r as any)[k] || "").toLowerCase().includes(String(v).toLowerCase())
              );
              return (
                <div style={style}>
                  <table className="data-table">
                    <tbody>
                      <tr className={isMatch ? "row-match" : undefined}>
                        {headers.map((h) => (
                          <td key={h.key} className="data-td">
                            {String((r as any)[h.key] == null ? "" : (r as any)[h.key])}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            }}
          </List>
        </div>
      </td>
    </tr>
  )}
</tbody>

      </table>
    </div>
  );
}
