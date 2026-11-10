<script setup lang="ts">
import { ref } from "vue";
import { useKnittingStore } from "~/stores/useKnittingStore";

const store = useKnittingStore();

const form = ref({
  author: "",
  rating: 5,
  productName: "사과",
  content: "",
  image: "",
});

const isSubmitting = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

const closeModal = () => {
  store.isReviewWriteModalOpen = false;
  form.value = {
    author: "",
    rating: 5,
    productName: "사과",
    content: "",
    image: "",
  };
};

const handleFileUpload = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      form.value.image = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const removeImage = () => {
  form.value.image = "";
  if (fileInputRef.value) {
    fileInputRef.value.value = "";
  }
};

const submitReview = () => {
  if (!form.value.author.trim()) {
    store.showAlert("닉네임 또는 인스타그램 아이디를 입력해주세요.", { type: "warning", title: "입력 확인" });
    return;
  }
  if (!form.value.content.trim()) {
    store.showAlert("정성스러운 리뷰 내용을 작성해주세요.", { type: "warning", title: "입력 확인" });
    return;
  }

  isSubmitting.value = true;
  store.createReview({
    author: form.value.author.trim(),
    rating: form.value.rating,
    productName: form.value.productName,
    content: form.value.content.trim(),
    image: form.value.image || undefined,
  });

  store.showAlert("소중한 리뷰가 등록되었습니다! 감사합니다 ❤️", {
    title: "리뷰 등록 완료",
    type: "success",
  });
  isSubmitting.value = false;
  closeModal();
};
</script>

<template>
  <div v-if="store.isReviewWriteModalOpen" class="modal-backdrop" @click.self="closeModal">
    <div class="modal-card">
      <div class="modal-header">
        <div class="title-wrap">
          <span class="icon-bubble">⭐</span>
          <div>
            <h3 class="modal-title">뜨개옷 후기 남기기</h3>
            <p class="modal-subtitle">인형에게 입힌 예쁜 사진과 소감을 들려주세요!</p>
          </div>
        </div>
        <button class="close-btn" @click="closeModal" aria-label="닫기">
          <i class="material-icons">close</i>
        </button>
      </div>

      <form class="modal-body" @submit.prevent="submitReview">
        <!-- 별점 선택 -->
        <div class="form-group star-rating-group">
          <label class="form-label">만족도 별점</label>
          <div class="stars-row">
            <button
              v-for="star in 5"
              :key="star"
              type="button"
              class="star-btn"
              :class="{ filled: star <= form.rating }"
              @click="form.rating = star"
            >
              ★
            </button>
            <span class="rating-text">{{ form.rating }}점 ({{ form.rating === 5 ? '최고예요! 💕' : form.rating >= 4 ? '좋아요! 👍' : '보통이에요' }})</span>
          </div>
        </div>

        <!-- 구매 상품 선택 -->
        <div class="form-group">
          <label class="form-label">구매하신 뜨개옷 <span class="req">*</span></label>
          <select v-model="form.productName" class="form-select">
            <option v-for="p in store.products" :key="p.id" :value="p.name">
              {{ p.name }} ({{ p.price.toLocaleString() }}원)
            </option>
            <option value="기타/세트구매">기타 / 세트 구매</option>
          </select>
        </div>

        <!-- 닉네임 / 인스타 ID -->
        <div class="form-group">
          <label class="form-label" for="rev-author">작성자 닉네임 / 인스타 ID <span class="req">*</span></label>
          <input
            id="rev-author"
            v-model="form.author"
            type="text"
            class="form-input"
            placeholder="예: 솜뭉치맘 (@som_doll)"
            required
          />
        </div>

        <!-- 후기 내용 -->
        <div class="form-group">
          <label class="form-label" for="rev-content">후기 내용 <span class="req">*</span></label>
          <textarea
            id="rev-content"
            v-model="form.content"
            rows="4"
            class="form-textarea"
            placeholder="뜨개옷의 핏, 마감 퀄리티, 인형에 입혔을 때 느낌 등을 솔직하게 적어주세요 :)"
            required
          ></textarea>
        </div>

        <!-- 사진 첨부 -->
        <div class="form-group">
          <label class="form-label">착용 사진 첨부 (선택)</label>
          <div v-if="!form.image" class="upload-dropzone" @click="fileInputRef?.click()">
            <i class="material-icons upload-icon">add_photo_alternate</i>
            <span class="upload-text">인형 착용샷 사진 추가하기</span>
            <span class="upload-sub">JPG, PNG 파일 지원</span>
          </div>
          <div v-else class="preview-wrap">
            <img :src="form.image" alt="착용샷 미리보기" class="image-preview" />
            <button type="button" class="btn-remove-img" @click="removeImage">
              <i class="material-icons">delete</i> 사진 삭제
            </button>
          </div>
          <input
            ref="fileInputRef"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleFileUpload"
          />
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="closeModal">취소</button>
          <button type="submit" class="btn-submit" :disabled="isSubmitting">
            <i class="material-icons" style="font-size: 1.05rem; vertical-align: middle; margin-right: 4px;">rate_review</i>
            <span>리뷰 등록하기</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
}

.modal-card {
  background: #ffffff;
  border-radius: 24px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(78, 42, 50, 0.2);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f0eae1;
}

.title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-bubble {
  font-size: 1.8rem;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2b1f1d;
  margin: 0;
}

.modal-subtitle {
  font-size: 0.82rem;
  color: #8c7e7b;
  margin: 2px 0 0;
}

.close-btn {
  background: none;
  border: none;
  color: #9c8e8b;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 0.88rem;
  font-weight: 600;
  color: #3d2f2d;
}

.req {
  color: #ff4d6d;
}

.stars-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.star-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: #e5e7eb;
  cursor: pointer;
  line-height: 1;
  transition: transform 0.15s, color 0.15s;
}

.star-btn:hover {
  transform: scale(1.15);
}

.star-btn.filled {
  color: #f59e0b;
}

.rating-text {
  font-size: 0.88rem;
  font-weight: 700;
  color: #d97706;
  margin-left: 8px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  border: 1.5px solid #e8ded4;
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 0.92rem;
  color: #2b1f1d;
  background: #fdfcfb;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: #ff758f;
  box-shadow: 0 0 0 3px rgba(255, 117, 143, 0.15);
}

.upload-dropzone {
  border: 2px dashed #e8ded4;
  border-radius: 14px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  background: #fdfcfb;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.upload-dropzone:hover {
  border-color: #ff758f;
  background: #fff8f9;
}

.upload-icon {
  font-size: 32px;
  color: #ff758f;
}

.upload-text {
  font-size: 0.88rem;
  font-weight: 700;
  color: #4b3e3b;
}

.upload-sub {
  font-size: 0.76rem;
  color: #9c8e8b;
}

.preview-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.image-preview {
  width: 90px;
  height: 90px;
  border-radius: 12px;
  object-fit: cover;
  border: 1px solid #ebdcd0;
}

.btn-remove-img {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #fee2e2;
  color: #ef4444;
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.btn-cancel {
  flex: 1;
  padding: 12px;
  border: 1px solid #e0d4c8;
  background: #f7f3ee;
  color: #6c5e5b;
  font-size: 0.92rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
}

.btn-submit {
  flex: 2;
  padding: 12px;
  border: none;
  background: linear-gradient(135deg, #ff758f 0%, #ff4d6d 100%);
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 700;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(255, 77, 109, 0.3);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-1px);
}

@media (max-width: 640px) {
  .modal-backdrop {
    align-items: flex-end;
    padding: 0;
  }
  .modal-card {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    max-height: 85vh;
  }
}
</style>
