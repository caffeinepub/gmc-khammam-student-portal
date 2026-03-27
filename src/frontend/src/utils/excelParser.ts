// Dynamically loads SheetJS from CDN for .xlsx parsing
declare global {
  interface Window {
    XLSX: any;
  }
}

function loadXLSX(): Promise<any> {
  if (window.XLSX) return Promise.resolve(window.XLSX);
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    script.onload = () => resolve(window.XLSX);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export function parseExcelFile<T>(file: File): Promise<T[]> {
  return new Promise((resolve, reject) => {
    loadXLSX()
      .then((XLSX) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            if (!sheetName) {
              resolve([]);
              return;
            }
            const worksheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(worksheet, {
              defval: "",
              raw: false,
            });
            resolve(rows);
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
      })
      .catch(reject);
  });
}
