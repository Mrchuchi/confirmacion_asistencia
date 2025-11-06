import React, { useState, useRef } from 'react';
import { AsistenciaService } from '../services/api';
import { showSuccessAlert, showErrorAlert, showLoadingAlert, closeLoadingAlert } from '../utils/sweetAlert';
import './ImportExcel.css';

interface ImportExcelProps {
  onImportComplete: () => void;
}

interface ImportResult {
  message: string;
  invitados_creados: number;
  acompanantes_creados: number;
}

export const ImportExcel: React.FC<ImportExcelProps> = ({ onImportComplete }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      const errorMsg = 'Por favor selecciona un archivo Excel (.xlsx o .xls)';
      setError(errorMsg);
      showErrorAlert('Archivo inválido', errorMsg);
      return;
    }

    setIsImporting(true);
    setError(null);
    setImportResult(null);
    
    showLoadingAlert('Importando archivo...', 'Por favor espera mientras procesamos el archivo Excel.');

    try {
      const result = await AsistenciaService.importExcel(file);
      setImportResult(result);
      closeLoadingAlert();
      
      showSuccessAlert(
        '¡Importación completada!',
        `Se crearon ${result.invitados_creados} invitados y ${result.acompanantes_creados} acompañantes.`
      );
      
      onImportComplete(); // Recargar la lista de invitados
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al importar el archivo';
      setError(errorMsg);
      closeLoadingAlert();
      showErrorAlert('Error en importación', errorMsg);
    } finally {
      setIsImporting(false);
      // Limpiar el input file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownloadTemplate = async () => {
    setIsDownloading(true);
    setError(null);

    try {
      const blob = await AsistenciaService.downloadTemplate();
      
      // Crear URL para descargar el archivo
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'plantilla_invitados.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al descargar la plantilla');
    } finally {
      setIsDownloading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <div className="import-excel-buttons">
        <button
          onClick={handleDownloadTemplate}
          disabled={isDownloading}
          className="download-template-btn"
          title="Descargar plantilla Excel para importar datos"
        >
          <span className="btn-icon">📄</span>
          {isDownloading ? 'Descargando...' : 'Descargar Plantilla'}
        </button>

        <button
          onClick={triggerFileSelect}
          disabled={isImporting}
          className="import-btn"
          title="Importar invitados desde archivo Excel"
        >
          <span className="btn-icon">📊</span>
          {isImporting ? 'Importando...' : 'Importar Excel'}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Resultado de la importación */}
      {importResult && (
        <div className="import-result success">
          <div className="result-icon">✅</div>
          <div className="result-content">
            <h4>{importResult.message}</h4>
            <div className="import-stats">
              <span className="stat-item">
                <strong>{importResult.invitados_creados}</strong> invitados creados
              </span>
              <span className="stat-item">
                <strong>{importResult.acompanantes_creados}</strong> acompañantes creados
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="import-result error">
          <div className="result-icon">❌</div>
          <div className="result-content">
            <h4>Error en la importación</h4>
            <p>{error}</p>
          </div>
        </div>
      )}
    </>
  );
};
