import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const getEnvValue = (key: string): string => {
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key]!;
  }
  return "";
};

let _supabaseClient: SupabaseClient | null = null;
const getSupabase = (): SupabaseClient | null => {
  if (_supabaseClient) return _supabaseClient;

  let url = "https://taxlvyiijpanfzwrmuih.supabase.co";
  let key = "sb_publishable_Xyp-Y9U-x152t2e6C1cItw_futrI8_G";

  try {
    const config = useRuntimeConfig();
    if (config?.public?.supabaseUrl) url = config.public.supabaseUrl;
    if (config?.public?.supabaseKey) key = config.public.supabaseKey;
  } catch (e) {
    // 런타임 이전 환경 fallback
  }

  if (!key && typeof process !== "undefined" && process.env) {
    if (process.env.SUPABASE_URL) url = process.env.SUPABASE_URL;
    if (process.env.SUPABASE_KEY) key = process.env.SUPABASE_KEY;
  }

  if (url && key) {
    try {
      _supabaseClient = createClient(url, key);
    } catch (e) {
      console.warn("[Supabase] Init error:", e);
    }
  } else {
    console.warn("[Supabase] SUPABASE_KEY가 비어있어 클라우드 동기화가 대기 중입니다.");
  }
  return _supabaseClient;
};

export interface ProductItem {
  id: string;
  name: string;
  price: number;
  image: string;
  images?: string[]; // 📸 상품 사진 최대 5장 지원
  tag: string;
  badgeColor?: string;
  description: string;
  details?: string;
  isPopular?: boolean;
}

export interface OrderItemEntry {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image: string;
}

export interface OrderItem {
  id: string;
  createdAt: string;
  createdAtTimestamp?: number; // 주문 생성 시각 (ms 타임스탬프)
  instagramId: string;
  buyerName: string;
  phone: string;
  address: string;
  shippingId: string;
  shippingType: string;
  shippingCost: number;
  items: OrderItemEntry[];
  totalProductAmount: number;
  totalAmount: number;
  depositorName: string;
  memo: string;
  status: "pending" | "paid" | "making" | "shipping" | "completed" | "cancelled";
  trackingNumber?: string;
  statusHistory?: { status: string; timestamp: string; note?: string }[];
  customImage?: string; // 📸 맞춤제작 도안/사진 또는 완성 제품 사진 (Base64/URL)
  adminNotes?: string; // 📝 관리자 전용 내부 메모
}

export interface RefundItem {
  id: string;
  orderId: string;
  buyerName: string;
  phone: string;
  amount: number;
  reason: string;
  refundBank: string;
  refundAccount: string;
  refundHolder: string;
  createdAt: string;
  status: "requested" | "processing" | "completed" | "rejected";
  adminNote?: string;
}

export interface InquiryItem {
  id: string;
  type: "상품문의" | "커스텀제작" | "배송문의" | "건의사항" | "기타";
  name: string;
  contact: string;
  content: string;
  createdAt: string;
  status: "unread" | "read" | "answered";
  adminReply?: string;
}

export interface ReviewItem {
  id: string;
  author: string;
  rating: number; // 1 ~ 5
  productName: string;
  content: string;
  image?: string;
  createdAt: string;
  likes: number;
  isVerified: boolean;
  isVisible: boolean;
}

export interface NotificationItem {
  id: string;
  type: "order" | "refund" | "inquiry" | "review" | "system";
  title: string;
  message: string;
  createdAt: string;
  timestamp: number;
  isRead: boolean;
  link?: string;
  metadata?: {
    orderId?: string;
    buyerName?: string;
    amount?: number;
    phone?: string;
    productName?: string;
    rating?: number;
    inquiryType?: string;
  };
}

export interface AdminSettings {
  adminPassword?: string;
  soundAlertEnabled: boolean;
  browserNotificationEnabled: boolean;
  // 카카오톡 알림 연동
  kakaoAlertEnabled: boolean;
  kakaoAccessToken: string;
  kakaoJsKey: string;
  kakaoNotifyOrder: boolean;
  kakaoNotifyRefund: boolean;
  kakaoNotifyReview: boolean;
  kakaoNotifyInquiry: boolean;
  // 계좌 정보
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

// 📢 사용자 페이지(홈/주문서/푸터)에 노출되는 공지 및 주문 안내 문구 모델
export interface SiteNotices {
  noticeContent: string;     // 1. 공지사항 (제작기간, 환불불가 등)
  shippingContent: string;   // 2. 배송안내 (일반/반택 비용 및 지점명)
  cautionContent: string;    // 3. 주문 유의사항 (24시간 미입금 취소 등)
  washingContent: string;    // 4. 세탁 시 주의사항 (울샴푸, 손세탁)
  shopIntro: string;         // 5. 공방 브랜드 소개 문구
  instagramId: string;       // 6. 인스타그램 계정 ID
  makingPeriod: string;      // 7. 제작 소요 기간 안내 문구
  courierInfo: string;       // 8. 배송사 안내 문구
}

// 공방 기본 공지 및 주문안내 정밀 텍스트 (이미지 2~5번 100% 반영)
export const DEFAULT_SITE_NOTICES: SiteNotices = {
  noticeContent: `• 핸드메이드 특성상 개체마다 약간의 실밥이나 비대칭이 발생할 수 있습니다.
• 주문 및 입금 확인 후 제작까지 약 3~7일 소요됩니다. (주문량 폭주 시 다소 지연될 수 있습니다.)
• 주문 제작 특성상 제작 착수 후 단순 변심으로 인한 교환/환불은 불가합니다.`,

  shippingContent: `• 일반 택배(CJ대한통운/한진택배): 4,000원 (제주 및 도서산간 5,000원)
• GS25 반택 / CU 알뜰택배: 2,000원 (반드시 수령하실 편의점 지점명을 주소란에 기재해 주세요!)
• 안전하고 꼼꼼하게 에어캡 포장하여 소중히 배송해 드립니다.`,

  cautionContent: `• 입금자와 주문자명이 다를 경우 메모란에 꼭 남겨주세요.
• 주문서 작성 후 24시간 이내 미입금 시 주문이 자동 취소될 수 있습니다.
• 맞춤 제작 문의나 긴급 요청사항은 인스타그램 DM(@hyebin_knit)으로 연락 부탁드립니다.`,

  washingContent: `• 뜨개실은 물에 닿거나 비틀어 짜면 수축/늘어짐 현상이 발생할 수 있으니 세탁기 사용은 자제해 주세요.
• 미온수에 중성세제(울샴푸)를 풀어 가볍게 조물조물 손세탁해 주세요.
• 수건으로 물기를 가볍게 털어낸 후 그늘에서 자연 건조(타월 드라이)를 권장합니다.`,

  shopIntro: `동글동글 귀여운 인형 친구들을 위한 사랑스러운 맞춤 뜨개옷 & 소품 공방입니다. 한 땀 한 땀 정성을 담아 제작하여 보내드립니다.`,

  instagramId: `@hyebin_knit`,
  makingPeriod: `입금 확인 후 약 3~7 영업일 소요`,
  courierInfo: `CJ대한통운 / 우체국 / GS25·CU 편의점 택배`,
};

// 🌟 사용자 대상 팝업 모달 안내 설정 (공지 및 새 상품 안내)
export interface PopupNotice {
  isActive: boolean; // 팝업 노출 활성화 여부
  type: "product" | "notice"; // 새 상품 안내 vs 일반 공지
  targetProductId: string; // 새 상품일 경우 이동할 대상 상품 ID
  badgeText: string; // 모달 상단 뱃지
  title: string; // 팝업 제목
  content: string; // 팝업 상세 내용
  imageUrl: string; // 팝업 사진 URL
  isAlways: boolean; // 기간 무제한(상시 노출) 여부
  startDate: string; // 노출 시작 일시 (YYYY-MM-DDTHH:mm)
  endDate: string; // 노출 종료 일시 (YYYY-MM-DDTHH:mm)
  actionButtonText: string; // 바로가기 버튼 문구
  showActionButton: boolean; // 바로가기 버튼 표시 여부
}

export const DEFAULT_POPUP_NOTICE: PopupNotice = {
  isActive: true,
  type: "product",
  targetProductId: "apple",
  badgeText: "NEW 신상품 출시 안내",
  title: "2026 앉은누이 귀여운 신상 컬렉션 오픈!",
  content: `동글동글 귀여운 인형 친구들을 위한 맞춤 사과 뜨개옷이 새롭게 출시되었습니다!
100% 핸드메이드 정성으로 한 땀 한 땀 제작되는 맞춤 뜨개옷을 지금 바로 주문서에서 만나보세요 ✨`,
  imageUrl: "/images/products/apple.jpg",
  isAlways: true,
  startDate: "2026-11-01T00:00",
  endDate: "2026-12-31T23:59",
  actionButtonText: "신상품 바로 보러가기",
  showActionButton: true,
};

// 9가지 앉은누이 뜨개옷 상품 정밀 데이터 (최대 5장 다중 사진 지원)
export const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: "apple",
    name: "사과",
    price: 14000,
    image: "/images/products/apple.jpg",
    images: ["/images/products/apple.jpg", "/images/products/apple_devil.jpg"],
    tag: "BEST",
    badgeColor: "#ff4d6d",
    description: "새빨간 사과에 앙증맞은 꼭지와 초록 잎사귀가 포인트인 시그니처 뜨개 모자",
    details: "부드러운 면혼방사로 제작되어 인형 털 손상 없이 쏙 씌워집니다.",
    isPopular: true,
  },
  {
    id: "apple_devil",
    name: "사과 데빌 ver.",
    price: 14000,
    image: "/images/products/apple_devil.jpg",
    images: ["/images/products/apple_devil.jpg", "/images/products/apple.jpg"],
    tag: "HOT",
    badgeColor: "#c9184a",
    description: "장난꾸러기 악마 뿔과 디테일 날개가 돋보이는 사과 데빌 에디션",
    details: "사과 모자에 깜찍한 뿔이 달려있어 할로윈이나 포인트 연출에 최고예요.",
    isPopular: true,
  },
  {
    id: "peach",
    name: "복숭아",
    price: 14000,
    image: "/images/products/peach.jpg",
    images: ["/images/products/peach.jpg", "/images/products/peach_sailor.jpg"],
    tag: "인기",
    badgeColor: "#ff758f",
    description: "은은한 베이비 핑크빛 복숭아 모양 보닛과 앙증맞은 잎사귀 장식",
    details: "동글동글한 복숭아 라인이 얼굴을 더욱 사랑스럽고 화사하게 만들어줍니다.",
    isPopular: true,
  },
  {
    id: "peach_sailor",
    name: "복숭아 세라(파랑, 분홍) ver.",
    price: 15000,
    image: "/images/products/peach_sailor.jpg",
    images: ["/images/products/peach_sailor.jpg", "/images/products/peach.jpg"],
    tag: "추천",
    badgeColor: "#59a5d8",
    description: "복숭아 모자에 청량한 세라복 카라가 함께 구성된 투피스 느낌의 세라 세트",
    details: "파랑 세라 / 분홍 세라 2가지 옵션으로 친구 인형과 트윈룩으로 입히기 좋아요.",
    isPopular: true,
  },
  {
    id: "lemon",
    name: "레몬",
    price: 14000,
    image: "/images/products/lemon.jpg",
    images: ["/images/products/lemon.jpg"],
    tag: "상큼",
    badgeColor: "#ffb703",
    description: "보기만 해도 상큼해지는 레몬 옐로우 컬러와 싱그러운 나뭇잎 포인트",
    details: "화사하고 쨍한 색감이라 야외 출사 사진 찍을 때 특히 예쁘게 나옵니다.",
    isPopular: false,
  },
  {
    id: "strawberry",
    name: "딸기",
    price: 14000,
    image: "/images/products/strawberry.jpg",
    images: ["/images/products/strawberry.jpg"],
    tag: "BEST",
    badgeColor: "#e63946",
    description: "달콤한 생크림 보닛 위에 콕 얹어진 탐스러운 빨간 딸기 모자",
    details: "새하얀 베이스와 선명한 딸기 오브제가 어우러져 어디서나 시선 집중!",
    isPopular: true,
  },
  {
    id: "rose_santa",
    name: "장미 산타 ver.",
    price: 15000,
    image: "/images/products/rose_santa.jpg",
    images: ["/images/products/rose_santa.jpg", "/images/products/rose_bonnet.jpg"],
    tag: "시즌한정",
    badgeColor: "#a4161a",
    description: "고급스러운 딥와인 레드 컬러에 하얀 퐁퐁 방울이 달린 장미 산타 에디션",
    details: "겨울 시즌 감성을 가득 담아 연말 선물용으로 가장 사랑받는 디자인입니다.",
    isPopular: false,
  },
  {
    id: "rose_bonnet",
    name: "장미 기본/보닛 ver.",
    price: 15000,
    image: "/images/products/rose_bonnet.jpg",
    images: ["/images/products/rose_bonnet.jpg", "/images/products/rose_santa.jpg"],
    tag: "우아",
    badgeColor: "#9d0208",
    description: "물결치는 프릴 디테일이 인형 얼굴을 폭 감싸주는 우아한 장미 보닛",
    details: "목 부분 리본을 살짝 묶어 사랑스럽게 착용하는 고풍스러운 보닛 스타일입니다.",
    isPopular: false,
  },
  {
    id: "acorn",
    name: "도토리 모자 세트",
    price: 15000,
    image: "/images/products/acorn.jpg",
    images: ["/images/products/acorn.jpg"],
    tag: "세트할인",
    badgeColor: "#8b5a2b",
    description: "올망졸망 도토리 꼭지 베레모와 미니 도토리 크로스백 소품 세트",
    details: "모자뿐만 아니라 작은 손가방까지 한 세트로 제공되어 완성도 높은 코디 가능!",
    isPopular: true,
  },
];

export const SHIPPING_OPTIONS = [
  {
    id: "normal",
    name: "일반 택배 (CJ대한통운/한진)",
    cost: 4000,
    desc: "기본 택배 (발송 후 1~2일 소요)",
  },
  {
    id: "island",
    name: "일반 택배 [제주/도서 산간지역]",
    cost: 5000,
    desc: "제주도 및 도서산간 추가 운임 포함",
  },
  {
    id: "half",
    name: "GS반택 / CU알뜰택배",
    cost: 2000,
    desc: "편의점 수령 (주소란에 반드시 GS/CU 점포명을 적어주세요!)",
  },
];

const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: "rev-1",
    author: "모찌맘 (@mochi_nui)",
    rating: 5,
    productName: "사과 & 딸기",
    content: "실물이 오조오억배는 더 귀여워요ㅠㅠ 실밥 하나 없이 꼼꼼하게 뜨개질되어있고 인형에 씌우니까 볼살 뽈록 튀어나오는게 심장 아픕니다.. 다른 과일도 꼭 재구매할게요!",
    image: "/images/products/apple.jpg",
    createdAt: "2026-11-05 14:20",
    likes: 18,
    isVerified: true,
    isVisible: true,
  },
  {
    id: "rev-2",
    author: "먼작귀덕후 (@chiikawa_love)",
    rating: 5,
    productName: "도토리 모자 세트",
    content: "도토리 모자 꼭지가 쫑긋 살아있어서 너무 귀엽고 같이 주신 미니 도토리 가방 매달아주니까 가을 소풍 나온 다람쥐 같아요 🍂 포장도 너무 정성스러웠어요 감사해요!",
    image: "/images/products/acorn.jpg",
    createdAt: "2026-11-06 18:32",
    likes: 12,
    isVerified: true,
    isVisible: true,
  },
  {
    id: "rev-3",
    author: "솜뭉치키우기 (@som_daily)",
    rating: 5,
    productName: "복숭아 세라 ver.",
    content: "세라복 카라 디테일 대박이에요! 파랑으로 주문했는데 색감도 쨍하고 핏이 딱 맞아서 벗겨지지도 않네요. 손세탁 설명서도 동봉해주셔서 안심하고 관리할 수 있겠어요.",
    image: "/images/products/peach_sailor.jpg",
    createdAt: "2026-11-07 11:15",
    likes: 9,
    isVerified: true,
    isVisible: true,
  },
];

const INITIAL_ORDERS: OrderItem[] = [
  {
    id: "ORD-20261108-8120",
    createdAt: "2026-11-08 14:30",
    createdAtTimestamp: Date.now() - 3600000 * 4,
    instagramId: "cotton_candy_nui",
    buyerName: "김민서",
    phone: "010-8924-1102",
    address: "서울시 마포구 독막로 12길 15 301호",
    shippingId: "normal",
    shippingType: "일반 택배 (CJ대한통운/한진)",
    shippingCost: 4000,
    items: [
      { productId: "apple", productName: "사과", price: 14000, quantity: 1, image: "/images/products/apple.jpg" },
      { productId: "peach", productName: "복숭아", price: 14000, quantity: 1, image: "/images/products/peach.jpg" },
    ],
    totalProductAmount: 28000,
    totalAmount: 32000,
    depositorName: "김민서",
    memo: "문 앞에 놓아주세요. 꼭지 예쁘게 부탁드려요!",
    status: "paid",
    trackingNumber: "",
    statusHistory: [
      { status: "pending", timestamp: "2026-11-08 14:30", note: "주문서 접수 완료" },
      { status: "paid", timestamp: "2026-11-08 14:45", note: "입금 확인 완료" },
    ],
  },
  {
    id: "ORD-20261108-9531",
    createdAt: "2026-11-08 16:10",
    createdAtTimestamp: Date.now() - 3600000 * 2,
    instagramId: "bear_lover",
    buyerName: "이지은",
    phone: "010-3451-9082",
    address: "GS25 마포중앙점 (편의점 수령)",
    shippingId: "half",
    shippingType: "GS반택 / CU알뜰택배",
    shippingCost: 2000,
    items: [
      { productId: "strawberry", productName: "딸기", price: 14000, quantity: 2, image: "/images/products/strawberry.jpg" },
    ],
    totalProductAmount: 28000,
    totalAmount: 30000,
    depositorName: "이지은",
    memo: "친구랑 트윈으로 맞추는 거라 딸기 크기 비슷하게 부탁드립니다 :)",
    status: "pending",
    trackingNumber: "",
    statusHistory: [
      { status: "pending", timestamp: "2026-11-08 16:10", note: "주문서 접수 완료 (입금 대기 중)" },
    ],
  },
];

const INITIAL_INQUIRIES: InquiryItem[] = [
  {
    id: "inq-1",
    type: "커스텀제작",
    name: "박하늘",
    contact: "@haneul_sky",
    content: "혹시 10cm 인형 말고 15cm 인형 사이즈로도 제작이 가능한지 궁금합니다! 사과 모자 넘 맘에 들어요.",
    createdAt: "2026-11-07 16:45",
    status: "answered",
    adminReply: "안녕하세요! 네, 머리둘레를 남겨주시면 15cm 인형 맞춤 커스텀 제작 가능합니다. 인스타 DM으로 사이즈 상담 도와드릴게요!",
  },
  {
    id: "inq-2",
    type: "배송문의",
    name: "정수아",
    contact: "010-9988-1234",
    content: "이번 주 금요일까지 받아야 하는데 오늘 주문하면 목요일까지 출고가 가능할까요?",
    createdAt: "2026-11-08 13:10",
    status: "unread",
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    type: "order",
    title: "🛍️ 신규 주문 접수",
    message: "김민주님께서 [사과, 복숭아 세라 ver.] 총 31,000원을 주문하셨습니다.",
    createdAt: "방금 전 (16:10)",
    timestamp: Date.now() - 1000 * 60 * 18,
    isRead: false,
    link: "/admin",
    metadata: {
      orderId: "ORD-20261108-8421",
      buyerName: "김민주",
      amount: 31000,
      phone: "010-1234-5678",
    },
  },
  {
    id: "notif-2",
    type: "inquiry",
    title: "💌 커스텀 제작 문의",
    message: "박하늘님: '10cm 인형 말고 15cm 인형 사이즈로도 제작이 가능한지 궁금합니다!'",
    createdAt: "어제 16:45",
    timestamp: Date.now() - 1000 * 60 * 60 * 25,
    isRead: false,
    link: "/admin",
    metadata: {
      buyerName: "박하늘",
      inquiryType: "커스텀제작",
    },
  },
  {
    id: "notif-3",
    type: "review",
    title: "⭐ 5성 포토 후기 도착",
    message: "콩순이맘님: '누이한테 씌워줬는데 너무 찰떡이고 귀여워요ㅠㅠ 실물이 오조오억배 예쁩니다!'",
    createdAt: "2일 전",
    timestamp: Date.now() - 1000 * 60 * 60 * 50,
    isRead: true,
    link: "/reviews",
    metadata: {
      buyerName: "콩순이맘",
      productName: "사과 (사과 모자)",
      rating: 5,
    },
  },
];

export const useKnittingStore = defineStore("knittingStore", () => {
  // 상태
  const products = ref<ProductItem[]>([...INITIAL_PRODUCTS]);
  const orders = ref<OrderItem[]>([...INITIAL_ORDERS]);
  const refunds = ref<RefundItem[]>([]);
  const inquiries = ref<InquiryItem[]>([...INITIAL_INQUIRIES]);
  const reviews = ref<ReviewItem[]>([...INITIAL_REVIEWS]);
  const notifications = ref<NotificationItem[]>([...INITIAL_NOTIFICATIONS]);

  // 관리자 인증 & 설정
  const isAdminLoggedIn = ref<boolean>(false);
  const adminActiveTab = ref<"orders" | "products" | "notices" | "popups" | "refunds" | "inquiries" | "reviews" | "settings">("orders");
  const adminScrollTrigger = ref<number>(0);

  // 📢 사용자 페이지 공지 및 주문 안내 문구 상태 (2~5번 이미지)
  const siteNotices = ref<SiteNotices>({ ...DEFAULT_SITE_NOTICES });

  // 🌟 사용자 팝업 안내 및 신상품 안내 설정
  const popupNotice = ref<PopupNotice>({ ...DEFAULT_POPUP_NOTICE });
  const isUserNoticeModalOpen = ref<boolean>(false);

  const switchAdminTab = (tab: "orders" | "products" | "notices" | "popups" | "refunds" | "inquiries" | "reviews" | "settings") => {
    adminActiveTab.value = tab;
    adminScrollTrigger.value++;
  };

  // 전역 인앱 알림 모달 상태 (브라우저 기본 alert 완전 대체)
  const alertModal = ref<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "error";
    confirmText: string;
  }>({
    isOpen: false,
    title: "알림",
    message: "",
    type: "info",
    confirmText: "확인",
  });

  const showAlert = (
    message: string,
    options?: {
      title?: string;
      type?: "info" | "success" | "warning" | "error";
      confirmText?: string;
    }
  ) => {
    alertModal.value = {
      isOpen: true,
      title: options?.title || "안내",
      message,
      type: options?.type || "info",
      confirmText: options?.confirmText || "확인",
    };
  };

  const closeAlert = () => {
    alertModal.value.isOpen = false;
  };

  // 전역 인앱 토스트 팝업 (가벼운 복사/저장 알림)
  const toast = ref<{
    show: boolean;
    message: string;
    type: "info" | "success" | "warning";
  }>({
    show: false,
    message: "",
    type: "info",
  });

  let toastTimer: any = null;
  const showToast = (message: string, type: "info" | "success" | "warning" = "success") => {
    if (toastTimer) clearTimeout(toastTimer);
    toast.value = { show: true, message, type };
    toastTimer = setTimeout(() => {
      toast.value.show = false;
    }, 2400);
  };
  const settings = ref<AdminSettings>({
    adminPassword: "admin1234",
    soundAlertEnabled: true,
    browserNotificationEnabled: true,
    // 카카오톡 알림
    kakaoAlertEnabled: true,
    kakaoAccessToken: "",
    kakaoJsKey: "",
    kakaoNotifyOrder: true,
    kakaoNotifyRefund: true,
    kakaoNotifyReview: true,
    kakaoNotifyInquiry: true,
    // 공식 계좌 정보
    bankName: "카카오뱅크",
    accountNumber: "3333-12-8924018",
    accountHolder: "전혜빈",
  });

  // 전역 모달 상태
  const isFeedbackModalOpen = ref<boolean>(false);
  const isOrderLookupModalOpen = ref<boolean>(false);
  const isReviewWriteModalOpen = ref<boolean>(false);
  const isNotificationModalOpen = ref<boolean>(false);
  const previewImageUrl = ref<string>("");

  // 계산된 속성 (통계 등)
  const unreadNotificationCount = computed(() => {
    return notifications.value.filter((n) => !n.isRead).length;
  });
  const totalRevenue = computed(() => {
    return orders.value
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.totalAmount, 0);
  });

  const pendingCount = computed(() => orders.value.filter((o) => o.status === "pending").length);
  const paidCount = computed(() => orders.value.filter((o) => o.status === "paid").length);
  const makingCount = computed(() => orders.value.filter((o) => o.status === "making").length);
  const shippingCount = computed(() => orders.value.filter((o) => o.status === "shipping").length);
  const completedCount = computed(() => orders.value.filter((o) => o.status === "completed").length);
  const unreadInquiriesCount = computed(() => inquiries.value.filter((i) => i.status === "unread").length);
  const pendingRefundsCount = computed(() => refunds.value.filter((r) => r.status === "requested").length);

  // 로컬 스토리지 불러오기 & 저장
  const loadFromLocalStorage = () => {
    if (typeof window === "undefined") return;
    try {
      const storedProducts = localStorage.getItem("knitting_products");
      if (storedProducts) {
        try {
          const parsed = JSON.parse(storedProducts);
          if (Array.isArray(parsed) && parsed.length > 0) {
            products.value = parsed.map((p) => ({
              ...p,
              images: (p.images && Array.isArray(p.images) && p.images.length > 0)
                ? p.images
                : (p.image ? [p.image] : []),
            }));
          }
        } catch (e) {
          console.error("Failed to parse stored products:", e);
        }
      }

      const storedOrders = localStorage.getItem("knitting_orders");
      if (storedOrders) orders.value = JSON.parse(storedOrders);

      const storedRefunds = localStorage.getItem("knitting_refunds");
      if (storedRefunds) refunds.value = JSON.parse(storedRefunds);

      const storedInquiries = localStorage.getItem("knitting_inquiries");
      if (storedInquiries) inquiries.value = JSON.parse(storedInquiries);

      const storedReviews = localStorage.getItem("knitting_reviews");
      if (storedReviews) reviews.value = JSON.parse(storedReviews);

      const storedNotifications = localStorage.getItem("knitting_notifications");
      if (storedNotifications) notifications.value = JSON.parse(storedNotifications);

      const storedSettings = localStorage.getItem("knitting_settings");
      if (storedSettings) {
        settings.value = { ...settings.value, ...JSON.parse(storedSettings) };
      }

      // 📢 사용자 공지 및 주문 안내 문구 불러오기
      const storedNotices = localStorage.getItem("knitting_site_notices");
      if (storedNotices) {
        try {
          siteNotices.value = { ...DEFAULT_SITE_NOTICES, ...JSON.parse(storedNotices) };
        } catch (e) {
          console.error("Failed to parse site notices:", e);
        }
      }

      // 🌟 사용자 팝업 안내 및 신상품 안내 설정 불러오기
      const storedPopup = localStorage.getItem("knitting_popup_notice");
      if (storedPopup) {
        try {
          const parsed = JSON.parse(storedPopup);
          popupNotice.value = { ...DEFAULT_POPUP_NOTICE, ...parsed };
          const stripLeadingEmoji = (str?: string) =>
            str ? str.replace(/^[\s\p{Extended_Pictographic}\u200d\ufe0f🍎🧶📢🌟🛒🛍️👉✨]+/u, "").trim() : "";
          if (popupNotice.value.actionButtonText) {
            popupNotice.value.actionButtonText = stripLeadingEmoji(popupNotice.value.actionButtonText);
          }
          if (popupNotice.value.badgeText) {
            popupNotice.value.badgeText = stripLeadingEmoji(popupNotice.value.badgeText);
          }
        } catch (e) {
          console.error("Failed to parse popup notice:", e);
        }
      }

      const adminSession = sessionStorage.getItem("knitting_admin_auth");
      if (adminSession === "true") {
        isAdminLoggedIn.value = true;
      }

      // ⏰ 로컬스토리지 불러올 때 24시간 지난 미입금 주문 즉시 자동 취소 검사
      checkAndCancelExpiredOrders();

      // 🌐 Supabase 서버와 비동기 데이터 동기화 (최신 상품, 공지, 주문, 리뷰)
      syncFromSupabase();
    } catch (e) {
      console.error("Failed to load from localStorage:", e);
    }
  };

  // ⏰ 24시간 미입금 주문 자동 취소 검사기
  const EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24시간

  const checkAndCancelExpiredOrders = () => {
    if (typeof window === "undefined") return;
    const now = Date.now();
    let hasChanges = false;

    orders.value.forEach((order) => {
      // 입금 대기("pending") 상태인 주문만 24시간 초과 시 취소
      if (order.status === "pending") {
        let orderTime = order.createdAtTimestamp;
        if (!orderTime) {
          const parsed = new Date(order.createdAt).getTime();
          orderTime = isNaN(parsed) ? now : parsed;
          order.createdAtTimestamp = orderTime;
        }

        const elapsed = now - orderTime;
        if (elapsed >= EXPIRATION_MS) {
          order.status = "cancelled";
          if (!order.statusHistory) order.statusHistory = [];
          const cancelTimeStr = new Date().toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" });
          order.statusHistory.push({
            status: "cancelled",
            timestamp: cancelTimeStr,
            note: "주문서 작성 후 24시간 이내 미입금으로 시스템에 의해 자동 취소되었습니다.",
          });

          // 관리자 알림 센터에 자동 취소 알림 추가
          addNotification({
            type: "system",
            title: "⏰ 24시간 미입금 자동 취소",
            message: `주문번호 [${order.id}] (${order.buyerName}님) 건이 24시간 동안 미입금되어 자동 취소되었습니다.`,
            link: "/admin",
            metadata: {
              orderId: order.id,
              buyerName: order.buyerName,
              amount: order.totalAmount,
            },
          });

          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      saveToLocalStorage();
    }
  };

  // 1분마다 주기적 자동 검사
  if (typeof window !== "undefined") {
    setInterval(() => {
      checkAndCancelExpiredOrders();
    }, 60000);
  }

  // 🌐 Supabase 서버와 비동기 데이터 동기화
  const syncFromSupabase = async () => {
    const client = getSupabase();
    if (!client) return;

    try {
      // 1. 상품 카탈로그 동기화
      const { data: pData } = await client
        .from("knitting_products")
        .select("*")
        .order("order_num", { ascending: true });
      if (pData && pData.length > 0) {
        products.value = pData.map((row: any) => ({
          id: row.id,
          name: row.name,
          price: row.price,
          image: row.image,
          images: row.images || [row.image],
          tag: row.tag || "BEST",
          badgeColor: row.badge_color || "#ff4d6d",
          description: row.description || "",
          details: row.details || "",
          isPopular: row.is_popular ?? false,
        }));
        if (typeof window !== "undefined") {
          localStorage.setItem("knitting_products", JSON.stringify(products.value));
        }
      }

      // 2. 공지 & 주문안내 문구 동기화
      const { data: nData } = await client
        .from("knitting_site_notices")
        .select("*")
        .eq("id", "main_notices")
        .maybeSingle();
      if (nData) {
        siteNotices.value = {
          noticeContent: nData.notice_content || siteNotices.value.noticeContent,
          shippingContent: nData.shipping_content || siteNotices.value.shippingContent,
          cautionContent: nData.caution_content || siteNotices.value.cautionContent,
          washingContent: nData.washing_content || siteNotices.value.washingContent,
          shopIntro: nData.shop_intro || siteNotices.value.shopIntro,
          instagramId: nData.instagram_id || siteNotices.value.instagramId,
          makingPeriod: nData.making_period || siteNotices.value.makingPeriod,
          courierInfo: nData.courier_info || siteNotices.value.courierInfo,
        };
        if (typeof window !== "undefined") {
          localStorage.setItem("knitting_site_notices", JSON.stringify(siteNotices.value));
        }
      }

      // 3. 팝업 안내 설정 동기화
      const { data: popData } = await client
        .from("knitting_popup_notice")
        .select("*")
        .eq("id", "main_popup")
        .maybeSingle();
      if (popData) {
        popupNotice.value = {
          isActive: popData.is_active ?? popupNotice.value.isActive,
          type: popData.type || popupNotice.value.type,
          targetProductId: popData.target_product_id || popupNotice.value.targetProductId,
          badgeText: popData.badge_text || popupNotice.value.badgeText,
          title: popData.title || popupNotice.value.title,
          content: popData.content || popupNotice.value.content,
          imageUrl: popData.image_url || popupNotice.value.imageUrl,
          isAlways: popData.is_always ?? popupNotice.value.isAlways,
          startDate: popData.start_date || popupNotice.value.startDate,
          endDate: popData.end_date || popupNotice.value.endDate,
          actionButtonText: popData.action_button_text || popupNotice.value.actionButtonText,
          showActionButton: popData.show_action_button ?? popupNotice.value.showActionButton,
        };
        if (typeof window !== "undefined") {
          localStorage.setItem("knitting_popup_notice", JSON.stringify(popupNotice.value));
        }
      }

      // 4. 구매자 리뷰 동기화
      const { data: rData } = await client
        .from("knitting_reviews")
        .select("*")
        .order("created_at", { ascending: false });
      if (rData && rData.length > 0) {
        reviews.value = rData.map((row: any) => ({
          id: row.id,
          author: row.author,
          rating: row.rating,
          productName: row.product_name,
          content: row.content,
          image: row.image,
          createdAt: row.created_at ? new Date(row.created_at).toLocaleString("ko-KR") : "",
          likes: row.likes || 0,
          isVerified: row.is_verified ?? true,
          isVisible: row.is_visible ?? true,
        }));
        if (typeof window !== "undefined") {
          localStorage.setItem("knitting_reviews", JSON.stringify(reviews.value));
        }
      }

      // 5. 주문 내역 동기화
      const { data: oData } = await client
        .from("knitting_orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (oData && oData.length > 0) {
        orders.value = oData.map((row: any) => ({
          id: row.id,
          createdAt: row.created_at ? new Date(row.created_at).toLocaleString("ko-KR") : "",
          createdAtTimestamp: row.created_at_timestamp || new Date(row.created_at).getTime(),
          instagramId: row.instagram_id,
          buyerName: row.buyer_name,
          phone: row.phone,
          address: row.address,
          shippingId: row.shipping_id,
          shippingType: row.shipping_type,
          shippingCost: row.shipping_cost,
          items: row.items || [],
          totalProductAmount: row.total_product_amount,
          totalAmount: row.total_amount,
          depositorName: row.depositor_name,
          memo: row.memo,
          status: row.status,
          trackingNumber: row.tracking_number,
          statusHistory: row.status_history || [],
          customImage: row.custom_image,
          adminNotes: row.admin_notes,
        }));
        if (typeof window !== "undefined") {
          localStorage.setItem("knitting_orders", JSON.stringify(orders.value));
        }
      }

      // 6. 환불 및 문의 내역 동기화
      const { data: refData } = await client
        .from("knitting_refunds")
        .select("*")
        .order("created_at", { ascending: false });
      if (refData && refData.length > 0) {
        refunds.value = refData.map((row: any) => ({
          id: row.id,
          createdAt: row.created_at ? new Date(row.created_at).toLocaleString("ko-KR") : "",
          orderId: row.order_id,
          buyerName: row.buyer_name,
          phone: row.phone,
          amount: row.amount,
          reason: row.reason,
          refundBank: row.refund_bank,
          refundAccount: row.refund_account,
          refundHolder: row.refund_holder,
          status: row.status,
          adminNote: row.admin_note,
        }));
        if (typeof window !== "undefined") {
          localStorage.setItem("knitting_refunds", JSON.stringify(refunds.value));
        }
      }

      const { data: inqData } = await client
        .from("knitting_inquiries")
        .select("*")
        .order("created_at", { ascending: false });
      if (inqData && inqData.length > 0) {
        inquiries.value = inqData.map((row: any) => ({
          id: row.id,
          createdAt: row.created_at ? new Date(row.created_at).toLocaleString("ko-KR") : "",
          type: row.type,
          name: row.name,
          contact: row.contact,
          content: row.content,
          status: row.status,
          adminReply: row.admin_reply,
        }));
        if (typeof window !== "undefined") {
          localStorage.setItem("knitting_inquiries", JSON.stringify(inquiries.value));
        }
      }

      // 7. 상점 및 카카오톡 설정 동기화
      const { data: sData } = await client
        .from("knitting_settings")
        .select("*")
        .eq("id", "main_settings")
        .maybeSingle();
      if (sData) {
        settings.value = {
          ...settings.value,
          adminPassword: sData.admin_password || settings.value.adminPassword,
          bankName: sData.bank_name || settings.value.bankName,
          accountNumber: sData.account_number || settings.value.accountNumber,
          accountHolder: sData.account_holder || settings.value.accountHolder,
          soundAlertEnabled: sData.sound_alert_enabled ?? true,
          browserNotificationEnabled: sData.browser_notification_enabled ?? true,
          kakaoAlertEnabled: sData.kakao_alert_enabled ?? true,
          kakaoAccessToken: sData.kakao_access_token || "",
          kakaoJsKey: sData.kakao_js_key || settings.value.kakaoJsKey,
          kakaoNotifyOrder: sData.kakao_notify_order ?? true,
          kakaoNotifyRefund: sData.kakao_notify_refund ?? true,
          kakaoNotifyReview: sData.kakao_notify_review ?? true,
          kakaoNotifyInquiry: sData.kakao_notify_inquiry ?? true,
        };
        if (typeof window !== "undefined") {
          localStorage.setItem("knitting_settings", JSON.stringify(settings.value));
        }
      }
    } catch (err) {
      console.warn("[Supabase] Data sync notice:", err);
    }
  };

  const saveToLocalStorage = () => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("knitting_products", JSON.stringify(products.value));
      localStorage.setItem("knitting_orders", JSON.stringify(orders.value));
      localStorage.setItem("knitting_refunds", JSON.stringify(refunds.value));
      localStorage.setItem("knitting_inquiries", JSON.stringify(inquiries.value));
      localStorage.setItem("knitting_reviews", JSON.stringify(reviews.value));
      localStorage.setItem("knitting_notifications", JSON.stringify(notifications.value));
      localStorage.setItem("knitting_settings", JSON.stringify(settings.value));
      localStorage.setItem("knitting_site_notices", JSON.stringify(siteNotices.value));
      localStorage.setItem("knitting_popup_notice", JSON.stringify(popupNotice.value));
    } catch (e: any) {
      console.warn("LocalStorage save warning (recovering quota):", e);
      // QuotaExceededError 발생 시 알림 기록 등 비필수 데이터 정리 후 핵심 데이터(상품, 주문) 재저장
      try {
        localStorage.removeItem("knitting_notifications");
        localStorage.setItem("knitting_products", JSON.stringify(products.value));
        localStorage.setItem("knitting_orders", JSON.stringify(orders.value));
      } catch (innerErr) {
        console.error("Critical storage failure:", innerErr);
      }
    }
  };

  // 🔔 알림 모달 관리 메서드들
  const addNotification = (notif: {
    type: NotificationItem["type"];
    title: string;
    message: string;
    link?: string;
    metadata?: NotificationItem["metadata"];
  }) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: `방금 전 (${timeStr})`,
      timestamp: Date.now(),
      isRead: false,
      ...notif,
    };
    notifications.value.unshift(newNotif);
    saveToLocalStorage();

    // 알림음 및 진동
    playChimeSound();
    triggerVibration();

    return newNotif;
  };

  const markNotificationAsRead = (id: string) => {
    const target = notifications.value.find((n) => n.id === id);
    if (target) {
      target.isRead = true;
      saveToLocalStorage();
    }
  };

  const markAllNotificationsAsRead = () => {
    notifications.value.forEach((n) => (n.isRead = true));
    saveToLocalStorage();
  };

  const deleteNotification = (id: string) => {
    notifications.value = notifications.value.filter((n) => n.id !== id);
    saveToLocalStorage();
  };

  const clearAllNotifications = () => {
    notifications.value = [];
    saveToLocalStorage();
  };

  // 소리 차임벨 재생 (Web Audio API 신디사이저 - 맑은 크리스탈 차임 소리)
  const playChimeSound = () => {
    if (typeof window === "undefined") return;
    if (!settings.value.soundAlertEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const now = ctx.currentTime;
      // 맑고 통통 튀는 사랑스러운 4단 알림 차임 (도-미-솔-높은도)
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0, now + idx * 0.1);
        gain.gain.linearRampToValueAtTime(0.3, now + idx * 0.1 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 0.55);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.6);
      });
    } catch (err) {
      console.warn("Could not play synthesized audio chime:", err);
    }
  };

  // 모바일 진동
  const triggerVibration = () => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([200, 100, 200, 100, 400]);
      } catch (e) {
        // ignore
      }
    }
  };

  // 브라우저 웹 푸시 알림
  const triggerBrowserNotification = (title: string, body: string) => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (!settings.value.browserNotificationEnabled) return;
    if (Notification.permission === "granted") {
      try {
        new Notification(title, {
          body,
          icon: "/favicon1.png",
          badge: "/favicon1.png",
        });
      } catch (e) {
        console.warn("Browser notification failed:", e);
      }
    }
  };

  // 브라우저 알림 권한 요청
  const requestNotificationPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      showAlert("현재 접속하신 브라우저는 웹 알림 기능을 지원하지 않습니다.", { type: "warning" });
      return false;
    }
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      showToast("알림 권한이 허용되었습니다! 새로운 주문 발생 시 알림이 표시됩니다. 🔔", "success");
      return true;
    } else {
      showAlert("알림 권한이 거부되었습니다. 브라우저 설정에서 사이트 알림을 허용해주세요.", { type: "warning" });
      return false;
    }
  };

  // 💛 카카오톡 '나에게 보내기' 공식 REST API 실시간 알림 발송
  const sendKakaoTalkMessage = async (text: string, buttonUrl = "http://localhost:3000/admin") => {
    if (!settings.value.kakaoAlertEnabled) {
      return { success: false, reason: "카카오톡 알림 기능이 꺼져 있습니다." };
    }

    const token = settings.value.kakaoAccessToken?.trim();
    if (!token) {
      return { success: false, reason: "카카오톡 액세스 토큰이 등록되지 않았습니다." };
    }

    const templateObject = {
      object_type: "text",
      text,
      link: {
        web_url: buttonUrl,
        mobile_web_url: buttonUrl,
      },
      button_title: "관리자 대시보드 바로가기",
    };

    try {
      const bodyParams = new URLSearchParams();
      bodyParams.append("template_object", JSON.stringify(templateObject));

      const res = await fetch("https://kapi.kakao.com/v2/api/talk/memo/default/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        },
        body: bodyParams.toString(),
      });

      const data = await res.json();
      if (data.result_code === 0) {
        return { success: true };
      } else {
        return {
          success: false,
          reason: data.msg || `카카오 API 에러 (${data.result_code})`,
          needReauth: data.result_code === -401,
        };
      }
    } catch (err: any) {
      return { success: false, reason: err.message || "네트워크 통신 오류" };
    }
  };

  // 신규 주문 접수 및 휴대폰(카카오톡 / 사운드 / 진동) 알림 발송
  const createOrder = async (orderInput: {
    instagramId: string;
    buyerName: string;
    phone: string;
    address: string;
    shippingId: string;
    items: OrderItemEntry[];
    depositorName?: string;
    memo?: string;
  }) => {
    const selectedShipping = SHIPPING_OPTIONS.find((s) => s.id === orderInput.shippingId) || SHIPPING_OPTIONS[0];
    const totalProductAmount = orderInput.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalAmount = totalProductAmount + selectedShipping.cost;

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `ORD-${dateStr}-${randomSuffix}`;

    const newOrder: OrderItem = {
      id: orderId,
      createdAt: now.toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" }),
      createdAtTimestamp: now.getTime(),
      instagramId: orderInput.instagramId.replace(/^@/, ""),
      buyerName: orderInput.buyerName,
      phone: orderInput.phone,
      address: orderInput.address,
      shippingId: selectedShipping.id,
      shippingType: selectedShipping.name,
      shippingCost: selectedShipping.cost,
      items: orderInput.items,
      totalProductAmount,
      totalAmount,
      depositorName: orderInput.depositorName || orderInput.buyerName,
      memo: orderInput.memo || "",
      status: "pending",
      trackingNumber: "",
      statusHistory: [
        {
          status: "pending",
          timestamp: now.toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" }),
          note: "주문서 접수 완료 (입금 대기 중)",
        },
      ],
    };

    orders.value.unshift(newOrder);
    saveToLocalStorage();

    // 🔔 0. 알림 센터 모달에 실시간 알림 추가
    addNotification({
      type: "order",
      title: "🛍️ 신규 주문 접수",
      message: `${newOrder.buyerName}님께서 [${newOrder.items.map((i) => `${i.productName} ${i.quantity}개`).join(", ")}] 총 ${newOrder.totalAmount.toLocaleString()}원을 주문하셨습니다.`,
      link: "/admin",
      metadata: {
        orderId: newOrder.id,
        buyerName: newOrder.buyerName,
        amount: newOrder.totalAmount,
        phone: newOrder.phone,
      },
    });

    // 🔔 1. 사운드, 모바일 진동 및 시스템 푸시 (오직 관리자 화면/로그인 상태에서만 울림)
    if (isAdminLoggedIn.value) {
      playChimeSound();
      triggerVibration();
      triggerBrowserNotification(
        "🧶 새 뜨개옷 주문이 도착했습니다!",
        `${newOrder.buyerName}님 (@${newOrder.instagramId})의 주문: ${newOrder.items.map((i) => `${i.productName} ${i.quantity}개`).join(", ")} (${newOrder.totalAmount.toLocaleString()}원)`
      );
    }

    // 💛 3. 관리자 카카오톡 실시간 푸시 알림 발송!
    if (settings.value.kakaoNotifyOrder) {
      const kakaoText = `🔔 [새 뜨개옷 주문 도착!]\n\n` +
        `• 주문번호: ${newOrder.id}\n` +
        `• 주문자: ${newOrder.buyerName} (@${newOrder.instagramId})\n` +
        `• 연락처: ${newOrder.phone}\n` +
        `• 주문상품: ${newOrder.items.map((i) => `${i.productName} ${i.quantity}개`).join(", ")}\n` +
        `• 총 결제금액: ${newOrder.totalAmount.toLocaleString()}원 (${newOrder.shippingType})\n` +
        `• 배송지: ${newOrder.address}\n` +
        `• 입금자명: ${newOrder.depositorName}\n` +
        `• 요청메모: ${newOrder.memo || "없음"}\n\n` +
        `👉 관리자 페이지에서 입금 확인 및 상태를 변경해주세요!`;

      sendKakaoTalkMessage(kakaoText);
    }

    // 🌐 Supabase 서버 주문 등록
    try {
      const client = getSupabase();
      if (client) {
        client.from("knitting_orders").insert({
          id: newOrder.id,
          created_at_timestamp: newOrder.createdAtTimestamp,
          instagram_id: newOrder.instagramId,
          buyer_name: newOrder.buyerName,
          phone: newOrder.phone,
          address: newOrder.address,
          shipping_id: newOrder.shippingId,
          shipping_type: newOrder.shippingType,
          shipping_cost: newOrder.shippingCost,
          items: newOrder.items,
          total_product_amount: newOrder.totalProductAmount,
          total_amount: newOrder.totalAmount,
          depositor_name: newOrder.depositorName,
          memo: newOrder.memo,
          status: newOrder.status,
          tracking_number: newOrder.trackingNumber || null,
          status_history: newOrder.statusHistory || [],
          custom_image: newOrder.customImage || null,
          admin_notes: newOrder.adminNotes || null,
        }).then(({ error }: any) => {
          if (error) console.warn("[Supabase] Order insert error:", error);
        });
      }
    } catch (e) {
      console.warn("[Supabase] Order sync error:", e);
    }

    return newOrder;
  };

  // 주문 상태 변경
  const updateOrderStatus = (orderId: string, newStatus: OrderItem["status"], trackingNumber?: string, note?: string) => {
    const order = orders.value.find((o) => o.id === orderId);
    if (!order) return;

    order.status = newStatus;
    if (trackingNumber !== undefined) {
      order.trackingNumber = trackingNumber;
    }
    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status: newStatus,
      timestamp: new Date().toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" }),
      note: note || `주문 상태가 '${getStatusLabel(newStatus)}'(으)로 변경되었습니다.`,
    });

    saveToLocalStorage();

    // 🌐 Supabase 서버 상태 업데이트
    try {
      const client = getSupabase();
      if (client) {
        client.from("knitting_orders").update({
          status: newStatus,
          tracking_number: order.trackingNumber || null,
          status_history: order.statusHistory || [],
          updated_at: new Date().toISOString(),
        }).eq("id", orderId).then(({ error }: any) => {
          if (error) console.warn("[Supabase] Order status update error:", error);
        });
      }
    } catch (e) {
      console.warn("[Supabase] Order status sync error:", e);
    }
  };

  // 관리자 전용: 주문서 상세 및 맞춤 사진 수정
  const updateOrderDetails = (orderId: string, updatedData: Partial<OrderItem>) => {
    const orderIndex = orders.value.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) {
      showToast("수정할 주문서를 찾을 수 없습니다.");
      return false;
    }

    const currentOrder = orders.value[orderIndex];

    // 상태 변경 감지 시 히스토리 자동 기록
    let history = currentOrder.statusHistory ? [...currentOrder.statusHistory] : [];
    if (updatedData.status && updatedData.status !== currentOrder.status) {
      history.push({
        status: updatedData.status,
        timestamp: new Date().toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" }),
        note: `관리자가 주문 상태를 '${getStatusLabel(updatedData.status)}'(으)로 변경함`,
      });
    }

    // 아이템 및 배송비 재계산
    const newItems = updatedData.items !== undefined ? updatedData.items : currentOrder.items;
    const newShippingCost = updatedData.shippingCost !== undefined ? updatedData.shippingCost : currentOrder.shippingCost;
    const totalProductAmount = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalAmount = totalProductAmount + newShippingCost;

    orders.value[orderIndex] = {
      ...currentOrder,
      ...updatedData,
      items: newItems,
      shippingCost: newShippingCost,
      totalProductAmount,
      totalAmount,
      statusHistory: history,
    };

    saveToLocalStorage();

    // 🌐 Supabase 서버 주문서 상세 업데이트
    try {
      const client = getSupabase();
      if (client) {
        client.from("knitting_orders").update({
          instagram_id: orders.value[orderIndex].instagramId,
          buyer_name: orders.value[orderIndex].buyerName,
          phone: orders.value[orderIndex].phone,
          address: orders.value[orderIndex].address,
          shipping_id: orders.value[orderIndex].shippingId,
          shipping_type: orders.value[orderIndex].shippingType,
          shipping_cost: orders.value[orderIndex].shippingCost,
          items: orders.value[orderIndex].items,
          total_product_amount: orders.value[orderIndex].totalProductAmount,
          total_amount: orders.value[orderIndex].totalAmount,
          depositor_name: orders.value[orderIndex].depositorName,
          memo: orders.value[orderIndex].memo,
          status: orders.value[orderIndex].status,
          tracking_number: orders.value[orderIndex].trackingNumber || null,
          status_history: orders.value[orderIndex].statusHistory || [],
          custom_image: orders.value[orderIndex].customImage || null,
          admin_notes: orders.value[orderIndex].adminNotes || null,
          updated_at: new Date().toISOString(),
        }).eq("id", orderId).then(({ error }: any) => {
          if (error) console.warn("[Supabase] Order details update error:", error);
        });
      }
    } catch (e) {
      console.warn("[Supabase] Order details sync error:", e);
    }

    showToast("주문서 및 사진 수정이 안전하게 저장되었습니다! ✨");
    return true;
  };

  // 환불 요청 등록 및 카카오톡 알림
  const requestRefund = (orderId: string, refundData: {
    buyerName: string;
    phone: string;
    amount: number;
    reason: string;
    refundBank: string;
    refundAccount: string;
    refundHolder: string;
  }) => {
    const refundId = `REF-${Date.now().toString().slice(-6)}`;
    const newRefund: RefundItem = {
      id: refundId,
      orderId,
      buyerName: refundData.buyerName,
      phone: refundData.phone,
      amount: refundData.amount,
      reason: refundData.reason,
      refundBank: refundData.refundBank,
      refundAccount: refundData.refundAccount,
      refundHolder: refundData.refundHolder,
      createdAt: new Date().toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" }),
      status: "requested",
    };

    refunds.value.unshift(newRefund);
    updateOrderStatus(orderId, "cancelled", undefined, `환불 요청 접수됨 (${refundData.reason})`);
    saveToLocalStorage();

    // 🔔 0. 알림 센터 모달에 실시간 알림 추가
    addNotification({
      type: "refund",
      title: "💸 환불/취소 요청 접수",
      message: `${refundData.buyerName}님께서 [주문 ${orderId}] ${refundData.amount.toLocaleString()}원 환불을 요청하셨습니다. (사유: ${refundData.reason})`,
      link: "/admin",
      metadata: {
        orderId,
        buyerName: refundData.buyerName,
        amount: refundData.amount,
        phone: refundData.phone,
      },
    });

    // 관리자 사운드 및 브라우저 알림
    playChimeSound();
    triggerVibration();
    triggerBrowserNotification("💸 환불 요청 접수", `${refundData.buyerName}님의 환불 요청: ${refundData.reason}`);

    // 💛 관리자 카카오톡 알림
    if (settings.value.kakaoNotifyRefund) {
      const kakaoText = `💸 [환불/취소 요청 접수!]\n\n` +
        `• 주문번호: ${orderId}\n` +
        `• 신청자: ${refundData.buyerName} (${refundData.phone})\n` +
        `• 환불금액: ${refundData.amount.toLocaleString()}원\n` +
        `• 환불사유: ${refundData.reason}\n` +
        `• 환불계좌: ${refundData.refundBank} ${refundData.refundAccount} (예금주: ${refundData.refundHolder})\n\n` +
        `👉 관리자 대시보드에서 환불 계좌를 확인해주세요!`;

      sendKakaoTalkMessage(kakaoText);
    }

    // 🌐 Supabase 서버 환불 요청 등록
    try {
      const client = getSupabase();
      if (client) {
        client.from("knitting_refunds").insert({
          id: newRefund.id,
          order_id: newRefund.orderId,
          buyer_name: newRefund.buyerName,
          phone: newRefund.phone,
          amount: newRefund.amount,
          reason: newRefund.reason,
          refund_bank: newRefund.refundBank,
          refund_account: newRefund.refundAccount,
          refund_holder: newRefund.refundHolder,
          status: newRefund.status,
          admin_note: newRefund.adminNote || null,
        }).then(({ error }: any) => {
          if (error) console.warn("[Supabase] Refund insert error:", error);
        });
      }
    } catch (e) {
      console.warn("[Supabase] Refund sync error:", e);
    }

    return newRefund;
  };

  // 환불 처리 상태 변경 (관리자)
  const updateRefundStatus = (refundId: string, status: RefundItem["status"], adminNote?: string) => {
    const refund = refunds.value.find((r) => r.id === refundId);
    if (!refund) return;
    refund.status = status;
    if (adminNote) refund.adminNote = adminNote;
    saveToLocalStorage();

    // 🌐 Supabase 서버 환불 상태 업데이트
    try {
      const client = getSupabase();
      if (client) {
        client.from("knitting_refunds").update({
          status,
          admin_note: adminNote || null,
          updated_at: new Date().toISOString(),
        }).eq("id", refundId).then(({ error }: any) => {
          if (error) console.warn("[Supabase] Refund status update error:", error);
        });
      }
    } catch (e) {
      console.warn("[Supabase] Refund status sync error:", e);
    }
  };

  // 의견/문의 등록 및 카카오톡 알림
  const createInquiry = (inquiryInput: {
    type: InquiryItem["type"];
    name: string;
    contact: string;
    content: string;
  }) => {
    const inqId = `INQ-${Date.now().toString().slice(-6)}`;
    const newInquiry: InquiryItem = {
      id: inqId,
      type: inquiryInput.type,
      name: inquiryInput.name,
      contact: inquiryInput.contact,
      content: inquiryInput.content,
      createdAt: new Date().toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" }),
      status: "unread",
    };

    inquiries.value.unshift(newInquiry);
    saveToLocalStorage();

    // 🔔 0. 알림 센터 모달에 실시간 알림 추가
    addNotification({
      type: "inquiry",
      title: `💌 [${newInquiry.type}] 문의 접수`,
      message: `${newInquiry.name}님: "${newInquiry.content.slice(0, 40)}${newInquiry.content.length > 40 ? "..." : ""}"`,
      link: "/admin",
      metadata: {
        buyerName: newInquiry.name,
        inquiryType: newInquiry.type,
      },
    });

    // 🔔 사운드 & 브라우저 알림
    playChimeSound();
    triggerVibration();
    triggerBrowserNotification("💌 새 고객 의견/문의 도착", `[${newInquiry.type}] ${newInquiry.name}님: ${newInquiry.content.slice(0, 30)}...`);

    // 💛 관리자 카카오톡 알림
    if (settings.value.kakaoNotifyInquiry) {
      const kakaoText = `💌 [새 고객 문의/의견 접수!]\n\n` +
        `• 문의유형: ${newInquiry.type}\n` +
        `• 작성자: ${newInquiry.name} (${newInquiry.contact})\n` +
        `• 문의내용:\n"${newInquiry.content}"\n\n` +
        `👉 관리자 대시보드에서 확인 및 답변을 남겨주세요!`;

      sendKakaoTalkMessage(kakaoText);
    }

    // 🌐 Supabase 서버 문의 등록
    try {
      const client = getSupabase();
      if (client) {
        client.from("knitting_inquiries").insert({
          id: newInquiry.id,
          type: newInquiry.type,
          name: newInquiry.name,
          contact: newInquiry.contact,
          content: newInquiry.content,
          status: newInquiry.status,
        }).then(({ error }: any) => {
          if (error) console.warn("[Supabase] Inquiry insert error:", error);
        });
      }
    } catch (e) {
      console.warn("[Supabase] Inquiry sync error:", e);
    }

    return newInquiry;
  };

  // 문의 처리 상태 변경 (관리자)
  const updateInquiryStatus = (inquiryId: string, status: InquiryItem["status"], reply?: string) => {
    const inquiry = inquiries.value.find((i) => i.id === inquiryId);
    if (!inquiry) return;
    inquiry.status = status;
    if (reply !== undefined) inquiry.adminReply = reply;
    saveToLocalStorage();

    // 🌐 Supabase 서버 문의 상태 업데이트
    try {
      const client = getSupabase();
      if (client) {
        client.from("knitting_inquiries").update({
          status,
          admin_reply: reply !== undefined ? reply : (inquiry.adminReply || null),
          updated_at: new Date().toISOString(),
        }).eq("id", inquiryId).then(({ error }: any) => {
          if (error) console.warn("[Supabase] Inquiry status update error:", error);
        });
      }
    } catch (e) {
      console.warn("[Supabase] Inquiry status sync error:", e);
    }
  };

  // 리뷰 등록 및 카카오톡 알림
  const createReview = (reviewInput: {
    author: string;
    rating: number;
    productName: string;
    content: string;
    image?: string;
  }) => {
    const revId = `REV-${Date.now().toString().slice(-6)}`;
    const newReview: ReviewItem = {
      id: revId,
      author: reviewInput.author,
      rating: reviewInput.rating,
      productName: reviewInput.productName,
      content: reviewInput.content,
      image: reviewInput.image || "",
      createdAt: new Date().toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" }),
      likes: 0,
      isVerified: true,
      isVisible: true,
    };

    reviews.value.unshift(newReview);
    saveToLocalStorage();

    // 🔔 0. 알림 센터 모달에 실시간 알림 추가
    addNotification({
      type: "review",
      title: "⭐ 새 포토 후기 등록",
      message: `${newReview.author}님 (${'★'.repeat(newReview.rating)}): "${newReview.content.slice(0, 40)}${newReview.content.length > 40 ? "..." : ""}"`,
      link: "/reviews",
      metadata: {
        buyerName: newReview.author,
        productName: newReview.productName,
        rating: newReview.rating,
      },
    });

    // 🔔 사운드 & 브라우저 알림
    playChimeSound();
    triggerBrowserNotification("⭐ 새 뜨개옷 후기 등록", `${newReview.author}님의 후기 (평점: ${newReview.rating}점)`);

    // 🌐 Supabase 서버 리뷰 등록
    try {
      const client = getSupabase();
      if (client) {
        client.from("knitting_reviews").insert({
          id: newReview.id,
          author: newReview.author,
          rating: newReview.rating,
          product_name: newReview.productName,
          content: newReview.content,
          image: newReview.image || null,
          likes: newReview.likes,
          is_verified: newReview.isVerified,
          is_visible: newReview.isVisible,
        }).then(({ error }: any) => {
          if (error) console.warn("[Supabase] Review insert error:", error);
        });
      }
    } catch (e) {
      console.warn("[Supabase] Review sync error:", e);
    }

    // 💛 관리자 카카오톡 알림
    if (settings.value.kakaoNotifyReview) {
      const kakaoText = `⭐ [새 포토 리뷰 등록!]\n\n` +
        `• 작성자: ${newReview.author}\n` +
        `• 평점: ${'★'.repeat(newReview.rating)} (${newReview.rating}점)\n` +
        `• 구매상품: ${newReview.productName}\n` +
        `• 리뷰내용:\n"${newReview.content}"\n\n` +
        `👉 관리자 대시보드에서 리뷰를 확인해보세요!`;

      sendKakaoTalkMessage(kakaoText);
    }

    return newReview;
  };

  const toggleReviewVisibility = (reviewId: string) => {
    const rev = reviews.value.find((r) => r.id === reviewId);
    if (!rev) return;
    rev.isVisible = !rev.isVisible;
    saveToLocalStorage();
    showToast(rev.isVisible ? "후기가 '공개(표시 중)'로 전환되었습니다." : "후기가 '비공개(숨김 상태)'로 전환되었습니다.");
  };

  const deleteReview = (reviewId: string) => {
    reviews.value = reviews.value.filter((r) => r.id !== reviewId);
    saveToLocalStorage();
    showToast("리뷰가 삭제되었습니다.");
  };

  const likeReview = (reviewId: string) => {
    const rev = reviews.value.find((r) => r.id === reviewId);
    if (rev) {
      rev.likes += 1;
      saveToLocalStorage();
    }
  };

  // 관리자 인증
  const loginAdmin = (password: string): boolean => {
    const correctPassword = settings.value.adminPassword || "admin1234";
    if (password === correctPassword) {
      isAdminLoggedIn.value = true;
      if (typeof window !== "undefined") {
        sessionStorage.setItem("knitting_admin_auth", "true");
      }
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    isAdminLoggedIn.value = false;
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("knitting_admin_auth");
    }
  };

  const updateAdminSettings = (newSettings: Partial<AdminSettings>) => {
    settings.value = { ...settings.value, ...newSettings };
    saveToLocalStorage();

    // 🌐 Supabase 서버 설정 업데이트
    try {
      const client = getSupabase();
      if (client) {
        client.from("knitting_settings").upsert({
          id: "main_settings",
          admin_password: settings.value.adminPassword,
          sound_alert_enabled: settings.value.soundAlertEnabled,
          browser_notification_enabled: settings.value.browserNotificationEnabled,
          kakao_alert_enabled: settings.value.kakaoAlertEnabled,
          kakao_access_token: settings.value.kakaoAccessToken,
          kakao_js_key: settings.value.kakaoJsKey,
          kakao_notify_order: settings.value.kakaoNotifyOrder,
          kakao_notify_refund: settings.value.kakaoNotifyRefund,
          kakao_notify_review: settings.value.kakaoNotifyReview,
          kakao_notify_inquiry: settings.value.kakaoNotifyInquiry,
          bank_name: settings.value.bankName,
          account_number: settings.value.accountNumber,
          account_holder: settings.value.accountHolder,
          updated_at: new Date().toISOString(),
        }).then(({ error }: any) => {
          if (error) console.warn("[Supabase] Settings update error:", error);
        });
      }
    } catch (e) {
      console.warn("[Supabase] Settings sync error:", e);
    }
  };

  // 관리자 비밀번호 변경 및 검증
  const verifyAdminPassword = (pw: string): boolean => {
    const current = settings.value.adminPassword || "admin1234";
    return pw === current;
  };

  const changeAdminPassword = (newPw: string): boolean => {
    if (!newPw || newPw.trim().length < 4) return false;
    settings.value.adminPassword = newPw.trim();
    saveToLocalStorage();

    // 🌐 Supabase 서버 비밀번호 업데이트
    try {
      const client = getSupabase();
      if (client) {
        client.from("knitting_settings").update({
          admin_password: settings.value.adminPassword,
          updated_at: new Date().toISOString(),
        }).eq("id", "main_settings").then(({ error }: any) => {
          if (error) console.warn("[Supabase] Password update error:", error);
        });
      }
    } catch (e) {
      console.warn("[Supabase] Password sync error:", e);
    }

    return true;
  };

  // 상태 라벨 헬퍼
  const getStatusLabel = (status: OrderItem["status"]): string => {
    switch (status) {
      case "pending":
        return "입금 대기";
      case "paid":
        return "입금 확인";
      case "making":
        return "제작 중";
      case "shipping":
        return "배송 중";
      case "completed":
        return "배송 완료";
      case "cancelled":
        return "주문 취소/환불";
      default:
        return status;
    }
  };

  const getStatusColor = (status: OrderItem["status"]): string => {
    switch (status) {
      case "pending":
        return "#f59e0b";
      case "paid":
        return "#3b82f6";
      case "making":
        return "#ec4899";
      case "shipping":
        return "#8b5cf6";
      case "completed":
        return "#10b981";
      case "cancelled":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  // 🛍️ 관리자 전용: 주문서 상품(카탈로그) 추가 (최대 5장 사진 지원)
  const addProduct = (productData: Omit<ProductItem, "id">) => {
    const id = `prod_${Date.now()}`;
    const rawImages = productData.images && productData.images.length > 0
      ? productData.images.slice(0, 5)
      : (productData.image ? [productData.image] : []);
    const mainImage = rawImages[0] || productData.image || "/images/products/apple.jpg";

    const newProduct: ProductItem = {
      id,
      ...productData,
      image: mainImage,
      images: rawImages.length > 0 ? rawImages : [mainImage],
    };
    products.value.unshift(newProduct);
    saveToLocalStorage();

    // 🌐 Supabase 비동기 동기화
    try {
      const client = getSupabase();
      if (client) {
        client.from("knitting_products").insert({
          id: newProduct.id,
          name: newProduct.name,
          price: newProduct.price,
          image: newProduct.image,
          images: newProduct.images || [newProduct.image],
          tag: newProduct.tag || "BEST",
          badge_color: newProduct.badgeColor || "#ff4d6d",
          description: newProduct.description || "",
          details: newProduct.details || "",
          is_popular: Boolean(newProduct.isPopular),
          order_num: 0,
        }).then(({ error }: any) => {
          if (error) console.error("Supabase addProduct sync error:", error);
        });
      }
    } catch (e) {
      console.warn("Supabase addProduct background sync failed", e);
    }

    showToast(`'${newProduct.name}' 상품이 성공적으로 등록되었습니다! 🎉`);
    return newProduct;
  };

  // 🛍️ 관리자 전용: 주문서 상품(사진 최대 5장, 이름, 가격, 태그 등) 수정
  const updateProduct = (id: string, updatedData: Partial<ProductItem>) => {
    const index = products.value.findIndex((p) => p.id === id);
    if (index === -1) {
      showToast("수정할 상품을 찾을 수 없습니다.");
      return false;
    }

    let nextImages = updatedData.images
      ? updatedData.images.slice(0, 5)
      : products.value[index].images;

    if (!nextImages || nextImages.length === 0) {
      const fallbackImg = updatedData.image || products.value[index].image;
      nextImages = fallbackImg ? [fallbackImg] : [];
    }

    const mainImage = nextImages[0] || updatedData.image || products.value[index].image;

    products.value[index] = {
      ...products.value[index],
      ...updatedData,
      image: mainImage,
      images: nextImages,
    };
    saveToLocalStorage();

    // 🌐 Supabase 비동기 동기화
    try {
      const client = getSupabase();
      if (client) {
        const prod = products.value[index];
        client.from("knitting_products").update({
          name: prod.name,
          price: prod.price,
          image: prod.image,
          images: prod.images || [prod.image],
          tag: prod.tag || "BEST",
          badge_color: prod.badgeColor || "#ff4d6d",
          description: prod.description || "",
          details: prod.details || "",
          is_popular: Boolean(prod.isPopular),
          updated_at: new Date().toISOString(),
        }).eq("id", id).then(({ error }: any) => {
          if (error) console.error("Supabase updateProduct sync error:", error);
        });
      }
    } catch (e) {
      console.warn("Supabase updateProduct background sync failed", e);
    }

    showToast(`'${products.value[index].name}' 상품 정보가 안전하게 수정되었습니다! ✨`);
    return true;
  };

  // 🛍️ 관리자 전용: 주문서 상품 삭제
  const deleteProduct = (id: string) => {
    if (products.value.length <= 1) {
      showAlert("최소 1개 이상의 주문서 상품이 유지되어야 합니다.", {
        type: "warning",
        title: "삭제 불가",
      });
      return false;
    }
    const target = products.value.find((p) => p.id === id);
    const targetName = target ? target.name : "상품";
    products.value = products.value.filter((p) => p.id !== id);
    saveToLocalStorage();

    // 🌐 Supabase 비동기 동기화
    try {
      const client = getSupabase();
      if (client) {
        client.from("knitting_products").delete().eq("id", id).then(({ error }: any) => {
          if (error) console.error("Supabase deleteProduct sync error:", error);
        });
      }
    } catch (e) {
      console.warn("Supabase deleteProduct background sync failed", e);
    }

    showToast(`'${targetName}' 상품이 삭제되었습니다.`);
    return true;
  };

  // 🛍️ 관리자 전용: 기본 9개 상품으로 복구
  const resetProductsToDefault = () => {
    products.value = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
    saveToLocalStorage();
    showToast("초기 기본 9개 상품 목록으로 복원되었습니다.");
  };

  // 📢 관리자 전용: 공지사항, 배송안내, 세탁주의, 공방소개/인스타 등 수정 (2~5번 이미지)
  const updateSiteNotices = (payload: Partial<SiteNotices>) => {
    siteNotices.value = {
      ...siteNotices.value,
      ...payload,
    };
    saveToLocalStorage();

    // 🌐 Supabase 비동기 동기화
    try {
      const client = getSupabase();
      if (client) {
        client.from("knitting_site_notices").upsert({
          id: "main_notices",
          notice_content: siteNotices.value.noticeContent,
          shipping_content: siteNotices.value.shippingContent,
          caution_content: siteNotices.value.cautionContent,
          washing_content: siteNotices.value.washingContent,
          shop_intro: siteNotices.value.shopIntro,
          instagram_id: siteNotices.value.instagramId,
          making_period: siteNotices.value.makingPeriod,
          courier_info: siteNotices.value.courierInfo,
          updated_at: new Date().toISOString(),
        }).then(({ error }: any) => {
          if (error) console.error("Supabase updateSiteNotices sync error:", error);
        });
      }
    } catch (e) {
      console.warn("Supabase updateSiteNotices background sync failed", e);
    }

    showToast("공지 및 주문 안내 문구가 안전하게 저장되었습니다! ✨");
    return true;
  };

  // 📢 관리자 전용: 기본 공지 및 주문 안내 문구로 초기화
  const resetSiteNoticesToDefault = () => {
    siteNotices.value = { ...DEFAULT_SITE_NOTICES };
    saveToLocalStorage();
    showToast("초기 기본 공지 및 주문 안내 문구로 복원되었습니다.");
  };

  // 🌟 관리자 전용: 사용자 팝업 안내 & 새 상품 안내 설정 저장
  const updatePopupNotice = (payload: Partial<PopupNotice>) => {
    const cleanPayload = { ...payload };
    const stripLeadingEmoji = (str?: string) =>
      str ? str.replace(/^[\s\p{Extended_Pictographic}\u200d\ufe0f🍎🧶📢🌟🛒🛍️👉✨]+/u, "").trim() : str;
    if (cleanPayload.actionButtonText) {
      cleanPayload.actionButtonText = stripLeadingEmoji(cleanPayload.actionButtonText);
    }
    if (cleanPayload.badgeText) {
      cleanPayload.badgeText = stripLeadingEmoji(cleanPayload.badgeText);
    }
    popupNotice.value = {
      ...popupNotice.value,
      ...cleanPayload,
    };
    saveToLocalStorage();

    // 🌐 Supabase 비동기 동기화
    try {
      const client = getSupabase();
      if (client) {
        client.from("knitting_popup_notice").upsert({
          id: "main_popup",
          is_active: popupNotice.value.isActive,
          type: popupNotice.value.type,
          target_product_id: popupNotice.value.targetProductId,
          badge_text: popupNotice.value.badgeText,
          title: popupNotice.value.title,
          content: popupNotice.value.content,
          image_url: popupNotice.value.imageUrl,
          is_always: popupNotice.value.isAlways,
          start_date: popupNotice.value.startDate,
          end_date: popupNotice.value.endDate,
          action_button_text: popupNotice.value.actionButtonText,
          show_action_button: popupNotice.value.showActionButton,
          updated_at: new Date().toISOString(),
        }).then(({ error }: any) => {
          if (error) console.error("Supabase updatePopupNotice sync error:", error);
        });
      }
    } catch (e) {
      console.warn("Supabase updatePopupNotice background sync failed", e);
    }

    showToast("사용자 팝업 안내 설정이 저장되었습니다! ✨");
    return true;
  };

  // 🌟 관리자 전용: 기본 팝업 설정으로 복원
  const resetPopupNoticeToDefault = () => {
    popupNotice.value = { ...DEFAULT_POPUP_NOTICE };
    saveToLocalStorage();
    showToast("기본 팝업 안내 설정으로 복원되었습니다.");
  };

  return {
    products,
    orders,
    refunds,
    inquiries,
    reviews,
    notifications,
    settings,
    siteNotices,
    popupNotice,
    isUserNoticeModalOpen,
    isAdminLoggedIn,
    adminActiveTab,
    adminScrollTrigger,
    switchAdminTab,
    alertModal,
    showAlert,
    closeAlert,
    toast,
    showToast,
    isFeedbackModalOpen,
    isOrderLookupModalOpen,
    isReviewWriteModalOpen,
    isNotificationModalOpen,
    unreadNotificationCount,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications,
    previewImageUrl,
    totalRevenue,
    pendingCount,
    paidCount,
    makingCount,
    shippingCount,
    completedCount,
    unreadInquiriesCount,
    pendingRefundsCount,
    loadFromLocalStorage,
    saveToLocalStorage,
    checkAndCancelExpiredOrders,
    playChimeSound,
    triggerVibration,
    triggerBrowserNotification,
    requestNotificationPermission,
    sendKakaoTalkMessage,
    createOrder,
    updateOrderStatus,
    updateOrderDetails,
    addProduct,
    updateProduct,
    deleteProduct,
    resetProductsToDefault,
    updateSiteNotices,
    resetSiteNoticesToDefault,
    updatePopupNotice,
    resetPopupNoticeToDefault,
    requestRefund,
    updateRefundStatus,
    createInquiry,
    updateInquiryStatus,
    createReview,
    toggleReviewVisibility,
    deleteReview,
    likeReview,
    loginAdmin,
    logoutAdmin,
    updateAdminSettings,
    verifyAdminPassword,
    changeAdminPassword,
    getStatusLabel,
    getStatusColor,
  };
});
