// src/App.jsx (improved formatting)
import { useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import './index.css';

export default function App() {
  const [context, setContext] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await axios.post('https://triagegenie-backend.onrender.com/analyze', {
        responses: { context },
      });
      setSummary(res.data.summary || 'No summary returned.');
    } catch (err) {
      setSummary('Error analyzing triage data.');
    }
    setLoading(false);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("TriageGenie Summary", 10, 10);
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(summary, 180);
    doc.text(lines, 10, 20);
    doc.save(`triage-report.pdf`);
  };

  const formatSummary = (text) => {
    const sections = text.split(/(?=\n\*\*.+?\*\*)/);
    return sections.map((section, index) => {
      const [rawTitle, ...bullets] = section.trim().split(/\n(?=[-•*]\s)/);
      const title = rawTitle?.replace(/\*\*/g, '').trim();

      return (
        <div key={index} className="styled-section">
          {title && <h3 className="styled-section-title">{title}</h3>}
          <ul className="styled-bullet-list">
            {bullets.map((bullet, i) => (
              <li key={i} className="styled-bullet-item">{bullet.replace(/^[-•*]\s/, '').trim()}</li>
            ))}
          </ul>
        </div>
      );
    });
  };

  return (
    <div className="app-wrapper">
      <div className="card">
        <h1 className="title">TriageGenie</h1>
        <label className="label">Paste Business Context for This Engagement:</label>
        <textarea
          className="textarea"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="E.g. API integration with Salesforce, 50 marketing analysts, customer PII, vendor AWS-hosted, etc."
        />

        <div className="button-group">
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Analyzing...' : 'Generate Summary'}
          </button>
          {summary && (
            <button className="btn-secondary" onClick={downloadPDF}>
              Download PDF
            </button>
          )}
        </div>

        {summary && (
          <div className="summary-box">
            <h2 className="summary-title">AI Summary</h2>
            <div>{formatSummary(summary)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
