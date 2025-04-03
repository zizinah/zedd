const { GoogleSpreadsheet } = require('google-spreadsheet');

exports.handler = async function(event, context) {
  const { name, answer } = JSON.parse(event.body);

  const doc = new GoogleSpreadsheet('152d_7IiRa9gdYj9KUxVD0mIKlYUefEFY8a6e6Erm4lY');

  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  });

  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];
  await sheet.addRow({ name, answer });

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "응답 저장 완료" }),
  };
};
