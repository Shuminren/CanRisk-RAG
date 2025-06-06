import { useState } from "react";
import Image from "next/image";

// 你也可以把这些组件统一写到一个 UI 库中引入
export default function HomePage() {
  const [userInput, setUserInput] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_input: userInput })
      });

      const data = await response.json();
      setResults(data.records);
      setSummary(data.summary);
    } catch (error) {
      console.error("查询失败", error);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <Image src="/logo.png" alt="Logo" width={50} height={50} />
        <div>
          <h1 className="text-2xl font-bold">CRPMRT-RAG</h1>
          <p className="text-sm text-gray-600">
            I can recommend cancer risk prediction model studies from PubMed. Just tell me what you need!
          </p>
        </div>
      </div>

      <div className="bg-white shadow p-4 rounded space-y-4">
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="请输入研究描述或文本..."
          className="w-full p-2 border rounded min-h-[120px]"
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "处理中..." : "提交并匹配"}
        </button>
      </div>

      {results && (
        <div className="bg-white shadow p-4 rounded space-y-4">
          <h2 className="text-xl font-semibold">匹配结果 Top 10</h2>
          <div className="overflow-auto max-h-[400px]">
            <table className="w-full text-sm border border-collapse">
              <thead>
                <tr>
                  <th className="border px-2">MID</th>
                  <th className="border px-2">PMID</th>
                  <th className="border px-2">期刊</th>
                  <th className="border px-2">模型</th>
                  <th className="border px-2">类型</th>
                  <th className="border px-2">AUC</th>
                  <th className="border px-2">国家</th>
                  <th className="border px-2">癌症</th>
                  <th className="border px-2">链接</th>
                </tr>
              </thead>
              <tbody>
                {results.map((item, idx) => (
                  <tr key={idx}>
                    <td className="border px-2">{item.MID}</td>
                    <td className="border px-2">{item.PMID}</td>
                    <td className="border px-2">{item.Journal_name}</td>
                    <td className="border px-2">{item.Model_Name}</td>
                    <td className="border px-2">{item.Model_Type}</td>
                    <td className="border px-2">{item.AUC_value}</td>
                    <td className="border px-2">{item.Country}</td>
                    <td className="border px-2">{item.Cancer_Type}</td>
                    <td className="border px-2">
                      <a href={item.Link} target="_blank" className="text-blue-500 underline">
                        查看
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="text-lg font-medium mt-4">摘要总结</h3>
            <p className="mt-2 text-gray-700 whitespace-pre-wrap">{summary}</p>
          </div>
        </div>
      )}
    </div>
  );
}
