export interface ProductSwatch {
  color: string;
  name: string;
  label: string;
}

export interface TechSpec {
  key: string;
  value: string;
}

export interface Product {
  id: number;
  name: string;
  price: string;
  rawPrice: number;
  desc: string;
  detailDesc: string;
  img: string;
  tag: string;
  swatches: ProductSwatch[];
  techSpecs?: TechSpec[];
}

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "XT-6 COSMIC NEON BLUE",
    price: "₩ 260,000",
    rawPrice: 260000,
    desc: "아웃도어 기술력과 은하수 궤도 느낌의 네온 블루 컬러웨이가 결합된 트레일 아이콘 슈즈",
    detailDesc: "살로몬 트레일 러닝 역사상 가장 아이코닉한 헤리티지를 자랑하는 XT-6의 은하수 궤도 네온 스페셜 컬렉션입니다. 2013년 최초 출시 이후 세계적인 아웃도어 기어의 최강자로 군림하였으며, 내마모성이 우수한 메쉬 소재와 충격 흡수가 월등한 EVA 아웃솔이 장착되었습니다.",
    img: "/images/salomon_xt6.png",
    tag: "BEST",
    swatches: [
      { color: "#00f2fe", name: "NEON BLUE", label: "네온 블루 배합 컬러 옵션" },
      { color: "#2b2b2b", name: "CYBER BLACK", label: "사이버 블랙 단색 컬러 옵션" },
      { color: "#e6e6e6", name: "VANILLA ICE", label: "바닐라 아이스 투톤 배합 컬러 옵션" },
      { color: "#ff7b7b", name: "SALMON PINK", label: "살몬 핑크 네온 포인트 컬러 옵션" },
      { color: "#c0c0c0", name: "METALLIC SILVER", label: "메탈릭 실버 반사광 컬러 옵션" },
      { color: "#ffffff", name: "PURE WHITE", label: "퓨어 화이트 미니멀 컬러 옵션" }
    ],
    techSpecs: [
      { key: "아웃솔", value: "Mud Contagrip® (어떤 지형에서도 미끄럼 방지)" },
      { key: "레이싱 시스템", value: "Quicklace™ (한 번에 당기는 조임 끈)" },
      { key: "섀시", value: "Agile Chassis™ System (안정성 극대화 구조)" },
      { key: "상부 구조", value: "SensiFit™ (발을 밀착해서 감싸는 최상의 피팅감)" }
    ]
  },
  {
    id: 2,
    name: "XT-6 ASTRONAUT SHADOW",
    price: "₩ 260,000",
    rawPrice: 260000,
    desc: "달 표면을 탐사하는 듯한 은은한 다크 실버와 매트 블랙 스피드로 레이싱이 가능한 스포티 슈즈",
    detailDesc: "우주 비행사의 달 표면 탐사선 콘셉트에서 영감을 받은 다크 실버 & 매트 블랙 시그니처 쉐도우 에디션입니다. 뛰어난 방수 메쉬 가공 처리가 적용되어 습한 아웃도어 트레일 런에서도 최상의 건조한 상태와 안정적인 쿠셔닝을 오랫동안 보장합니다.",
    img: "/images/salomon_xt6.png",
    tag: "NEW",
    swatches: [
      { color: "#2b2b2b", name: "CYBER BLACK", label: "사이버 블랙 단색 컬러 옵션" },
      { color: "#c0c0c0", name: "METALLIC SILVER", label: "메탈릭 실버 반사광 컬러 옵션" },
      { color: "#00f2fe", name: "NEON BLUE", label: "네온 블루 배합 컬러 옵션" },
      { color: "#e6e6e6", name: "VANILLA ICE", label: "바닐라 아이스 투톤 배합 컬러 옵션" },
      { color: "#ffffff", name: "PURE WHITE", label: "퓨어 화이트 미니멀 컬러 옵션" }
    ],
    techSpecs: [
      { key: "아웃솔", value: "All Terrain Contagrip® (모든 지면 접지력 대응)" },
      { key: "레이싱 시스템", value: "Quicklace™ (원터치 조임 레이싱 기법)" },
      { key: "소재", value: "GORE-TEX 방습 레이어 탑재" },
      { key: "피팅 기술", value: "EndoFit™ (양말처럼 착 감기는 이너 슬리브 구조)" }
    ]
  },
  {
    id: 3,
    name: "XT-SPECIAL HYDRO SLICK",
    price: "₩ 280,000",
    rawPrice: 280000,
    desc: "고어텍스 코팅과 오렌지 퀵레이스 포인트가 빛나는 스페셜 한정 컬렉션 트레일 기어",
    detailDesc: "하이드로 코팅 특수 가공과 네온 오렌지 포인트 퀵레이스가 강렬한 조화를 이루는 한정판 스페셜 컬렉션입니다. 험난한 산악 지형을 달리는 극한의 러너들을 위해 하부 지지력이 보강되었으며, 발 피로도를 대폭 낮춰주는 듀얼 밀도 미드솔이 추가 장착되었습니다.",
    img: "/images/salomon_xt6.png",
    tag: "LIMITED",
    swatches: [
      { color: "#ff7b7b", name: "SALMON PINK", label: "살몬 핑크 네온 포인트 컬러 옵션" },
      { color: "#2b2b2b", name: "CYBER BLACK", label: "사이버 블랙 단색 컬러 옵션" },
      { color: "#c0c0c0", name: "METALLIC SILVER", label: "메탈릭 실버 반사광 컬러 옵션" },
      { color: "#00f2fe", name: "NEON BLUE", label: "네온 블루 배합 컬러 옵션" }
    ],
    techSpecs: [
      { key: "아웃솔", value: "Wet Traction Contagrip® (습윤 지면 밀착형 아웃솔)" },
      { key: "레이싱 시스템", value: "Quicklace™ (고강도 Kevlar 특수 조임 끈)" },
      { key: "미드솔", value: "Dual Density EVA (이중 밀도 완충 완충재)" },
      { key: "상부 방어막", value: "Anti-debris Mesh (돌부리 침투 차단망)" }
    ]
  }
];
