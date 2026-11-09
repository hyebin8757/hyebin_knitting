<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useKnittingStore, type ReviewItem } from "~/stores/useKnittingStore";

const router = useRouter();
const store = useKnittingStore();

onMounted(() => {
  // 포토 후기 메뉴는 추후 적용 예정으로 홈으로 안전하게 안내
  router.replace("/");
});

const selectedRatingFilter = ref<number | "all">("all");
const selectedProductFilter = ref<string>("all");
const zoomImage = ref<string | null>(null);

// 평점 통계
const averageRating = computed(() => {
  if (store.reviews.length === 0) return 5.0;
  const sum = store.reviews.reduce((acc, r) => acc + r.rating, 0);
  return (sum / store.reviews.length).toFixed(1);
});

// 필터링된 리뷰
const filteredReviews = computed(() => {
  return store.reviews.filter((rev) => {
    if (!rev.isVisible) return false;
    if (selectedRatingFilter.value !== "all" && rev.rating !== selectedRatingFilter.value) {
      return false;
    }
    if (selectedProductFilter.value !== "all" && !rev.productName.includes(selectedProductFilter.value)) {
      return false;
    }
    return true;
  });
});

const handleLike = (id: string) => {
  store.likeReview(id);
};
</script>

<template>
  <div class="reviews-page">
    <div class="container">
      <!-- 상단 헤더 & 평점 요약 -->
      <section class="reviews-header-card">
        <div class="header-left">
          <span class="sub-badge">REAL REVIEWS</span>
          <h1 class="page-title">집사님들의 소중한 뜨개옷 후기</h1>
          <p class="page-desc">소중한 인형 친구들의 사랑스러운 착용샷과 진솔한 리뷰를 만나보세요.</p>
        </div>

        <div class="header-right">
          <div class="rating-stat-card">
            <div class="score-row">
              <span class="big-score font-mono">{{ averageRating }}</span>
              <div class="stars-col">
                <div class="stars-gold">★★★★★</div>
                <span class="review-count">총 {{ store.reviews.filter(r => r.isVisible).length }}개의 솔직 후기</span>
              </div>
            </div>
          </div>
          <button class="btn-write-rev" @click="store.isReviewWriteModalOpen = true">
            <i class="material-icons">edit</i>
            <span>후기 작성하기 ✨</span>
          </button>
        </div>
      </section>

      <!-- 필터 바 -->
      <div class="filters-bar">
        <div class="filter-group">
          <span class="filter-label">별점 필터:</span>
          <button
            class="filter-pill"
            :class="{ active: selectedRatingFilter === 'all' }"
            @click="selectedRatingFilter = 'all'"
          >
            전체
          </button>
          <button
            v-for="r in [5, 4, 3]"
            :key="r"
            class="filter-pill"
            :class="{ active: selectedRatingFilter === r }"
            @click="selectedRatingFilter = r"
          >
            ★ {{ r }}점
          </button>
        </div>

        <div class="filter-group">
          <span class="filter-label">상품 필터:</span>
          <select v-model="selectedProductFilter" class="select-filter">
            <option value="all">모든 뜨개옷</option>
            <option v-for="p in store.products" :key="p.id" :value="p.name">{{ p.name }}</option>
          </select>
        </div>
      </div>

      <!-- 리뷰 카드 그리드 -->
      <div v-if="filteredReviews.length === 0" class="empty-reviews">
        <span class="empty-icon">📝</span>
        <h3 class="empty-title">해당하는 후기가 아직 없습니다.</h3>
        <p class="empty-sub">첫 번째 후기의 주인공이 되어보세요!</p>
        <button class="btn-write-rev-empty" @click="store.isReviewWriteModalOpen = true">
          첫 후기 작성하기
        </button>
      </div>

      <div v-else class="reviews-masonry">
        <div v-for="rev in filteredReviews" :key="rev.id" class="review-item-card">
          <!-- 상단 정보 -->
          <div class="card-top">
            <div class="user-meta">
              <div class="avatar-circle">🧶</div>
              <div>
                <span class="author-name">{{ rev.author }}</span>
                <span class="rev-date">{{ rev.createdAt }}</span>
              </div>
            </div>
            <div class="stars-row">
              <span v-for="s in rev.rating" :key="s" class="star-on">★</span>
              <span v-for="s in (5 - rev.rating)" :key="s" class="star-off">★</span>
            </div>
          </div>

          <!-- 구매 상품 배지 -->
          <div class="product-tag-pill">
            <i class="material-icons tag-icon">check_circle</i>
            <span>{{ rev.productName }} 구매</span>
          </div>

          <!-- 착용 사진 (있는 경우) -->
          <div v-if="rev.image" class="rev-img-wrap" @click="zoomImage = rev.image">
            <img :src="rev.image" :alt="rev.productName" class="rev-img" />
            <span class="zoom-hint"><i class="material-icons">zoom_in</i> 확대</span>
          </div>

          <!-- 내용 -->
          <p class="rev-text">{{ rev.content }}</p>

          <!-- 하단 좋아요 -->
          <div class="card-bottom">
            <button class="btn-like" @click="handleLike(rev.id)">
              <i class="material-icons heart-icon">favorite</i>
              <span>도움돼요 {{ rev.likes }}</span>
            </button>
            <span class="verified-tag">✓ 구매 인증</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 이미지 확대 모달 -->
    <div v-if="zoomImage" class="zoom-modal" @click="zoomImage = null">
      <div class="zoom-content">
        <img :src="zoomImage" alt="착용샷 확대" class="zoom-img" />
        <button class="btn-close-zoom" @click="zoomImage = null">닫기</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reviews-page {
  padding: 24px 16px 20px;
}

.container {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.reviews-header-card {
  background: linear-gradient(135deg, #fff2f4 0%, #fff7f2 100%);
  border: 1.5px solid #ffd6de;
  border-radius: 24px;
  padding: 32px 28px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.sub-badge {
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 1.5px;
  color: #ff4d6d;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 900;
  color: #2b1f1d;
  margin: 6px 0 8px;
}

.page-desc {
  font-size: 0.92rem;
  color: #6b5c58;
  margin: 0;
}

.header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.rating-stat-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 12px 18px;
  box-shadow: 0 4px 12px rgba(255, 117, 143, 0.15);
  border: 1px solid #ffe2e8;
}

.score-row {
  display: flex;
  align-items: center;
  gap: 14px;
}

.big-score {
  font-size: 2.2rem;
  font-weight: 900;
  color: #ff4d6d;
}

.stars-col {
  display: flex;
  flex-direction: column;
}

.stars-gold {
  color: #f59e0b;
  font-size: 1.1rem;
  letter-spacing: 1px;
}

.review-count {
  font-size: 0.78rem;
  color: #8c7e7b;
  font-weight: 600;
}

.btn-write-rev {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #ff758f 0%, #ff4d6d 100%);
  color: #ffffff;
  border: none;
  border-radius: 14px;
  padding: 12px 22px;
  font-size: 0.92rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(255, 77, 109, 0.35);
  transition: all 0.2s;
}

.btn-write-rev:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(255, 77, 109, 0.45);
}

.filters-bar {
  background: #ffffff;
  border: 1px solid #ebdcd0;
  border-radius: 16px;
  padding: 14px 18px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: #6b5c58;
}

.filter-pill {
  background: #f7f3ee;
  border: 1px solid #e8ded4;
  border-radius: 20px;
  padding: 5px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #5c4e4b;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-pill.active {
  background: #ff758f;
  color: #ffffff;
  border-color: #ff758f;
}

.select-filter {
  border: 1px solid #e8ded4;
  border-radius: 10px;
  padding: 6px 12px;
  font-size: 0.82rem;
  color: #2b1f1d;
  background: #fdfcfb;
}

.reviews-masonry {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 20px;
}

.review-item-card {
  background: #ffffff;
  border: 1px solid #ebdcd0;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: transform 0.2s;
}

.review-item-card:hover {
  transform: translateY(-2px);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar-circle {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #fff0f3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.author-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: #2b1f1d;
  display: block;
}

.rev-date {
  font-size: 0.72rem;
  color: #9c8e8b;
}

.stars-row {
  display: flex;
}

.star-on {
  color: #f59e0b;
}

.star-off {
  color: #e5e7eb;
}

.product-tag-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #fff0f3;
  color: #c9184a;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.76rem;
  font-weight: 700;
  align-self: flex-start;
}

.tag-icon {
  font-size: 14px;
}

.rev-img-wrap {
  position: relative;
  width: 100%;
  padding-top: 75%;
  background: #fdfaf6;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
}

.rev-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s;
}

.rev-img-wrap:hover .rev-img {
  transform: scale(1.05);
}

.zoom-hint {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 2px;
}

.zoom-hint .material-icons {
  font-size: 14px;
}

.rev-text {
  font-size: 0.88rem;
  color: #4b3e3b;
  line-height: 1.6;
  margin: 0;
  flex: 1;
}

.card-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px dashed #ebdcd0;
  padding-top: 10px;
}

.btn-like {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #fff0f3;
  border: 1px solid #ffd6de;
  color: #c9184a;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-like:hover {
  background: #ff758f;
  color: #fff;
}

.heart-icon {
  font-size: 14px;
}

.verified-tag {
  font-size: 0.72rem;
  color: #16a34a;
  font-weight: 700;
}

.empty-reviews {
  background: #ffffff;
  border: 1px solid #ebdcd0;
  border-radius: 20px;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
}

.empty-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #2b1f1d;
  margin: 12px 0 6px;
}

.empty-sub {
  font-size: 0.85rem;
  color: #8c7e7b;
  margin: 0 0 16px;
}

.btn-write-rev-empty {
  background: #ff758f;
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 10px 24px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
}

.zoom-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 16px;
}

.zoom-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  max-width: 90vw;
  max-height: 90vh;
}

.zoom-img {
  max-width: 100%;
  max-height: 80vh;
  border-radius: 12px;
  object-fit: contain;
}

.btn-close-zoom {
  background: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 8px 24px;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 640px) {
  .reviews-page {
    padding: 16px 10px 16px;
  }
  .reviews-header {
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
  }
  .header-right {
    align-items: stretch;
  }
  .btn-write-rev {
    justify-content: center;
    width: 100%;
  }
  .filters-bar {
    padding: 10px 12px;
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  .filter-group {
    overflow-x: auto;
    scrollbar-width: none;
    flex-wrap: nowrap;
    padding-bottom: 2px;
  }
  .filter-group::-webkit-scrollbar {
    display: none;
  }
  .filter-pill {
    white-space: nowrap;
    flex-shrink: 0;
  }
  .reviews-masonry {
    grid-template-columns: 1fr;
    gap: 14px;
  }
  .review-item-card {
    padding: 14px;
    border-radius: 16px;
  }
}
</style>
