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
      products
    } = JSON.parse(event.body);

    const doc = new GoogleSpreadsheet('152d_7IiRa9gdYj9KUxVD0mIKlYUefEFY8a6e6Erm4lY');

    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });

    await doc.loadInfo();
    const sheet = doc.sheetsByTitle['response'];

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
      Confirmations: confirmations.join(', ')
    };

    // 제품 코드별 데이터 추가
    products.forEach(({ code, available, price }) => {
      row[`${code} Available`] = available;
      row[`${code} Price`] = price;
    });

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
