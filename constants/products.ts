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
    name: "ACS 프로 SHELL",
    price: "₩ 260,000",
    rawPrice: 260000,
    desc: "아웃도어 기술력과 은하수 궤도 느낌의 네온 블루 컬러웨이가 결합된 트레일 아이콘 슈즈",
    detailDesc: "살로몬 트레일 러닝 역사상 가장 아이코닉한 헤리티지를 자랑하는 XT-6의 은하수 궤도 네온 스페셜 컬렉션입니다. 2013년 최초 출시 이후 세계적인 아웃도어 기어의 최강자로 군림하였으며, 내마모성이 우수한 메쉬 소재와 충격 흡수가 월등한 EVA 아웃솔이 장착되었습니다.",
    img: "/images/img/salomon/shoes/1/shoes_card.png",
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
    name: "RX 메리제인",
    price: "₩ 260,000",
    rawPrice: 260000,
    desc: "발등을 가로지르는 우아한 스트랩과 살로몬 고유의 테크니컬 메쉬가 결합된 하이브리드 메리제인 스니커즈",
    detailDesc: "살로몬의 혁신적인 트레일 러닝 기술력과 페미닌한 무드의 메리제인 실루엣이 완벽한 시너지를 이루는 스페셜 에디션입니다. 뛰어난 통기성의 오픈 메쉬 구조와 리커버리 슬립온 프레임이 결합되어 일상과 아웃도어를 자유롭게 넘나드는 유니크한 럭셔리 스타일을 완성합니다.",
    img: "/images/img/salomon/shoes/2/shoes_card.png",
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
    name: "XT-위스퍼 VOID",
    price: "₩ 280,000",
    rawPrice: 280000,
    desc: "안개처럼 고요한 실루엣에 독보적인 리커버리 테크놀로지가 결합된 리미티드 트레일 스니커즈",
    detailDesc: "바람과 안개의 스텔스적인 움직임에서 영감을 얻은 XT-위스퍼 VOID 한정 컬렉션입니다. 초경량 통기성 메쉬 레이아웃과 충격 분산형 섀시 프레임이 탑재되어 어떠한 극한의 지형에서도 고요하고 안락한 트레일 런을 선사합니다.",
    img: "/images/img/salomon/shoes/3/shoes_card.png",
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
