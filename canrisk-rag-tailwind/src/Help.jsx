// src/Help.jsx
console.log("Help 页面被加载！");
import React from "react";

function Help() {
  return (
    <div className="max-w-4xl mx-auto p-8 text-gray-800">
      <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">Help Information</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Overview</h2>
        <p>
          The <strong>Cancer Risk Prediction Model Retrieval Tool – RAG (CRPMRT-RAG)</strong> is an intelligent retrieval platform that integrates a local knowledge base (CRPMKB) with large language models (LLMs). It is designed to assist researchers and healthcare professionals in identifying the most suitable cancer risk prediction models based on personalized criteria.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Key Features</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong>Flexible Query Input:</strong> Users can freely input various criteria, such as <em>cancer type</em>, <em>model type</em>, <em>predictive variables</em>, and <em>study region</em>.
          </li>
          <li>
            <strong>Customizable Output:</strong> Users can define the number of results returned using the <em>Top-K</em> parameter (between 5 and 20).
          </li>
          <li>
            <strong>Retrieval Results:</strong> The system calculates similarity scores between the query and entries in the knowledge base, then combines these scores with factors such as <em>publication year</em>, <em>journal impact factor (JIF)</em>, and <em>model performance (AUC)</em> to generate ranked recommendations.
          </li>
          <li>
            <strong>Detailed Display:</strong> Each recommended model includes the following fields:
            <br />
            <code className="bg-gray-100 px-2 py-1 rounded inline-block mt-1">
              MID, PMID, Journal, Model Name, Model Type, AUC, Research Type, Involved Factors, Year, Country, Cancer Type, Total Score, Link
            </code>
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Usage Steps</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li><strong>Access the Tool Page:</strong> Visit the CRPMRT-RAG homepage.</li>
          <li><strong>Fill Out the Input Box:</strong> Enter information related to the cancer prediction model of interest.</li>
          <li><strong>Submit Query:</strong> Click the <em>"Search"</em> button to initiate retrieval and ranking.</li>
          <li><strong>View Results:</strong> Explore the retrieved model list with full details and links for deeper insights.</li>
        </ol>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">Application Scenarios</h2>
        <p>
          CRPMRT-RAG is ideal for <strong>researchers</strong>, <strong>clinicians</strong>, and <strong>students</strong> seeking evidence-based cancer prediction models tailored to specific research or clinical needs. By facilitating fast access to relevant models, the tool contributes to enhanced cancer prevention efforts and promotes personalized medical strategies.
        </p>
      </section>
    </div>
  );
}

export default Help;
