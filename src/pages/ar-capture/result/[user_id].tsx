import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Result() {
  const router = useRouter();
  const [videos, setVideos] = useState<string[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      if (!router.isReady) return;
      const { user_id } = router.query;
      const res = await fetch(`/api/ar-capture/list`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          private_key: process.env.PRIVATE_KEY,
          user_id: user_id,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        // user 배열의 각 file_data를 파싱해서 videos에 넣기
        let allVideos: string[] = [];
        if (data && Array.isArray(data.user)) {
          data.user.forEach((item: any) => {
            try {
              const files = JSON.parse(item.file_data);
              if (Array.isArray(files)) {
                allVideos = allVideos.concat(files);
              }
            } catch (e) {
              // 파싱 에러 무시
            }
          });
        }
        setVideos(allVideos);
      }
    };
    fetchUser();
  }, [router.isReady, router.query]);

  return (
    <div>
      <h2>업로드된 영상 목록</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        {videos.length === 0 && <div>영상이 없습니다.</div>}
        {videos.map((filename: string, idx: number) => (
          <video
            key={idx}
            src={`/public/uploads/0/${filename}`}
            controls
            width={320}
            style={{ marginBottom: 16 }}
          />
        ))}
      </div>
    </div>
  );
}
