import React, { useState, useRef } from 'react';
import { API_URL } from './config.js';

// Languages supported for SPEECH synthesis (S2S output) - 36 languages total
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
]; const SpeechToSpeech = () => {
    const [srcLang, setSrcLang] = useState('eng');
    const [targetLang, setTargetLang] = useState('hin');
    const [audioFile, setAudioFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [outputAudio, setOutputAudio] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [recordedBlob, setRecordedBlob] = useState(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];
            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };
            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const arrayBuffer = await audioBlob.arrayBuffer();
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                const wavBlob = audioBufferToWav(audioBuffer);
                setRecordedBlob(wavBlob);
                setAudioFile(wavBlob);
                stream.getTracks().forEach(track => track.stop());
            };
            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Recording error:', error);
            alert('Could not access microphone');
        }
    };
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };
    const audioBufferToWav = (audioBuffer) => {
        const numberOfChannels = audioBuffer.numberOfChannels;
        const originalSampleRate = audioBuffer.sampleRate;
        const targetSampleRate = 16000; // SeamlessM4T requires 16kHz
        const format = 1;
        const bitDepth = 16;
        const bytesPerSample = bitDepth / 8;
        const blockAlign = numberOfChannels * bytesPerSample;

        // Get audio data
        const data = [];
        for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
            data.push(audioBuffer.getChannelData(i));
        }

        // Resample to 16kHz if needed
        let resampledData = data;
        let finalLength = data[0].length;

        if (originalSampleRate !== targetSampleRate) {
            const ratio = targetSampleRate / originalSampleRate;
            finalLength = Math.round(data[0].length * ratio);
            resampledData = [];

            for (let channel = 0; channel < numberOfChannels; channel++) {
                const channelData = new Float32Array(finalLength);
                for (let i = 0; i < finalLength; i++) {
                    const srcIndex = i / ratio;
                    const srcIndexFloor = Math.floor(srcIndex);
                    const srcIndexCeil = Math.min(srcIndexFloor + 1, data[channel].length - 1);
                    const t = srcIndex - srcIndexFloor;
                    channelData[i] = data[channel][srcIndexFloor] * (1 - t) + data[channel][srcIndexCeil] * t;
                }
                resampledData.push(channelData);
            }
        }

        // Interleave channels
        const interleaved = new Float32Array(finalLength * numberOfChannels);
        for (let src = 0; src < finalLength; src++) {
            for (let channel = 0; channel < numberOfChannels; channel++) {
                interleaved[src * numberOfChannels + channel] = resampledData[channel][src];
            }
        }
        const dataLength = interleaved.length * bytesPerSample;
        const buffer = new ArrayBuffer(44 + dataLength);
        const view = new DataView(buffer);
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + dataLength, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, format, true);
        view.setUint16(22, numberOfChannels, true);
        view.setUint32(24, targetSampleRate, true); // Use 16kHz
        view.setUint32(28, targetSampleRate * blockAlign, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bitDepth, true);
        writeString(36, 'data');
        view.setUint32(40, dataLength, true);
        let offset = 44;
        for (let i = 0; i < interleaved.length; i++) {
            const sample = Math.max(-1, Math.min(1, interleaved[i]));
            const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
            view.setInt16(offset, int16, true);
            offset += 2;
        }
        return new Blob([buffer], { type: 'audio/wav' });
    };
    const handleConvert = async () => {
        if (!audioFile) {
            alert('Please upload or record audio');
            return;
        }
        setLoading(true);
        setOutputAudio('');
        try {
            const formData = new FormData();
            formData.append('audio', audioFile);
            formData.append('src_lang', srcLang);
            formData.append('target_lang', targetLang);

            console.log('Sending speech-to-speech request:', { src_lang: srcLang, target_lang: targetLang });

            const res = await fetch(`${API_URL}/speech-to-speech`, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to translate speech');
            }

            const data = await res.json();
            console.log('Server response:', data);

            if (data.audio_file || data.audio_url) {
                // Handle new format (audio_file) or old format (audio_url) for backward compatibility
                if (data.duration) {
                    console.log(`Audio duration: ${data.duration}s, file size: ${data.file_size} bytes`);
                }
                if (data.transcribed_text) {
                    console.log(`Transcribed: ${data.transcribed_text}`);
                }
                if (data.translated_text) {
                    console.log(`Translated: ${data.translated_text}`);
                }

                // Add timestamp to prevent browser caching
                const url = data.audio_file
                    ? `${API_URL}/output.wav?t=${Date.now()}`
                    : `${data.audio_url}?t=${Date.now()}`; // Fallback for old format
                setOutputAudio(url);
            } else {
                throw new Error(data.error || 'Speech translation failed!');
            }
        } catch (error) {
            console.error('Speech-to-speech error:', error);
            alert(error.message || 'Server error occurred');
        } finally {
            setLoading(false);
        }
    };
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAudioFile(file);
            setRecordedBlob(null);
        }
    };
    return (
        <section style={styles.section}>
            <h2 style={styles.title}>Speech to Speech Translation</h2>
            <p style={styles.description}>Translate speech to speech in real-time</p>
            <div style={styles.languageRow}>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Source Language</label>
                    <select value={srcLang} onChange={(e) => setSrcLang(e.target.value)}>
                        {languages.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
                    </select>
                </div>
                <div style={styles.arrow}>→</div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Target Language</label>
                    <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)}>
                        {languages.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
                    </select>
                </div>
            </div>
            <div style={styles.inputRow}>
                <button onClick={isRecording ? stopRecording : startRecording} style={{ ...styles.recordButton, backgroundColor: isRecording ? '#e74c3c' : '#2c3e50' }}>
                    {isRecording ? '⏹ Stop Recording' : '🎙 Record Audio'}
                </button>
                <div style={styles.orText}>or</div>
                <label style={styles.fileLabel}>
                    📁 Upload Audio
                    <input type="file" accept="audio/*" onChange={handleFileChange} style={styles.fileInput} />
                </label>
            </div>
            {audioFile && (
                <div style={styles.fileInfo}>
                    {recordedBlob ? '🎤 Recorded audio ready' : `📄 ${audioFile.name}`}
                </div>
            )}
            <button onClick={handleConvert} disabled={loading || !audioFile}>
                {loading ? 'Translating...' : 'Translate Speech'}
            </button>
            {outputAudio && (
                <div style={styles.result}>
                    <h3 style={styles.resultTitle}>Translated Speech</h3>
                    <audio controls src={outputAudio} style={styles.audio}>Your browser does not support audio playback</audio>
                </div>
            )}
        </section>
    );
};
const styles = {
    section: { backgroundColor: '#fff', border: '1px solid #d0d0d0', borderRadius: '8px', padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' },
    title: { fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.4rem', color: '#2c3e50' },
    description: { fontSize: '0.85rem', color: '#7f8c8d', marginBottom: '1.2rem' },
    languageRow: { display: 'flex', gap: '0.8rem', alignItems: 'flex-end', marginBottom: '1.2rem' },
    inputGroup: { flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' },
    label: { fontSize: '0.8rem', fontWeight: '500', color: '#2c3e50' },
    arrow: { fontSize: '1.3rem', color: '#7f8c8d', marginBottom: '0.3rem' },
    inputRow: { display: 'flex', gap: '0.8rem', alignItems: 'center', marginBottom: '1rem' },
    recordButton: { flex: 1, padding: '0.6rem 1rem', fontSize: '0.85rem', fontWeight: '500', borderRadius: '4px', border: 'none', color: '#fff', cursor: 'pointer' },
    orText: { fontSize: '0.85rem', color: '#7f8c8d', fontWeight: '500' },
    fileLabel: { flex: 1, padding: '0.6rem 1rem', fontSize: '0.85rem', fontWeight: '500', borderRadius: '4px', border: '1px solid #2c3e50', backgroundColor: '#2c3e50', color: '#fff', cursor: 'pointer', textAlign: 'center', display: 'block' },
    fileInput: { display: 'none' },
    fileInfo: { padding: '0.65rem', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #e0e0e0', marginBottom: '1rem', fontSize: '0.85rem', color: '#2c3e50' },
    result: { marginTop: '1.2rem', padding: '0.9rem', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #e0e0e0' },
    resultTitle: { fontSize: '0.9rem', fontWeight: '600', color: '#2c3e50', marginBottom: '0.5rem' },
    audio: { width: '100%', marginTop: '0.5rem' }
};
export default SpeechToSpeech;
