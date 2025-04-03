import React, { useState } from "react";
import data from "./data/products.json";

function App() {
  // 안내/체크박스용 contentBlocks와 제품 리스트
  const contentBlocks = data.slice(0, 8);
  const productRows = data.slice(10);

  // delivered만 사용하도록 통일
  const [companyInfo, setCompanyInfo] = useState({
    companyName: "",
    email: "",
    whatsapp: "",
    website: "",
    reshippingSupport: "",
    delivered: "",           // ← 배송 관련 질문 답변
    additionalProducts: "",
    finalMessage: "",
  });

  // 체크박스 상태(동적)
  const [confirmations, setConfirmations] = useState({});

  // 제품 공급 가능 여부 & 가격 입력 상태
  const [productResponses, setProductResponses] = useState({});

  // productRows를 묶음 단위로 그룹화
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

  // input/textarea 공용 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCompanyInfo((prev) => ({ ...prev, [name]: value }));
  };

  // 안내 섹션 체크박스 (field5, field6) 선택 처리
  const handleConfirmation = (sectionKey, label) => {
    setConfirmations((prev) => ({
      ...prev,
      [sectionKey]: prev[sectionKey] === label ? null : label,
    }));
  };

  // 제품별 공급가능 여부 / 가격입력
  const handleProductChange = (code, type, value) => {
    setProductResponses((prev) => ({
      ...prev,
      [code]: {
        ...prev[code],
        [type]: value,
      },
    }));
  };

  // 최종 전송
  const handleSubmit = async () => {
    // 제품 코드만 골라서 (field2 존재)
    const allCodes = productRows.filter((r) => r.field2).map((r) => r.field2);

    // 코드별로 [Available 여부, 가격] 순서로 평탄화
    const products = allCodes.flatMap((code) => {
      const val = productResponses[code] || {};
      const available = val.available ? "Available" : "";
      const price = val.price ? String(val.price) : "";
      return [available, price];
    });

    const payload = {
      companyName: companyInfo.companyName,
      email: companyInfo.email,
      whatsapp: companyInfo.whatsapp,
      website: companyInfo.website,
      reshippingSupport: companyInfo.reshippingSupport,
      delivered: companyInfo.delivered, // ← 'delivered' 필드만 사용
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

      {/* 기본 정보 */}
      <div className="mb-6">
        <label className="block mb-2">Company Name</label>
        <input
          type="text"
          name="companyName"
          value={companyInfo.companyName}
          onChange={handleInputChange}
          className="border px-2 py-1 rounded w-full mb-4"
        />

        <label className="block mb-2">Email</label>
        <input
          type="email"
          name="email"
          value={companyInfo.email}
          onChange={handleInputChange}
          className="border px-2 py-1 rounded w-full mb-4"
        />

        <label className="block mb-2">WhatsApp Number (Optional)</label>
        <input
          type="text"
          name="whatsapp"
          value={companyInfo.whatsapp}
          onChange={handleInputChange}
          className="border px-2 py-1 rounded w-full mb-4"
        />

        <label className="block mb-2">Website (Optional)</label>
        <input
          type="url"
          name="website"
          value={companyInfo.website}
          onChange={handleInputChange}
          className="border px-2 py-1 rounded w-full mb-4"
        />
      </div>

      {/* 안내 & 체크박스 */}
      {contentBlocks.map((block, idx) => (
        <div key={idx} className="mb-6">
          {block.field4 && (
            <p className="whitespace-pre-line bg-gray-100 p-4 rounded">
              {block.field4}
            </p>
          )}

          {/* field5 / field6가 있으면 체크박스 */}
          {block.field5 && block.field6 ? (
            <div className="mt-2">
              {[block.field5, block.field6].map((text, i) => (
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
          ) : block.field5 ? (
            <div className="mt-2">
              <label>
                <input
                  type="checkbox"
                  className="mr-1"
                  checked={confirmations[idx] === block.field5}
                  onChange={() => handleConfirmation(idx, block.field5)}
                />
                {block.field5}
              </label>
            </div>
          ) : null}
        </div>
      ))}

      <hr className="my-8 border-t-2" />

      {/* 제품 리스트 */}
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
              {product.options.length === 1 || iOpt > 0 ? (
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
              ) : null}
            </div>
          ))}
        </div>
      ))}

      <hr className="my-8 border-t-2" />

      {/* 배송 관련 질문 → delivered 필드 */}
      <div className="mb-6">
        <label className="block mb-2">
          How long does it usually take for your products to be delivered to
          customers in South Korea?
        </label>
        <textarea
          name="delivered"
          value={companyInfo.delivered}
          onChange={handleInputChange}
          className="border px-2 py-1 rounded w-full mb-4"
          rows="4"
        />
      </div>

      {/* 추가 가능 제품 */}
      <div className="mb-6">
        <label className="block mb-2">
          If you have other products that can be shipped to Korea, please write them
          here.
        </label>
        <textarea
          name="additionalProducts"
          value={companyInfo.additionalProducts}
          onChange={handleInputChange}
          className="border px-2 py-1 rounded w-full mb-4"
          rows="4"
        />
      </div>

      {/* 마지막 메시지 */}
      <div className="mb-6">
        <label className="block mb-2">
          Do you have any final message you would like to convey?
        </label>
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
