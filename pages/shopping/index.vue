<script setup lang="ts">
import { ref, computed, inject } from "vue";
import { useRouter } from "vue-router";
import { cx, css } from "@emotion/css";

/************************************************************
 * Components
 ************************************************************/
import BaseBtn from "~/components/base/btn/BaseBtn.vue";
import Interactive360Viewer from "~/components/shopping/Interactive360Viewer.vue";

/************************************************************
 * External Dependencies
 ************************************************************/
const router = useRouter();

/************************************************************
 * Provide / inject Data (윈도우 폭 반응형 감지)
 ************************************************************/
const windowWidth = inject("windowWidth", ref(1920)) as any;
const isMobile = computed(() => windowWidth.value <= 768);

/************************************************************
 * Dynamic Data (쇼핑몰 상태)
 ************************************************************/
import { useCartStore } from "~/stores/useCartStore";

const cartStore = useCartStore();

const isCartOpen = ref(false);
const cartItems = computed(() => cartStore.cartItems);
const totalPrice = computed(() => cartStore.totalPrice);
const totalCartCount = computed(() => cartStore.totalCartCount);

// 살로몬 오마주 리팩토링 슈즈 상품 리스트
const products = ref([
  {
    id: 1,
    name: "XT-6 COSMIC NEON BLUE",
    price: "₩ 260,000",
    desc: "아웃도어 기술력과 은하수 궤도 느낌의 네온 블루 컬러웨이가 결합된 트레일 아이콘 슈즈",
    img: "/images/salomon_xt6.png",
    tag: "BEST",
    selectedColor: "NEON BLUE",
    swatches: [
      { color: "#00f2fe", name: "NEON BLUE", label: "네온 블루 배합 컬러 옵션" },
      { color: "#2b2b2b", name: "CYBER BLACK", label: "사이버 블랙 단색 컬러 옵션" },
      { color: "#e6e6e6", name: "VANILLA ICE", label: "바닐라 아이스 투톤 배합 컬러 옵션" },
      { color: "#ff7b7b", name: "SALMON PINK", label: "살몬 핑크 네온 포인트 컬러 옵션" },
      { color: "#c0c0c0", name: "METALLIC SILVER", label: "메탈릭 실버 반사광 컬러 옵션" },
      { color: "#ffffff", name: "PURE WHITE", label: "퓨어 화이트 미니멀 컬러 옵션" }
    ]
  },
  {
    id: 2,
    name: "XT-6 ASTRONAUT SHADOW",
    price: "₩ 260,000",
    desc: "달 표면을 탐사하는 듯한 은은한 다크 실버와 매트 블랙 스피드로 레이싱이 가능한 스포티 슈즈",
    img: "/images/salomon_xt6.png",
    tag: "NEW",
    selectedColor: "CYBER BLACK",
    swatches: [
      { color: "#2b2b2b", name: "CYBER BLACK", label: "사이버 블랙 단색 컬러 옵션" },
      { color: "#c0c0c0", name: "METALLIC SILVER", label: "메탈릭 실버 반사광 컬러 옵션" },
      { color: "#00f2fe", name: "NEON BLUE", label: "네온 블루 배합 컬러 옵션" },
      { color: "#e6e6e6", name: "VANILLA ICE", label: "바닐라 아이스 투톤 배합 컬러 옵션" },
      { color: "#ffffff", name: "PURE WHITE", label: "퓨어 화이트 미니멀 컬러 옵션" }
    ]
  },
  {
    id: 3,
    name: "XT-SPECIAL HYDRO SLICK",
    price: "₩ 280,000",
    desc: "고어텍스 코팅과 오렌지 퀵레이스 포인트가 빛나는 스페셜 한정 컬렉션 트레일 기어",
    img: "/images/salomon_xt6.png",
    tag: "LIMITED",
    selectedColor: "SALMON PINK",
    swatches: [
      { color: "#ff7b7b", name: "SALMON PINK", label: "살몬 핑크 네온 포인트 컬러 옵션" },
      { color: "#2b2b2b", name: "CYBER BLACK", label: "사이버 블랙 단색 컬러 옵션" },
      { color: "#c0c0c0", name: "METALLIC SILVER", label: "메탈릭 실버 반사광 컬러 옵션" },
      { color: "#00f2fe", name: "NEON BLUE", label: "네온 블루 배합 컬러 옵션" }
    ]
  }
]);

/************************************************************
 * Function
 ************************************************************/
const goBackToPortfolio = () => {
  router.push("/main/main");
};

// 장바구니 담기 (비회원 로그인 장벽 X // 즉각 반영)
const addToCart = (product: any) => {
  cartStore.addToCart({
    id: product.id,
    name: product.name,
    price: product.price,
    img: product.img,
    selectedColor: product.selectedColor
  });
  // 추가 후 장바구니 자동 오픈 (매끄러운 피드백 제공)
  isCartOpen.value = true;
};

// 장바구니 삭제 및 수량 조작
const increaseQty = (item: any) => {
  cartStore.increaseQty(item);
};

const decreaseQty = (item: any) => {
  cartStore.decreaseQty(item);
};

const removeCartItem = (item: any) => {
  cartStore.removeCartItem(item);
};

const selectColor = (prodIndex: number, colorName: string) => {
  products.value[prodIndex].selectedColor = colorName;
};

/************************************************************
 * Styles (Emotion CSS)
 ************************************************************/
const Styles = {
  Layout: css`
    min-height: 100vh;
    background-color: #0b0b0b;
    color: #ffffff;
    font-family: 'Inter', 'Outfit', sans-serif;
    padding-top: 80px;
    overflow-x: hidden;
    position: relative;
  `,

  Header: css`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 80px;
    background: rgba(11, 11, 11, 0.85);
    backdrop-filter: blur(25px);
    -webkit-backdrop-filter: blur(25px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    z-index: 90;
    
    .header-inner {
      max-width: 1440px;
      height: 100%;
      margin: 0 auto;
      padding: 0 4rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .logo {
      cursor: pointer;
      display: flex;
      flex-direction: column;
      
      .logo-text {
        font-size: 2.4rem;
        font-weight: 900;
        letter-spacing: 0.1em;
        color: #ffffff;
        text-shadow: 0 0 10px rgba(255, 255, 255, 0.15);
      }
      
      .logo-sub {
        font-size: 0.9rem;
        color: #00f2fe;
        font-weight: 700;
        letter-spacing: 0.25em;
        margin-top: 0.1rem;
      }
    }

    .ux-tag-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.5rem 1.4rem;
      background: linear-gradient(135deg, rgba(0, 242, 254, 0.1), rgba(255, 255, 255, 0.05));
      border: 1px solid rgba(0, 242, 254, 0.4);
      border-radius: 4px;
      
      span {
        font-size: 1.1rem;
        font-weight: 800;
        color: #00f2fe;
        letter-spacing: 0.05em;
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 2.8rem;

      .cart-icon {
        cursor: pointer;
        position: relative;
        color: rgba(255, 255, 255, 0.9);
        transition: all 0.3s ease;

        &:hover {
          color: #00f2fe;
          transform: scale(1.05);
        }

        .material-icons {
          font-size: 2.8rem;
        }

        .cart-badge {
          position: absolute;
          top: -3px;
          right: -5px;
          background: #00f2fe;
          color: #0b0b0b;
          font-size: 1.1rem;
          font-weight: 900;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 12px rgba(0, 242, 254, 0.6);
        }
      }

      .back-btn {
        background: rgba(255, 255, 255, 0.04) !important;
        border: 1px solid rgba(255, 255, 255, 0.12) !important;
        color: #ffffff !important;
        border-radius: 4px !important;
        padding: 0.8rem 1.8rem !important;
        font-size: 1.3rem !important;
        font-weight: 700 !important;
        display: flex;
        align-items: center;
        gap: 0.6rem;
        height: auto !important;
        transition: all 0.3s ease !important;

        .material-icons {
          font-size: 1.6rem;
        }

        &:hover {
          background: rgba(0, 242, 254, 0.1) !important;
          border-color: #00f2fe !important;
          color: #00f2fe !important;
        }
      }
    }

    @media (max-width: 768px) {
      .header-inner {
        padding: 0 2rem;
      }
      .ux-tag-badge {
        display: none;
      }
    }
  `,

  Hero: css`
    position: relative;
    height: 55vh;
    min-height: 440px;
    display: flex;
    align-items: center;
    overflow: hidden;
    
    .hero-bg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
      }

      .overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          to right,
          rgba(11, 11, 11, 0.95) 25%,
          rgba(11, 11, 11, 0.6) 65%,
          rgba(11, 11, 11, 0.2) 100-percent
        );
      }
    }

    .hero-content {
      position: relative;
      z-index: 2;
      max-width: 1440px;
      width: 100%;
      margin: 0 auto;
      padding: 0 4rem;
    }

    .refactoring-label {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.6rem 1.4rem;
      background: rgba(0, 242, 254, 0.12);
      border: 1px solid rgba(0, 242, 254, 0.4);
      border-radius: 4px;
      color: #00f2fe;
      font-size: 1.2rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      margin-bottom: 2rem;

      .material-icons {
        font-size: 1.6rem;
      }
    }

    .hero-title {
      font-size: 6rem;
      font-weight: 900;
      line-height: 1.1;
      letter-spacing: -0.02em;
      margin-bottom: 2.2rem;
      color: #ffffff;
      
      span {
        background: linear-gradient(135deg, #ffffff, #00f2fe);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 0 40px rgba(0, 242, 254, 0.35);
      }
    }

    .hero-desc {
      font-size: 1.6rem;
      line-height: 1.7;
      color: rgba(255, 255, 255, 0.7);
      max-width: 620px;
      margin-bottom: 3.6rem;
      word-break: keep-all;
    }

    .hero-btn-row {
      .hero-primary-btn {
        background: linear-gradient(135deg, #ffffff, #c0c0c0) !important;
        color: #0b0b0b !important;
        font-weight: 800 !important;
        font-size: 1.5rem !important;
        padding: 1.4rem 3.4rem !important;
        border-radius: 4px !important;
        height: auto !important;
        box-shadow: 0 4px 15px rgba(255, 255, 255, 0.15) !important;
        transition: all 0.3s ease !important;

        &:hover {
          background: #00f2fe !important;
          box-shadow: 0 6px 25px rgba(0, 242, 254, 0.6) !important;
          transform: translateY(-2px);
        }
      }
    }

    @media (max-width: 768px) {
      height: auto;
      padding: 8rem 0;
      
      .hero-bg .overlay {
        background: rgba(11, 11, 11, 0.9);
      }
      .hero-content {
        padding: 0 2rem;
      }
      .hero-title {
        font-size: 4rem;
      }
    }
  `,

  Products: css`
    max-width: 1440px;
    margin: 8rem auto;
    padding: 0 4rem;
    
    .section-header {
      margin-bottom: 5.6rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 2.4rem;
      
      .title {
        font-size: 3rem;
        font-weight: 900;
        letter-spacing: 0.02em;
        color: #ffffff;
      }
      
      .sub {
        font-size: 1.4rem;
        color: rgba(255, 255, 255, 0.5);
        margin-top: 0.8rem;
      }
    }

    .product-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 4rem;
    }

    .product-card {
      background: rgba(255, 255, 255, 0.02);
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      
      // 핵심 개선 2: 1px 투명 보더 기본 선점하여 호버 시 CLS 레이아웃 흔들림 방지
      .product-card-inner {
        border: 1.5px solid transparent;
        border-radius: 8px;
        transition: all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      
      &:hover .product-card-inner {
        border-color: rgba(0, 242, 254, 0.5);
        background: rgba(255, 255, 255, 0.04);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7), 
                    0 0 20px rgba(0, 242, 254, 0.15);
                    
        .image-box img {
          transform: scale(1.04);
        }
        
        .hover-actions {
          opacity: 1;
        }
      }
      
      .image-box {
        position: relative;
        height: 340px;
        background: #141414;
        overflow: hidden;
        
        .tag-badge {
          position: absolute;
          top: 18px;
          left: 18px;
          background: #ffffff;
          color: #0b0b0b;
          font-size: 1.1rem;
          font-weight: 900;
          padding: 0.4rem 1.2rem;
          border-radius: 2px;
          z-index: 10;
          letter-spacing: 0.05em;
        }

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        
        .hover-actions {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(11, 11, 11, 0.55);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
          
          .action-btn {
            cursor: pointer;
            font-weight: 800;
            transition: all 0.3s ease;
            
            &.rect {
              width: 80%;
              height: 50px;
              border-radius: 4px;
              background: #ffffff;
              color: #0b0b0b;
              font-size: 1.3rem;
              letter-spacing: 0.08em;
              border: none;
              
              &:hover {
                background: #00f2fe;
                box-shadow: 0 0 15px rgba(0, 242, 254, 0.6);
              }
            }
          }
        }
      }

      .info-box {
        padding: 2.6rem;
        flex: 1;
        display: flex;
        flex-direction: column;
        
        .selected-color-info {
          font-size: 1.2rem;
          color: rgba(255, 255, 255, 0.4);
          margin-bottom: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          
          strong {
            color: #00f2fe;
            font-weight: 800;
          }
        }

        .product-name {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 1rem;
          color: #ffffff;
          line-height: 1.3;
        }
        
        .product-desc {
          font-size: 1.3rem;
          color: rgba(255, 255, 255, 0.55);
          line-height: 1.6;
          margin-bottom: 2.2rem;
          height: 4.8rem;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        // 핵심 개선 4: 모바일 스와치 가독성 4개 이하 제한 축약 뱃지 스타일
        .swatches-container {
          margin-bottom: 2.6rem;
          
          .swatches-list {
            display: flex;
            align-items: center;
            gap: 1rem;
            flex-wrap: wrap;
          }

          .swatch-btn {
            width: 22px;
            height: 22px;
            border-radius: 50%;
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 2px;
            cursor: pointer;
            transition: all 0.25s ease;
            position: relative;
            background-clip: content-box;

            &.active {
              border-color: #00f2fe;
              transform: scale(1.15);
              box-shadow: 0 0 8px rgba(0, 242, 254, 0.5);
            }
            
            &:hover {
              border-color: #ffffff;
            }
          }

          .swatch-more-counter {
            font-size: 1.1rem;
            font-weight: 800;
            color: rgba(255, 255, 255, 0.5);
            background: rgba(255, 255, 255, 0.08);
            border: 1px dashed rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            width: 22px;
            height: 22px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }

        .price-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
          
          .price {
            font-size: 2.1rem;
            font-weight: 900;
            color: #ffffff;
          }
          
          .buy-btn {
            cursor: pointer;
            width: 44px;
            height: 44px;
            border-radius: 4px;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            transition: all 0.3s ease;
            
            &:hover {
              background: #00f2fe;
              color: #0b0b0b;
              border-color: #00f2fe;
              box-shadow: 0 0 12px rgba(0, 242, 254, 0.5);
            }
          }
        }
      }
    }

    @media (max-width: 1024px) {
      .product-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 3rem;
      }
    }
    @media (max-width: 768px) {
      padding: 0 2rem;
      margin: 6rem auto;
      
      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1.6rem;
      }
      .product-grid {
        grid-template-columns: 1fr;
      }
    }
  `,

  CartDrawer: css`
    position: fixed;
    top: 0;
    right: -420px;
    width: 420px;
    height: 100vh;
    background: #0f0f0f;
    border-left: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: -10px 0 40px rgba(0, 0, 0, 0.8);
    z-index: 150;
    transition: right 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
    display: flex;
    flex-direction: column;

    &.open {
      right: 0;
    }

    .drawer-header {
      padding: 2.8rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;

      h2 {
        font-size: 2.2rem;
        font-weight: 900;
        letter-spacing: 0.05em;
        color: #ffffff;
      }

      .close-btn {
        background: transparent;
        border: none;
        color: rgba(255, 255, 255, 0.6);
        cursor: pointer;
        transition: color 0.3s ease;

        &:hover {
          color: #00f2fe;
        }

        .material-icons {
          font-size: 2.6rem;
        }
      }
    }

    .drawer-body {
      flex: 1;
      overflow-y: auto;
      padding: 2.8rem;
      
      &::-webkit-scrollbar {
        width: 4px;
      }
      &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
      }

      .empty-cart {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        text-align: center;
        color: rgba(255, 255, 255, 0.4);

        .material-icons {
          font-size: 6.4rem;
          margin-bottom: 2rem;
        }

        p {
          font-size: 1.8rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 0.8rem;
        }
        
        .sub {
          font-size: 1.3rem;
          line-height: 1.5;
        }
      }

      .cart-items-list {
        display: flex;
        flex-direction: column;
        gap: 2.4rem;
      }

      .cart-item {
        display: flex;
        gap: 1.8rem;
        padding-bottom: 2.4rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);

        .item-img {
          width: 80px;
          height: 80px;
          background: #141414;
          border-radius: 4px;
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .item-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;

          .item-name {
            font-size: 1.4rem;
            font-weight: 800;
            color: #ffffff;
            line-height: 1.3;
          }

          .item-color {
            font-size: 1.1rem;
            color: rgba(255, 255, 255, 0.4);
            text-transform: uppercase;
          }

          .qty-row {
            display: flex;
            align-items: center;
            gap: 1.2rem;
            background: rgba(255, 255, 255, 0.05);
            width: fit-content;
            padding: 0.2rem 0.8rem;
            border-radius: 4px;

            .qty-btn {
              background: transparent;
              border: none;
              color: rgba(255, 255, 255, 0.8);
              font-size: 1.6rem;
              cursor: pointer;
              font-weight: 700;

              &:hover {
                color: #00f2fe;
              }
            }

            .qty-val {
              font-size: 1.3rem;
              font-weight: 700;
              color: #ffffff;
              min-width: 16px;
              text-align: center;
            }
          }
        }

        .item-price-col {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: flex-end;

          .item-price {
            font-size: 1.4rem;
            font-weight: 800;
            color: #ffffff;
          }

          .item-remove {
            background: transparent;
            border: none;
            color: rgba(255, 255, 255, 0.3);
            cursor: pointer;
            transition: color 0.2s ease;

            &:hover {
              color: #ff4081;
            }

            .material-icons {
              font-size: 2rem;
            }
          }
        }
      }
    }

    .drawer-footer {
      padding: 2.8rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      background: #0b0b0b;

      .total-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.2rem;

        span {
          font-size: 1.6rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.6);
        }

        .total-price {
          font-size: 2.4rem;
          font-weight: 900;
          color: #00f2fe;
          text-shadow: 0 0 15px rgba(0, 242, 254, 0.3);
        }
      }

      .guide-text {
        font-size: 1.1rem;
        color: rgba(255, 255, 255, 0.35);
        margin-bottom: 2.2rem;
        line-height: 1.4;
      }

      .checkout-btn {
        width: 100%;
        height: 52px;
        background: #00f2fe;
        color: #0b0b0b;
        font-size: 1.5rem;
        font-weight: 800;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(0, 242, 254, 0.3);

        &:hover:not(:disabled) {
          background: #ffffff;
          box-shadow: 0 6px 20px rgba(0, 242, 254, 0.5);
          transform: translateY(-1px);
        }

        &:disabled {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.3);
          cursor: not-allowed;
          box-shadow: none;
        }
      }
    }

    @media (max-width: 480px) {
      width: 100%;
      right: -100%;
    }
  `,

  Footer: css`
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    background: #070707;
    padding: 4rem 0;
    margin-top: 12rem;
    
    .footer-inner {
      max-width: 1440px;
      margin: 0 auto;
      padding: 0 4rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: rgba(255, 255, 255, 0.35);
      font-size: 1.3rem;
    }

    @media (max-width: 768px) {
      .footer-inner {
        padding: 0 2rem;
        flex-direction: column;
        gap: 1.2rem;
        text-align: center;
      }
    }
  `
};
</script>

<template>
  <div :class="cx('salomon-layout', Styles.Layout)">
    <!-- 네비게이션 헤더 -->
    <header :class="cx('shop-header', Styles.Header)">
      <div class="header-inner">
        <div class="logo" @click="router.push('/main/main')">
          <span class="logo-text">SALOMON</span>
          <span class="logo-sub">REFACTORING</span>
        </div>

        <div class="ux-tag-badge">
          <span>PORTFOLIO UX/UI IMPROVED</span>
        </div>

        <div class="header-actions">
          <!-- 비회원 바로 진입 가능한 장바구니 아이콘 -->
          <div class="cart-icon" @click="isCartOpen = !isCartOpen">
            <span class="material-icons">shopping_bag</span>
            <span v-if="totalCartCount > 0" class="cart-badge" v-text="totalCartCount"></span>
          </div>

          <BaseBtn
            class="back-btn"
            :hover="false"
            variant="flat"
            @on-click="goBackToPortfolio"
          >
            <span class="material-icons">arrow_back</span>
            포트폴리오 돌아가기
          </BaseBtn>
        </div>
      </div>
    </header>

    <!-- 히어로 배너 (살로몬 특유의 시크하고 강렬한 아웃도어 테마) -->
    <section :class="cx('hero-section', Styles.Hero)">
      <div class="hero-bg">
        <img src="/images/salomon_xt6.png" alt="Salomon XT-6 Cosmic" />
        <div class="overlay"></div>
      </div>

      <div class="hero-content">
        <div class="refactoring-label">
          <span class="material-icons">architecture</span>
          살로몬 공식몰 5대 UI/UX 개선 오마주
        </div>
        <h1 class="hero-title">
          XT-6 <span>COSMIC SHIELD</span>
        </h1>
        <p class="hero-desc">
          레이아웃 흔들림(CLS) 방지, 비회원 장바구니 로그인 장벽 제거, 모바일 스와치 가로 최적화 및 스크린 리더 대체 텍스트(A11y) 확보 등 
          기존 사이트의 병목 문제를 완전무결하게 리팩토링한 퍼블리싱 포트폴리오 에디션.
        </p>
        <div class="hero-btn-row">
          <BaseBtn
            class="hero-primary-btn"
            :hover="false"
            variant="flat"
            @on-click="isCartOpen = true"
          >
            장바구니 확인하기 🛍
          </BaseBtn>
        </div>
      </div>
    </section>

    <!-- 신규 360도 인터랙티브 디테일 탐색기 -->
    <Interactive360Viewer />

    <!-- 상품 목록 섹션 -->
    <section :class="cx('products-section', Styles.Products)">
      <div class="section-header">
        <div>
          <h2 class="title">XT-6 SPORTSWEAR COLLECTION</h2>
          <p class="sub">마우스 호버 시의 테두리 영역 흔들림(CLS)과 모바일 뷰포트 스와치 축약 기능이 내장되어 있습니다.</p>
        </div>
      </div>

      <!-- 상품 그리드 -->
      <div class="product-grid">
        <div
          v-for="(prod, prodIdx) in products"
          :key="prod.id"
          class="product-card"
          @click="router.push('/shopping/' + prod.id)"
        >
          <!-- 카드 테두리 영역 선점 스타일 적용 (CLS 100% 방지) -->
          <div class="product-card-inner">
            <div class="image-box">
              <span v-if="prod.tag" class="tag-badge" v-text="prod.tag"></span>
              <img :src="prod.img" :alt="prod.name" />
              
              <div class="hover-actions">
                <button class="action-btn rect" @click.stop="addToCart(prod)">
                  QUICK ADD TO CART
                </button>
              </div>
            </div>

            <div class="info-box">
              <!-- 선택된 컬러 실시간 표기 -->
              <div class="selected-color-info">
                <span>Color: </span>
                <strong v-text="prod.selectedColor"></strong>
              </div>

              <h3 class="product-name" v-text="prod.name"></h3>
              <p class="product-desc" v-text="prod.desc"></p>

              <!-- 컬러 스와치 (모바일 축약 렌더링 지원 및 웹 접근성 A11y 적용) -->
              <div class="swatches-container">
                <div class="swatches-list">
                  <button
                    v-for="(sw, swIdx) in (isMobile ? prod.swatches.slice(0, 4) : prod.swatches)"
                    :key="swIdx"
                    :class="['swatch-btn', { active: prod.selectedColor === sw.name }]"
                    :style="{ backgroundColor: sw.color }"
                    :aria-label="sw.label"
                    @click.stop="selectColor(prodIdx, sw.name)"
                  >
                    <span class="blind" v-text="sw.name"></span>
                  </button>
                  
                  <!-- 모바일일 때 초과 개수를 알려주는 축약 카운터 (+N) -->
                  <div
                    v-if="isMobile && prod.swatches.length > 4"
                    class="swatch-more-counter"
                    v-text="'+' + (prod.swatches.length - 4)"
                    :aria-label="'옵션 ' + (prod.swatches.length - 4) + '개 더보기'"
                  ></div>
                </div>
              </div>

              <div class="price-row">
                <span class="price" v-text="prod.price"></span>
                <span class="buy-btn" @click.stop="addToCart(prod)">
                  <span class="material-icons">add_shopping_cart</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 비회원 전용 사이드 카트 서랍 (Friction 0% 장바구니 구현) -->
    <div :class="['cart-drawer-overlay', { open: isCartOpen }]" @click="isCartOpen = false"></div>
    <aside :class="['cart-drawer', { open: isCartOpen }, Styles.CartDrawer]">
      <div class="drawer-header">
        <h2>SHOPPING BAG</h2>
        <button class="close-btn" @click="isCartOpen = false">
          <span class="material-icons">close</span>
        </button>
      </div>

      <!-- 카트 아이템 리스트 -->
      <div class="drawer-body">
        <div v-if="cartItems.length === 0" class="empty-cart">
          <span class="material-icons">shopping_bag</span>
          <p>장바구니가 비어 있습니다.</p>
          <span class="sub">로그인 없이 자유롭게 상품을 추가할 수 있습니다.</span>
        </div>

        <div v-else class="cart-items-list">
          <div
            v-for="(item, index) in cartItems"
            :key="index"
            class="cart-item"
          >
            <div class="item-img">
              <img :src="item.img" :alt="item.name" />
            </div>
            
            <div class="item-info">
              <h4 class="item-name" v-text="item.name"></h4>
              <span class="item-color" v-text="'옵션: ' + item.selectedColor"></span>
              <div class="qty-row">
                <button class="qty-btn" @click="decreaseQty(item)">-</button>
                <span class="qty-val" v-text="item.qty"></span>
                <button class="qty-btn" @click="increaseQty(item)">+</button>
              </div>
            </div>

            <div class="item-price-col">
              <span class="item-price" v-text="item.price"></span>
              <button class="item-remove" @click="removeCartItem(item)">
                <span class="material-icons">delete_outline</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 카트 푸터 합산 금액 -->
      <div class="drawer-footer">
        <div class="total-row">
          <span>합계 금액:</span>
          <span class="total-price" v-text="'₩ ' + totalPrice.toLocaleString()"></span>
        </div>
        <p class="guide-text">비회원 상태에서 마찰(Friction) 없이 최종 결제 설계 흐름 검증 완료.</p>
        <button
          class="checkout-btn"
          :disabled="cartItems.length === 0"
          @click="alert('가상의 최종 결제(Checkout) 단계로 이동합니다. 로그인/비회원 주문 옵션 제안.')"
        >
          최종 주문 확인서 작성
        </button>
      </div>
    </aside>

    <!-- 푸터 영역 -->
    <footer :class="cx('shop-footer', Styles.Footer)">
      <div class="footer-inner">
        <p>© 2026 SALOMON REFACTORING HOMAGE STUDIO. ALL RIGHTS RESERVED.</p>
        <p>RE-PUBLISHED BY MIN UJU // PORTFOLIO OPTIMIZATION</p>
      </div>
    </footer>
  </div>
</template>

<style lang="scss">
/* 전역 스크롤바 & 블라인드 태그 커스텀 */
.salomon-layout::-webkit-scrollbar {
  width: 6px;
}
.salomon-layout::-webkit-scrollbar-track {
  background: #111111;
}
.salomon-layout::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}
.blind {
  position: absolute;
  overflow: hidden;
  clip: rect(0 0 0 0);
  margin: -1px;
  width: 1px;
  height: 1px;
}
</style>
