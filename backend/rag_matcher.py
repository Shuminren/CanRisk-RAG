import json
import pandas as pd
import requests
import numpy as np
import os
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import faiss  # Import FAISS library

API_URL = "https://api.siliconflow.cn/v1/chat/completions"
API_KEY = "sk-iebqbxokiekwqfnrafdpiuxcciiyuwlqkugnheppjddwouao"
MODEL = "deepseek-ai/DeepSeek-V3"
TOP_K = 10

# Load data
print("加载数据...")
df = pd.read_csv("basic_info.csv")
print(f"数据加载完成，数据集大小：{df.shape}")

# Load embedding model
print("加载嵌入模型...")
embedder = SentenceTransformer("all-distilroberta-v1")
print("嵌入模型加载完成")

# Function to generate embeddings
def get_embedding(text: str):
    return embedder.encode(text, normalize_embeddings=True)

# Precompute embeddings and create/load FAISS index
print("预计算嵌入向量并构建/加载 FAISS 索引...")

df["tag_string"] = df.apply(
    lambda row: f"{row['Model_Type']}, {row['Research_Type']}, {row['Involved_Factors']}, {row['Area']}, {row['Country']}, {row['Cancer_Type']}",
    axis=1
)
df["abstract_string"] = df["Abstract"].astype(str)

if os.path.exists("faiss_index.index") and os.path.exists("combined_embeddings.npy"):
    print("检测到已有索引文件，开始加载...")
    index = faiss.read_index("faiss_index.index")
    combined_embeddings = np.load("combined_embeddings.npy")
    print("FAISS 索引加载完成")
else:
    print("未检测到索引文件，开始重新构建...")
    tag_embeddings = get_embedding(df["tag_string"].tolist())
    abstract_embeddings = get_embedding(df["abstract_string"].tolist())
    combined_embeddings = 0.8 * tag_embeddings + 0.2 * abstract_embeddings
    combined_embeddings = np.array(combined_embeddings, dtype=np.float32)
    faiss.normalize_L2(combined_embeddings)
    dimension = combined_embeddings.shape[1]
    index = faiss.IndexFlatIP(dimension)
    index.add(combined_embeddings)
    faiss.write_index(index, "faiss_index.index")
    np.save("combined_embeddings.npy", combined_embeddings)
    print("FAISS 索引构建并保存完成")

def extract_tags_with_deepseek(user_input):
    print(f"\n开始提取标签，输入：{user_input}")
    prompt = f"""
    Extract the following information fields from the text below and return in JSON format:
    - Model_Type （比如Logistic Regression，Deep Learning Convolutional Neural Network (cnn) Models，Deep Learning Convolutional Neural Network (cnn) Models，Cox Proportional Hazards Regression等）
    - Research_Type （比如development or validation）
    - Involved_Factors (比如，Age,history Of Breast Gland Disease,family History,menstrual Age,pregnancy Age,biopsy Of Breast Gland,ethnic Group)
    - Area
    - Country
    - Cancer_Type
    - Original_Input (keep original input)

    Text:
    {user_input}
    """
    
    payload = {
        "model": MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.2
    }
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }

    try:
        response = requests.post(API_URL, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        if "choices" not in data or not data["choices"]:
            raise ValueError("API response format is invalid")

        content = data["choices"][0]["message"]["content"]
        content = content.strip()
        if content.startswith("```json"):
            content = content[len("```json"):].strip()
        if content.endswith("```"):
            content = content[:-len("```")].strip()

        user_tags = json.loads(content)
        print("标签提取完成，结果：")
        print(json.dumps(user_tags, ensure_ascii=False, indent=2))
        return user_tags

    except requests.exceptions.RequestException as e:
        raise Exception(f"API request failed: {str(e)}")
    except json.JSONDecodeError as e:
        raise Exception(f"JSON parsing failed: {str(e)}")
    except KeyError as e:
        raise Exception(f"API response missing required fields: {str(e)}")

def match_top_k(user_tags, top_k=TOP_K):
    print("\n开始匹配 Top-K 记录...")
    query_tag = f"{user_tags['Model_Type']}, {user_tags['Research_Type']}, {user_tags['Involved_Factors']}, {user_tags['Area']}, {user_tags['Country']}, {user_tags['Cancer_Type']}"
    query_abstract = user_tags['Original_Input']

    query_tag_emb = get_embedding(query_tag)
    query_content_emb = get_embedding(query_abstract)

    query_emb = 0.8 * query_tag_emb + 0.2 * query_content_emb
    query_emb = np.array([query_emb], dtype=np.float32)
    faiss.normalize_L2(query_emb)

    distances, indices = index.search(query_emb, top_k)
    distances = distances[0]
    indices = indices[0]

    df["similarity"] = 0.0
    for idx, sim in zip(indices, distances):
        df.loc[idx, "similarity"] = sim

    metric_df = pd.read_csv("metricdata.csv")
    df["jif_score"] = metric_df.iloc[:, 0].fillna(0).reset_index(drop=True)
    df["auc_score"] = metric_df.iloc[:, 1].fillna(0).reset_index(drop=True)
    df["new_score"] = metric_df.iloc[:, 2].fillna(0).reset_index(drop=True)

    df["total_score"] = (
        0.85 * df["similarity"] +
        0.05 * df["jif_score"] +
        0.05 * df["auc_score"] +
        0.05 * df["new_score"]
    )

    df["Link"] = df["MID"].apply(lambda x: f"http://www.sysbio.org.cn/CRPMKB/info.php?id={x}")

    top_df = df.iloc[indices].copy()
    print(f"Top-K 匹配完成，记录数量：{top_df.shape}")
    return top_df

def generate_summary_from_abstracts(top_df):
    print("\n开始生成摘要总结...")
    all_abstracts = "\n\n".join(top_df["Abstract"].astype(str).tolist())
    prompt = f"""
以下是多篇关于癌症风险预测模型研究的文献摘要，请对这些内容进行总结，提炼共同研究方向、方法、技术、疾病类型或结论等重要信息，撰写一段200字以内的总结性描述，用英文输出：

{all_abstracts}
"""
    payload = {
        "model": MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.5
    }
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }

    response = requests.post(API_URL, headers=headers, json=payload)
    if response.status_code == 200:
        summary = response.json()["choices"][0]["message"]["content"]
        print("摘要总结生成完成")
        return summary
    else:
        print("摘要总结生成失败")
        return f"摘要总结生成失败: {response.status_code}"

if __name__ == "__main__":
    user_input = "请给我推荐一些亚洲地区的肺癌预测模型，同时还包括Age,sex,body Mass Index,persol History Of Cancer,pneumonia,family History Of Lung Cancer,这些预测因素"
    user_tags = extract_tags_with_deepseek(user_input)
    top_df = match_top_k(user_tags)

    columns_to_display = ["MID", "PMID", "Journal_name", "Model_Name", "Model_Type",
                      "AUC_value", "Research_Type", "Involved_Factors", "Year_value",
                      "Country", "Cancer_Type", "total_score", "Link"]


    top_10_table = top_df[columns_to_display].reset_index(drop=True)
    print("\nTop 10 记录：")
    print(top_10_table.to_string(index=False))

    summary = generate_summary_from_abstracts(top_df)
    print("\n摘要总结：\n", summary)
