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

export function downloadExcel(filename: string, rows: any[], headerOrder: string[]) {
  const ws = XLSX.utils.json_to_sheet(rows, { header: headerOrder });
  XLSX.utils.sheet_add_aoa(ws, [headerOrder], { origin: "A1" });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

  const blob = new Blob([wbout], { type: "application/octet-stream" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
