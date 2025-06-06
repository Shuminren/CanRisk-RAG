// src/App.jsx
import React, { useState } from "react";
import { HashRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./Home";
import Help from "./Help";

function App() {
  const [showContact, setShowContact] = useState(false);

  const toggleContactModal = () => setShowContact(!showContact);

  return (
    
      <div className="max-w-screen-xl mx-auto font-sans text-gray-800">
        {/* 顶部导航栏 */}
        <nav className="bg-blue-700 text-white px-6 py-4 shadow-md mb-6">
          <div className="max-w-screen-xl mx-auto flex justify-between items-center">
            <div className="text-xl font-semibold">Cancer Risk Prediction Models Recommendation Tool</div>
            <ul className="flex gap-6 text-base">
              <li>
                <Link to="/" className="hover:underline text-white">CanRisk–RAG</Link>
              </li>
              <li>
                <a
                  href="http://www.sysbio.org.cn/CRPMKB/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-white"
                >
                  CRPMKB
                </a>
              </li>
              <li>
                <Link to="/help" className="hover:underline text-white">Help</Link>
              </li>
              <li>
                <button
                  onClick={toggleContactModal}
                  className="hover:underline text-white focus:outline-none"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>
        </nav>

        {/* 页面内容区域 */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/help" element={<Help />} />
        </Routes>

        {/* Contact 弹窗 */}
        {showContact && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg max-w-xl w-full p-6 relative">
      <button
        onClick={toggleContactModal}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-lg font-bold"
      >
        ×
      </button>
      <h2 className="text-2xl font-bold mb-4 text-blue-700 text-center">
        Institutes for Systems Genetics  
      </h2>
      <p className="text-gray-700 mb-4 leading-relaxed text-sm">
        With the further development of precision medical science, molecular genetics mechanism and evolution will become the key to realize the revelation of genetics mechanism and the innovation of technology.
        <br /><br />
        In February 2018, supported by West China Hospital, Institutes for Systems Genetics was officially established, aiming at integrating the existed biobank, supporting platforms of genomics, proteomics and metabonomics as well as the biomedical big data center in West China Hospital.
        <br /><br />
        By cooperating with experts in clinical medicine and basic medicine, our institute has been exploring the occurrence and development of human rare diseases’ genetic problem, promoting the cutting-edge research in medicine.
      </p>

      <h3 className="text-lg font-semibold text-blue-700 mb-2">Contact us</h3>
      <ul className="text-gray-700 text-sm space-y-1">
        <li><strong>Address:</strong> 9F & 10F, Building D5-A, Frontiers Science Center for Disease-related Molecular Network, No.2222, Xinchuan Road, Gaoxin District, Chengdu</li>
        <li><strong>Postal code:</strong> 610212</li>
        <li><strong>Tel:</strong> 9F: 028-61528679 / 028-61528680 ; 10F: 028-61528681 / 028-61528682</li>
        <li><strong>Web:</strong> <a href="http://www.sysbio.org.cn/" target="_blank" rel="noreferrer" className="text-blue-600 underline">http://www.sysbio.org.cn/</a></li>
      </ul>
    </div>
  </div>
)}

      </div>
    
  );
}

export default App;
