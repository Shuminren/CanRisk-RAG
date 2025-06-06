import sys
import json

# 引入你之前定义的函数
from rag_deepseek_retriever import extract_tags_with_deepseek, match_top_k, generate_summary_from_abstracts

if __name__ == "__main__":
    user_input = sys.argv[1]
    user_tags = extract_tags_with_deepseek(user_input)
    top_df = match_top_k(user_tags)

    summary = generate_summary_from_abstracts(top_df)
    records = top_df.to_dict(orient="records")

    result = {
        "records": records,
        "summary": summary
    }

    print(json.dumps(result, ensure_ascii=False))
