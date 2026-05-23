<script setup lang="ts">
import { ref, computed, inject, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { cx, css } from "@emotion/css";

/************************************************************
 * Components
 ************************************************************/
import BaseBtn from "~/components/base/btn/BaseBtn.vue";
import Interactive360Viewer from "~/components/shopping/Interactive360Viewer.vue";

/************************************************************
 * External Dependencies & Constants
 ************************************************************/
import { PRODUCTS } from "~/constants/products";

const route = useRoute();
const router = useRouter();

const productId = computed(() => parseInt(route.params.id as string, 10) || 1);

/************************************************************
 * Provide / inject Data (반응형 감지)
 ************************************************************/
const windowWidth = inject("windowWidth", ref(1920)) as any;
const isMobile = computed(() => windowWidth.value <= 768);

// 현재 렌더링할 상품 데이터 (DRY 단일 공급원으로부터 탐색)
const product = computed(() => {
  return PRODUCTS.find((p) => p.id === productId.value) || PRODUCTS[0];
});

// 동적 SEO 및 브라우저 타이틀 최적화
useHead({
  title: computed(() => `${product.value?.name || "상세보기"} | SALOMON HOMAGE`),
  meta: [
    { name: "description", content: computed(() => product.value?.detailDesc || "") }
  ]
});

/************************************************************
 * Interactive States (상세 페이지 조작 상태)
 ************************************************************/
const selectedColor = ref("");
const selectedSize = ref<number | null>(null);
const sizes = [230, 235, 240, 245, 250, 255, 260, 265, 270, 275, 280, 285, 290];

// 미디어 선택 탭 상태 ('image' | '360')
const activeMediaTab = ref("image");

// 썸네일 갤러리 이미지 리스트 (원래 상품 이미지 + 360 각도 이미지들 결합)
const GALLERY_IMAGES = computed(() => {
  // 1번, 2번, 3번 폴더에 파일이 실제로 존재하므로, 다른 번호의 경우 1번으로 폴백하여 엑박 방지 (UX 무결성 확보)
  const targetId = [1, 2, 3].includes(product.value.id) ? product.value.id : 1;
  const ext = [2, 3].includes(targetId) ? "webp" : "png";
  return [
    product.value.img,
    `/images/img/salomon/shoes/${targetId}/shoes_img01.${ext}`,
    `/images/img/salomon/shoes/${targetId}/shoes_img02.${ext}`,
    `/images/img/salomon/shoes/${targetId}/shoes_img03.${ext}`,
    `/images/img/salomon/shoes/${targetId}/shoes_img04.${ext}`,
    `/images/img/salomon/shoes/${targetId}/shoes_img05.${ext}`
  ];
});
const activeGalleryIndex = ref(0);

// 수량 선택 상태
const selectedQty = ref(1);

// 스크롤 관련 상태
const scrollPercent = ref(0);
const showScrollTop = ref(false);

// 가상의 품절 사이즈 지정 (실무 느낌 연출)
const outOfStockSizes = computed(() => {
  if (product.value.id === 1) return [230, 245, 275];
  if (product.value.id === 2) return [255, 280, 290];
  if (product.value.id === 3) return [240, 270, 285];
  if (product.value.id === 4) return [230, 265, 280];
  return [235, 250, 275];
});

// 이미지 돋보기 줌 마이크로 인터랙션
const isZoomed = ref(false);
const zoomOrigin = ref("center center");

const handleZoomMove = (e: MouseEvent) => {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  zoomOrigin.value = `${x}% ${y}%`;
};

// 핏 가이드 (Fit Guide) 모달 팝업 상태
const isFitGuideOpen = ref(false);

import { useCartStore } from "~/stores/useCartStore";

const cartStore = useCartStore();

// 장바구니 Drawer 관련 데이터 (전역 스토어 연동)
const isCartOpen = ref(false);
const cartItems = computed(() => cartStore.cartItems);
const totalPrice = computed(() => cartStore.totalPrice);
const totalCartCount = computed(() => cartStore.totalCartCount);

// You May Also Like 관련 상품 추천 목록 (현재 상품 제외하고 슬라이스)
const recommendedProducts = computed(() => {
  return PRODUCTS.filter(p => p.id !== product.value.id).slice(0, 4);
});

/************************************************************
 * Methods
 ************************************************************/
const handleScroll = () => {
  // 스크롤 상단 진행도 계산
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (docHeight > 0) {
    scrollPercent.value = (window.scrollY / docHeight) * 100;
  }
  
  // Scroll to Top 버튼 노출 트리거
  showScrollTop.value = window.scrollY > 400;
};

onMounted(() => {
  // 최초 로드 시 디폴트 컬러 매칭
  if (product.value) {
    selectedColor.value = product.value.swatches[0].name;
  }
  
  // 최근 본 상품 등록
  cartStore.addRecentlyViewed(productId.value);

  // 스크롤 리스너 장착
  window.addEventListener("scroll", handleScroll);
});

onBeforeUnmount(() => {
  // 스크롤 리스너 해제
  window.removeEventListener("scroll", handleScroll);
});

const selectColor = (colorName: string) => {
  selectedColor.value = colorName;
};

const selectSize = (size: number) => {
  if (outOfStockSizes.value.includes(size)) return;
  selectedSize.value = size;
};

// 장바구니 추가
const addToCart = () => {
  if (!selectedSize.value) {
    alert("사이즈 옵션을 먼저 선택해 주세요.");
    return;
  }
  
  cartStore.addToCart({
    id: product.value.id,
    name: product.value.name,
    price: product.value.price,
    img: product.value.img,
    selectedColor: selectedColor.value,
    selectedSize: selectedSize.value,
    qty: selectedQty.value
  });

  isCartOpen.value = true;
};

// 즉시 구매
const buyNow = () => {
  if (!selectedSize.value) {
    alert("사이즈 옵션을 먼저 선택해 주세요.");
    return;
  }
  alert(`구매를 진행합니다: ${product.value.name}\n컬러: ${selectedColor.value}\n사이즈: ${selectedSize.value}mm\n수량: ${selectedQty.value}개\n최종 결제서 화면으로 이동합니다 (Friction 0%)`);
};

// 상품 공유하기
const shareProduct = () => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(window.location.href);
    alert("상품 링크가 클립보드에 성공적으로 복사되었습니다! 친구에게 공유해 보세요. 🔗");
  } else {
    alert("링크 복사를 지원하지 않는 브라우저입니다.");
  }
};

// 수량 제어
const increaseQty = (item: any) => cartStore.increaseQty(item);
const decreaseQty = (item: any) => cartStore.decreaseQty(item);
const removeCartItem = (item: any) => cartStore.removeCartItem(item);

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

    .scroll-progress-bar {
      position: fixed;
      top: 0;
      left: 0;
      height: 4px;
      background: linear-gradient(to right, #00f2fe, #ff4081);
      z-index: 200;
      transition: width 0.1s ease;
    }

    .scroll-top-btn {
      position: fixed;
      bottom: 40px;
      right: 40px;
      width: 50px;
      height: 50px;
      background: rgba(11, 11, 11, 0.85);
      border: 1px solid rgba(0, 242, 254, 0.3);
      color: #00f2fe;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
      z-index: 100;
      pointer-events: none;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 15px rgba(0, 242, 254, 0.15);
      padding: 0;
      
      &:hover {
        background: #00f2fe;
        color: #0b0b0b;
        border-color: #00f2fe;
        box-shadow: 0 6px 20px rgba(0, 242, 254, 0.5);
        transform: translateY(-2px);
      }
      
      &.show {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
      }
      
      .material-icons {
        font-size: 2rem;
      }
    }
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
        padding: 0 1.6rem;
      }
      .ux-tag-badge {
        display: none;
      }
      
      .logo {
        .logo-text {
          font-size: 1.8rem !important;
        }
        .logo-sub {
          font-size: 0.9rem !important;
        }
      }

      .header-actions {
        gap: 1.2rem;
        
        .back-btn {
          width: 38px !important;
          height: 38px !important;
          min-width: 38px !important;
          max-width: 38px !important;
          min-height: 38px !important;
          max-height: 38px !important;
          flex-shrink: 0 !important;
          aspect-ratio: 1 / 1 !important;
          padding: 0 !important;
          border-radius: 50% !important;
          background: rgba(255, 255, 255, 0.04) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          color: #ffffff !important;
          font-size: 0 !important;
          overflow: hidden !important;
          
          .material-icons {
            margin: 0 !important;
            font-size: 1.8rem !important;
          }
          
          &:hover {
            background: rgba(0, 242, 254, 0.1) !important;
            border-color: #00f2fe !important;
            color: #00f2fe !important;
            box-shadow: 0 0 10px rgba(0, 242, 254, 0.4);
          }
        }
      }
    }
  `,

  ContentWrapper: css`
    max-width: 1440px;
    margin: 2rem auto 8rem auto;
    padding: 0 4rem;

    .breadcrumbs {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      font-size: 1.2rem;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.4);
      margin-bottom: 2.8rem;
      
      .crumb-link {
        cursor: pointer;
        transition: color 0.3s ease;
        
        &:hover {
          color: #00f2fe;
        }
      }
      
      .crumb-separator {
        color: rgba(255, 255, 255, 0.25);
      }
      
      .crumb-active {
        color: #ffffff;
      }
    }

    .detail-grid {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 6rem;
      align-items: start;
    }

    .media-column-wrapper {
      position: relative;
      background: #141414;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.05);
      padding: 2.8rem;

      .tag-badge {
        position: absolute;
        top: 24px;
        left: 24px;
        background: #ffffff;
        color: #0b0b0b;
        font-size: 1.2rem;
        font-weight: 900;
        padding: 0.5rem 1.4rem;
        border-radius: 2px;
        z-index: 10;
        letter-spacing: 0.08em;
      }

      .media-gallery-container {
        display: flex;
        gap: 2.4rem;
        height: 580px;
        align-items: stretch;
      }

      .thumbnail-strip {
        display: flex;
        flex-direction: column;
        gap: 1.2rem;
        width: 80px;
        flex-shrink: 0;
        overflow-y: auto;
        
        &::-webkit-scrollbar {
          width: 0px;
        }
        
        .thumb-box {
          border: 1.5px solid rgba(255, 255, 255, 0.08);
          border-radius: 4px;
          background: #111111;
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          opacity: 0.6;
          
          img {
            width: 85%;
            height: auto;
            object-fit: contain;
            transition: transform 0.3s ease;
          }
          
          &:hover {
            opacity: 1;
            border-color: rgba(0, 242, 254, 0.5);
            
            img {
              transform: scale(1.05);
            }
          }
          
          &.active {
            opacity: 1;
            border-color: #00f2fe;
            box-shadow: 0 0 10px rgba(0, 242, 254, 0.3);
          }
        }
      }

      .main-image-viewer {
        flex: 1;
        position: relative;
        background: #191919;
        border-radius: 6px;
        overflow: hidden;
        cursor: zoom-in;
        display: flex;
        align-items: center;
        justify-content: center;

        img {
          width: 80%;
          height: auto;
          object-fit: contain;
          transition: transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        .zoom-guide-toast {
          position: absolute;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(11, 11, 11, 0.75);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.7);
          padding: 0.8rem 1.6rem;
          border-radius: 30px;
          font-size: 1.2rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.8rem;
          pointer-events: none;
          transition: all 0.3s ease;
          
          .material-icons {
            font-size: 1.6rem;
            color: #00f2fe;
          }
        }

        &:hover .zoom-guide-toast {
          opacity: 0;
          transform: translate(-50%, 10px);
        }
      }
    }

    .info-column-wrapper {
      position: relative;
      height: 100%;
      
      .info-sticky-panel {
        position: sticky;
        top: 120px; /* Header 80px + 여유분 40px */
        display: flex;
        flex-direction: column;
        transition: all 0.3s ease;
      }

      .brand-sub {
        font-size: 1.3rem;
        font-weight: 800;
        color: #00f2fe;
        letter-spacing: 0.2em;
        margin-bottom: 1.2rem;
      }

      .title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 2rem;
        margin-bottom: 1.8rem;

        .prod-title {
          font-size: 4rem;
          font-weight: 900;
          line-height: 1.2;
          letter-spacing: -0.01em;
          color: #ffffff;
          margin: 0;
        }

        .share-btn {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.7);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 0;
          
          &:hover {
            background: #ffffff;
            color: #0b0b0b;
            border-color: #ffffff;
            transform: scale(1.08);
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.25);
          }

          .material-icons {
            font-size: 2rem;
          }
        }
      }

      .prod-price {
        font-size: 2.8rem;
        font-weight: 900;
        color: #ffffff;
        margin-bottom: 2.4rem;
      }

      .urgency-panel {
        background: rgba(255, 255, 255, 0.02);
        border: 1px dashed rgba(0, 242, 254, 0.2);
        border-radius: 6px;
        padding: 1.6rem;
        margin-bottom: 2.8rem;
        display: flex;
        flex-direction: column;
        gap: 1.2rem;
        
        .urgency-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 1.3rem;
          color: rgba(255, 255, 255, 0.7);
          
          strong {
            color: #ffffff;
          }
          
          .material-icons {
            font-size: 1.8rem;
            
            &.pulse {
              color: #00f2fe;
              animation: livePulse 2s infinite ease-in-out;
            }
            
            &.error {
              color: #ff4081;
            }
          }
        }
        
        @keyframes livePulse {
          0% { opacity: 0.4; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.1); text-shadow: 0 0 8px #00f2fe; }
          100% { opacity: 0.4; transform: scale(0.9); }
        }
      }

      .prod-desc {
        font-size: 1.5rem;
        line-height: 1.8;
        color: rgba(255, 255, 255, 0.65);
        margin-bottom: 3.2rem;
        word-break: keep-all;
      }

      .option-section {
        margin-bottom: 2.8rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        padding-bottom: 2.4rem;

        .section-title {
          font-size: 1.4rem;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 1.4rem;
          
          strong {
            color: #00f2fe;
          }
        }

        .section-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 1.4rem;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 1.4rem;

          .fit-guide-trigger {
            background: transparent;
            border: none;
            color: #00f2fe;
            font-size: 1.3rem;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.4rem;
            transition: all 0.3s ease;

            &:hover {
              color: #ffffff;
              text-shadow: 0 0 8px rgba(0, 242, 254, 0.5);
            }

            .material-icons {
              font-size: 1.6rem;
            }
          }
        }

        .swatches-list {
          display: flex;
          align-items: center;
          gap: 1.4rem;
          flex-wrap: wrap;

          .swatch-btn {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 2px solid rgba(255, 255, 255, 0.15);
            padding: 3px;
            cursor: pointer;
            transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
            background-clip: content-box;

            &.active {
              border-color: #00f2fe;
              transform: scale(1.15);
              box-shadow: 0 0 12px rgba(0, 242, 254, 0.6);
            }

            &:hover:not(.active) {
              border-color: #ffffff;
            }
          }
        }

        .qty-selector {
          display: flex;
          align-items: center;
          gap: 2rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 4px;
          padding: 0.6rem 1.6rem;
          width: fit-content;
          
          .qty-btn {
            background: transparent;
            border: none;
            color: #ffffff;
            font-size: 1.8rem;
            font-weight: 700;
            cursor: pointer;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            
            &:hover {
              color: #00f2fe;
            }
          }
          
          .qty-value {
            font-size: 1.5rem;
            font-weight: 800;
            color: #ffffff;
            min-width: 24px;
            text-align: center;
          }
        }

        .size-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1rem;

          .size-btn {
            height: 50px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 4px;
            color: #ffffff;
            font-size: 1.4rem;
            font-weight: 700;
            cursor: pointer;
            position: relative;
            transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);

            &.active {
              background: #ffffff;
              color: #0b0b0b;
              border-color: #ffffff;
              font-weight: 900;
              box-shadow: 0 4px 15px rgba(255, 255, 255, 0.15);
            }

            &:hover:not(.active):not(:disabled) {
              border-color: #00f2fe;
              color: #00f2fe;
              background: rgba(0, 242, 254, 0.03);
            }

            &:disabled {
              background: rgba(255, 255, 255, 0.01);
              border-color: rgba(255, 255, 255, 0.05);
              color: rgba(255, 255, 255, 0.2);
              cursor: not-allowed;
              text-decoration: line-through;
            }
          }
        }
      }

      .action-buttons-panel {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
        margin-top: 1.6rem;
        margin-bottom: 4.8rem;

        .cart-add-btn {
          height: 60px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #ffffff;
          font-size: 1.6rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          transition: all 0.3s ease;

          &:hover {
            background: #ffffff;
            color: #0b0b0b;
            border-color: #ffffff;
            box-shadow: 0 4px 20px rgba(255, 255, 255, 0.15);
          }

          .material-icons {
            font-size: 2.2rem;
          }
        }

        .buy-now-btn {
          height: 60px;
          background: #00f2fe;
          border: none;
          color: #0b0b0b;
          font-size: 1.6rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 242, 254, 0.3);

          &:hover {
            background: #ffffff;
            box-shadow: 0 6px 25px rgba(0, 242, 254, 0.5);
            transform: translateY(-2px);
          }
        }
      }

      .spec-section {
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        padding-top: 3.2rem;

        .spec-header {
          font-size: 1.5rem;
          font-weight: 900;
          letter-spacing: 0.05em;
          color: #ffffff;
          margin-bottom: 2rem;
        }

        .spec-list {
          display: flex;
          flex-direction: column;
          gap: 1.6rem;
        }

        .spec-row {
          display: flex;
          justify-content: space-between;
          font-size: 1.3rem;
          line-height: 1.6;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          padding-bottom: 1.2rem;

          .spec-key {
            font-weight: 800;
            color: rgba(255, 255, 255, 0.5);
            width: 120px;
            flex-shrink: 0;
          }

          .spec-val {
            color: rgba(255, 255, 255, 0.85);
            text-align: right;
            word-break: keep-all;
          }
        }
      }
    }

    .viewer-section {
      margin-top: 10rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding-top: 8rem;

      .viewer-section-header {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        margin-bottom: 4rem;

        .viewer-section-label {
          font-size: 1.2rem;
          font-weight: 800;
          color: #00f2fe;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          margin-bottom: 0.8rem;
        }

        .viewer-section-title {
          font-size: 3.2rem;
          font-weight: 900;
          color: #ffffff;
          letter-spacing: -0.01em;
          line-height: 1.15;

          span {
            background: linear-gradient(135deg, #ffffff 30%, #00f2fe);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
        }

        .viewer-section-desc {
          font-size: 1.4rem;
          color: rgba(255, 255, 255, 0.45);
          max-width: 320px;
          text-align: right;
          line-height: 1.7;
          word-break: keep-all;
        }
      }

      .viewer-section-inner {
        background: radial-gradient(ellipse at 50% 0%, #0d1a26 0%, #06090e 65%);
        border: 1px solid rgba(0, 242, 254, 0.12);
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 30px 80px rgba(0, 0, 0, 0.7), inset 0 0 60px rgba(0, 242, 254, 0.04);
        padding: 4rem 2rem;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
    }

    .recommendations-section {
      margin-top: 12rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 6rem;
      
      .rec-section-title {
        font-size: 2rem;
        font-weight: 900;
        letter-spacing: 0.1em;
        color: #ffffff;
        margin-bottom: 4rem;
        display: flex;
        align-items: center;
        gap: 0.8rem;
        
        .material-icons {
          color: #00f2fe;
          font-size: 2.4rem;
        }
      }
      
      .recommendations-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 3rem;
      }
      
      .rec-card {
        background: rgba(255, 255, 255, 0.01);
        border: 1px solid rgba(255, 255, 255, 0.04);
        border-radius: 6px;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
        
        .rec-img-box {
          height: 180px;
          background: #131313;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          
          img {
            width: 80%;
            height: auto;
            object-fit: contain;
            transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
          }
        }
        
        .rec-info-box {
          padding: 1.8rem;
          
          .rec-name {
            font-size: 1.3rem;
            font-weight: 800;
            color: #ffffff;
            margin-bottom: 0.8rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .rec-price {
            font-size: 1.4rem;
            font-weight: 900;
            color: #00f2fe;
          }
        }
        
        &:hover {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(0, 242, 254, 0.4);
          transform: translateY(-6px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.6), 0 0 15px rgba(0, 242, 254, 0.1);
          
          .rec-img-box img {
            transform: scale(1.06);
          }
        }
      }
    }

    @media (max-width: 1024px) {
      .detail-grid {
        grid-template-columns: 1fr;
        gap: 5rem;
      }
      
      .media-column-wrapper .media-gallery-container {
        height: 480px;
      }

      .recommendations-section .recommendations-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 2.4rem;
      }
    }

    @media (max-width: 768px) {
      padding: 0 2rem;
      margin: 2rem auto 6rem auto;
      
      .breadcrumbs {
        margin-bottom: 2rem;
      }

      .media-column-wrapper {
        padding: 1.6rem;
        
        .media-gallery-container {
          flex-direction: column-reverse;
          height: auto;
          gap: 1.6rem;
          
          .thumbnail-strip {
            flex-direction: row;
            width: 100%;
            height: auto;
            justify-content: center;
            
            .thumb-box {
              width: 64px;
              height: 64px;
            }
          }
          
          .main-image-viewer {
            height: 320px;
          }
        }
      }

      .info-column-wrapper {
        .info-sticky-panel {
          position: static;
        }

        .title-row .prod-title {
          font-size: 3rem;
        }
        
        .option-section .size-grid {
          grid-template-columns: repeat(4, 1fr);
        }

        .action-buttons-panel {
          grid-template-columns: 1fr;
          gap: 1.6rem;
        }
      }

      .viewer-section {
        margin-top: 6rem;
        padding-top: 4rem;
        
        .viewer-section-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 1.6rem;
          
          .viewer-section-desc {
            text-align: left;
          }
        }
      }
    }
  `,

  FitGuideCard: css`
    background: #0f0f0f !important;
    border: 1px solid rgba(0, 242, 254, 0.3);
    color: #ffffff !important;
    border-radius: 8px !important;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 242, 254, 0.15) !important;

    .dialog-header {
      padding: 2.8rem 2.8rem 1.6rem 2.8rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);

      h3 {
        font-size: 2rem;
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
          font-size: 2.4rem;
        }
      }
    }

    .modal-desc {
      font-size: 1.6rem;
      line-height: 1.7;
      color: rgba(255, 255, 255, 0.85);
      margin-bottom: 2.8rem;
      padding: 0 0.8rem;
      word-break: keep-all;
    }

    .size-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 1.5rem;

      th {
        background: rgba(255, 255, 255, 0.03);
        color: rgba(255, 255, 255, 0.85);
        font-size: 1.6rem;
        font-weight: 900;
        text-align: center;
        padding: 1.5rem 1.2rem;
        border-bottom: 2px solid rgba(0, 242, 254, 0.35);
      }

      td {
        padding: 1.5rem 1.2rem;
        text-align: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.95);
        font-weight: 700;

        &:first-of-type {
          color: #00f2fe;
          font-weight: 900;
          font-size: 1.55rem;
          text-shadow: 0 0 10px rgba(0, 242, 254, 0.2);
        }
      }

      tr:hover td {
        background: rgba(255, 255, 255, 0.04);
      }
    }

    .dialog-actions {
      padding: 2rem 2.8rem 2.8rem 2.8rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      justify-content: flex-end;

      .close-action-btn {
        background: #ffffff !important;
        color: #0b0b0b !important;
        font-weight: 800 !important;
        font-size: 1.5rem !important;
        padding: 1.2rem 3rem !important;
        border-radius: 4px !important;
        height: auto !important;
        transition: all 0.3s ease !important;

        &:hover {
          background: #00f2fe !important;
          box-shadow: 0 0 15px rgba(0, 242, 254, 0.5) !important;
        }
      }
    }

    @media (max-width: 480px) {
      .modal-desc {
        font-size: 1.4rem;
        padding: 0 0.4rem;
        margin-bottom: 2rem;
      }
      .size-table {
        font-size: 1.3rem;
        
        th {
          font-size: 1.3rem;
          padding: 1.2rem 0.6rem;
        }
        
        td {
          padding: 1.2rem 0.6rem;
          
          &:first-of-type {
            font-size: 1.35rem;
          }
        }
      }
      .dialog-actions {
        padding: 1.6rem;
        
        .close-action-btn {
          font-size: 1.3rem !important;
          padding: 1rem 2.2rem !important;
        }
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
  <div :class="cx('salomon-detail-layout', Styles.Layout)">
    <!-- 스크롤 진행 바 (고정형 네온 블루 진행도) -->
    <div class="scroll-progress-bar" :style="{ width: scrollPercent + '%' }"></div>

    <!-- 네비게이션 헤더 -->
    <header :class="cx('shop-header', Styles.Header)">
      <div class="header-inner">
        <div class="logo" @click="router.push('/shopping')">
          <span class="logo-text">SALOMON</span>
          <span class="logo-sub">OFFICIAL HOMAGE</span>
        </div>

        <div class="ux-tag-badge">
          <span>PREMIUM SHOPPING EXPERIENCE</span>
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
            @on-click="router.push('/shopping')"
          >
            <span class="material-icons">arrow_back</span>
            컬렉션 목록
          </BaseBtn>
        </div>
      </div>
    </header>

    <!-- 상세정보 메인 콘텐츠 구역 -->
    <main :class="cx(Styles.ContentWrapper)">
      <!-- 브레드크럼 네비게이션 -->
      <div class="breadcrumbs">
        <span class="crumb-link" @click="router.push('/main/main')">Home</span>
        <span class="crumb-separator">></span>
        <span class="crumb-link" @click="router.push('/shopping')">Shop</span>
        <span class="crumb-separator">></span>
        <span class="crumb-active" v-text="product.name"></span>
      </div>

      <div class="detail-grid">
        
        <!-- 왼쪽 열: 제품 이미지 썸네일 스트립 + 돋보기 줌 뷰어 -->
        <div class="media-column-wrapper">
          
          <div class="media-gallery-container">
            <!-- 세로형 썸네일 스트립 -->
            <div class="thumbnail-strip">
              <div 
                v-for="(imgUrl, idx) in GALLERY_IMAGES" 
                :key="idx" 
                :class="['thumb-box', { active: activeGalleryIndex === idx }]"
                @click="activeGalleryIndex = idx"
              >
                <img :src="imgUrl" alt="Thumbnail" />
              </div>
            </div>
            
            <!-- 메인 이미지 돋보기 줌 뷰어 -->
            <div
              class="main-image-viewer"
              @mousemove="handleZoomMove"
              @mouseenter="isZoomed = true"
              @mouseleave="isZoomed = false"
            >
              <!-- 메인 이미지 위에 겹쳐서 표시하여 썸네일 간섭 100% 제거 -->
              <div class="tag-badge" v-text="product.tag"></div>
              <img
                :src="GALLERY_IMAGES[activeGalleryIndex]"
                :alt="product.name"
                :style="{
                  transform: isZoomed ? 'scale(1.8)' : 'scale(1)',
                  transformOrigin: zoomOrigin
                }"
              />

              <div class="zoom-guide-toast" v-if="!isZoomed">
                <span class="material-icons">zoom_in</span>
                마우스를 올려 미세 재질을 확대해보세요
              </div>
            </div>
          </div>
        </div>

        <!-- 오른쪽 열: 옵션 구매 패널 영역 (Sticky 적용) -->
        <div class="info-column-wrapper">
          <div class="info-sticky-panel">
            <!-- 제품 기본 인포 -->
            <div class="brand-sub">SALOMON HERITAGE COLLECTIVE</div>
            <div class="title-row">
              <h1 class="prod-title" v-text="product.name"></h1>
              <button class="share-btn" @click="shareProduct" aria-label="상품 공유하기">
                <span class="material-icons">share</span>
              </button>
            </div>
            
            <div class="prod-price" v-text="product.price"></div>

            <!-- 재고 긴급성 및 실시간 시각적 증거 (Social Proof) -->
            <div class="urgency-panel">
              <div class="urgency-row views">
                <span class="material-icons pulse">visibility</span>
                <span>실시간 <strong>15명</strong>이 이 상품을 함께 탐색하고 있습니다.</span>
              </div>
              <div class="urgency-row stock">
                <span class="material-icons error">flash_on</span>
                <span>품절 직전! 남은 재고 <strong>3개</strong> (선택 즉시 선점)</span>
              </div>
            </div>

            <p class="prod-desc" v-text="product.detailDesc"></p>

            <!-- 리팩토링 컬러 스와치 옵션 -->
            <div class="option-section">
              <div class="section-title">
                컬러 옵션: <strong v-text="selectedColor"></strong>
              </div>
              <div class="swatches-list">
                <button
                  v-for="(sw, swIdx) in product.swatches"
                  :key="swIdx"
                  :class="['swatch-btn', { active: selectedColor === sw.name }]"
                  :style="{ backgroundColor: sw.color }"
                  :aria-label="sw.label"
                  @click="selectColor(sw.name)"
                >
                  <span class="blind" v-text="sw.name"></span>
                </button>
              </div>
            </div>

            <!-- 수량 선택 UI -->
            <div class="option-section">
              <div class="section-title">수량 선택</div>
              <div class="qty-selector">
                <button class="qty-btn" @click="selectedQty = Math.max(1, selectedQty - 1)">-</button>
                <span class="qty-value" v-text="selectedQty"></span>
                <button class="qty-btn" @click="selectedQty = selectedQty + 1">+</button>
              </div>
            </div>

            <!-- 사이즈 옵션 선택 (품절 분기 적용) -->
            <div class="option-section">
              <div class="section-title-row">
                <span>사이즈 선택 (MM)</span>
                <button class="fit-guide-trigger" @click="isFitGuideOpen = true">
                  <span class="material-icons">straighten</span>
                  핏 가이드 보기
                </button>
              </div>

              <div class="size-grid">
                <button
                  v-for="size in sizes"
                  :key="size"
                  :class="[
                    'size-btn',
                    { active: selectedSize === size },
                    { 'out-of-stock': outOfStockSizes.includes(size) }
                  ]"
                  :disabled="outOfStockSizes.includes(size)"
                  @click="selectSize(size)"
                >
                  <span v-text="size"></span>
                  <span v-if="outOfStockSizes.includes(size)" class="soldout-tag">품절</span>
                </button>
              </div>
            </div>

            <!-- 구매 액션 버튼 패널 -->
            <div class="action-buttons-panel">
              <button class="cart-add-btn" @click="addToCart">
                <span class="material-icons">shopping_bag</span>
                장바구니 담기
              </button>
              <button class="buy-now-btn" @click="buyNow">
                즉시 구매하기
              </button>
            </div>

            <!-- 기술 특징 스펙 설명 (아코디언 스타일 대체형 플랫 리스트) -->
            <div class="spec-section">
              <h3 class="spec-header">TECHNICAL CHARACTERISTICS</h3>
              <div class="spec-list">
                <div v-for="spec in product.techSpecs" :key="spec.key" class="spec-row">
                  <span class="spec-key" v-text="spec.key"></span>
                  <span class="spec-val" v-text="spec.value"></span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      <!-- 360° 풀 와이드 섹션: 구매 흐름 이후 몰입 탐색 존 -->
      <section class="viewer-section">
        <div class="viewer-section-header">
          <div>
            <div class="viewer-section-label">360° INTERACTIVE EXPLORER</div>
            <h2 class="viewer-section-title">
              모든 각도에서<br /><span>직접 확인하세요</span>
            </h2>
          </div>
          <p class="viewer-section-desc">
            클릭 후 드래그하여 신발을 자유롭게 회전시켜<br />
            솔, 힐컵, 아웃솔 디테일까지 직접 탐색하세요.
          </p>
        </div>
        <div class="viewer-section-inner">
          <Interactive360Viewer :is-detail="true" :product-id="product.id" />
        </div>
      </section>

      <!-- You May Also Like 관련 상품 추천 섹션 -->
      <section class="recommendations-section">
        <h3 class="rec-section-title">
          <span class="material-icons">auto_awesome</span>
          YOU MAY ALSO LIKE
        </h3>
        <div class="recommendations-grid">
          <div 
            v-for="rec in recommendedProducts" 
            :key="rec.id" 
            class="rec-card"
            @click="router.push('/shopping/' + rec.id); activeGalleryIndex = 0; selectedSize = null; selectedQty = 1;"
          >
            <div class="rec-img-box">
              <img :src="rec.img" :alt="rec.name" />
            </div>
            <div class="rec-info-box">
              <h4 class="rec-name" v-text="rec.name"></h4>
              <p class="rec-price" v-text="rec.price"></p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 반응형 3D 핏 가이드 (Size Chart) 모달 팝업 -->
    <v-dialog v-model="isFitGuideOpen" max-width="600" persistent>
      <v-card :class="cx(Styles.FitGuideCard)">
        <v-card-title class="dialog-header">
          <h3>SALOMON FIT & SIZE GUIDE</h3>
          <button class="close-btn" @click="isFitGuideOpen = false">
            <span class="material-icons">close</span>
          </button>
        </v-card-title>
        
        <v-card-text>
          <p class="modal-desc">살로몬 스니커즈는 뛰어난 섀시 핏 피팅감을 선사하며, 발볼 너비에 맞게 정사이즈 또는 5mm 오버사이징(반업)을 권장합니다.</p>
          
          <table class="size-table">
            <thead>
              <tr>
                <th>한국 (KR)</th>
                <th>유럽 (EU)</th>
                <th>미국 (US)</th>
                <th>영국 (UK)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>230 mm</td>
                <td>37.5</td>
                <td>5.5</td>
                <td>5.0</td>
              </tr>
              <tr>
                <td>240 mm</td>
                <td>38.7</td>
                <td>6.5</td>
                <td>6.0</td>
              </tr>
              <tr>
                <td>250 mm</td>
                <td>40.0</td>
                <td>7.5</td>
                <td>7.0</td>
              </tr>
              <tr>
                <td>260 mm</td>
                <td>41.3</td>
                <td>8.5</td>
                <td>8.0</td>
              </tr>
              <tr>
                <td>270 mm</td>
                <td>42.7</td>
                <td>9.5</td>
                <td>9.0</td>
              </tr>
              <tr>
                <td>280 mm</td>
                <td>44.0</td>
                <td>10.5</td>
                <td>10.0</td>
              </tr>
              <tr>
                <td>290 mm</td>
                <td>45.3</td>
                <td>11.5</td>
                <td>11.0</td>
              </tr>
            </tbody>
          </table>
        </v-card-text>
        
        <v-card-actions class="dialog-actions">
          <BaseBtn :hover="false" variant="flat" class="close-action-btn" @on-click="isFitGuideOpen = false">
            확인 및 닫기
          </BaseBtn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 비회원 전용 사이드 카트 서랍 (Friction 0% 장바구니 연동) -->
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
          <span class="sub">비회원 상태로 언제든지 즉각 담을 수 있습니다.</span>
        </div>

        <div v-else class="cart-items-list">
          <div v-for="(item, index) in cartItems" :key="index" class="cart-item">
            <div class="item-img">
              <img :src="item.img" :alt="item.name" />
            </div>
            
            <div class="item-info">
              <h4 class="item-name" v-text="item.name"></h4>
              <span class="item-color" v-text="'옵션: ' + item.selectedColor + ' / ' + item.selectedSize + 'mm'"></span>
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
        <p class="guide-text">로그인 요구 장벽 없이 즉각적인 장바구니 CRUD 계산 연동 완료.</p>
        <button
          class="checkout-btn"
          :disabled="cartItems.length === 0"
          @click="buyNow"
        >
          최종 주문 확인서 작성
        </button>
      </div>
    </aside>

    <!-- Scroll to Top 플로팅 버튼 -->
    <button 
      class="scroll-top-btn" 
      :class="{ show: showScrollTop }" 
      @click="window.scrollTo({ top: 0, behavior: 'smooth' })"
      aria-label="맨 위로 가기"
    >
      <span class="material-icons">arrow_upward</span>
    </button>

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
.salomon-detail-layout::-webkit-scrollbar {
  width: 6px;
}
.salomon-detail-layout::-webkit-scrollbar-track {
  background: #111111;
}
.salomon-detail-layout::-webkit-scrollbar-thumb {
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

/* 장바구니 오버레이 딤드 처리 */
.cart-drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 140;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.4s ease;
  
  &.open {
    opacity: 1;
    pointer-events: auto;
  }
}
</style>
