<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useKnittingStore, type ProductItem } from "~/stores/useKnittingStore";
import { compressImageFile } from "~/utils/imageCompress";

const props = defineProps<{
  modelValue: boolean;
  product: ProductItem | null; // null이면 신규 추가, 객체면 수정 모드
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "saved", productId: string): void;
}>();

const store = useKnittingStore();
const fileInputRef = ref<HTMLInputElement | null>(null);

const isEditMode = computed(() => !!props.product);

// 사진 목록 상태 (최대 5장)
const imageList = ref<string[]>([]);
const activePreviewIndex = ref<number>(0);
const urlInput = ref<string>("");

// 폼 상태
const form = ref({
  name: "",
  price: 14000,
  tag: "NEW",
  badgeColor: "#ff4d6d",
  description: "",
  details: "",
  isPopular: true,
});

// 기본 추천 이미지 목록 (9종)
const defaultSampleImages = [
  { name: "사과", url: "/images/products/apple.jpg" },
  { name: "사과 데빌", url: "/images/products/apple_devil.jpg" },
  { name: "복숭아", url: "/images/products/peach.jpg" },
  { name: "세라복", url: "/images/products/peach_sailor.jpg" },
  { name: "레몬", url: "/images/products/lemon.jpg" },
  { name: "딸기", url: "/images/products/strawberry.jpg" },
  { name: "장미 산타", url: "/images/products/rose_santa.jpg" },
  { name: "장미 보닛", url: "/images/products/rose_bonnet.jpg" },
  { name: "도토리", url: "/images/products/acorn.jpg" },
];

// 추천 뱃지 색상 팔레트
const colorPalette = [
  { name: "핑크", color: "#ff758f" },
  { name: "레드", color: "#ff4d6d" },
  { name: "와인", color: "#c9184a" },
  { name: "오렌지", color: "#f97316" },
  { name: "옐로우", color: "#ffb703" },
  { name: "스카이", color: "#59a5d8" },
  { name: "브라운", color: "#8b5a2b" },
  { name: "퍼플", color: "#8b5cf6" },
];

watch(
  () => props.product,
  (newVal) => {
    urlInput.value = "";
    if (newVal) {
      // 수정 모드: 기존 이미지 복원 (최대 5장)
      const imgs = newVal.images && Array.isArray(newVal.images) && newVal.images.length > 0
        ? [...newVal.images]
        : (newVal.image ? [newVal.image] : ["/images/products/apple.jpg"]);
      imageList.value = imgs.slice(0, 5);

      form.value = {
        name: newVal.name || "",
        price: newVal.price || 14000,
        tag: newVal.tag || "BEST",
        badgeColor: newVal.badgeColor || "#ff4d6d",
        description: newVal.description || "",
        details: newVal.details || "",
        isPopular: newVal.isPopular ?? true,
      };
    } else {
      // 신규 등록 모드
      imageList.value = ["/images/products/apple.jpg"];
      form.value = {
        name: "",
        price: 14000,
        tag: "NEW",
        badgeColor: "#ff4d6d",
        description: "",
        details: "100% 핸드메이드 맞춤 뜨개옷으로 인형에 딱 맞게 제작됩니다.",
        isPopular: true,
      };
    }
    activePreviewIndex.value = 0;
  },
  { immediate: true }
);

// 현재 선택된 미리보기 이미지 URL
const currentPreviewImage = computed(() => {
  if (imageList.value.length === 0) return "/images/products/apple.jpg";
  const idx = Math.min(activePreviewIndex.value, imageList.value.length - 1);
  return imageList.value[Math.max(0, idx)];
});

// 파일 선택창 열기
const triggerFileInput = () => {
  if (imageList.value.length >= 5) {
    store.showAlert("상품 사진은 최대 5장까지 등록할 수 있습니다.\n기존 사진을 삭제 후 추가해주세요.", {
      type: "warning",
      title: "사진 개수 초과 (최대 5장)",
    });
    return;
  }
  if (fileInputRef.value) {
    fileInputRef.value.click();
  }
};

// 다중 파일 업로드 & 자동 압축 핸들러
const handleFileUpload = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  const files = target.files;
  if (!files || files.length === 0) return;

  const availableSlots = 5 - imageList.value.length;
  if (availableSlots <= 0) {
    store.showAlert("상품 사진은 최대 5장까지 등록할 수 있습니다.", {
      type: "warning",
      title: "최대 5장 초과",
    });
    target.value = "";
    return;
  }

  const countToProcess = Math.min(files.length, availableSlots);
  store.showToast(`${countToProcess}장의 사진을 최적화 압축 등록 중... 📸`);

  for (let i = 0; i < countToProcess; i++) {
    try {
      const compressedBase64 = await compressImageFile(files[i], 800, 800, 0.75);
      imageList.value.push(compressedBase64);
    } catch (err) {
      console.error("Image compression error:", err);
    }
  }

  target.value = "";
  activePreviewIndex.value = imageList.value.length - 1;
  store.showToast(`사진이 등록되었습니다! (현재 ${imageList.value.length}/5장) ✨`);
};

// URL로 사진 추가
const addImageFromUrl = () => {
  const url = urlInput.value.trim();
  if (!url) {
    store.showAlert("추가할 이미지 URL을 입력해주세요.", { type: "warning" });
    return;
  }
  if (imageList.value.length >= 5) {
    store.showAlert("상품 사진은 최대 5장까지 등록할 수 있습니다.", { type: "warning" });
    return;
  }
  imageList.value.push(url);
  urlInput.value = "";
  activePreviewIndex.value = imageList.value.length - 1;
  store.showToast(`사진이 추가되었습니다! (${imageList.value.length}/5장)`);
};

// 공방 샘플 사진 추가/선택
const selectSampleImage = (url: string) => {
  if (imageList.value.includes(url)) {
    // 이미 있으면 해당 이미지 미리보기로 포커스
    const foundIdx = imageList.value.indexOf(url);
    activePreviewIndex.value = foundIdx;
    store.showToast("해당 사진을 선택했습니다.");
    return;
  }
  if (imageList.value.length >= 5) {
    // 5장이 꽉 차 있으면 현재 활성 인덱스의 사진을 교체
    imageList.value[activePreviewIndex.value] = url;
    store.showToast("현재 선택된 사진을 샘플 사진으로 변경했습니다.");
  } else {
    imageList.value.push(url);
    activePreviewIndex.value = imageList.value.length - 1;
    store.showToast(`샘플 사진이 추가되었습니다! (${imageList.value.length}/5장)`);
  }
};

// 대표 사진(1번째)으로 지정
const setAsMainImage = (index: number) => {
  if (index <= 0 || index >= imageList.value.length) return;
  const [targetItem] = imageList.value.splice(index, 1);
  imageList.value.unshift(targetItem);
  activePreviewIndex.value = 0;
  store.showToast("대표 사진(1번)으로 지정되었습니다! ⭐");
};

// 사진 삭제
const removeImage = (index: number) => {
  if (imageList.value.length <= 1) {
    store.showAlert("상품에는 최소 1장의 대표 사진이 필요합니다.", {
      type: "warning",
      title: "삭제 불가",
    });
    return;
  }
  imageList.value.splice(index, 1);
  if (activePreviewIndex.value >= imageList.value.length) {
    activePreviewIndex.value = Math.max(0, imageList.value.length - 1);
  }
  store.showToast("사진이 삭제되었습니다.");
};

const closeModal = () => {
  emit("update:modelValue", false);
};

// 저장 처리
const handleSave = () => {
  if (!form.value.name.trim()) {
    store.showAlert("상품명을 입력해주세요.", { type: "warning", title: "필수 입력 누락" });
    return;
  }

  if (!form.value.price || form.value.price <= 0) {
    store.showAlert("올바른 상품 판매 가격을 입력해주세요.", { type: "warning", title: "가격 확인" });
    return;
  }

  if (imageList.value.length === 0) {
    store.showAlert("최소 1장의 상품 사진을 등록해주세요.", { type: "warning", title: "사진 필수" });
    return;
  }

  const mainImage = imageList.value[0];
  const finalImages = imageList.value.slice(0, 5);

  if (isEditMode.value && props.product) {
    store.updateProduct(props.product.id, {
      name: form.value.name.trim(),
      price: Number(form.value.price),
      image: mainImage,
      images: finalImages,
      tag: form.value.tag.trim() || "BEST",
      badgeColor: form.value.badgeColor,
      description: form.value.description.trim(),
      details: form.value.details.trim(),
      isPopular: form.value.isPopular,
    });
    emit("saved", props.product.id);
  } else {
    const created = store.addProduct({
      name: form.value.name.trim(),
      price: Number(form.value.price),
      image: mainImage,
      images: finalImages,
      tag: form.value.tag.trim() || "NEW",
      badgeColor: form.value.badgeColor,
      description: form.value.description.trim() || "정성껏 한 땀 한 땀 제작하는 핸드메이드 맞춤 뜨개옷",
      details: form.value.details.trim(),
      isPopular: form.value.isPopular,
    });
    emit("saved", created.id);
  }

  closeModal();
};
</script>

<template>
  <transition name="modal-fade">
    <div v-if="modelValue" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-dialog" role="dialog" aria-modal="true">
        <!-- 모달 헤더 -->
        <div class="modal-header">
          <div class="header-titles">
            <span class="badge-cat font-mono">{{ isEditMode ? 'EDIT PRODUCT' : 'NEW PRODUCT' }}</span>
            <h2 class="modal-title">
              {{ isEditMode ? '✏️ 주문서 상품 및 사진 수정' : '➕ 새 주문서 상품 등록' }}
            </h2>
          </div>
          <button class="btn-close" @click="closeModal" title="닫기">✕</button>
        </div>

        <!-- 모달 바디 (스크롤) -->
        <div class="modal-body">
          <!-- 1. 상품 사진 등록 및 관리 (최대 5장) -->
          <div class="form-section highlight-photo-sec">
            <div class="sec-title-row">
              <span class="sec-icon">📸</span>
              <div class="sec-meta">
                <div class="sec-title-flex">
                  <h3 class="sec-title">상품 사진 관리</h3>
                  <span class="photo-counter-badge font-mono" :class="{ 'full-badge': imageList.length >= 5 }">
                    {{ imageList.length }} / 5장
                  </span>
                </div>
                <span class="sec-sub">
                  최대 5장까지 등록할 수 있으며, <strong>첫 번째 사진이 대표 사진</strong>으로 지정됩니다. 사용자 페이지에서 스와이프하여 감상할 수 있습니다.
                </span>
              </div>
            </div>

            <!-- 메인 미리보기 박스 -->
            <div class="preview-container">
              <div class="product-preview-card">
                <img :src="currentPreviewImage" alt="상품 사진 미리보기" class="preview-img" />
                <span class="preview-badge" :style="{ backgroundColor: form.badgeColor || '#ff4d6d' }">
                  {{ form.tag || 'BEST' }}
                </span>
                <span v-if="activePreviewIndex === 0" class="main-photo-indicator">
                  ⭐ 대표 사진
                </span>
                <span v-else class="sub-photo-indicator">
                  {{ activePreviewIndex + 1 }}번째 사진
                </span>
              </div>
            </div>

            <!-- 등록된 사진 썸네일 리스트 (1~5장) -->
            <div class="photo-thumbnail-grid">
              <div
                v-for="(img, idx) in imageList"
                :key="`thumb-${idx}`"
                class="thumb-item-box"
                :class="{ active: activePreviewIndex === idx, 'is-main': idx === 0 }"
                @click="activePreviewIndex = idx"
              >
                <img :src="img" :alt="`사진 ${idx + 1}`" class="thumb-img" />
                
                <!-- 대표 뱃지 -->
                <span v-if="idx === 0" class="thumb-main-badge">대표</span>
                <span v-else class="thumb-num-badge font-mono">{{ idx + 1 }}</span>

                <!-- 사진 제어 액션들 -->
                <div class="thumb-actions" @click.stop>
                  <!-- 2번째 이상일 때: 대표 지정 버튼 -->
                  <button
                    v-if="idx > 0"
                    type="button"
                    class="btn-thumb-star"
                    title="대표 사진으로 지정"
                    @click="setAsMainImage(idx)"
                  >
                    ⭐
                  </button>
                  <!-- 삭제 버튼 -->
                  <button
                    type="button"
                    class="btn-thumb-del"
                    title="사진 삭제"
                    @click="removeImage(idx)"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <!-- 5장 미만일 때: 추가 버튼 슬롯 -->
              <button
                v-if="imageList.length < 5"
                type="button"
                class="thumb-add-slot"
                @click="triggerFileInput"
                title="사진 추가하기"
              >
                <i class="material-icons">add_photo_alternate</i>
                <span>+ 사진추가</span>
                <span class="slot-count font-mono">{{ imageList.length }}/5</span>
              </button>
            </div>

            <!-- 숨김 파일 인풋 (multiple 지원) -->
            <input
              ref="fileInputRef"
              type="file"
              multiple
              accept="image/*"
              class="hidden-file-input"
              @change="handleFileUpload"
            />

            <!-- 사진 업로드 액션 바 -->
            <div class="photo-btn-row">
              <button
                type="button"
                class="btn-upload-trigger"
                :disabled="imageList.length >= 5"
                @click="triggerFileInput"
              >
                <i class="material-icons">add_a_photo</i>
                <span>파일 앨범 / 사진 선택 (최대 5장)</span>
              </button>
            </div>

            <!-- 이미지 URL 직접 추가 인풋 -->
            <div class="url-input-group">
              <label class="url-lbl">또는 이미지 URL 직접 추가 (최대 5장):</label>
              <div class="url-inp-row">
                <input
                  v-model="urlInput"
                  type="text"
                  placeholder="https://... 또는 /images/products/... 입력"
                  class="form-input font-mono url-inp"
                  @keyup.enter="addImageFromUrl"
                />
                <button
                  type="button"
                  class="btn-add-url"
                  :disabled="imageList.length >= 5"
                  @click="addImageFromUrl"
                >
                  + 추가
                </button>
              </div>
            </div>

            <!-- 공방 기본 샘플 이미지 빠른 선택 칩 -->
            <div class="samples-group">
              <span class="samples-lbl">💡 기본 공방 샘플 사진 빠른 선택:</span>
              <div class="samples-chips">
                <button
                  v-for="sample in defaultSampleImages"
                  :key="sample.name"
                  type="button"
                  class="btn-sample-chip"
                  :class="{ active: imageList.includes(sample.url) }"
                  @click="selectSampleImage(sample.url)"
                >
                  <img :src="sample.url" :alt="sample.name" class="chip-mini-thumb" />
                  <span>{{ sample.name }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- 2. 상품 기본 정보 (상품명, 판매가격) -->
          <div class="form-section">
            <div class="sec-title-row">
              <span class="sec-icon">🏷️</span>
              <h3 class="sec-title">상품 기본 정보</h3>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="input-label">상품명 <span class="req">*</span></label>
                <input
                  v-model="form.name"
                  type="text"
                  class="form-input"
                  placeholder="예: 복숭아 세라(파랑, 분홍) ver."
                />
              </div>

              <div class="form-group">
                <label class="input-label">판매 가격 (원) <span class="req">*</span></label>
                <div class="price-input-wrap">
                  <input
                    v-model.number="form.price"
                    type="number"
                    step="500"
                    min="1000"
                    class="form-input font-mono"
                    placeholder="14000"
                  />
                  <span class="price-won-tag">원</span>
                </div>
              </div>
            </div>

            <!-- 3. 라벨 뱃지 & 색상 선택 -->
            <div class="form-grid-2">
              <div class="form-group">
                <label class="input-label">라벨 뱃지 문구</label>
                <input
                  v-model="form.tag"
                  type="text"
                  maxlength="6"
                  class="form-input"
                  placeholder="예: BEST, HOT, 추천, 인기"
                />
              </div>

              <div class="form-group">
                <label class="input-label">뱃지 색상 선택</label>
                <div class="color-picker-row">
                  <button
                    v-for="c in colorPalette"
                    :key="c.color"
                    type="button"
                    class="color-chip"
                    :class="{ active: form.badgeColor === c.color }"
                    :style="{ backgroundColor: c.color }"
                    :title="c.name"
                    @click="form.badgeColor = c.color"
                  ></button>
                </div>
              </div>
            </div>

            <!-- 4. 한 줄 소개 & 상세 설명 -->
            <div class="form-group">
              <label class="input-label">상품 한 줄 소개</label>
              <input
                v-model="form.description"
                type="text"
                class="form-input"
                placeholder="예: 은은한 베이비 핑크빛 복숭아 모양 보닛과 앙증맞은 잎사귀 장식"
              />
            </div>

            <div class="form-group">
              <label class="input-label">상품 상세 설명 (제작 안내, 핏 설명)</label>
              <textarea
                v-model="form.details"
                rows="3"
                class="form-textarea"
                placeholder="인형 착용감, 색상 구성, 세탁 시 주의사항 등 고객에게 보여줄 상세 정보"
              ></textarea>
            </div>

            <!-- 인기 추천 상품 등록 여부 토글 -->
            <div class="toggle-row">
              <label class="toggle-label">
                <input v-model="form.isPopular" type="checkbox" class="toggle-checkbox" />
                <span class="toggle-text">✨ 메인 홈 추천 인기 상품으로 노출</span>
              </label>
            </div>
          </div>
        </div>

        <!-- 모달 푸터 버튼 바 -->
        <div class="modal-footer">
          <button type="button" class="btn-cancel" @click="closeModal">취소</button>
          <button type="button" class="btn-save" @click="handleSave">
            <i class="material-icons">check_circle</i>
            <span>{{ isEditMode ? '수정 내용 저장' : '새 상품 등록 완료' }}</span>
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
/* 모달 레이아웃 */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(43, 31, 29, 0.65);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal-dialog {
  background: #ffffff;
  border-radius: 24px;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 48px rgba(43, 31, 29, 0.25);
  border: 1.5px solid #ebdcd0;
  animation: modalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalPop {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1.5px solid #ebdcd0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fdfbf7;
}

.badge-cat {
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: #ff4d6d;
  background: #fff0f3;
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid #ffccd5;
}

.modal-title {
  font-size: 1.15rem;
  font-weight: 900;
  color: #2b1f1d;
  margin: 4px 0 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #8c7875;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.btn-close:hover {
  background: #f2ebe5;
  color: #2b1f1d;
}

/* 바디 스크롤 */
.modal-body {
  padding: 16px 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #ffffff;
}

.form-section {
  background: #fdfbf7;
  border: 1.5px solid #ebdcd0;
  border-radius: 18px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.highlight-photo-sec {
  background: #fffafa;
  border-color: #ffd6de;
}

.sec-title-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.sec-icon {
  font-size: 1.15rem;
}

.sec-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.sec-title-flex {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sec-title {
  font-size: 0.98rem;
  font-weight: 800;
  color: #4a3431;
  margin: 0;
}

.photo-counter-badge {
  font-size: 0.74rem;
  font-weight: 800;
  background: #ffe3e8;
  color: #c9184a;
  padding: 2px 8px;
  border-radius: 10px;
  border: 1px solid #ffccd5;
}

.photo-counter-badge.full-badge {
  background: #fee2e2;
  color: #ef4444;
  border-color: #fca5a5;
}

.sec-sub {
  font-size: 0.74rem;
  color: #8c7875;
  line-height: 1.35;
}

/* 메인 미리보기 박스 */
.preview-container {
  display: flex;
  justify-content: center;
  margin: 2px 0;
}

.product-preview-card {
  position: relative;
  width: 140px;
  height: 140px;
  border-radius: 16px;
  border: 2px solid #ffccd5;
  overflow: hidden;
  background: #f8f6f4;
  box-shadow: 0 4px 14px rgba(43, 31, 29, 0.1);
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  color: #ffffff;
  font-size: 0.68rem;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.main-photo-indicator {
  position: absolute;
  bottom: 6px;
  left: 6px;
  right: 6px;
  background: rgba(255, 77, 109, 0.92);
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: 800;
  text-align: center;
  padding: 3px 0;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.sub-photo-indicator {
  position: absolute;
  bottom: 6px;
  left: 6px;
  right: 6px;
  background: rgba(43, 31, 29, 0.82);
  color: #ffffff;
  font-size: 0.68rem;
  font-weight: 700;
  text-align: center;
  padding: 3px 0;
  border-radius: 6px;
}

/* 썸네일 그리드 (최대 5장 + 추가 버튼) */
.photo-thumbnail-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin: 4px 0;
}

.thumb-item-box {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  border: 2px solid #ebdcd0;
  overflow: hidden;
  cursor: pointer;
  background: #ffffff;
  transition: all 0.15s;
}

.thumb-item-box.active {
  border-color: #ff4d6d;
  box-shadow: 0 0 0 2px rgba(255, 77, 109, 0.3);
  transform: scale(1.02);
}

.thumb-item-box.is-main {
  border-color: #f59e0b;
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-main-badge {
  position: absolute;
  top: 3px;
  left: 3px;
  background: #f59e0b;
  color: #ffffff;
  font-size: 0.58rem;
  font-weight: 900;
  padding: 1px 4px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.thumb-num-badge {
  position: absolute;
  top: 3px;
  left: 3px;
  background: rgba(43, 31, 29, 0.7);
  color: #ffffff;
  font-size: 0.6rem;
  font-weight: 800;
  width: 16px;
  height: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumb-actions {
  position: absolute;
  bottom: 2px;
  right: 2px;
  display: flex;
  gap: 2px;
}

.btn-thumb-star {
  background: rgba(245, 158, 11, 0.9);
  color: #ffffff;
  border: none;
  font-size: 0.62rem;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.btn-thumb-del {
  background: rgba(239, 68, 68, 0.9);
  color: #ffffff;
  border: none;
  font-size: 0.62rem;
  font-weight: 900;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.thumb-add-slot {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  border: 2px dashed #ffccd5;
  background: #fff8f9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  color: #ff4d6d;
  font-size: 0.64rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.15s;
  padding: 2px;
}

.thumb-add-slot .material-icons {
  font-size: 20px;
}

.thumb-add-slot:hover {
  background: #ffeef2;
  border-color: #ff4d6d;
}

.slot-count {
  font-size: 0.6rem;
  color: #9c8a87;
}

.hidden-file-input {
  display: none;
}

.photo-btn-row {
  display: flex;
  gap: 8px;
}

.btn-upload-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #ff4d6d;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 0.84rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(255, 77, 109, 0.25);
  transition: all 0.15s;
}

.btn-upload-trigger:hover:not(:disabled) {
  background: #e63956;
  transform: translateY(-1px);
}

.btn-upload-trigger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.url-input-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.url-lbl {
  font-size: 0.74rem;
  font-weight: 700;
  color: #8c7875;
}

.url-inp-row {
  display: flex;
  gap: 6px;
}

.url-inp {
  flex: 1;
  font-size: 0.78rem;
  padding: 8px 10px;
}

.btn-add-url {
  background: #5c4e4b;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 0 14px;
  font-size: 0.78rem;
  font-weight: 800;
  cursor: pointer;
}

.btn-add-url:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 샘플 사진 칩 */
.samples-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.samples-lbl {
  font-size: 0.74rem;
  font-weight: 700;
  color: #8c7875;
}

.samples-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.btn-sample-chip {
  display: flex;
  align-items: center;
  gap: 5px;
  background: #ffffff;
  border: 1px solid #ebdcd0;
  border-radius: 20px;
  padding: 3px 8px;
  font-size: 0.72rem;
  font-weight: 700;
  color: #5c4e4b;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-sample-chip:hover {
  border-color: #ff758f;
  background: #fff8f9;
}

.btn-sample-chip.active {
  background: #ff4d6d;
  color: #ffffff;
  border-color: #ff4d6d;
}

.chip-mini-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  object-fit: cover;
}

/* 기본 정보 폼 그리드 */
.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.input-label {
  font-size: 0.78rem;
  font-weight: 800;
  color: #4a3431;
}

.req {
  color: #ff4d6d;
}

.form-input,
.form-textarea {
  width: 100%;
  background: #ffffff;
  border: 1.5px solid #ebdcd0;
  border-radius: 12px;
  padding: 8px 12px;
  font-size: 0.84rem;
  color: #2b1f1d;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.15s;
}

.form-input:focus,
.form-textarea:focus {
  border-color: #ff4d6d;
  box-shadow: 0 0 0 3px rgba(255, 77, 109, 0.15);
}

.price-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.price-won-tag {
  position: absolute;
  right: 12px;
  font-size: 0.8rem;
  font-weight: 800;
  color: #8c7875;
}

.color-picker-row {
  display: flex;
  gap: 6px;
  align-items: center;
  padding-top: 4px;
  flex-wrap: wrap;
}

.color-chip {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #ffffff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: transform 0.15s;
}

.color-chip.active {
  transform: scale(1.2);
  outline: 2px solid #4a3431;
}

.toggle-row {
  display: flex;
  align-items: center;
  padding-top: 4px;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #4a3431;
  cursor: pointer;
}

.toggle-checkbox {
  width: 18px;
  height: 18px;
  accent-color: #ff4d6d;
  cursor: pointer;
}

/* 모달 푸터 */
.modal-footer {
  padding: 14px 20px;
  border-top: 1.5px solid #ebdcd0;
  display: flex;
  gap: 10px;
  background: #fdfbf7;
}

.btn-cancel {
  flex: 1;
  background: #ffffff;
  border: 1.5px solid #ebdcd0;
  border-radius: 14px;
  padding: 12px;
  font-size: 0.88rem;
  font-weight: 700;
  color: #6b5c58;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-cancel:hover {
  background: #f5ede6;
}

.btn-save {
  flex: 2;
  background: #ff4d6d;
  border: none;
  border-radius: 14px;
  padding: 12px;
  font-size: 0.9rem;
  font-weight: 900;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(255, 77, 109, 0.3);
  transition: all 0.15s;
}

.btn-save:hover {
  background: #e63956;
  transform: translateY(-1px);
}

@media (max-width: 480px) {
  .photo-thumbnail-grid {
    grid-template-columns: repeat(5, 1fr);
    gap: 4px;
  }
  .form-grid-2 {
    grid-template-columns: 1fr;
  }
}
</style>
