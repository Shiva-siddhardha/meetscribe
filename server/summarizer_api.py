from flask import Flask, request, jsonify
from transformers import pipeline
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load the model
summarizer = pipeline("summarization", model="C:/Users/Shiva/Desktop/meetsis/server/fine_tuned_summarizer")
@app.route("/summarize", methods=["POST"])
def summarize():
    data = request.get_json()
    input_text = data.get("text", "")
    if not input_text:
        return jsonify({"summary": "No input provided."})
    try:
        summary = summarizer(input_text, max_length=100, min_length=20, do_sample=False)
        return jsonify({"summary": summary[0]["summary_text"]})
    except Exception as e:
        return jsonify({"summary": f"Error: {str(e)}"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True) 