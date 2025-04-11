import { NextApiResponse, NextApiRequest } from "next";
import { deleteCookie } from 'cookies-next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  deleteCookie('adminSession', { req, res });

  return res.status(200).json({ message: "Logout successful" });
} 