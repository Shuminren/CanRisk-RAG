from flask import Flask, request, jsonify
from flask_cors import CORS
from rag_matcher import extract_tags_with_deepseek, match_top_k, generate_summary_from_abstracts
import numpy as np

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5179"}}, supports_credentials=True)

@app.route("/api/recommend", methods=["POST"])
def recommend():
    data = request.json
    user_input = data.get("query", "")
    top_k = data.get("top_k", 10)  # 如果前端没传 top_k，默认用 10

    user_tags = extract_tags_with_deepseek(user_input)
    top_df = match_top_k(user_tags, top_k=top_k)
    summary = generate_summary_from_abstracts(top_df)

    results = top_df.replace({np.nan: None}).to_dict(orient="records")
    return jsonify({"summary": summary, "results": results})


if __name__ == "__main__":
    app.run(debug=True, port=8000)
