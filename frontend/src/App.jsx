import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SpeechTranslate from "./speech_translate";
import TextTranslate from "./TextTranslate.jsx";
import TextToSpeech from "./TextToSpeech.jsx";

function App() {
 return (
    <div>
      <TextTranslate />
      {/* <TextToSpeech /> */}
    </div>
  );
}

export default App
