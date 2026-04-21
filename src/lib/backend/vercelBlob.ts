import { put, type PutBlobResult } from "@vercel/blob";
import type { File as FormidableFile } from "formidable";
import fs from "fs";
import { Readable } from "stream";

type UploadOptions = {
  pathname: string;
  file: FormidableFile;
  access?: "public" | "private";
};

export async function uploadFormidableFileToVercelBlob({
  pathname,
  file,
  access = "public",
}: UploadOptions): Promise<PutBlobResult> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not set");
  }

  const fileStream = fs.createReadStream(file.filepath);
  const body = Readable.toWeb(fileStream) as unknown as ReadableStream;

  return await put(pathname, body, {
    access,
    token,
    multipart: true,
    addRandomSuffix: false,
    contentType: file.mimetype || undefined,
  });
}

