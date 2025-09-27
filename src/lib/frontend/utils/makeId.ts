// session ID 생성 유틸리티
// sess-<timestamp>-<random>

export const makeId = (prefix = "id") =>
  `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
