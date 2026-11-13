<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useKnittingStore, SHIPPING_OPTIONS, type OrderItem, type OrderItemEntry } from "~/stores/useKnittingStore";
import { compressImageFile } from "~/utils/imageCompress";

const props = defineProps<{
  modelValue: boolean;
  order: OrderItem | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "saved", orderId: string): void;
}>();

const store = useKnittingStore();
const fileInputRef = ref<HTMLInputElement | null>(null);

// 편집 폼 상태
const form = ref({
  buyerName: "",
  instagramId: "",
  phone: "",
  depositorName: "",
  address: "",
  status: "pending" as OrderItem["status"],
  trackingNumber: "",
  shippingId: "normal",
  shippingType: "일반 택배 (CJ대한통운/한진)",
  shippingCost: 4000,
  memo: "",
  adminNotes: "",
  customImage: "",
  items: [] as OrderItemEntry[],
});

// 추가할 상품 선택
const selectedAddProductId = ref("");

// order prop이 변경될 때 폼 초기화
watch(
  () => props.order,
  (newOrder) => {
    if (newOrder) {
      form.value = {
        buyerName: newOrder.buyerName || "",
        instagramId: newOrder.instagramId || "",
        phone: newOrder.phone || "",
        depositorName: newOrder.depositorName || newOrder.buyerName || "",
        address: newOrder.address || "",
        status: newOrder.status || "pending",
        trackingNumber: newOrder.trackingNumber || "",
        shippingId: newOrder.shippingId || "normal",
        shippingType: newOrder.shippingType || "일반 택배",
        shippingCost: newOrder.shippingCost ?? 4000,
        memo: newOrder.memo || "",
        adminNotes: newOrder.adminNotes || "",
        customImage: newOrder.customImage || "",
        items: newOrder.items ? JSON.parse(JSON.stringify(newOrder.items)) : [],
      };
    }
  },
  { immediate: true }
);

// 실시간 계산
const calculatedProductAmount = computed(() => {
  return form.value.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

const calculatedTotalAmount = computed(() => {
  return calculatedProductAmount.value + Number(form.value.shippingCost || 0);
});

// 배송 방식 변경 처리
const handleShippingChange = (e: Event) => {
  const target = e.target as HTMLSelectElement;
  const opt = SHIPPING_OPTIONS.find((s) => s.id === target.value);
  if (opt) {
    form.value.shippingId = opt.id;
    form.value.shippingType = opt.name;
    form.value.shippingCost = opt.cost;
  }
};

// 수량 증가/감소
const updateItemQty = (index: number, delta: number) => {
  const item = form.value.items[index];
  if (!item) return;
  const newQty = item.quantity + delta;
  if (newQty <= 0) {
    removeItem(index);
  } else {
    item.quantity = newQty;
  }
};

// 상품 삭제
const removeItem = (index: number) => {
  form.value.items.splice(index, 1);
};

// 새 상품 추가
const addItemToOrder = () => {
  if (!selectedAddProductId.value) return;
  const prod = store.products.find((p) => p.id === selectedAddProductId.value);
  if (!prod) return;

  const existing = form.value.items.find((i) => i.productId === prod.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    form.value.items.push({
      productId: prod.id,
      productName: prod.name,
      price: prod.price,
      quantity: 1,
      image: prod.image,
    });
  }
  selectedAddProductId.value = "";
  store.showToast(`'${prod.name}' 상품이 추가되었습니다.`);
};

// 모바일/PC 사진 파일 업로드 (Base64 변환)
const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click();
  }
};

const handleFileUpload = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  try {
    const compressedBase64 = await compressImageFile(file, 800, 800, 0.75);
    form.value.customImage = compressedBase64;
    store.showToast("사진이 최적화되어 안전하게 첨부되었습니다! 📸");
  } catch (err) {
    store.showAlert("이미지 최적화 처리 중 오류가 발생했습니다.", {
      type: "error",
      title: "업로드 오류",
    });
  }
};

// 사진 제거
const removeCustomImage = () => {
  form.value.customImage = "";
  if (fileInputRef.value) {
    fileInputRef.value.value = "";
  }
  store.showToast("첨부 사진이 삭제되었습니다.");
};

// 모달 닫기
const closeModal = () => {
  emit("update:modelValue", false);
};

// 저장 처리
const handleSave = () => {
  if (!props.order) return;

  if (!form.value.buyerName.trim()) {
    store.showAlert("주문자 성함을 입력해주세요.", { type: "warning", title: "필수 입력 누락" });
    return;
  }

  if (!form.value.phone.trim()) {
    store.showAlert("연락처를 입력해주세요.", { type: "warning", title: "필수 입력 누락" });
    return;
  }

  if (form.value.items.length === 0) {
    store.showAlert("최소 1개 이상의 주문 상품이 포함되어야 합니다.", { type: "warning", title: "상품 구성 확인" });
    return;
  }

  const success = store.updateOrderDetails(props.order.id, {
    buyerName: form.value.buyerName.trim(),
    instagramId: form.value.instagramId.trim(),
    phone: form.value.phone.trim(),
    depositorName: form.value.depositorName.trim() || form.value.buyerName.trim(),
    address: form.value.address.trim(),
    status: form.value.status,
    trackingNumber: form.value.trackingNumber.trim(),
    shippingId: form.value.shippingId,
    shippingType: form.value.shippingType,
    shippingCost: Number(form.value.shippingCost),
    memo: form.value.memo.trim(),
    adminNotes: form.value.adminNotes.trim(),
    customImage: form.value.customImage.trim(),
    items: form.value.items,
  });

  if (success) {
    emit("saved", props.order.id);
    closeModal();
  }
};
</script>

<template>
  <transition name="modal-fade">
    <div v-if="modelValue && order" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-dialog" role="dialog" aria-modal="true">
        <!-- 모달 헤더 -->
        <div class="modal-header">
          <div class="header-titles">
            <span class="badge-edit font-mono">ORDER #{{ order.id }}</span>
            <h2 class="modal-title">✏️ 주문서 및 사진 수정</h2>
          </div>
          <button class="btn-close" @click="closeModal" title="닫기">✕</button>
        </div>

        <!-- 모달 본문 (스크롤) -->
        <div class="modal-body">
          <!-- 1. 📸 맞춤 사진 등록 및 수정 섹션 -->
          <div class="form-section highlight-photo-sec">
            <div class="sec-title-row">
              <span class="sec-icon">📸</span>
              <div class="sec-meta">
                <h3 class="sec-title">맞춤제작 / 주문 첨부 사진</h3>
                <span class="sec-sub">고객 맞춤 도안, 요청 사진 또는 완성된 뜨개옷 확인 사진을 등록·수정합니다.</span>
              </div>
            </div>

            <!-- 사진 미리보기 박스 -->
            <div class="photo-preview-wrap">
              <div v-if="form.customImage" class="photo-preview-box">
                <img :src="form.customImage" alt="첨부 사진 미리보기" class="preview-img" />
                <button type="button" class="btn-remove-photo" @click="removeCustomImage" title="사진 삭제">
                  <i class="material-icons btn-del-icon">delete</i>
                  <span>사진 삭제</span>
                </button>
              </div>

              <div v-else class="photo-empty-placeholder" @click="triggerFileInput">
                <span class="empty-cam-icon">📷</span>
                <span class="empty-txt">등록된 사진이 없습니다.</span>
                <span class="empty-sub">클릭하여 스마트폰 앨범 또는 PC에서 사진을 선택하세요.</span>
              </div>
            </div>

            <!-- 파일 업로드 컨트롤 -->
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              class="hidden-file-input"
              @change="handleFileUpload"
            />

            <div class="photo-btn-row">
              <button type="button" class="btn-upload-trigger" @click="triggerFileInput">
                <i class="material-icons">add_photo_alternate</i>
                <span>사진 파일 / 앨범에서 선택</span>
              </button>
            </div>

            <!-- 직접 이미지 URL 입력 옵션 -->
            <div class="url-input-group">
              <label class="url-lbl">또는 이미지 URL 직접 입력:</label>
              <input
                v-model="form.customImage"
                type="text"
                placeholder="https://... 또는 data:image/... 형식"
                class="form-input font-mono url-inp"
              />
            </div>
          </div>

          <!-- 2. 👤 주문자 기본 정보 섹션 -->
          <div class="form-section">
            <div class="sec-title-row">
              <span class="sec-icon">👤</span>
              <h3 class="sec-title">주문자 기본 정보</h3>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="input-label">주문자 성함 <span class="req">*</span></label>
                <input v-model="form.buyerName" type="text" class="form-input" placeholder="홍길동" />
              </div>

              <div class="form-group">
                <label class="input-label">연락처 <span class="req">*</span></label>
                <input v-model="form.phone" type="text" class="form-input font-mono" placeholder="010-1234-5678" />
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="input-label">인스타그램 ID</label>
                <div class="prefix-input-wrap">
                  <span class="prefix">@</span>
                  <input v-model="form.instagramId" type="text" class="form-input has-prefix" placeholder="nui_closet" />
                </div>
              </div>

              <div class="form-group">
                <label class="input-label">입금자명</label>
                <input v-model="form.depositorName" type="text" class="form-input" placeholder="실제 입금자명" />
              </div>
            </div>

            <div class="form-group">
              <label class="input-label">배송지 주소 <span class="req">*</span></label>
              <textarea
                v-model="form.address"
                rows="2"
                class="form-textarea"
                placeholder="도로명 주소 및 동호수 (반택 시 편의점 지점명 필수)"
              ></textarea>
            </div>
          </div>

          <!-- 3. 🚚 주문 상태 및 운송장 정보 -->
          <div class="form-section">
            <div class="sec-title-row">
              <span class="sec-icon">🚚</span>
              <h3 class="sec-title">주문 진행 상태 & 배송 정보</h3>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="input-label">주문 진행 상태</label>
                <select v-model="form.status" class="form-select status-select">
                  <option value="pending">⏳ 입금 대기 (pending)</option>
                  <option value="paid">💳 입금 확인 (paid)</option>
                  <option value="making">🧶 제작 시작/진행 중 (making)</option>
                  <option value="shipping">🚚 배송 출발/배송 중 (shipping)</option>
                  <option value="completed">✨ 배송 완료 (completed)</option>
                  <option value="cancelled">❌ 주문 취소 (cancelled)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="input-label">운송장 번호</label>
                <input
                  v-model="form.trackingNumber"
                  type="text"
                  class="form-input font-mono"
                  placeholder="예: 682910398210"
                />
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="input-label">배송 방식</label>
                <select :value="form.shippingId" class="form-select" @change="handleShippingChange">
                  <option v-for="s in SHIPPING_OPTIONS" :key="s.id" :value="s.id">
                    {{ s.name }} (+{{ s.cost.toLocaleString() }}원)
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label class="input-label">배송비 (원)</label>
                <input
                  v-model.number="form.shippingCost"
                  type="number"
                  step="500"
                  class="form-input font-mono"
                  placeholder="4000"
                />
              </div>
            </div>
          </div>

          <!-- 4. 🧶 주문 상품 구성 및 수량 수정 -->
          <div class="form-section">
            <div class="sec-title-row">
              <span class="sec-icon">🧶</span>
              <div class="sec-meta">
                <h3 class="sec-title">주문 상품 구성 및 수량</h3>
                <span class="sec-sub">수량을 조정하거나 새로운 상품을 추가할 수 있습니다.</span>
              </div>
            </div>

            <!-- 현재 주문 상품 목록 (모바일에서도 상품명/단가 깨짐 없는 카드형 레이아웃) -->
            <div class="edit-items-list">
              <div v-for="(item, idx) in form.items" :key="item.productId" class="edit-item-card">
                <!-- 1행: 썸네일, 상품명, 삭제 버튼 -->
                <div class="item-card-top">
                  <img :src="item.image" :alt="item.productName" class="edit-item-img" />
                  <div class="item-name-box">
                    <span class="item-name font-bold">{{ item.productName }}</span>
                    <span class="item-unit-price font-mono">개당 {{ item.price.toLocaleString() }}원</span>
                  </div>
                  <button
                    type="button"
                    class="btn-delete-item"
                    @click="removeItem(idx)"
                    title="상품 삭제"
                  >
                    ✕
                  </button>
                </div>

                <!-- 2행: 수량 조절 버튼 & 소계 금액 -->
                <div class="item-card-bottom">
                  <div class="edit-qty-ctrl">
                    <button type="button" class="btn-qty" @click="updateItemQty(idx, -1)" aria-label="수량 감소">−</button>
                    <span class="qty-count font-mono font-bold">{{ item.quantity }}</span>
                    <button type="button" class="btn-qty" @click="updateItemQty(idx, 1)" aria-label="수량 증가">+</button>
                  </div>

                  <div class="edit-item-subtotal-wrap">
                    <span class="subtotal-label">합계</span>
                    <span class="edit-item-subtotal font-mono font-bold">
                      {{ (item.price * item.quantity).toLocaleString() }}원
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 상품 추가 콤보 -->
            <div class="add-item-box">
              <select v-model="selectedAddProductId" class="form-select add-product-select">
                <option value="">➕ 추가할 공방 뜨개옷 선택...</option>
                <option v-for="prod in store.products" :key="prod.id" :value="prod.id">
                  {{ prod.name }} ({{ prod.price.toLocaleString() }}원)
                </option>
              </select>
              <button
                type="button"
                class="btn-add-item"
                :disabled="!selectedAddProductId"
                @click="addItemToOrder"
              >
                상품 추가
              </button>
            </div>

            <!-- 금액 정산 요약 -->
            <div class="calc-summary-card">
              <div class="calc-row">
                <span>상품 총액</span>
                <span class="font-mono">{{ calculatedProductAmount.toLocaleString() }}원</span>
              </div>
              <div class="calc-row">
                <span>배송비</span>
                <span class="font-mono">+{{ Number(form.shippingCost || 0).toLocaleString() }}원</span>
              </div>
              <div class="calc-row total-calc-row">
                <span class="font-bold">최종 결제금액</span>
                <span class="total-calc-val font-mono">{{ calculatedTotalAmount.toLocaleString() }}원</span>
              </div>
            </div>
          </div>

          <!-- 5. 📝 메모 및 관리자 메모 섹션 -->
          <div class="form-section">
            <div class="sec-title-row">
              <span class="sec-icon">📝</span>
              <h3 class="sec-title">메모 및 관리자 노트</h3>
            </div>

            <div class="form-group">
              <label class="input-label">고객 요청 메모</label>
              <textarea
                v-model="form.memo"
                rows="2"
                class="form-textarea"
                placeholder="고객이 주문 시 남긴 요청 사항"
              ></textarea>
            </div>

            <div class="form-group">
              <label class="input-label">관리자 전용 내부 메모 (고객에게 비공개)</label>
              <textarea
                v-model="form.adminNotes"
                rows="2"
                class="form-textarea admin-note-textarea"
                placeholder="예: 인스타 DM으로 귀 길이 1cm 연장 협의 완료, 11/12 발송 예정"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- 모달 푸터 버튼 -->
        <div class="modal-footer">
          <button type="button" class="btn-modal-cancel" @click="closeModal">
            취소
          </button>
          <button type="button" class="btn-modal-save" @click="handleSave">
            <i class="material-icons">save</i>
            <span>수정사항 저장하기</span>
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9998;
  background: rgba(30, 20, 20, 0.65);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal-dialog {
  width: 100%;
  max-width: 580px;
  max-height: 90dvh;
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid #ebdcd0;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

/* 헤더 */
.modal-header {
  padding: 18px 20px;
  border-bottom: 1px solid #f0e6dd;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #faf7f5;
}

.header-titles {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.badge-edit {
  display: inline-block;
  background: #ff4d6d;
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 6px;
  width: fit-content;
}

.modal-title {
  font-size: 1.18rem;
  font-weight: 900;
  color: #3b2826;
  margin: 0;
}

.btn-close {
  background: #f3eae5;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 800;
  color: #8c7875;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #e5d7d1;
  color: #3b2826;
}

/* 바디 (스크롤) */
.modal-body {
  padding: 20px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* 섹션 공통 */
.form-section {
  background: #ffffff;
  border: 1px solid #ebdcd0;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.highlight-photo-sec {
  background: #fff8f9;
  border: 1.5px solid #ffccd5;
}

.sec-title-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.sec-icon {
  font-size: 1.25rem;
  line-height: 1;
}

.sec-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sec-title {
  font-size: 0.98rem;
  font-weight: 800;
  color: #4a3431;
  margin: 0;
}

.sec-sub {
  font-size: 0.76rem;
  color: #8c7875;
  line-height: 1.35;
}

/* 사진 미리보기 */
.photo-preview-wrap {
  width: 100%;
}

.photo-preview-box {
  position: relative;
  width: 100%;
  max-height: 220px;
  border-radius: 14px;
  overflow: hidden;
  border: 2px solid #ffccd5;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-img {
  width: 100%;
  max-height: 220px;
  object-fit: contain;
}

.btn-remove-photo {
  position: absolute;
  top: 10px;
  right: 10px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(220, 38, 38, 0.88);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 0.76rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: background 0.2s;
}

.btn-del-icon {
  font-size: 0.95rem;
}

.btn-remove-photo:hover {
  background: rgba(185, 28, 28, 1);
}

.photo-empty-placeholder {
  border: 2px dashed #ffccd5;
  border-radius: 14px;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  cursor: pointer;
  background: #fffbfb;
  transition: background 0.2s, border-color 0.2s;
}

.photo-empty-placeholder:hover {
  background: #fff1f3;
  border-color: #ff4d6d;
}

.empty-cam-icon {
  font-size: 2.2rem;
  margin-bottom: 6px;
}

.empty-txt {
  font-size: 0.88rem;
  font-weight: 800;
  color: #ff4d6d;
}

.empty-sub {
  font-size: 0.75rem;
  color: #a89491;
  margin-top: 4px;
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
  padding: 10px 16px;
  font-size: 0.86rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(255, 77, 109, 0.25);
  transition: transform 0.15s, background 0.2s;
}

.btn-upload-trigger:hover {
  background: #e63956;
  transform: translateY(-1px);
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

.url-inp {
  font-size: 0.78rem;
  padding: 8px 10px;
}

/* 폼 컨트롤 */
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
  color: #6b5c58;
}

.req {
  color: #ff4d6d;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  box-sizing: border-box;
  background: #faf7f5;
  border: 1.5px solid #ebdcd0;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 0.86rem;
  color: #3b2826;
  outline: none;
  transition: border-color 0.2s, background 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: #ff4d6d;
  background: #ffffff;
}

.status-select {
  font-weight: 800;
  color: #1e40af;
  background: #eff6ff;
  border-color: #bfdbfe;
}

.prefix-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.prefix {
  position: absolute;
  left: 10px;
  font-weight: 800;
  color: #ff4d6d;
}

.has-prefix {
  padding-left: 24px;
}

.form-textarea {
  resize: vertical;
  line-height: 1.45;
}

.admin-note-textarea {
  background: #fffbeb;
  border-color: #fef08a;
  color: #713f12;
}

/* 상품 리스트 (모바일 친화형 카드 레이아웃) */
.edit-items-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.edit-item-card {
  background: #ffffff;
  border: 1.5px solid #ebdcd0;
  border-radius: 14px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
}

.item-card-top {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.edit-item-img {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #ebdcd0;
  flex-shrink: 0;
  background: #fdfaf6;
}

.item-name-box {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-name {
  font-size: 0.86rem;
  font-weight: 800;
  color: #3b2826;
  white-space: normal;
  word-break: keep-all;
  line-height: 1.25;
}

.item-unit-price {
  font-size: 0.72rem;
  color: #8c7875;
}

.btn-delete-item {
  background: #fee2e2;
  border: none;
  color: #ef4444;
  font-size: 0.85rem;
  font-weight: 800;
  cursor: pointer;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s;
}

.btn-delete-item:hover {
  background: #fca5a5;
  color: #ffffff;
}

.item-card-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 6px;
  border-top: 1px dashed #f0e6de;
  gap: 8px;
}

.edit-qty-ctrl {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #fdfbf7;
  border: 1px solid #ebdcd0;
  border-radius: 8px;
  padding: 2px 4px;
}

.btn-qty {
  width: 26px;
  height: 26px;
  border: none;
  background: #f3eae5;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 800;
  color: #4a3431;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-qty:hover {
  background: #ffccd5;
  color: #ff4d6d;
}

.qty-count {
  min-width: 22px;
  text-align: center;
  font-size: 0.86rem;
}

.edit-item-subtotal-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}

.subtotal-label {
  font-size: 0.74rem;
  color: #8c7875;
  font-weight: 600;
}

.edit-item-subtotal {
  font-size: 0.9rem;
  font-weight: 900;
  color: #ff4d6d;
}

/* 상품 추가 콤보 */
.add-item-box {
  display: flex;
  gap: 8px;
}

.add-product-select {
  flex: 1;
}

.btn-add-item {
  background: #4a3431;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 0 16px;
  font-size: 0.84rem;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
}

.btn-add-item:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* 정산 요약 카드 */
.calc-summary-card {
  background: #faf7f5;
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  border: 1px solid #ebdcd0;
}

.calc-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
  color: #6b5c58;
}

.total-calc-row {
  border-top: 1px dashed #ebdcd0;
  padding-top: 8px;
  margin-top: 4px;
  font-size: 0.94rem;
}

.total-calc-val {
  font-size: 1.05rem;
  font-weight: 900;
  color: #ff4d6d;
}

/* 푸터 */
.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #f0e6dd;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background: #faf7f5;
}

.btn-modal-cancel {
  background: #f3eae5;
  border: 1px solid #ebdcd0;
  border-radius: 12px;
  padding: 12px 18px;
  font-size: 0.88rem;
  font-weight: 800;
  color: #6b5c58;
  cursor: pointer;
}

.btn-modal-save {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #ff4d6d 0%, #ff758f 100%);
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 0.92rem;
  font-weight: 800;
  color: #ffffff;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(255, 77, 109, 0.35);
  transition: transform 0.15s, box-shadow 0.2s;
}

.btn-modal-save:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(255, 77, 109, 0.45);
}

/* 반응형 (320px 모바일 완벽 대응) */
@media (max-width: 640px) {
  .modal-dialog {
    max-height: 90dvh;
    border-radius: 18px;
  }

  .modal-header {
    padding: 14px 16px;
  }

  .modal-title {
    font-size: 1.05rem;
  }

  .modal-body {
    padding: 14px;
    gap: 14px;
  }

  .form-section {
    padding: 12px;
    gap: 10px;
    border-radius: 14px;
  }

  .form-grid-2 {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .edit-item-card {
    padding: 8px 10px;
    gap: 6px;
  }

  .edit-item-img {
    width: 34px;
    height: 34px;
  }

  .item-name {
    font-size: 0.82rem;
  }

  .edit-item-subtotal {
    font-size: 0.84rem;
  }

  .add-item-box {
    flex-direction: column;
  }

  .btn-add-item {
    height: 38px;
  }

  .modal-footer {
    padding: 12px 14px;
  }

  .btn-modal-cancel {
    padding: 10px 14px;
    font-size: 0.84rem;
  }

  .btn-modal-save {
    padding: 10px 18px;
    font-size: 0.86rem;
  }
}

/* 트랜지션 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
