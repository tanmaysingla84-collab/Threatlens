import { useState, useCallback } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ScanResultViewer from '../components/ScanResultViewer';

export default function FileAnalysis() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleScan = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    // Manual timeout via AbortController (AbortSignal.timeout not supported everywhere)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    try {
      const fetchResp = await fetch('http://localhost:5000/api/analyze/file', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const responseText = await fetchResp.text();
      let responseJson;
      try {
        responseJson = JSON.parse(responseText);
      } catch {
        throw new Error(`Server returned invalid response (${fetchResp.status})`);
      }

      if (!fetchResp.ok || !responseJson.success) {
        throw new Error(responseJson?.error?.message || `Server error: ${fetchResp.status}`);
      }

      const scanResult = responseJson?.data;
      if (scanResult) {
        setResult(scanResult);
        const history = JSON.parse(localStorage.getItem('threatlens_scans') || '[]');
        history.unshift(scanResult);
        localStorage.setItem('threatlens_scans', JSON.stringify(history));
      } else {
        throw new Error('Analysis report empty');
      }
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        setError('Request timed out. The file may be too large or the server is busy.');
      } else {
        setError(err.message || 'An error occurred during file scanning');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="text-xl font-bold text-text-primary">File Analysis</h1>
        <p className="text-text-muted text-xs">Upload a executable, document, or archive for SHA-256 computation and parallel reputation check</p>
      </div>

      <div className="glass-card p-6 border border-border-subtle">
        <form onSubmit={handleScan} className="space-y-4">
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-xl transition-all duration-150 cursor-pointer
              ${dragActive ? 'border-accent-indigo bg-accent-indigo/5' : 'border-border-default hover:border-border-hover bg-bg-tertiary'}
              ${file ? 'border-accent-blue bg-accent-blue/5' : ''}`}
          >
            <input
              type="file"
              id="file-upload-input"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              onChange={handleFileChange}
            />
            <span className="text-3xl mb-3 text-text-muted">⬡</span>
            {file ? (
              <div className="text-center">
                <p className="text-sm font-semibold text-text-primary truncate max-w-lg">{file.name}</p>
                <p className="text-xs text-text-muted mt-1">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div className="text-center space-y-1">
                <p className="text-sm text-text-secondary">Drag and drop file here, or click to browse</p>
                <p className="text-[11px] text-text-muted">Max file size: 32MB. Executables, PDFs, ZIPs, images supported.</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            {file && (
              <button
                type="button"
                onClick={() => setFile(null)}
                className="px-4 py-2 border border-border-default text-xs font-semibold rounded-xl text-text-secondary hover:bg-bg-cardHover transition-colors"
                disabled={loading}
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              disabled={!file || loading}
              className="px-5 py-2.5 bg-gradient-primary hover:bg-gradient-hover text-white text-xs font-bold rounded-xl shadow-glow-blue disabled:opacity-40 disabled:pointer-events-none transition-all duration-150 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Analyzing...
                </>
              ) : (
                'Scan File'
              )}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-threat-high/10 border border-threat-high/20 rounded-xl text-threat-high text-xs font-mono">
          [ERROR] {error}
        </div>
      )}

      <ScanResultViewer result={result} />
    </div>
  );
}
