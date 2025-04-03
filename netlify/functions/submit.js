const { GoogleSpreadsheet } = require('google-spreadsheet');

exports.handler = async function(event, context) {
  console.log("🟢 [submit] Received body:", event.body);

  try {
    const { name, answer } = JSON.parse(event.body);

    const doc = new GoogleSpreadsheet('152d_7IiRa9gdYj9KUxVD0mIKlYUefEFY8a6e6Erm4lY');

    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });

    await doc.loadInfo();
    const sheet = doc.sheetsByTitle['response'];


    await sheet.addRow({ name, answer });

    console.log("✅ [submit] Row added successfully");

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })  // ✅ React에서 인식 가능하도록 수정됨
    };
  } catch (err) {
    console.error("❌ [submit] Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message })  // ✅ 에러 메시지도 전달
    };
  }
};
