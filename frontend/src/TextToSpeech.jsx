import React, { useState } from "react";
import { API_URL } from './config.js';

// Languages supported for SPEECH synthesis (TTS and S2S) - 36 languages total
// Based on SeamlessM4T model's speech synthesis capabilities
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

const TextToSpeech = () => {
  const [text, setText] = useState("");
  const [srcLang, setSrcLang] = useState("eng");
  const [targetLang, setTargetLang] = useState("hin");
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioInfo, setAudioInfo] = useState(null);
  const handleConvert = async () => {
    if (!text.trim()) {
      alert("Please enter text to convert!");
      return;
    }
    setLoading(true);
    setAudioUrl(null);
    try {
      console.log("Sending request:", { text, src_lang: srcLang, target_lang: targetLang });

      const res = await fetch(`${API_URL}/text-to-speech`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, src_lang: srcLang, target_lang: targetLang }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to generate speech');
      }

      const data = await res.json();
      console.log("Server response:", data);

      if (data.audio_file) {
        console.log(`Audio duration: ${data.duration}s, file size: ${data.file_size} bytes`);

        // Store audio info
        setAudioInfo({
          duration: data.duration,
          fileSize: data.file_size,
          sampleRate: data.sample_rate
        });

        // Add timestamp to prevent browser caching
        const url = `${API_URL}/output.wav?t=${Date.now()}`;
        setAudioUrl(url);

        // Try to load the audio file
        const audio = new Audio(url);
        await new Promise((resolve, reject) => {
          audio.onloadeddata = () => {
            console.log(`Audio loaded successfully! Duration: ${audio.duration}s`);
            resolve();
          };
          audio.onerror = (e) => {
            console.error("Audio loading error:", e);
            reject(new Error('Failed to load audio file'));
          };
          setTimeout(() => reject(new Error('Audio loading timeout')), 10000);
        });
      } else {
        throw new Error(data.error || 'Speech generation failed!');
      }
    } catch (err) {
      console.error("Error:", err);
      alert(err.message || "Server error! Check Flask console.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <section style={styles.section}>
      <h2 style={styles.title}>Text to Speech Translation</h2>
      <p style={styles.description}>Convert text to speech in another language</p>
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
          <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)}>
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
      <button onClick={handleConvert} disabled={loading}>
        {loading ? "Generating..." : "Generate Speech"}
      </button>
      {audioUrl && (
        <div style={styles.result}>
          <h3 style={styles.resultTitle}>Generated Speech</h3>
          {audioInfo && (
            <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
              <p>Duration: {audioInfo.duration.toFixed(2)}s</p>
              <p>File Size: {(audioInfo.fileSize / 1024).toFixed(2)} KB</p>
              <p>Sample Rate: {audioInfo.sampleRate} Hz</p>
            </div>
          )}
          <audio controls src={audioUrl} style={styles.audio}>
            Your browser does not support audio playback
          </audio>
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
  audio: {
    width: '100%',
    marginTop: '0.5rem'
  }
};
export default TextToSpeech;
