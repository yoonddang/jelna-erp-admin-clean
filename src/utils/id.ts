export function generateInternalId(prefix: string, baseId: string): string {
  // 플랫폼에서 받은 주문번호의 공백을 제거합니다.
  const cleanBaseId = String(baseId || "").trim();

  // 만약 주문번호가 없다면, 예외적인 상황을 위해 랜덤 코드를 생성합니다.
  if (!cleanBaseId) {
    const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
    return `${prefix}-NO_ID-${rand}`;
  }

  // "플랫폼-주문번호" 형태로 고정된 자체주문번호를 반환합니다.
  return `${prefix}-${cleanBaseId}`;
}
