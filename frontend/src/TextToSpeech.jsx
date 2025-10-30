import React, { useState } from "react";

const TextToSpeech = () => {
  const [text, setText] = useState("");
  const [targetLang, setTargetLang] = useState("hin");
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);

  const handleConvert = async () => {
    if (!text.trim()) {
      alert("Please enter text!");
      return;
    }

    setLoading(true);
    setAudioUrl(null);
    try {
      const res = await fetch("http://127.0.0.1:5000/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, target_lang: targetLang }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to generate speech');
      }
      
      const data = await res.json();

      if (data.audio_file) {
        // Add timestamp to prevent browser caching
        const url = `http://127.0.0.1:5000/output.wav?t=${Date.now()}`;
        setAudioUrl(url);
        
        // Try to load the audio file
        const audio = new Audio(url);
        await new Promise((resolve, reject) => {
          audio.onloadeddata = resolve;
          audio.onerror = () => reject(new Error('Failed to load audio file'));
          setTimeout(() => reject(new Error('Audio loading timeout')), 5000);
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">🔊 Text to Speech</h1>

      <textarea
        placeholder="Enter text to convert..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-80 h-32 bg-gray-800 text-white rounded-lg p-3 mb-4"
      ></textarea>

      <select
        value={targetLang}
        onChange={(e) => setTargetLang(e.target.value)}
        className="bg-gray-800 text-white px-4 py-2 rounded-lg mb-4"
      >
        <option value="eng">English</option>
        <option value="hin">Hindi</option>
        <option value="tel">Telugu</option>
        <option value="tam">Tamil</option>
        <option value="fra">French</option>
        <option value="spa">Spanish</option>
      </select>

      <button
        onClick={handleConvert}
        disabled={loading}
        className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 font-semibold"
      >
        {loading ? "Generating..." : "Convert to Speech"}
      </button>

      {audioUrl && (
        <div className="mt-6">
          <h2 className="text-xl mb-2">🎧 Your Audio:</h2>
          <audio controls src={audioUrl}></audio>
        </div>
      )}
    </div>
  );
};

export default TextToSpeech;
