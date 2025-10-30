import React, { useState } from "react";

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
      const res = await fetch("http://127.0.0.1:5000/translate", {
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">🌍 Text Translator</h1>

      <div className="flex gap-4 mb-4">
        <select
          value={srcLang}
          onChange={(e) => setSrcLang(e.target.value)}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg"
        >
          <option value="eng">English</option>
          <option value="hin">Hindi</option>
          <option value="tel">Telugu</option>
          <option value="tam">Tamil</option>
          <option value="fra">French</option>
          <option value="spa">Spanish</option>
        </select>

        <select
          value={tgtLang}
          onChange={(e) => setTgtLang(e.target.value)}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg"
        >
          <option value="eng">English</option>
          <option value="hin">Hindi</option>
          <option value="tel">Telugu</option>
          <option value="tam">Tamil</option>
          <option value="fra">French</option>
          <option value="spa">Spanish</option>
        </select>
      </div>

      <textarea
        placeholder="Enter your text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-80 h-32 bg-gray-800 text-white rounded-lg p-3 mb-4"
      ></textarea>

      <button
        onClick={handleTranslate}
        disabled={loading}
        className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 font-semibold"
      >
        {loading ? "Translating..." : "Translate"}
      </button>

      {translatedText && (
        <div className="mt-6 bg-gray-800 p-4 rounded-lg w-80">
          <h2 className="text-xl font-semibold mb-2">🔤 Translation:</h2>
          <p>{translatedText}</p>
        </div>
      )}
    </div>
  );
};

export default TextTranslate;
