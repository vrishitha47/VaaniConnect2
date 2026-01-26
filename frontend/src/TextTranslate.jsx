import React, { useState } from "react";
import { API_URL } from './config.js';

// Languages supported by SeamlessM4T for all translation modes - 36 languages
// Note: model.generate() validates against these languages even for text-only translation
const languages = [
  { code: 'arb', name: 'Arabic' },
  { code: 'ben', name: 'Bengali' },
  { code: 'cat', name: 'Catalan' },
  { code: 'ces', name: 'Czech' },
  { code: 'cmn', name: 'Chinese (Mandarin)' },
  { code: 'cym', name: 'Welsh' },
  { code: 'dan', name: 'Danish' },
  { code: 'deu', name: 'German' },
  { code: 'eng', name: 'English' },
  { code: 'est', name: 'Estonian' },
  { code: 'fin', name: 'Finnish' },
  { code: 'fra', name: 'French' },
  { code: 'hin', name: 'Hindi' },
  { code: 'ind', name: 'Indonesian' },
  { code: 'ita', name: 'Italian' },
  { code: 'jpn', name: 'Japanese' },
  { code: 'kor', name: 'Korean' },
  { code: 'mlt', name: 'Maltese' },
  { code: 'nld', name: 'Dutch' },
  { code: 'pes', name: 'Persian (Farsi)' },
  { code: 'pol', name: 'Polish' },
  { code: 'por', name: 'Portuguese' },
  { code: 'ron', name: 'Romanian' },
  { code: 'rus', name: 'Russian' },
  { code: 'slk', name: 'Slovak' },
  { code: 'spa', name: 'Spanish' },
  { code: 'swe', name: 'Swedish' },
  { code: 'swh', name: 'Swahili' },
  { code: 'tel', name: 'Telugu' },
  { code: 'tgl', name: 'Tagalog (Filipino)' },
  { code: 'tha', name: 'Thai' },
  { code: 'tur', name: 'Turkish' },
  { code: 'ukr', name: 'Ukrainian' },
  { code: 'urd', name: 'Urdu' },
  { code: 'uzn', name: 'Uzbek (Northern)' },
  { code: 'vie', name: 'Vietnamese' }
];

const TextTranslate = () => {
  const [text, setText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [srcLang, setSrcLang] = useState("eng");
  const [tgtLang, setTgtLang] = useState("hin");
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    if (!text.trim()) {
      alert("Please enter text to translate!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, src_lang: srcLang, target_lang: tgtLang }),
      });
      const data = await res.json();
      setTranslatedText(data.translated_text || "Error during translation");
    } catch (error) {
      console.error("Error:", error);
      setTranslatedText("Server error. Check Flask console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={styles.section}>
      <h2 style={styles.title}>Text to Text Translation</h2>
      <p style={styles.description}>Translate text between languages</p>

      <div style={styles.languageRow}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Source Language</label>
          <select value={srcLang} onChange={(e) => setSrcLang(e.target.value)}>
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </div>

        <div style={styles.arrow}>→</div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Target Language</label>
          <select value={tgtLang} onChange={(e) => setTgtLang(e.target.value)}>
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Enter Text</label>
        <textarea
          placeholder="Type your text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={styles.textarea}
        />
      </div>

      <button onClick={handleTranslate} disabled={loading}>
        {loading ? "Translating..." : "Translate"}
      </button>

      {translatedText && (
        <div style={styles.result}>
          <h3 style={styles.resultTitle}>Translation</h3>
          <p style={styles.resultText}>{translatedText}</p>
        </div>
      )}
    </section>
  );
};

const styles = {
  section: {
    backgroundColor: '#fff',
    border: '1px solid #d0d0d0',
    borderRadius: '8px',
    padding: '1.5rem',
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.4rem',
    color: '#2c3e50'
  },
  description: {
    fontSize: '0.85rem',
    color: '#7f8c8d',
    marginBottom: '1.2rem'
  },
  languageRow: {
    display: 'flex',
    gap: '0.8rem',
    alignItems: 'flex-end',
    marginBottom: '1.2rem'
  },
  inputGroup: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem'
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: '500',
    color: '#2c3e50'
  },
  arrow: {
    fontSize: '1.3rem',
    color: '#7f8c8d',
    marginBottom: '0.3rem'
  },
  textarea: {
    width: '100%',
    height: '100px',
    padding: '0.6rem',
    fontSize: '0.9rem',
    border: '1px solid #d0d0d0',
    borderRadius: '4px',
    resize: 'vertical',
    fontFamily: 'inherit'
  },
  result: {
    marginTop: '1.2rem',
    padding: '0.9rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    border: '1px solid #e0e0e0'
  },
  resultTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: '0.5rem'
  },
  resultText: {
    fontSize: '0.9rem',
    color: '#2c3e50',
    lineHeight: '1.5'
  }
};

export default TextTranslate;
