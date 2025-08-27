export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { name, phone } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ success: false, error: "Missing fields" });
  }

  try {
    const response = await fetch(process.env.SHEET_WEBAPP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: process.env.SHEET_SECRET_KEY,  // hidden secret
        name,
        phone
      })
    });

    const result = await response.json();
    res.status(200).json(result);

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}



