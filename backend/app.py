from flask import Flask, request, jsonify
from transformers import AutoProcessor, SeamlessM4TModel
import torch

app = Flask(__name__)

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

    # Encode input
    inputs = processor(text=text, src_lang="eng", return_tensors="pt")

    # Generate translation
    with torch.no_grad():
        output_tokens = model.generate(**inputs, tgt_lang=target_lang, generate_speech=False)

    # ✅ Extract sequences properly
    sequences = output_tokens.sequences if hasattr(output_tokens, "sequences") else output_tokens

    # Decode translation
    translated_text = processor.decode(sequences[0], skip_special_tokens=True)

    return jsonify({"translated_text": translated_text})

if __name__ == "__main__":
    app.run(debug=False)
