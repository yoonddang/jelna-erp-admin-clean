import * as XLSX from "xlsx";

export async function readExcel(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array((e.target as FileReader).result as ArrayBuffer);
      const wb = XLSX.read(data, { type: "array" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const json = XLSX.utils.sheet_to_json(ws, { defval: "" });
      resolve(json);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// ✅ [수정] 네 번째 인자로 sheetName을 추가하고 기본값을 "Sheet1"로 설정합니다.
export function downloadExcel(filename: string, rows: any[], headerOrder: string[], sheetName: string = "Sheet1") {
  const ws = XLSX.utils.json_to_sheet(rows, { header: headerOrder });

  // 참고: json_to_sheet에 header 옵션을 사용하면 아래 라인은 보통 필요 없으나, 기존 로직 유지를 위해 남겨둡니다.
  XLSX.utils.sheet_add_aoa(ws, [headerOrder], { origin: "A1" });

  const wb = XLSX.utils.book_new();

  // ✅ [수정] 하드코딩된 "Sheet1" 대신 인자로 받은 sheetName을 사용합니다.
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

  const blob = new Blob([wbout], { type: "application/octet-stream" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
