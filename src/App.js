import React, { useState } from "react";
import data from "./data/products.json";

function App() {
  const contentBlocks = data.slice(0, 8);
  const productRows = data.slice(10);

  const [companyInfo, setCompanyInfo] = useState({
    companyName: "",
    email: "",
    whatsapp: "",
    website: "",
    reshippingSupport: "",
    delivered: "",
    additionalProducts: "",
    finalMessage: "",
  });

  const [confirmations, setConfirmations] = useState({});
  const [productResponses, setProductResponses] = useState({});

  const groupedProducts = [];
  let currentGroup = null;
  productRows.forEach((row) => {
    if (row.field1) {
      if (currentGroup) groupedProducts.push(currentGroup);
      currentGroup = {
        image: row.field3,
        ingredient: row.field5,
        options: [row],
      };
    } else if (currentGroup) {
      currentGroup.options.push(row);
    }
  });
  if (currentGroup) groupedProducts.push(currentGroup);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCompanyInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleConfirmation = (sectionKey, label) => {
    setConfirmations((prev) => ({
      ...prev,
      [sectionKey]: prev[sectionKey] === label ? null : label,
    }));
  };

  const handleProductChange = (code, type, value) => {
    setProductResponses((prev) => ({
      ...prev,
      [code]: {
        ...prev[code],
        [type]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    const allCodes = productRows.filter((r) => r.field2).map((r) => r.field2);

    const products = allCodes.map((code) => {
      const val = productResponses[code] || {};
      return {
        code,
        available: val.available ? "Available" : "",
        price: val.price ? String(val.price) : "",
      };
    });

    const payload = {
      companyName: companyInfo.companyName,
      email: companyInfo.email,
      whatsapp: companyInfo.whatsapp,
      website: companyInfo.website,
      reshippingSupport: companyInfo.reshippingSupport,
      delivered: companyInfo.delivered,
      additionalProducts: companyInfo.additionalProducts,
      finalMessage: companyInfo.finalMessage,
      confirmations: Object.values(confirmations).filter(Boolean),
      products,
    };

    try {
      const res = await fetch("/.netlify/functions/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) alert("✅ Response submitted successfully!");
    } catch (e) {
      alert("❌ Submission failed.");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📦 Sourcing Response Form</h1>

      <div className="mb-6">
        {["companyName", "email", "whatsapp", "website"].map((name) => (
          <div key={name}>
            <label className="block mb-2">
              {name === "companyName"
                ? "Company Name"
                : name === "email"
                ? "Email"
                : name === "whatsapp"
                ? "WhatsApp Number (Optional)"
                : "Website (Optional)"}
            </label>
            <input
              type={name === "email" ? "email" : name === "website" ? "url" : "text"}
              name={name}
              value={companyInfo[name]}
              onChange={handleInputChange}
              className="border px-2 py-1 rounded w-full mb-4"
            />
          </div>
        ))}
      </div>

      {contentBlocks.map((block, idx) => (
        <div key={idx} className="mb-6">
          {block.field4 && (
            <p className="whitespace-pre-line bg-gray-100 p-4 rounded">
              {block.field4}
            </p>
          )}
          {[block.field5, block.field6].filter(Boolean).map((text, i) => (
            <label key={`${idx}_${i}`} className="mr-4">
              <input
                type="checkbox"
                className="mr-1"
                checked={confirmations[idx] === text}
                onChange={() => handleConfirmation(idx, text)}
              />
              {text}
            </label>
          ))}
        </div>
      ))}

      <hr className="my-8 border-t-2" />

      <h2 className="text-xl font-semibold mb-4">📋 Product List</h2>
      {groupedProducts.map((product, iGroup) => (
        <div key={iGroup} className="border rounded p-4 mb-6 shadow-sm">
          {product.image && (
            <img src={product.image} alt="product" className="w-64 border mb-2" />
          )}
          {product.ingredient && (
            <p className="text-sm text-gray-600 mb-2">
              Ingredient: {product.ingredient}
            </p>
          )}
          {product.options.map((opt, iOpt) => (
            <div key={iOpt} className="border p-3 rounded mb-2">
              <p className="font-medium mb-1">{opt.field4}</p>
              {(product.options.length === 1 || iOpt > 0) && (
                <div className="flex gap-4 items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={!!productResponses[opt.field2]?.available}
                      onChange={(e) =>
                        handleProductChange(opt.field2, "available", e.target.checked)
                      }
                    />
                    Available for Supply
                  </label>
                  <input
                    type="text"
                    placeholder="Enter price incl. shipping"
                    value={productResponses[opt.field2]?.price || ""}
                    onChange={(e) =>
                      handleProductChange(opt.field2, "price", e.target.value)
                    }
                    className="border px-2 py-1 rounded w-60"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      ))}

      <hr className="my-8 border-t-2" />

      <div className="mb-6">
        <label className="block mb-2">
          How long does it usually take for your products to be delivered to customers in South Korea?
        </label>
        <textarea
          name="delivered"
          value={companyInfo.delivered}
          onChange={handleInputChange}
          className="border px-2 py-1 rounded w-full mb-4"
          rows="4"
        />
      </div>

      <div className="mb-6">
        <label className="block mb-2">
          If you have other products that can be shipped to Korea, please write them here.
        </label>
        <textarea
          name="additionalProducts"
          value={companyInfo.additionalProducts}
          onChange={handleInputChange}
          className="border px-2 py-1 rounded w-full mb-4"
          rows="4"
        />
      </div>

      <div className="mb-6">
        <label className="block mb-2">Do you have any final message you would like to convey?</label>
        <textarea
          name="finalMessage"
          value={companyInfo.finalMessage}
          onChange={handleInputChange}
          className="border px-2 py-1 rounded w-full mb-4"
          rows="4"
        />
      </div>

      <button
        onClick={handleSubmit}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
      >
        Submit Response
      </button>
    </div>
  );
}

export default App;
