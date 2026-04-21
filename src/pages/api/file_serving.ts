// pages/api/serving.ts

import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const mimeTypes: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".mp3": "audio/mpeg",
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { file_data, contents_id } = req.query;

  if (!file_data) {
    res.status(400).send("요청 파라미터가 필요합니다.");
    return;
  }

  // Vercel Blob 업로드 후에는 file_data에 URL이 저장될 수 있음
  const fileData = Array.isArray(file_data) ? file_data[0] : file_data;
  if (typeof fileData === "string" && /^https?:\/\//.test(fileData)) {
    res.redirect(302, fileData);
    return;
  }

  if (!contents_id) {
    res.status(400).send("요청 파라미터가 필요합니다.");
    return;
  }

  const filePath = path.join(
    process.cwd(),
    "public",
    "uploads",
    String(contents_id),
    String(fileData)
  );
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = mimeTypes[ext] || "application/octet-stream";

  if (!fs.existsSync(filePath)) {
    res.status(404).send("File not found");
    return;
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    const fileStream = fs.createReadStream(filePath, { start, end });

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": mimeType,
      "Content-Disposition": `attachment; filename="${fileData}"`,
    });

    fileStream.pipe(res);
  } else {
    res.writeHead(200, {
      "Content-Length": fileSize,
      "Content-Type": mimeType,
    });

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }
}
