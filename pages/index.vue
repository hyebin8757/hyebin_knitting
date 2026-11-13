<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useKnittingStore } from "~/stores/useKnittingStore";

const route = useRoute();
const router = useRouter();
const store = useKnittingStore();

const searchPhone = ref("");

// 비밀 관리자 쿼리 파라미터 감지 (예: /?manage 또는 /?admin 접속 시 관리자 페이지로 자동 이동)
onMounted(() => {
  if (route.query.manage !== undefined || route.query.admin !== undefined || route.query.owner !== undefined) {
    router.replace("/manage");
  }
});

const goToOrderWithProduct = (productId: string) => {
  router.push({ path: "/order", query: { select: productId } });
};

const handleQuickLookup = () => {
  if (!searchPhone.value.trim()) {
    store.isOrderLookupModalOpen = true;
    return;
  }
  store.isOrderLookupModalOpen = true;
};
</script>

<template>
  <div class="home-page">
    <!-- 메인 히어로 배너 -->
    <section class="hero-section">
      <div class="hero-inner">
        <div class="hero-badge">🌸 100% 핸드메이드 인형옷 공방</div>
        <h1 class="hero-title">
          <span class="hero-main-title">🧶 먼작콩 뜨개상점</span>
          <span class="hero-sub-title highlight-text">치이카와 앉은누이 전용 뜨개옷</span>
        </h1>

        <div class="hero-actions">
          <nuxt-link to="/order" class="btn-hero-primary">
            <i class="material-icons">shopping_bag</i>
            <span>뜨개옷 주문서 작성하기</span>
          </nuxt-link>
          <!-- 포토 후기 버튼 (추후 적용 예정으로 숨김 처리)
          <nuxt-link to="/reviews" class="btn-hero-secondary">
            <i class="material-icons">photo_camera</i>
            <span>생생 포토 후기 ({{ store.reviews.length }})</span>
          </nuxt-link>
          -->
          <button type="button" class="btn-hero-outline" @click="store.isFeedbackModalOpen = true">
            <i class="material-icons">support_agent</i>
            <span>의견 / 제작 문의하기</span>
          </button>
        </div>
      </div>
    </section>

    <!-- 공지사항 & 주문 안내 (관리자 메뉴에서 실시간 수정 연동 - 이미지 2번) -->
    <section class="notice-grid-section">
      <div class="container">
        <div class="notices-grid">
          <!-- 1. 공지사항 -->
          <div class="notice-card notice-important">
            <div class="card-icon-title">
              <span class="card-emoji">📢</span>
              <h3 class="card-heading">공지사항</h3>
            </div>
            <div class="notice-content-box">
              {{ store.siteNotices.noticeContent }}
            </div>
          </div>

          <!-- 2. 배송안내 -->
          <div class="notice-card notice-shipping">
            <div class="card-icon-title">
              <span class="card-emoji">📦</span>
              <h3 class="card-heading">배송 안내</h3>
            </div>
            <div class="notice-content-box">
              {{ store.siteNotices.shippingContent }}
            </div>
          </div>

          <!-- 3. 세탁 시 주의사항 -->
          <div class="notice-card notice-care">
            <div class="card-icon-title">
              <span class="card-emoji">🫧</span>
              <h3 class="card-heading">세탁 시 주의사항</h3>
            </div>
            <div class="notice-content-box">
              {{ store.siteNotices.washingContent }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 전체 상품 라인업 섹션 (9종 실물) -->
    <section class="products-section">
      <div class="container">
        <div class="section-header">
          <div class="badge-mini">CATALOG</div>
          <h2 class="section-title">주문 가능한 뜨개옷 라인업</h2>
          <p class="section-desc">원하시는 디자인을 선택하시면 주문서 작성 페이지로 바로 이동합니다.</p>
        </div>

        <div class="products-grid">
          <div
            v-for="product in store.products"
            :id="`product-${product.id}`"
            :key="product.id"
            class="product-card"
          >
            <!-- 이미지 스와이프 영역 (최대 5장 지원) -->
            <div class="img-wrap">
              <ProductImageSwipe
                :images="product.images || [product.image]"
                :fallback-image="product.image"
                :alt="product.name"
                :badge-text="product.tag"
                :badge-color="product.badgeColor || '#ff758f'"
                @click="goToOrderWithProduct(product.id)"
              />
            </div>

            <!-- 정보 영역 -->
            <div class="product-info">
              <div class="name-price-row">
                <h3 class="product-name" @click="goToOrderWithProduct(product.id)">{{ product.name }}</h3>
                <span class="product-price">{{ product.price.toLocaleString() }}원</span>
              </div>
              <p class="product-desc">{{ product.description }}</p>

              <button class="btn-add-order" @click="goToOrderWithProduct(product.id)">
                <i class="material-icons">add_shopping_cart</i>
                <span>주문서에 담기</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 실시간 구매자 후기 섹션 (추후 적용 예정으로 숨김 처리)
    <section class="reviews-preview-section">
      <div class="container">
        <div class="section-header">
          <div class="badge-mini">REVIEWS</div>
          <h2 class="section-title">집사님들의 솔직한 포토 후기</h2>
          <p class="section-desc">귀여운 인형 착용샷과 만족도 후기를 확인해보세요!</p>
        </div>

        <div class="reviews-grid">
          <div v-for="rev in store.reviews.slice(0, 3)" :key="rev.id" class="review-card">
            <div class="review-top">
              <div class="stars">
                <span v-for="s in rev.rating" :key="s">★</span>
              </div>
              <span class="rev-date">{{ rev.createdAt }}</span>
            </div>
            <div class="rev-product-tag">🏷️ {{ rev.productName }}</div>
            <p class="rev-content">{{ rev.content }}</p>
            <div class="rev-author-line">
              <span class="rev-author">{{ rev.author }}</span>
              <span class="verified-badge">✓ 실구매 인증</span>
            </div>
          </div>
        </div>

        <div class="reviews-footer-cta">
          <nuxt-link to="/reviews" class="btn-more-reviews">
            전체 후기 보러가기 & 후기 남기기 →
          </nuxt-link>
        </div>
      </div>
    </section>
    -->

    <!-- 하단 빠른 주문조회 배너 -->
    <section class="order-lookup-banner-section">
      <div class="container">
        <div class="lookup-banner-card">
          <div class="lookup-text-group">
            <span class="banner-badge">MY ORDER</span>
            <h3 class="banner-title">이미 주문하셨나요? 배송 상태를 확인해보세요!</h3>
            <p class="banner-desc">연락처나 주문번호만 입력하면 현재 제작 및 배송 단계를 바로 확인하실 수 있습니다.</p>
          </div>
          <button class="btn-open-lookup" @click="handleQuickLookup">
            <i class="material-icons">search</i>
            <span>내 주문 조회하기</span>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 20px;
}

.container {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 16px;
}

/* 히어로 섹션 */
.hero-section {
  background: linear-gradient(180deg, #fff2f4 0%, #faf7f2 100%);
  padding: 38px 16px 20px;
  text-align: center;
}

.hero-inner {
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.hero-badge {
  background: #ffffff;
  color: #ff4d6d;
  font-size: 0.82rem;
  font-weight: 800;
  padding: 5px 16px;
  border-radius: 20px;
  box-shadow: 0 2px 10px rgba(255, 77, 109, 0.12);
  margin-bottom: 14px;
  border: 1px solid #ffd6de;
  letter-spacing: -0.2px;
}

.hero-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin: 0 0 22px;
  text-align: center;
}

.hero-main-title {
  font-size: 1.95rem;
  font-weight: 900;
  color: #2b1f1d;
  letter-spacing: -0.5px;
  line-height: 1.25;
}

.hero-sub-title {
  font-size: 1.7rem;
  font-weight: 900;
  line-height: 1.3;
  letter-spacing: -0.5px;
}

.highlight-text {
  color: #ff4d6d;
  background: linear-gradient(transparent 65%, #ffd6de 65%);
  padding: 0 6px;
  border-radius: 6px;
}

.hero-desc {
  font-size: 0.95rem;
  color: #6b5c58;
  line-height: 1.6;
  margin: 0 0 24px;
  word-break: keep-all;
  text-align: center;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.btn-hero-primary {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #ff758f 0%, #ff4d6d 100%);
  color: #ffffff;
  font-size: 1rem;
  font-weight: 800;
  padding: 14px 28px;
  border-radius: 16px;
  text-decoration: none;
  box-shadow: 0 6px 20px rgba(255, 77, 109, 0.35);
  transition: all 0.2s;
}

.btn-hero-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 77, 109, 0.45);
}

.btn-hero-secondary {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  color: #3f2f2c;
  font-size: 0.95rem;
  font-weight: 700;
  padding: 14px 22px;
  border-radius: 16px;
  text-decoration: none;
  border: 1.5px solid #ebdcd0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.2s;
}

.btn-hero-secondary:hover {
  background: #fdfaf6;
  border-color: #ff758f;
  color: #ff4d6d;
}

.btn-hero-outline {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #ffffff;
  color: #c9184a;
  border: 1.5px solid #ffccd5;
  font-size: 0.94rem;
  font-weight: 700;
  padding: 13px 22px;
  border-radius: 16px;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(255, 77, 109, 0.08);
  transition: all 0.2s;
}

.btn-hero-outline:hover {
  background: #fff5f7;
  border-color: #ff758f;
  transform: translateY(-1px);
}

/* 안내 카드 그리드 */
.notices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.notice-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 22px;
  border: 1px solid #ebdcd0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-icon-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-emoji {
  font-size: 1.5rem;
}

.card-heading {
  font-size: 1.05rem;
  font-weight: 800;
  color: #2b1f1d;
  margin: 0;
}

.notice-ul {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.85rem;
  line-height: 1.55;
  color: #5c4e4b;
}

.notice-content-box {
  font-size: 0.84rem;
  line-height: 1.65;
  color: #5c4e4b;
  white-space: pre-line;
  word-break: keep-all;
}

/* 상품 라인업 섹션 */
.section-header {
  text-align: center;
  margin-bottom: 32px;
}

.badge-mini {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 1.5px;
  color: #ff758f;
  margin-bottom: 6px;
}

.section-title {
  font-size: 1.7rem;
  font-weight: 800;
  color: #2b1f1d;
  margin: 0 0 8px;
}

.section-desc {
  font-size: 0.9rem;
  color: #8c7e7b;
  margin: 0;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.product-card {
  background: #ffffff;
  border: 1px solid #ebdcd0;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px rgba(255, 117, 143, 0.15);
}

.product-card.product-card-highlight {
  border-color: #ff4d6d !important;
  box-shadow: 0 0 0 4.5px rgba(255, 77, 109, 0.45), 0 12px 28px rgba(255, 77, 109, 0.25) !important;
  animation: cardPulse 0.7s ease-in-out 4 alternate;
}

@keyframes cardPulse {
  0% { transform: scale(1); }
  100% { transform: scale(1.035); }
}

.img-wrap {
  position: relative;
  width: 100%;
  padding-top: 85%;
  background: #fdfaf6;
  cursor: pointer;
  overflow: hidden;
}

.img-wrap :deep(.product-image-swipe) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border-radius: 0;
  background: transparent;
}

.img-wrap :deep(.slide-img) {
  padding: 12px;
  object-fit: contain;
  transition: transform 0.3s;
}

.product-card:hover :deep(.slide-img) {
  transform: scale(1.06);
}

.product-thumb {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 12px;
  transition: transform 0.3s;
}

.product-card:hover .product-thumb {
  transform: scale(1.08);
}

.product-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 10px;
}

.product-info {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.name-price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-name {
  font-size: 1.05rem;
  font-weight: 800;
  color: #2b1f1d;
  margin: 0;
  cursor: pointer;
}

.product-price {
  font-size: 1.05rem;
  font-weight: 800;
  color: #ff4d6d;
  white-space: nowrap;
  flex-shrink: 0;
}

.product-desc {
  font-size: 0.82rem;
  color: #6b5c58;
  line-height: 1.5;
  margin: 0;
  flex: 1;
}

.btn-add-order {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #fff0f3;
  border: 1px solid #ffd6de;
  color: #c9184a;
  padding: 10px;
  border-radius: 12px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add-order:hover {
  background: #ff758f;
  color: #ffffff;
}

/* 후기 미리보기 */
.reviews-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.review-card {
  background: #ffffff;
  border: 1px solid #ebdcd0;
  border-radius: 18px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.review-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stars {
  color: #f59e0b;
  font-size: 1rem;
  letter-spacing: 1px;
}

.rev-date {
  font-size: 0.74rem;
  color: #9c8e8b;
}

.rev-product-tag {
  font-size: 0.78rem;
  font-weight: 700;
  color: #ff758f;
}

.rev-content {
  font-size: 0.86rem;
  color: #4b3e3b;
  line-height: 1.6;
  margin: 0;
  flex: 1;
}

.rev-author-line {
  display: flex;
  align-items: center;
  gap: 8px;
  border-top: 1px dashed #ebdcd0;
  padding-top: 10px;
}

.rev-author {
  font-size: 0.8rem;
  font-weight: 700;
  color: #6b5c58;
}

.verified-badge {
  background: #dcfce7;
  color: #15803d;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 6px;
}

.reviews-footer-cta {
  text-align: center;
  margin-top: 24px;
}

.btn-more-reviews {
  display: inline-block;
  background: #ffffff;
  border: 1.5px solid #ebdcd0;
  color: #2b1f1d;
  font-size: 0.92rem;
  font-weight: 700;
  padding: 12px 28px;
  border-radius: 14px;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-more-reviews:hover {
  border-color: #ff758f;
  color: #ff4d6d;
  background: #fff8f9;
}

/* 주문조회 배너 */
.lookup-banner-card {
  background: linear-gradient(135deg, #fff7f2 0%, #fff0f5 100%);
  border: 1.5px solid #ffd6de;
  border-radius: 24px;
  padding: 28px 32px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.lookup-text-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.banner-badge {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 1px;
  color: #ff758f;
}

.banner-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #2b1f1d;
  margin: 0;
}

.banner-desc {
  font-size: 0.85rem;
  color: #6b5c58;
  margin: 0;
}

.btn-open-lookup {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #2b1f1d;
  color: #ffffff;
  border: none;
  border-radius: 14px;
  padding: 12px 24px;
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-open-lookup:hover {
  background: #ff4d6d;
}

@media (max-width: 640px) {
  .home-page {
    gap: 16px;
  }

  .hero-section {
    padding: 22px 14px 14px;
    text-align: center;
  }

  .hero-inner {
    padding: 0; /* 이중 패딩 제거로 비정상적인 여백 해소 */
    width: 100%;
    align-items: center;
    text-align: center;
  }

  .hero-badge {
    font-size: 0.74rem;
    padding: 4px 12px;
    margin-bottom: 10px;
  }

  .hero-title {
    gap: 4px;
    margin-bottom: 8px;
    text-align: center;
  }

  .hero-main-title {
    font-size: 1.45rem;
    line-height: 1.25;
  }

  .hero-sub-title {
    font-size: 1.3rem;
    line-height: 1.3;
  }

  .hero-desc {
    font-size: 0.84rem;
    line-height: 1.5;
    margin-bottom: 18px;
    text-align: center;
  }

  .hero-actions {
    flex-direction: column;
    width: 100%;
    gap: 8px;
  }

  .hero-actions a,
  .hero-actions button {
    width: 100%;
    justify-content: center;
  }

  .btn-hero-primary {
    padding: 13px 18px;
    font-size: 0.95rem;
    border-radius: 14px;
  }

  .btn-hero-outline {
    padding: 12px 18px;
    font-size: 0.88rem;
    border-radius: 14px;
  }

  .notices-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .notice-card {
    padding: 16px 14px;
    border-radius: 16px;
    gap: 8px;
  }

  .card-emoji {
    font-size: 1.3rem;
  }

  .card-heading {
    font-size: 0.98rem;
  }

  .notice-ul {
    padding-left: 16px;
    gap: 6px;
    font-size: 0.82rem;
    line-height: 1.5;
  }

  .products-section {
    padding: 0;
  }

  .section-header {
    margin-bottom: 12px;
    text-align: center;
  }

  .section-title {
    font-size: 1.25rem;
    margin-bottom: 4px;
  }

  .section-desc {
    font-size: 0.82rem;
  }

  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .product-card {
    border-radius: 14px;
  }

  .product-info {
    padding: 10px;
    gap: 4px;
  }

  .name-price-row {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 3px;
  }

  .product-name {
    font-size: 0.88rem;
    line-height: 1.3;
    word-break: keep-all;
  }

  .product-price {
    font-size: 0.95rem;
    font-weight: 900;
    color: #ff4d6d;
    white-space: nowrap;
  }

  .product-desc {
    display: none; /* 모바일 그리드에선 간결하게 사진과 가격 강조 */
  }

  .btn-add-order {
    padding: 8px;
    font-size: 0.78rem;
    border-radius: 10px;
    margin-top: 4px;
  }

  .lookup-banner-card {
    padding: 16px 14px;
    border-radius: 16px;
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .banner-title {
    font-size: 1.05rem;
  }

  .banner-desc {
    font-size: 0.82rem;
    margin-bottom: 8px;
  }

  .btn-open-lookup {
    width: 100%;
    justify-content: center;
    padding: 12px;
    border-radius: 12px;
    font-size: 0.9rem;
  }
}
</style>
