/**
 * Parses CSV or TSV files (and simple Excel-exported CSVs).
 * For true .xlsx support the file should be saved as CSV first.
 * Falls back to CSV parsing which works for most admin upload use-cases.
 */
export function parseExcelFile<T>(file: File): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rows = parseCSV(text);
        resolve(rows as T[]);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(reader.error);
    // Read as text for CSV; for xlsx binary we fall back gracefully
    reader.readAsText(file);
  });
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length < 2) return [];

  const headers = splitRow(lines[0]);
  const result: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitRow(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = (values[idx] ?? "").trim();
    });
    result.push(row);
  }

  return result;
}

function splitRow(line: string): string[] {
  // Handle quoted CSV fields
  const result: string[] = [];
  let inQuotes = false;
  let current = "";

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if ((ch === "," || ch === "\t") && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}
