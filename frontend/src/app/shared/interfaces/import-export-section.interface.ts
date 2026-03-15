export type ImportExportFormat = 'csv' | 'xlsx' | 'xml';

export interface IImportResult {
  created: number;
  invalidRows: number[];
}

export interface IImportExportSection {
  entityId: string;
  labelKey: string;
  formats: ImportExportFormat[];
  importEndpoint: string;
  exportEndpoint: string;
  exportTypeSuffix?: string;
}
