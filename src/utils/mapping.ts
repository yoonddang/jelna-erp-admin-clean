import { generateInternalId } from "./id";

export type Platform = "arrange" | "paldo" | "smartstore";

export type UnifiedRow = {
  serviceName: string;            // 서비스명: 어레인지 | 팔도감 | 네이버
  internalOrderId: string;        // 자체주문번호
  platformOrderId: string;        // 서비스 주문번호 (주문번호)
  orderDatetime: string;          // 주문일시
  buyerName: string | null;       // 주문자
  buyerPhone: string | null;      // 주문자 연락처
  receiverName: string;           // 받는분
  receiverPhone: string;          // 받는분 연락처
  receiverAddress: string;        // 받는분 주소
  zipcode: string;                // 우편번호
  deliveryMessage: string | null; // 배송 메시지
  productName: string;            // 상품명
  qty: number;                    // 수량
  trackingNo: string | null;      // 송장번호
};

function prefixForPlatform(platform: Platform): string {
  switch (platform) {
    case "smartstore": return "NV";
    case "paldo": return "PL";
    case "arrange": return "AR";
    default: return "JN";
  }
}

function coalesceId(val: any, platform: Platform) {
  const v = String(val ?? "").trim();
  if (v) return v;
  return generateInternalId(prefixForPlatform(platform));
}

export const PLATFORM_LABEL: Record<Platform, string> = {
  arrange: "어레인지",
  paldo: "팔도감",
  smartstore: "네이버",
};

export function mapArrangeRow(raw: any): UnifiedRow {
  return {
    serviceName: "어레인지",
    internalOrderId: coalesceId(raw["자체주문번호"], "arrange"),
    platformOrderId: String(raw["주문번호"] ?? ""),
    orderDatetime: String(raw["주문일"] ?? raw["주문일시"] ?? ""),
    buyerName: (raw["보내는사람 (주문자)"] ?? null) as string | null,
    buyerPhone: (raw["주문자 연락처"] ?? null) as string | null,
    receiverName: String(raw["받는분"] ?? ""),
    receiverPhone: String(raw["받는분 연락처"] ?? ""),
    receiverAddress: String(raw["받는분 주소"] ?? ""),
    zipcode: String(raw["우편번호"] ?? ""),
    deliveryMessage: (raw["배송메시지"] ?? null) as string | null,
    productName: String(raw["상품명"] ?? ""),
    qty: Number(raw["수량"] ?? 1),
    trackingNo: (raw["송장번호"] ?? null) as string | null,
  };
}

export function mapPaldoRow(raw: any): UnifiedRow {
  return {
    serviceName: "팔도감",
    internalOrderId: coalesceId(raw["자체주문번호"], "paldo"),
    platformOrderId: String(raw["주문번호"] ?? ""),
    orderDatetime: String(raw["주문일시"] ?? ""),
    buyerName: String(raw["수령인"] ?? ""), // 없음
    buyerPhone: null, // 없음
    receiverName: String(raw["수령인"] ?? ""),
    receiverPhone: String(raw["전화번호"] ?? ""),
    receiverAddress: String(raw["배송주소"] ?? ""),
    zipcode: String(raw["우편번호"] ?? ""),
    deliveryMessage: (raw["배송요청사항"] ?? null) as string | null,
    productName: String(raw["상품명"] ?? ""),
    qty: Number(raw["수량"] ?? 1),
    trackingNo: (raw["송장번호"] ?? null) as string | null,
  };
}

export function mapSmartstoreRow(raw: any): UnifiedRow {
  return {
    serviceName: "네이버",
    internalOrderId: coalesceId(raw["자체주문번호"], "smartstore"),
    platformOrderId: String(raw["주문번호"] ?? ""),
    orderDatetime: String(raw["주문일시"] ?? ""),
    buyerName: String(raw["구매자명"] ?? ""), // 필드값 정리상 존재
    buyerPhone: String(raw["구매자 연락처"] ?? raw["구매자연락처"] ?? ""), // 이름 변형 대응
    receiverName: String(raw["수취인명"] ?? ""),
    receiverPhone: String(raw["수취인연락처1"] ?? ""),
    receiverAddress: String(raw["통합배송지"] ?? ""),
    zipcode: String(raw["우편번호"] ?? ""),
    deliveryMessage: (raw["배송메시지"] ?? null) as string | null,
    productName: String(raw["상품명"] ?? ""),
    qty: Number(raw["수량"] ?? 1),
    trackingNo: (raw["송장번호"] ?? null) as string | null,
  };
}

export function toPostOfficeTemplateRows(unified: UnifiedRow[]) {
  return unified.map((r) => ({
    "보내는사람 (주문자)": r.buyerName?.trim() !== '' ? r.buyerName : r.receiverName,
    "주문자 연락처": r.buyerPhone,
    "받는분": r.receiverName,
    "우편번호": r.zipcode,
    "받는분 주소": r.receiverAddress,
    "받는분 연락처": r.receiverPhone,
    "상품명": r.productName,
    "수량": r.qty,
    "빈칸": "",
    "배송메시지": r.internalOrderId,
  }));
}

export function parsePostOfficeResultRow(raw: any) {
  const internalOrderId = String(raw["배송메세지"] || raw["internalOrderId"] || "").trim();
  const trackingNo = String(raw["송장번호"] || raw["trackingNo"] || "").trim();
  return { internalOrderId, trackingNo };
}
