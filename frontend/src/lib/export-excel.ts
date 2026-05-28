import { formatDateTime } from "@/lib/date-time";

export type ExcelCellValue = string | number | boolean | Date | null | undefined;

export interface ExcelColumn<T> {
  header: string;
  accessor: (row: T, index: number) => ExcelCellValue;
  width?: number;
}

interface ExportExcelOptions<T> {
  rows: T[];
  columns: ExcelColumn<T>[];
  filename: string;
  sheetName?: string;
}

export async function exportExcel<T>({
  rows,
  columns,
  filename,
  sheetName = "Sheet1",
}: ExportExcelOptions<T>) {
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  workbook.creator = "Maison Admin";
  workbook.created = new Date();
  workbook.eachSheet((sheet) => {
    sheet.eachRow((row) => {
      row.font = EXCEL_FONT;
    });
  });

  worksheet.views = [{ state: "frozen", ySplit: 4 }];

  worksheet.mergeCells(1, 1, 1, columns.length);
  const titleCell = worksheet.getCell(1, 1);
  titleCell.value = sheetName;
  titleCell.font = { ...EXCEL_FONT, bold: true, size: 16, color: { argb: "FF111827" } };
  titleCell.alignment = { vertical: "middle", horizontal: "left" };

  worksheet.mergeCells(2, 1, 2, columns.length);
  const subtitleCell = worksheet.getCell(2, 1);
  subtitleCell.value = `Xuất lúc ${formatDateTime(new Date(), "")}`;
  subtitleCell.font = { ...EXCEL_FONT, size: 10, color: { argb: "FF6B7280" } };

  worksheet.addRow([]);

  const headerRow = worksheet.getRow(4);
  columns.forEach((column, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = column.header;
    cell.font = { ...EXCEL_FONT, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0F3D2E" },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = BORDER_STYLE;
  });
  headerRow.height = 22;

  rows.forEach((row, rowIndex) => {
    const excelRow = worksheet.addRow(columns.map((column) => normalizeCellValue(column.accessor(row, rowIndex))));
    excelRow.eachCell((cell) => {
      cell.font = EXCEL_FONT;
      cell.border = BORDER_STYLE;
      cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: rowIndex % 2 === 0 ? "FFFFFFFF" : "FFF9FAFB" },
      };
    });
  });

  columns.forEach((column, index) => {
    const maxContentLength = rows.reduce((max, row, rowIndex) => {
      const value = normalizeCellValue(column.accessor(row, rowIndex));
      return Math.max(max, String(value ?? "").length);
    }, column.header.length);

    worksheet.getColumn(index + 1).width =
      column.width ?? Math.min(Math.max(maxContentLength + COLUMN_WIDTH_PADDING, MIN_COLUMN_WIDTH), MAX_COLUMN_WIDTH);
  });

  worksheet.autoFilter = {
    from: { row: 4, column: 1 },
    to: { row: Math.max(4, rows.length + 4), column: columns.length },
  };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer as BlobPart], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const date = new Date().toISOString().slice(0, 10);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${filename}-${date}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function normalizeCellValue(value: ExcelCellValue) {
  return value ?? "";
}

const BORDER_STYLE = {
  top: { style: "thin" as const, color: { argb: "FFE5E7EB" } },
  left: { style: "thin" as const, color: { argb: "FFE5E7EB" } },
  bottom: { style: "thin" as const, color: { argb: "FFE5E7EB" } },
  right: { style: "thin" as const, color: { argb: "FFE5E7EB" } },
};

const EXCEL_FONT = {
  name: "Times New Roman",
  size: 11,
};

const COLUMN_WIDTH_PADDING = 8;
const MIN_COLUMN_WIDTH = 16;
const MAX_COLUMN_WIDTH = 48;
