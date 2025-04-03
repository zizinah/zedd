const { GoogleSpreadsheet } = require('google-spreadsheet');

exports.handler = async function (event, context) {
  console.log("🟢 [submit] Received body:", event.body);

  try {
    const {
      companyName,
      email,
      whatsapp,
      website,
      reshippingSupport,
      delivered,
      additionalProducts,
      finalMessage,
      confirmations,
      products,
    } = JSON.parse(event.body);

    const doc = new GoogleSpreadsheet('152d_7IiRa9gdYj9KUxVD0mIKlYUefEFY8a6e6Erm4lY');

    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });

    await doc.loadInfo();
    const sheet = doc.sheetsByTitle['response'];
    await sheet.loadHeaderRow();
    const existingHeaders = sheet.headerValues;

    // 단일 행 구성
    const row = {
      Timestamp: new Date().toISOString(),
      Company: companyName,
      Email: email,
      WhatsApp: whatsapp,
      Website: website,
      ReshippingSupport: reshippingSupport,
      Delivered: delivered,
      AdditionalProducts: additionalProducts,
      FinalMessage: finalMessage,
      Confirmations: confirmations.join(', '),
    };

    // 제품 응답 처리 (객체로 변경된 구조 기대: { code, available, price })
    if (Array.isArray(products)) {
      products.forEach(({ code, available, price }) => {
        const availableHeader = `${code} Available`;
        const priceHeader = `${code} Price`;

        // 중복 헤더 추가 방지
        if (!existingHeaders.includes(availableHeader)) {
          existingHeaders.push(availableHeader);
        }
        if (!existingHeaders.includes(priceHeader)) {
          existingHeaders.push(priceHeader);
        }

        row[availableHeader] = available;
        row[priceHeader] = price;
      });

      await sheet.setHeaderRow(existingHeaders);
    }

    await sheet.addRow(row);
    console.log("✅ [submit] One row added successfully");

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error("❌ [submit] Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};
