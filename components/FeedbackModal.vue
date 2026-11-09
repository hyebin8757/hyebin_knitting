<script setup lang="ts">
import { ref } from "vue";
import { useKnittingStore } from "~/stores/useKnittingStore";

const store = useKnittingStore();

const form = ref({
  type: "상품문의" as "상품문의" | "커스텀제작" | "배송문의" | "건의사항" | "기타",
  name: "",
  contact: "",
  content: "",
});

const isSubmitting = ref(false);
const isSuccess = ref(false);

const typeOptions = [
  { value: "상품문의", label: "🧶 상품 문의", desc: "뜨개옷 실물, 호환 인형, 색상 등" },
  { value: "커스텀제작", label: "✨ 커스텀 제작 의뢰", desc: "다른 인형 사이즈, 새로운 디자인 의뢰" },
  { value: "배송문의", label: "📦 배송/주문 문의", desc: "출고 일정, 반값택배 점포 변경 등" },
  { value: "건의사항", label: "💡 사이트 건의사항", desc: "홈페이지 기능 개선, 추가 희망 디자인" },
  { value: "기타", label: "💬 기타 의견", desc: "따뜻한 응원의 한마디, 기타 질문" },
];

const closeModal = () => {
  store.isFeedbackModalOpen = false;
  setTimeout(() => {
    isSuccess.value = false;
    form.value = {
      type: "상품문의",
      name: "",
      contact: "",
      content: "",
    };
  }, 200);
};

const submitInquiry = async () => {
  if (!form.value.name.trim()) {
    store.showAlert("이름 또는 닉네임을 입력해 주세요.", { type: "warning", title: "입력 확인" });
    return;
  }
  if (!form.value.contact.trim()) {
    store.showAlert("답변을 받으실 연락처(전화번호 또는 인스타 ID)를 입력해 주세요.", { type: "warning", title: "입력 확인" });
    return;
  }
  if (!form.value.content.trim()) {
    store.showAlert("의견 또는 문의 내용을 작성해 주세요.", { type: "warning", title: "입력 확인" });
    return;
  }

  isSubmitting.value = true;
  try {
    store.createInquiry({
      type: form.value.type,
      name: form.value.name.trim(),
      contact: form.value.contact.trim(),
      content: form.value.content.trim(),
    });
    isSuccess.value = true;
  } catch (e) {
    store.showAlert("전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.", { type: "error" });
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div v-if="store.isFeedbackModalOpen" class="modal-backdrop" @click.self="closeModal">
    <div class="modal-card">
      <!-- 헤더 -->
      <div class="modal-header">
        <div class="title-wrap">
          <span class="icon-bubble">💌</span>
          <div>
            <h3 class="modal-title">의견 & 문의 보내기</h3>
            <p class="modal-subtitle">궁금한 점이나 건의사항을 남겨주시면 빠르게 확인해 드려요!</p>
          </div>
        </div>
        <button class="close-btn" @click="closeModal" aria-label="닫기">
          <i class="material-icons">close</i>
        </button>
      </div>

      <!-- 전송 성공 화면 -->
      <div v-if="isSuccess" class="success-screen">
        <div class="success-icon">🎉</div>
        <h4 class="success-title">소중한 의견이 전달되었습니다!</h4>
        <p class="success-desc">
          남겨주신 내용은 관리자에게 알림으로 즉시 전달되었습니다.<br />
          답변이 필요한 문의는 남겨주신 연락처로 정성껏 안내해 드릴게요.
        </p>
        <button class="btn-primary" @click="closeModal">확인</button>
      </div>

      <!-- 작성 폼 -->
      <form v-else class="modal-body" @submit.prevent="submitInquiry">
        <!-- 문의 유형 선택 -->
        <div class="form-group">
          <label class="form-label">문의 / 의견 유형 <span class="req">*</span></label>
          <div class="type-chips">
            <button
              v-for="opt in typeOptions"
              :key="opt.value"
              type="button"
              class="type-chip"
              :class="{ active: form.type === opt.value }"
              @click="form.type = opt.value"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>

        <!-- 성함 / 닉네임 -->
        <div class="form-group">
          <label class="form-label" for="fb-name">성함 또는 닉네임 <span class="req">*</span></label>
          <input
            id="fb-name"
            v-model="form.name"
            type="text"
            class="form-input"
            placeholder="예: 김민서 / 솜뭉치맘"
            required
          />
        </div>

        <!-- 연락처 / 인스타 ID -->
        <div class="form-group">
          <label class="form-label" for="fb-contact">연락처 또는 인스타 ID <span class="req">*</span></label>
          <input
            id="fb-contact"
            v-model="form.contact"
            type="text"
            class="form-input"
            placeholder="예: 010-1234-5678 또는 @instagram_id"
            required
          />
          <p class="input-tip">답변 알림을 받으실 연락처나 인스타 DM 아이디를 적어주세요.</p>
        </div>

        <!-- 내용 -->
        <div class="form-group">
          <label class="form-label" for="fb-content">의견 및 문의 내용 <span class="req">*</span></label>
          <textarea
            id="fb-content"
            v-model="form.content"
            rows="4"
            class="form-textarea"
            placeholder="인형 종류(사이즈), 원하시는 디자인, 개선 사항 등을 자유롭게 적어주세요 :)"
            required
          ></textarea>
        </div>

        <!-- 안내 문구 -->
        <div class="notice-box">
          <i class="material-icons notice-icon">info</i>
          <span>작성 즉시 관리자에게 모바일 알림이 전송됩니다.</span>
        </div>

        <!-- 버튼 영역 -->
        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="closeModal">취소</button>
          <button type="submit" class="btn-submit" :disabled="isSubmitting">
            <span v-if="isSubmitting">전송 중...</span>
            <span v-else>전송하기 ✨</span>
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
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f5f0ec;
  color: #333;
}

.modal-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
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

.type-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.type-chip {
  background: #f7f3ee;
  border: 1px solid #e8ded4;
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 0.82rem;
  font-weight: 500;
  color: #5c4e4b;
  cursor: pointer;
  transition: all 0.2s;
}

.type-chip:hover {
  background: #f0e6db;
}

.type-chip.active {
  background: #ff758f;
  color: #ffffff;
  border-color: #ff758f;
  box-shadow: 0 2px 8px rgba(255, 117, 143, 0.35);
}

.form-input,
.form-textarea {
  width: 100%;
  border: 1.5px solid #e8ded4;
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 0.92rem;
  color: #2b1f1d;
  background: #fdfcfb;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
}

.form-input:focus,
.form-textarea:focus {
  border-color: #ff758f;
  box-shadow: 0 0 0 3px rgba(255, 117, 143, 0.15);
  background: #ffffff;
}

.input-tip {
  font-size: 0.78rem;
  color: #8c7e7b;
  margin: 2px 0 0;
}

.notice-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff5f6;
  border: 1px solid #ffd3db;
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 0.82rem;
  color: #c9184a;
}

.notice-icon {
  font-size: 18px;
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
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #ede6dd;
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
  transition: all 0.2s;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(255, 77, 109, 0.4);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.success-screen {
  padding: 40px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.success-icon {
  font-size: 3rem;
  animation: bounce 0.6s infinite alternate;
}

@keyframes bounce {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-8px);
  }
}

.success-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2b1f1d;
  margin: 0;
}

.success-desc {
  font-size: 0.88rem;
  color: #6b5c58;
  line-height: 1.5;
  margin: 0 0 12px;
}

.btn-primary {
  padding: 12px 32px;
  border: none;
  background: #ff758f;
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 700;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(255, 117, 143, 0.3);
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
