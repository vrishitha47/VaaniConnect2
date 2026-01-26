from flask import Flask, request, jsonify, send_from_directory, send_file
from transformers import AutoProcessor, SeamlessM4TModel
import torch
import io
from flask_cors import CORS
import soundfile as sf
import os
import numpy as np
import wave
import audioread
import uuid
from pathlib import Path

app = Flask(__name__)

# Configure CORS for production
cors_origins = os.getenv('CORS_ORIGINS', '*')
if cors_origins != '*':
    # Split multiple origins by comma if provided
    origins_list = [origin.strip() for origin in cors_origins.split(',')]
    CORS(app, resources={r"/*": {"origins": origins_list}})
else:
    # Allow all origins in development
    CORS(app)

# Create audio outputs directory
AUDIO_OUTPUT_DIR = Path(os.getcwd()) / "audio_outputs"
AUDIO_OUTPUT_DIR.mkdir(exist_ok=True)

print("Loading model... this may take a few minutes ⏳")
model_id = "facebook/hf-seamless-m4t-medium"
processor = AutoProcessor.from_pretrained(model_id)

# Optimization: Load in float16 to save memory (Render free tier is VERY tight)
try:
    model = SeamlessM4TModel.from_pretrained(
        model_id, 
        torch_dtype=torch.float16,
        low_cpu_mem_usage=True
    )
    print("✅ Model loaded successfully in float16!")
except Exception as e:
    print(f"⚠️ float16 load failed, falling back to default: {e}")
    model = SeamlessM4TModel.from_pretrained(model_id)
    print("✅ Model loaded successfully (default precision)!")


def convert_audio_to_wav(audio_bytes):
    """Convert any audio format to WAV using soundfile, wave, or audioread as fallback"""
    try:
        # Try soundfile first
        waveform, sample_rate = sf.read(io.BytesIO(audio_bytes))
        return waveform, sample_rate
    except Exception as e:
        print(f"soundfile failed: {e}, trying wave...")
        try:
            # Try wave module
            with wave.open(io.BytesIO(audio_bytes), 'rb') as wav_file:
                sample_rate = wav_file.getframerate()
                frames = wav_file.readframes(wav_file.getnframes())
                waveform = np.frombuffer(frames, dtype=np.int16).astype(np.float32) / 32768.0
                return waveform, sample_rate
        except Exception as e:
            print(f"wave failed: {e}, trying audioread...")
            try:
                # Try audioread as last resort
                with audioread.audio_open(io.BytesIO(audio_bytes)) as audio_file:
                    sample_rate = audio_file.samplerate
                    waveform = []
                    for buf in audio_file:
                        waveform.append(np.frombuffer(buf, dtype=np.int16).astype(np.float32) / 32768.0)
                    waveform = np.concatenate(waveform)
                    return waveform, sample_rate
            except Exception as e:
                raise Exception(f"All audio conversion methods failed: {e}")


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
    
    try:
        inputs = processor(text=text, src_lang=src_lang, return_tensors="pt")
        
        with torch.no_grad():
            output_tokens = model.generate(
                **inputs,
                tgt_lang=target_lang,
                generate_speech=False,
                num_beams=5,
                max_length=256
            )

        # Decode the output
        if hasattr(output_tokens, 'sequences'):
            sequences = output_tokens.sequences
        else:
            sequences = output_tokens
            
        translated_text = processor.tokenizer.batch_decode(sequences, skip_special_tokens=True)[0]

        return jsonify({"translated_text": translated_text})
        
    except Exception as e:
        print(f"Error in text translation: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/speech-to-text", methods=["POST"])
def speech_to_text():
    if "file" not in request.files:
        return jsonify({"error": "No audio file uploaded"}), 400

    audio_file = request.files["file"]
    src_lang = request.form.get("src_lang", "eng")
    
    try:
        audio_bytes = audio_file.read()
        waveform, sample_rate = convert_audio_to_wav(audio_bytes)
    except Exception as e:
        return jsonify({"error": f"Audio conversion failed: {e}"}), 500

    # Generate transcription with source language (using 'audio' instead of deprecated 'audios')
    inputs = processor(audio=waveform, src_lang=src_lang, sampling_rate=sample_rate, return_tensors="pt")
    with torch.no_grad():
        output_tokens = model.generate(**inputs, tgt_lang="eng", generate_speech=False)

    sequences = output_tokens.sequences if hasattr(output_tokens, "sequences") else output_tokens
    transcription = processor.tokenizer.batch_decode(sequences, skip_special_tokens=True)[0]

    return jsonify({"transcribed_text": transcription})


@app.route("/text-to-speech", methods=["POST"])
def text_to_speech():
    """Text-to-Speech Generation (with optional translation)"""
    try:
        data = request.get_json()
        text = data.get("text")
        target_lang = data.get("target_lang")
        src_lang = data.get("src_lang", "eng")

        if not text or not target_lang:
            return jsonify({"error": "Missing 'text' or 'target_lang'"}), 400

        print(f"🔊 Generating speech: '{text[:50]}...' in {target_lang}")
        print(f"   Source language: {src_lang}")
        print(f"   Target language: {target_lang}")

        # Step 1: If source and target languages are different, translate first
        if src_lang != target_lang:
            print(f"   Step 1: Translating text from {src_lang} to {target_lang}...")
            inputs_translate = processor(text=text, src_lang=src_lang, return_tensors="pt")
            
            with torch.no_grad():
                output_tokens = model.generate(
                    **inputs_translate,
                    tgt_lang=target_lang,
                    generate_speech=False  # Text only
                )
                
                # Handle the output - might have .sequences attribute
                if hasattr(output_tokens, 'sequences'):
                    sequences = output_tokens.sequences
                else:
                    sequences = output_tokens
                
                # Decode using tokenizer
                translated_text = processor.tokenizer.batch_decode(sequences, skip_special_tokens=True)[0]
            
            print(f"   Translated text: '{translated_text[:50]}...'")
            # Now use translated text for speech
            text_for_speech = translated_text
            lang_for_speech = target_lang
        else:
            text_for_speech = text
            lang_for_speech = src_lang
        
        # Step 2: Generate speech in the target language
        print(f"   Step 2: Generating speech in {lang_for_speech}...")
        inputs_speech = processor(text=text_for_speech, src_lang=lang_for_speech, return_tensors="pt")
        
        print(f"   Input IDs shape: {inputs_speech['input_ids'].shape}")
        print(f"   Number of tokens: {inputs_speech['input_ids'].shape[1]}")

        # Generate speech
        with torch.no_grad():
            outputs = model.generate(
                **inputs_speech,
                tgt_lang=lang_for_speech,
                generate_speech=True,
                return_intermediate_token_ids=False
            )
            
            # Extract audio - SeamlessM4T returns (audio_waveform,) or just audio_waveform
            if isinstance(outputs, tuple) and len(outputs) > 0:
                audio_array_from_text = outputs[0].cpu().squeeze().numpy()
            else:
                audio_array_from_text = outputs.cpu().squeeze().numpy()
            
            sample_rate = 16000  # SeamlessM4T uses 16kHz

        print(f"✅ Generated audio shape: {audio_array_from_text.shape}")
        print(f"   Sample rate: {sample_rate}Hz")
        print(f"   Duration: {len(audio_array_from_text) / sample_rate:.2f} seconds")
        print(f"   Total samples: {len(audio_array_from_text)}")

        # Check if audio is too short
        if len(audio_array_from_text) < sample_rate * 0.5:  # Less than 0.5 seconds
            print(f"⚠️  WARNING: Generated audio is suspiciously short!")
            print(f"   Text: '{text}'")
            print(f"   Audio duration: {len(audio_array_from_text) / sample_rate:.2f}s")

        # Save audio file
        audio_path = AUDIO_OUTPUT_DIR / "output.wav"
        
        # Ensure proper format
        audio_data = audio_array_from_text.astype(np.float32)
        
        # Normalize audio to prevent clipping
        max_val = np.abs(audio_data).max()
        if max_val > 0:
            audio_data = audio_data / max_val * 0.95
        
        # Save with PCM_16 format for better compatibility
        sf.write(
            file=str(audio_path),
            data=audio_data,
            samplerate=sample_rate,
            format='WAV',
            subtype='PCM_16'
        )

        file_size = os.path.getsize(audio_path)
        print(f"💾 Audio saved: {audio_path} ({file_size} bytes)")
        
        return jsonify({
            "message": "Speech generated successfully",
            "audio_file": "output.wav",
            "duration": float(len(audio_array_from_text) / sample_rate),
            "sample_rate": int(sample_rate),
            "file_size": int(file_size)
        })

    except Exception as e:
        print(f"❌ TTS error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Text-to-speech failed: {str(e)}"}), 500


@app.route("/speech-to-speech", methods=["POST"])
def speech_to_speech():
    """Speech-to-Speech Translation (Full Pipeline)"""
    try:
        if "audio" not in request.files:
            return jsonify({"error": "No audio file uploaded"}), 400

        audio_file = request.files["audio"]
        src_lang = request.form.get("src_lang", "eng")
        target_lang = request.form.get("target_lang", "eng")
        
        print(f"🔄 Speech-to-Speech: {src_lang} → {target_lang}")

        # Step 1: Convert uploaded audio to proper format
        audio_bytes = audio_file.read()
        waveform, sample_rate = convert_audio_to_wav(audio_bytes)
        
        # Normalize waveform if needed
        if waveform.max() > 1.0 or waveform.min() < -1.0:
            waveform = waveform / max(abs(waveform.max()), abs(waveform.min()))
        
        print(f"🎤 Input audio processed: {waveform.shape}, {sample_rate}Hz")

        # Step 2: Transcribe speech to text in source language
        print(f"   Step 1: Transcribing audio in {src_lang}...")
        inputs_transcribe = processor(audio=waveform, src_lang=src_lang, sampling_rate=sample_rate, return_tensors="pt")
        
        with torch.no_grad():
            transcribed_tokens = model.generate(
                **inputs_transcribe,
                tgt_lang=src_lang,
                generate_speech=False  # Text only
            )
            
            # Handle the output - might have .sequences attribute
            if hasattr(transcribed_tokens, 'sequences'):
                sequences = transcribed_tokens.sequences
            else:
                sequences = transcribed_tokens
            
            # Decode using tokenizer
            transcribed_text = processor.tokenizer.batch_decode(sequences, skip_special_tokens=True)[0]
        
        print(f"   Transcribed text: '{transcribed_text[:50]}...'")

        # Step 3: If languages differ, translate the text
        if src_lang != target_lang:
            print(f"   Step 2: Translating text from {src_lang} to {target_lang}...")
            inputs_translate = processor(text=transcribed_text, src_lang=src_lang, return_tensors="pt")
            
            with torch.no_grad():
                translated_tokens = model.generate(
                    **inputs_translate,
                    tgt_lang=target_lang,
                    generate_speech=False  # Text only
                )
                
                # Handle the output
                if hasattr(translated_tokens, 'sequences'):
                    sequences = translated_tokens.sequences
                else:
                    sequences = translated_tokens
                
                # Decode using tokenizer
                translated_text = processor.tokenizer.batch_decode(sequences, skip_special_tokens=True)[0]
            
            print(f"   Translated text: '{translated_text[:50]}...'")
            text_for_speech = translated_text
            lang_for_speech = target_lang
        else:
            text_for_speech = transcribed_text
            lang_for_speech = src_lang

        # Step 4: Generate speech in the target language
        print(f"   Step 3: Generating speech in {lang_for_speech}...")
        inputs_speech = processor(text=text_for_speech, src_lang=lang_for_speech, return_tensors="pt")
        
        print(f"   Input IDs shape: {inputs_speech['input_ids'].shape}")
        print(f"   Number of tokens: {inputs_speech['input_ids'].shape[1]}")

        # Generate speech
        with torch.no_grad():
            outputs = model.generate(
                **inputs_speech,
                tgt_lang=lang_for_speech,
                generate_speech=True,
                return_intermediate_token_ids=False
            )
            
            print(f"   DEBUG - Output type: {type(outputs)}")
            print(f"   DEBUG - Has waveform attr: {hasattr(outputs, 'waveform')}")
            
            # Extract audio - Handle multiple output formats
            if hasattr(outputs, 'waveform'):
                # Output has waveform attribute (common in newer versions)
                audio_array_from_audio = outputs.waveform.cpu().numpy()
                print(f"   DEBUG - Using .waveform attribute, shape: {audio_array_from_audio.shape}")
                # Handle batch dimension
                if len(audio_array_from_audio.shape) == 2:
                    audio_array_from_audio = audio_array_from_audio[0]
            elif isinstance(outputs, tuple) and len(outputs) > 0:
                # Tuple output
                audio_array_from_audio = outputs[0].cpu().squeeze().numpy()
                print(f"   DEBUG - Using tuple[0], shape: {audio_array_from_audio.shape}")
            else:
                # Direct tensor
                audio_array_from_audio = outputs.cpu().squeeze().numpy()
                print(f"   DEBUG - Using direct output, shape: {audio_array_from_audio.shape}")
            
            output_sample_rate = 16000  # SeamlessM4T uses 16kHz

        print(f"✅ Generated audio shape: {audio_array_from_audio.shape}")
        print(f"   Sample rate: {output_sample_rate}Hz")
        print(f"   Duration: {len(audio_array_from_audio) / output_sample_rate:.2f} seconds")
        print(f"   Total samples: {len(audio_array_from_audio)}")

        # Check if audio is too short
        if len(audio_array_from_audio) < output_sample_rate * 0.5:  # Less than 0.5 seconds
            print(f"⚠️  WARNING: Generated audio is suspiciously short!")
            print(f"   Text for speech: '{text_for_speech[:100]}'")
            print(f"   Audio duration: {len(audio_array_from_audio) / output_sample_rate:.2f}s")

        # Step 5: Save audio file
        audio_path = AUDIO_OUTPUT_DIR / "output.wav"
        
        # Ensure proper format
        audio_data = audio_array_from_audio.astype(np.float32)
        
        # Normalize audio to prevent clipping
        max_val = np.abs(audio_data).max()
        if max_val > 0:
            audio_data = audio_data / max_val * 0.95
        
        # Save with PCM_16 format for better compatibility
        sf.write(
            file=str(audio_path),
            data=audio_data,
            samplerate=output_sample_rate,
            format='WAV',
            subtype='PCM_16'
        )

        file_size = os.path.getsize(audio_path)
        print(f"💾 Audio saved: {audio_path} ({file_size} bytes)")
        
        return jsonify({
            "message": "Speech translated successfully",
            "audio_file": "output.wav",
            "duration": float(len(audio_array_from_audio) / output_sample_rate),
            "sample_rate": int(output_sample_rate),
            "file_size": int(file_size),
            "transcribed_text": transcribed_text,
            "translated_text": text_for_speech if src_lang != target_lang else None
        })

    except Exception as e:
        print(f"❌ Speech-to-Speech error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Speech translation failed: {str(e)}"}), 500


@app.route('/output.wav')
def serve_output_audio():
    """Serve the generated audio file"""
    try:
        audio_path = AUDIO_OUTPUT_DIR / 'output.wav'
        
        if not audio_path.exists():
            return jsonify({"error": "Audio file not found"}), 404
        
        file_size = os.path.getsize(audio_path)
        print(f"📤 Serving audio: {audio_path} ({file_size} bytes)")
        
        return send_file(
            audio_path,
            mimetype='audio/wav',
            as_attachment=False,
            download_name='output.wav'
        )
    except Exception as e:
        print(f"❌ Error serving audio: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/audio/<filename>')
def serve_audio(filename):
    try:
        audio_path = os.path.join(AUDIO_OUTPUT_DIR, filename)
        if not os.path.exists(audio_path):
            return jsonify({"error": "Audio file not found"}), 404
            
        return send_from_directory(
            AUDIO_OUTPUT_DIR,
            filename,
            mimetype='audio/wav',
            as_attachment=False,
            max_age=0
        )
    except Exception as e:
        print(f"Error serving audio: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Get port from environment variable (Render provides this)
    port = int(os.getenv("PORT", 5000))
    # Bind to 0.0.0.0 for production deployment
    app.run(host="0.0.0.0", port=port, debug=False)
