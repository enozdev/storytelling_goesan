import { NextApiResponse, NextApiRequest } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const SESSION_DURATION = 20 * 60 * 1000; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { adminID, adminPWD } = req.body;

  const admin = await prisma.adminLogin.findFirst({
    where: { 
      adminID: adminID,
      adminPWD: adminPWD
    },
  });

  if (!admin) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const sessionData = {
    adminID: admin.adminID,
    loggedIn: true,
    expiresAt: Date.now() + SESSION_DURATION
  };

  console.log(sessionData);

  res.setHeader('Set-Cookie', `adminSession=${JSON.stringify(sessionData)}; Path=/; Max-Age=${SESSION_DURATION/1000}; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);

  return res.status(200).json({ 
    message: "Login successful",
    admin: {
      adminID: admin.adminID
    }
  });
}   
