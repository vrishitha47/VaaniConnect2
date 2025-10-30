from flask import Flask, request, jsonify,send_from_directory
from transformers import AutoProcessor, SeamlessM4TModel
import torch
import io
from flask_cors import CORS
from pydub import AudioSegment
import soundfile as sf
import os

# Set ffmpeg path
AudioSegment.converter = "D:\\ffmpeg-8.0-essentials_build\\bin\\ffmpeg.exe"
AudioSegment.ffmpeg = "D:\\ffmpeg-8.0-essentials_build\\bin\\ffmpeg.exe"
AudioSegment.ffprobe ="D:\\ffmpeg-8.0-essentials_build\\bin\\ffprobe.exe"

app = Flask(__name__)
CORS(app)  # Allow frontend access

print("Loading model... this may take a few minutes ⏳")
model_id = "facebook/hf-seamless-m4t-medium"
processor = AutoProcessor.from_pretrained(model_id)
model = SeamlessM4TModel.from_pretrained(model_id)
print("✅ Model loaded successfully!")


@app.route("/")
def home():
    return "🌐 VaaniConnect Backend is Running!"


@app.route("/translate", methods=["POST"])
def translate_text():
    data = request.get_json()
    text = data.get("text")
    target_lang = data.get("target_lang")

    if not text or not target_lang:
        return jsonify({"error": "Missing 'text' or 'target_lang'"}), 400

    src_lang = data.get("src_lang", "eng")
    inputs = processor(text=text, src_lang=src_lang, return_tensors="pt")

   

    with torch.no_grad():
        output_tokens = model.generate(**inputs, tgt_lang=target_lang, generate_speech=False)

    sequences = output_tokens.sequences if hasattr(output_tokens, "sequences") else output_tokens
    translated_text = processor.decode(sequences[0], skip_special_tokens=True)

    return jsonify({"translated_text": translated_text})


@app.route("/speech-to-text", methods=["POST"])
def speech_to_text():
    if "file" not in request.files:
        return jsonify({"error": "No audio file uploaded"}), 400

    audio_file = request.files["file"]
    audio_bytes = io.BytesIO(audio_file.read())

    # ✅ Convert any format (WebM/OGG/MP3) → WAV
    try:
        audio = AudioSegment.from_file(audio_bytes)
        wav_bytes = io.BytesIO()
        audio.export(wav_bytes, format="wav")
        wav_bytes.seek(0)
        waveform, sample_rate = sf.read(wav_bytes)
    except Exception as e:
        return jsonify({"error": f"Audio conversion failed: {e}"}), 500

    # Generate transcription
    inputs = processor(audios=waveform, sampling_rate=sample_rate, return_tensors="pt")
    with torch.no_grad():
        output_tokens = model.generate(**inputs, tgt_lang="eng", generate_speech=False)

    sequences = output_tokens.sequences if hasattr(output_tokens, "sequences") else output_tokens
    transcription = processor.decode(sequences[0], skip_special_tokens=True)

    return jsonify({"transcribed_text": transcription})


@app.route("/text-to-speech", methods=["POST"])
def text_to_speech():
    data = request.get_json()
    text = data.get("text")
    target_lang = data.get("target_lang")

    if not text or not target_lang:
        return jsonify({"error": "Missing 'text' or 'target_lang'"}), 400

    try:
        inputs = processor(text=text, src_lang="eng", return_tensors="pt")

        with torch.no_grad():
            output = model.generate(**inputs, tgt_lang=target_lang, generate_speech=True)

        # Handle tuple or object output
        if isinstance(output, tuple):
            audio_waveform, sample_rate = output
        else:
            audio_waveform = output.waveform[0].cpu().numpy()
            sample_rate = output.sampling_rate

        # Convert to numpy if not already
        if not isinstance(audio_waveform, torch.Tensor):
            import numpy as np
            audio_waveform = np.array(audio_waveform)

        # Save the WAV file
        audio_path = "output.wav"
        sf.write(audio_path, audio_waveform, sample_rate)

        return jsonify({"message": "Speech generated", "audio_file": "output.wav"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route('/output.wav')
def serve_audio():
    return send_from_directory(os.getcwd(), 'output.wav')

if __name__ == "__main__":
    app.run(debug=False)
