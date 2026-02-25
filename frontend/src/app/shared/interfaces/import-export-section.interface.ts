export type ImportExportFormat = 'csv' | 'xlsx' | 'xml';

export interface IImportExportSection {
  entityId: string;
  labelKey: string;
  formats: ImportExportFormat[];
  importEndpoint: string;
  exportEndpoint: string;
  exportTypeSuffix?: string;
}
