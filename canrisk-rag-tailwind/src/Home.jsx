import { useEffect, useState } from "react";
import { unparse } from "papaparse";

function Home() {
  const [query, setQuery] = useState("");
  const [topK, setTopK] = useState(() => {
    const saved = localStorage.getItem("topK");
    return saved ? parseInt(saved) : 10;
  });

  const [summary, setSummary] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    localStorage.setItem("topK", topK);
  }, [topK]);

  const handleSearch = async () => {
    setError("");
    setSummary("");
    setResults([]);
    setCurrentPage(1);
    if (topK < 5 || topK > 20) {
      setError("Top-K must be between 5 and 20.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, top_k: topK })
      });
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const data = await res.json();
      setSummary(data.summary);
      setResults(data.results);
    } catch (err) {
      setError(err.message);
    }
  };

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentResults = results.slice(indexOfFirst, indexOfLast);

  const exportToCSV = () => {
    if (results.length === 0) return;
    const csv = unparse(results);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `CRPMRT_recommendation_top${topK}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = Math.ceil(results.length / itemsPerPage);

  return (
    <div className="max-w-screen-xl mx-auto p-6 text-gray-800 font-sans">
      

      {/* 居中标题 */}
      <h1 className="text-4xl font-bold mb-6 text-blue-700 text-center">CanRisk–RAG</h1>
      <p className="mb-4 text-lg text-center">
        I can retrieve and summary the cancer risk prediction models research from PubMed according to your needs. Please describe your needs below!
      </p>

      <textarea
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="w-full border border-gray-300 p-3 rounded-lg mb-4 resize-none"
        placeholder="e.g. I want to know the models including the predictors related to alcohol intake and gene mutations."
        rows="4"
      />
      <div className="flex items-center gap-4 mb-6">
        <label className="text-lg">Top-K results:</label>
        <input
          type="number"
          value={topK}
          onChange={(e) => setTopK(parseInt(e.target.value))}
          min="5"
          max="50"
          className="w-20 px-2 py-1 border rounded-md"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Search
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {summary && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Summary:</h2>
          <p className="bg-gray-100 p-4 rounded-md leading-relaxed">{summary}</p>
        </div>
      )}

      {currentResults.length > 0 && (
        <div className="overflow-x-auto border rounded-lg shadow-sm bg-white">
          <div className="p-4 flex justify-between items-center">
            <span className="font-medium text-gray-700">Top {topK} Results</span>
            <button
              onClick={exportToCSV}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              Download
            </button>
          </div>
          <table className="min-w-full text-sm border-t">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                {[
                  "MID", "PMID", "Journal", "Model Name", "Model Type",
                  "AUC", "Research Type", "Involved Factors", "Year",
                  "Country", "Cancer Type", "Total Score", "Link"
                ].map((col) => (
                  <th key={col} className="px-3 py-2 border-b text-left">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentResults.map((item, i) => (
                <tr key={i} className="even:bg-gray-50 hover:bg-blue-50 transition">
                  <td className="px-3 py-2">{item.MID}</td>
                  <td className="px-3 py-2">{item.PMID}</td>
                  <td className="px-3 py-2">{item.Journal_name}</td>
                  <td className="px-3 py-2">{item.Model_Name}</td>
                  <td className="px-3 py-2">{item.Model_Type}</td>
                  <td className="px-3 py-2">{item.AUC_value}</td>
                  <td className="px-3 py-2">{item.Research_Type}</td>
                  <td className="px-3 py-2">{item.Involved_Factors}</td>
                  <td className="px-3 py-2">{item.Year_value}</td>
                  <td className="px-3 py-2">{item.Country}</td>
                  <td className="px-3 py-2">{item.Cancer_Type}</td>
                  <td className="px-3 py-2">{item.total_score?.toFixed(4)}</td>
                  <td className="px-3 py-2">
                    <a href={item.Link} target="_blank" rel="noreferrer" className="text-blue-600 underline">Link</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 分页按钮 */}
          <div className="flex justify-center items-center gap-2 py-4">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded-md border ${
                  currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-800'
                } hover:bg-blue-100`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
