import './App.css'
import TextTranslate from "./TextTranslate.jsx";
import TextToSpeech from "./TextToSpeech.jsx";
import SpeechToSpeech from "./SpeechToSpeech.jsx";

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>VaaniConnect</h1>
        <p>Universal Translation Platform</p>
      </header>

      <div className="features-grid">
        <TextTranslate />
        <TextToSpeech />
        <SpeechToSpeech />
      </div>

      <footer className="app-footer">
        <p>Powered by Meta SeamlessM4T</p>
      </footer>
    </div>
  );
}

export default App
