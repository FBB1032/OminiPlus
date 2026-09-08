/**
 * Universal CSV Export utility for Desktop Dashboard.
 * Formats any array of objects into RFC 4180 compliant CSV and triggers browser download.
 */
export interface CsvColumn<T = any> {
  header: string;
  key: string | ((item: T) => any);
}

export function exportToCsv<T extends Record<string, any>>(
  filename: string,
  rows: T[],
  columns?: CsvColumn<T>[]
) {
  if (!rows || rows.length === 0) {
    alert('No data available to export.');
    return;
  }

  let headers: string[];
  let getVal: (row: T, colIndex: number) => any;

  if (columns && columns.length > 0) {
    headers = columns.map((c) => c.header);
    getVal = (row, colIndex) => {
      const col = columns[colIndex];
      if (typeof col.key === 'function') {
        return col.key(row);
      }
      return (row as any)[col.key];
    };
  } else {
    headers = Object.keys(rows[0]);
    getVal = (row, colIndex) => (row as any)[headers[colIndex]];
  }

  const csvRows: string[] = [
    headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(','),
  ];

  for (const row of rows) {
    const values = headers.map((_, idx) => {
      let val = getVal(row, idx);
      if (val === null || val === undefined) {
        return '""';
      }
      if (typeof val === 'object') {
        val = JSON.stringify(val);
      }
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  const cleanFilename = filename.endsWith('.csv') ? filename.replace(/\.csv$/, '') : filename;

  link.setAttribute('href', url);
  link.setAttribute('download', `${cleanFilename}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
