import { NextApiRequest, NextApiResponse } from "next";

const API_BASE_URL = process.env.API_BASE_URL || "https://services.stage.zeropaper.online/api/zpu";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Extract the authorization token from the request headers
    const authToken = req.headers.authorization;

    if (!authToken) {
      return res.status(401).json({ error: "Authorization token is required" });
    }

    // Convert the request body to x-www-form-urlencoded format
    const formData = new URLSearchParams();
    for (const [key, value] of Object.entries(req.body)) {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    }

    // Forward the request to the backend API
    const response = await fetch(`${API_BASE_URL}/receipts/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: authToken,
      },
      body: formData.toString(),
    });

    // Handle the response
    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: errorData.message || "Failed to add receipt" });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error in add receipt API route:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}