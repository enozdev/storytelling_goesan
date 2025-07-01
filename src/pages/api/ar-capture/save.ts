import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import formidable, { File as FormidableFile } from "formidable";
import { IncomingMessage, ServerResponse } from "http";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: false,
  },
};

// 랜덤 문자열
function randomUppercaseString(length: number = 6): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * chars.length);
    result += chars[idx];
  }
  return result;
}

// 파일명 변경 함수
function renameUploadedFile(file: FormidableFile, userId: string) {
  const oldPath = file.filepath;
  const originalName = file.originalFilename || "unknown";
  const ext = path.extname(originalName);
  const newName = `${userId}_${Date.now()}${randomUppercaseString(20)}${ext}`;

  const uploadBasePath = `./public/uploads/ar_video/`;

  if (!fs.existsSync(uploadBasePath)) {
    fs.mkdirSync(uploadBasePath, { recursive: true });

    // 디렉토리도 접근 가능하도록 퍼미션 설정
    fs.chmodSync(uploadBasePath, 0o755);
  }

  const newPath = path.join(uploadBasePath, newName);

  fs.renameSync(oldPath, newPath);

  // ✅ 업로드된 파일 권한을 모두 읽을 수 있게 설정 (소유자: rw, 기타: r)
  fs.chmodSync(newPath, 0o755);

  return `${newName}`;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        success: false,
        errorCode: "E0002",
        error: "허용되지 않은 메서드입니다.",
      })
    );
    return;
  }

  const form = formidable({
    uploadDir: "./public/uploads/ar_video",
    keepExtensions: true,
    multiples: true,
    maxFileSize: 200 * 1024 * 1024, // 최대 200MB

    filter: ({ mimetype, originalFilename }) => {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "video/mp4",
        "audio/mpeg",
      ];
      const allowedExts = [".jpg", ".jpeg", ".png", ".mp4", "mp3"];
      const ext = path.extname(originalFilename || "").toLowerCase();

      return (
        (mimetype && allowedTypes.includes(mimetype)) ||
        allowedExts.includes(ext)
      );
    },
  });

  form.parse(req, async (err, fields, files) => {
    if (
      !fields.private_key ||
      (Array.isArray(fields.private_key)
        ? fields.private_key[0] !== process.env.PRIVATE_KEY
        : fields.private_key !== process.env.PRIVATE_KEY)
    ) {
      res.statusCode = 400;
      res.end(
        JSON.stringify({
          success: false,
          errorCode: "E0001",
          error: "유효하지 않은 접근입니다.",
        })
      );
      return;
    }

    if (!fields.user_id) {
      res.statusCode = 400;
      res.end(
        JSON.stringify({
          success: false,
          errorCode: "E0003",
          error: "요청 본문에 필수 입력값이 누락되었습니다.",
        })
      );
      return;
    }

    if (err) {
      res.statusCode = 500;
      res.end(
        JSON.stringify({
          success: false,
          errorCode: "E9998",
          error: "파일 업로드 중 오류가 발생하였습니다.",
          detail: err,
        })
      );
      return;
    }

    const userId = String(fields.user_id || "anonymous");

    // ✅ 업로드된 파일들 리스트 가져오기
    const uploadedFiles = files.file; // 'file' 필드는 Postman/브라우저의 name="file" input
    const renamedFiles: string[] = [];

    // ✅ 다중 파일 처리
    const fileArray = Array.isArray(uploadedFiles)
      ? uploadedFiles
      : [uploadedFiles];

    // 인덱스 가져오기
    try {
      fileArray.forEach((file) => {
        if (file) {
          // Ensure file is not undefined
          const contentId = parseInt(
            !Array.isArray(fields.content_id) ? "0" : fields.content_id[0]
          );
          const newName = renameUploadedFile(file, userId);
          renamedFiles.push(newName);
        }
      });

      const max_idx = await prisma.ar_video.findFirst({
        orderBy: {
          idx: "desc",
        },
        select: { idx: true },
      });

      const new_idx = (max_idx?.idx ?? 0) + 1;

      // 신규 참가 데이터 생성
      await prisma.ar_video.create({
        data: {
          idx: new_idx,
          user_id: parseInt(fields.user_id[0]),
          file_data: JSON.stringify(renamedFiles),
        },
      });

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          message: "파일 업로드 완료",
          user_id: parseInt(fields.user_id[0]),
          files: renamedFiles,
        })
      );
    } catch (error) {
      res.statusCode = 500;
      res.end(
        JSON.stringify({
          success: false,
          errorCode: "E9999",
          error: "네트워크 오류가 발생했습니다.",
          detail: error,
        })
      );
    }
  });
}
