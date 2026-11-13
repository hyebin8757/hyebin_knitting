<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useKnittingStore, SHIPPING_OPTIONS, type OrderItem } from "~/stores/useKnittingStore";

const route = useRoute();
const router = useRouter();
const store = useKnittingStore();

// 주문 폼 상태
const form = ref({
  instagramId: "",
  buyerName: "",
  phone: "",
  address: "",
  shippingId: "normal",
  depositorName: "",
  memo: "",
});

// 선택된 상품들 (productId -> 수량)
const selectedQuantities = ref<Record<string, number>>({});

// 개별 상품 상세 설명 접기/펼치기 상태 (미선택 상품도 미리보기 지원)
const expandedDetails = ref<Record<string, boolean>>({});

const toggleDetails = (id: string) => {
  expandedDetails.value[id] = !expandedDetails.value[id];
};

// 주문 완료 상태
const submittedOrder = ref<OrderItem | null>(null);
const isSubmitting = ref(false);

onMounted(() => {
  // URL 쿼리에 select가 있으면 해당 상품 1개 자동 선택
  const querySelect = route.query.select as string;
  if (querySelect && store.products.some((p) => p.id === querySelect)) {
    selectedQuantities.value[querySelect] = 1;
  }
});

// 선택된 상품 수량 제어
const getQuantity = (id: string) => selectedQuantities.value[id] || 0;

const toggleProduct = (id: string) => {
  if (selectedQuantities.value[id] && selectedQuantities.value[id] > 0) {
    delete selectedQuantities.value[id];
  } else {
    selectedQuantities.value[id] = 1;
  }
};

const increaseQuantity = (id: string) => {
  const current = selectedQuantities.value[id] || 0;
  selectedQuantities.value[id] = current + 1;
};

const decreaseQuantity = (id: string) => {
  const current = selectedQuantities.value[id] || 0;
  if (current <= 1) {
    delete selectedQuantities.value[id];
  } else {
    selectedQuantities.value[id] = current - 1;
  }
};

// 선택된 아이템 목록
const selectedItemList = computed(() => {
  const list: { product: (typeof store.products)[0]; quantity: number; subtotal: number }[] = [];
  for (const [id, qty] of Object.entries(selectedQuantities.value)) {
    if (qty > 0) {
      const p = store.products.find((prod) => prod.id === id);
      if (p) {
        list.push({
          product: p,
          quantity: qty,
          subtotal: p.price * qty,
        });
      }
    }
  }
  return list;
});

// 상세 설명(제작/핏 안내)이 있는 선택된 상품 목록 (요청사항 상단 요약용)
const selectedProductsWithDetails = computed(() => {
  return selectedItemList.value
    .map((item) => item.product)
    .filter((p) => p.details && p.details.trim().length > 0);
});

// 총 상품 금액
const totalProductPrice = computed(() => {
  return selectedItemList.value.reduce((sum, item) => sum + item.subtotal, 0);
});

// 배송비
const currentShipping = computed(() => {
  return SHIPPING_OPTIONS.find((s) => s.id === form.value.shippingId) || SHIPPING_OPTIONS[0];
});

// 최종 결제 금액
const finalTotal = computed(() => {
  if (selectedItemList.value.length === 0) return 0;
  return totalProductPrice.value + currentShipping.value.cost;
});

// 계좌번호 복사
const copyAccount = () => {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    navigator.clipboard.writeText(`${store.settings.bankName} ${store.settings.accountNumber}`);
    store.showToast(`계좌번호가 복사되었습니다! (${store.settings.bankName} ${store.settings.accountNumber}) ✨`);
  }
};

// 주문 확인 모달 상태
const isConfirmModalOpen = ref(false);

// 1차: 유효성 검사 후 최종 확인 모달 띄우기 ("정말로 주문할 건지")
const handleOpenConfirmModal = () => {
  if (!form.value.instagramId.trim()) {
    store.showAlert("인스타그램 아이디를 입력해주세요! (소통 및 제작 확인용)", { type: "warning", title: "입력 확인" });
    return;
  }
  if (!form.value.buyerName.trim()) {
    store.showAlert("수령자 성함을 입력해주세요.", { type: "warning", title: "입력 확인" });
    return;
  }
  if (!form.value.phone.trim()) {
    store.showAlert("연락처(휴대폰 번호)를 입력해주세요.", { type: "warning", title: "입력 확인" });
    return;
  }
  if (!form.value.address.trim()) {
    store.showAlert("배송받으실 주소를 입력해주세요. (반값택배의 경우 GS25/CU 점포명 기재)", { type: "warning", title: "입력 확인" });
    return;
  }
  if (selectedItemList.value.length === 0) {
    store.showAlert("주문하실 뜨개옷을 1개 이상 선택해주세요!", { type: "warning", title: "상품 미선택" });
    return;
  }

  isConfirmModalOpen.value = true;
};

// 2차: 모달에서 '네, 정말로 주문할게요' 클릭 시 최종 발주 접수
const confirmAndSubmitOrder = async () => {
  isSubmitting.value = true;
  try {
    const items = selectedItemList.value.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.image,
    }));

    const newOrder = await store.createOrder({
      instagramId: form.value.instagramId.trim(),
      buyerName: form.value.buyerName.trim(),
      phone: form.value.phone.trim(),
      address: form.value.address.trim(),
      shippingId: form.value.shippingId,
      items,
      depositorName: form.value.depositorName.trim() || form.value.buyerName.trim(),
      memo: form.value.memo.trim(),
    });

    isConfirmModalOpen.value = false;
    submittedOrder.value = newOrder;
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    store.showAlert("주문 처리 중 오류가 발생했습니다. 다시 시도해주세요.", { type: "error", title: "주문 오류" });
  } finally {
    isSubmitting.value = false;
  }
};

// 구매자 카카오톡으로 주문서 내역 영수증 공유/발송
const shareOrderToKakao = () => {
  if (!submittedOrder.value) return;
  const kakao = typeof window !== "undefined" ? (window as any).Kakao : null;
  const itemsText = submittedOrder.value.items.map((i) => `${i.productName} ${i.quantity}개`).join(", ");
  const totalText = `${submittedOrder.value.totalAmount.toLocaleString()}원`;
  const bankText = `${store.settings.bankName} ${store.settings.accountNumber} (${store.settings.accountHolder})`;

  const receiptText =
    `🧶 [앉은누이 뜨개옷장 주문 영수증]\n\n` +
    `• 주문번호: ${submittedOrder.value.id}\n` +
    `• 주문자: ${submittedOrder.value.buyerName} (@${submittedOrder.value.instagramId})\n` +
    `• 주문상품: ${itemsText}\n` +
    `• 결제금액: ${totalText} (${submittedOrder.value.shippingType})\n` +
    `• 배송지: ${submittedOrder.value.address}\n` +
    `• 입금계좌: ${bankText}\n` +
    `• 입금자명: ${submittedOrder.value.depositorName}\n\n` +
    `입금 확인 후 정성껏 제작이 시작됩니다! ✨`;

  if (kakao && kakao.isInitialized && kakao.isInitialized()) {
    try {
      kakao.Share.sendDefault({
        objectType: "text",
        text: receiptText,
        link: {
          mobileWebUrl: window.location.origin,
          webUrl: window.location.origin,
        },
        buttonTitle: "내 주문 배송조회",
      });
      return;
    } catch (e) {
      console.warn("Kakao share fallback:", e);
    }
  }

  // 모바일 웹 공유 (Web Share API) 또는 클립보드 복사
  if (navigator.share) {
    navigator
      .share({
        title: "앉은누이 뜨개옷 주문 영수증",
        text: receiptText,
      })
      .catch(() => {});
  } else {
    navigator.clipboard.writeText(receiptText);
    store.showToast("주문서 영수증과 계좌번호가 복사되었습니다! ✨");
  }
};

const resetForNewOrder = () => {
  submittedOrder.value = null;
  form.value = {
    instagramId: "",
    buyerName: "",
    phone: "",
    address: "",
    shippingId: "normal",
    depositorName: "",
    memo: "",
  };
  selectedQuantities.value = {};
};
</script>

<template>
  <div class="order-page">
    <div class="order-container">
      <!-- 주문 완료 화면 -->
      <div v-if="submittedOrder" class="order-success-card">
        <div class="success-header">
          <span class="celebrate-emoji">🎉</span>
          <h2 class="success-title">주문서가 성공적으로 접수되었습니다!</h2>
          <p class="success-subtitle">주문자님의 소중한 주문이 관리자에게 실시간 알림으로 전달되었습니다.</p>
        </div>

        <div class="order-meta-box">
          <div class="meta-row">
            <span class="label">주문번호</span>
            <span class="value font-mono font-bold">{{ submittedOrder.id }}</span>
          </div>
          <div class="meta-row">
            <span class="label">주문일시</span>
            <span class="value">{{ submittedOrder.createdAt }}</span>
          </div>
          <div class="meta-row">
            <span class="label">주문자</span>
            <span class="value">{{ submittedOrder.buyerName }} (@{{ submittedOrder.instagramId }})</span>
          </div>
          <div class="meta-row">
            <span class="label">배송지</span>
            <span class="value">{{ submittedOrder.address }}</span>
          </div>
          <div class="meta-row">
            <span class="label">배송방식</span>
            <span class="value">{{ submittedOrder.shippingType }} ({{ submittedOrder.shippingCost.toLocaleString() }}원)</span>
          </div>
        </div>

        <!-- 주문 상품 목록 -->
        <div class="ordered-items-box">
          <h4 class="sub-heading">선택하신 뜨개옷</h4>
          <div class="items-list">
            <div v-for="item in submittedOrder.items" :key="item.productId" class="item-row">
              <img :src="item.image" :alt="item.productName" class="item-img" />
              <div class="item-details">
                <span class="item-name">{{ item.productName }}</span>
                <span class="item-qty-price">{{ item.price.toLocaleString() }}원 × {{ item.quantity }}개</span>
              </div>
              <span class="item-subtotal">{{ (item.price * item.quantity).toLocaleString() }}원</span>
            </div>
          </div>
          <div class="total-bar">
            <span>총 입금하실 금액</span>
            <span class="final-price">{{ submittedOrder.totalAmount.toLocaleString() }}원</span>
          </div>
        </div>

        <!-- 입금 계좌 안내 -->
        <div class="bank-deposit-card">
          <div class="bank-title-line">
            <span class="bank-tag">입금 계좌 안내</span>
            <span class="bank-timer">⏱️ 24시간 이내 미입금 시 자동 취소</span>
          </div>
          <div class="bank-box-inner">
            <div class="bank-acc-info">
              <span class="bank-name">{{ store.settings.bankName }}</span>
              <span class="bank-num font-mono">{{ store.settings.accountNumber }}</span>
              <span class="bank-holder">예금주: {{ store.settings.accountHolder }}</span>
            </div>
            <button class="btn-copy-lg" @click="copyAccount">계좌번호 복사</button>
          </div>
          <p class="deposit-tip">
            입금자명이 <b>'{{ submittedOrder.depositorName }}'</b>(으)로 확인되면 정성껏 제작이 시작됩니다.
          </p>
          <div class="deposit-timer-notice">
            ⏰ <b>주문서 작성 후 24시간 이내 미입금 시 주문이 자동 취소됩니다.</b>
          </div>
        </div>

        <div class="success-actions">
          <!-- 💬 카카오톡으로 내 주문서 & 계좌 받기 버튼 -->
          <button type="button" class="btn-kakao-receipt" @click="shareOrderToKakao">
            <span class="kakao-bubble-icon">💬</span>
            <span>내 카카오톡으로 주문서 & 계좌 받기</span>
          </button>

          <button class="btn-lookup" @click="store.isOrderLookupModalOpen = true">
            <i class="material-icons">search</i>
            <span>내 주문 배송상태 조회</span>
          </button>
          <button class="btn-new-order" @click="resetForNewOrder">
            새 주문서 작성하기
          </button>
          <nuxt-link to="/" class="btn-go-home">홈으로 이동</nuxt-link>
        </div>
      </div>

      <!-- 주문서 작성 폼 -->
      <form v-else class="order-form-card" @submit.prevent="handleOpenConfirmModal">
        <!-- 폼 상단 헤더 -->
        <div class="form-hero">
          <h1 class="form-main-title">앉은누이 뜨개옷 주문서</h1>
          <p class="form-guide-text">수량은 폼에 기재되어있는 것을 선택해주세요!</p>
          <p class="form-highlight-text">주문서 작성 전 꼭 확인하시고 주문 부탁드려요 :)</p>
        </div>

        <!-- 폼 안내 박스들 (관리자 메뉴에서 실시간 수정 연동 - 이미지 5번) -->
        <div class="notice-accordion">
          <!-- 1. 공지사항 -->
          <div class="accordion-item">
            <div class="acc-head"><span class="acc-badge">공지사항</span></div>
            <div class="acc-body dynamic-notice-body">
              {{ store.siteNotices.noticeContent }}
            </div>
          </div>

          <!-- 2. 배송안내 -->
          <div class="accordion-item">
            <div class="acc-head"><span class="acc-badge bg-blue">배송안내</span></div>
            <div class="acc-body dynamic-notice-body">
              {{ store.siteNotices.shippingContent }}
            </div>
          </div>

          <!-- 3. 유의사항 -->
          <div class="accordion-item">
            <div class="acc-head"><span class="acc-badge bg-amber">유의사항</span></div>
            <div class="acc-body dynamic-notice-body">
              {{ store.siteNotices.cautionContent }}
            </div>
          </div>

          <!-- 4. 세탁 시 주의사항 -->
          <div class="accordion-item">
            <div class="acc-head"><span class="acc-badge bg-purple">세탁 시 주의사항</span></div>
            <div class="acc-body dynamic-notice-body">
              {{ store.siteNotices.washingContent }}
            </div>
          </div>
        </div>

        <!-- 필드 1: 인스타그램 아이디 -->
        <div class="form-section-card">
          <div class="field-label-row">
            <label class="field-label" for="insta">인스타그램 아이디 <span class="req">*</span></label>
            <span class="field-sub">주문 확인 및 제작 진행 DM 소통용</span>
          </div>
          <div class="input-with-prefix">
            <span class="prefix">@</span>
            <input
              id="insta"
              v-model="form.instagramId"
              type="text"
              class="form-control with-pref"
              placeholder="instagram_id"
              required
            />
          </div>
        </div>

        <!-- 필드 2: 수령자 성함 -->
        <div class="form-section-card">
          <div class="field-label-row">
            <label class="field-label" for="b-name">수령자 성함 <span class="req">*</span></label>
            <span class="field-sub">택배 수령인 실명</span>
          </div>
          <input
            id="b-name"
            v-model="form.buyerName"
            type="text"
            class="form-control"
            placeholder="예: 홍길동"
            required
          />
        </div>

        <!-- 필드 3: 연락처 -->
        <div class="form-section-card">
          <div class="field-label-row">
            <label class="field-label" for="b-phone">연락처 <span class="req">*</span></label>
            <span class="field-sub">배송 기사님 및 알림톡 수신용</span>
          </div>
          <input
            id="b-phone"
            v-model="form.phone"
            type="tel"
            class="form-control"
            placeholder="예: 010-1234-5678"
            required
          />
        </div>

        <!-- 필드 4: 배송받으실 주소 -->
        <div class="form-section-card">
          <div class="field-label-row">
            <label class="field-label" for="b-address">배송받으실 주소 <span class="req">*</span></label>
            <span class="field-sub">도로명 주소 및 상세 주소 (반값택배 시 편의점 점포명 기재)</span>
          </div>
          <textarea
            id="b-address"
            v-model="form.address"
            rows="3"
            class="form-textarea"
            placeholder="일반 택배: 도로명 주소 + 동호수 기재&#10;반값/알뜰택배: GS25 강남역삼점 (점포명 필수)"
            required
          ></textarea>
        </div>

        <!-- 필드 5: 주문제품 선택 (중복가능) - 구글 폼 9종 상품 그리드 -->
        <div class="form-section-card product-selection-card">
          <div class="field-label-row">
            <div>
              <label class="field-label">주문제품 선택 (중복가능) <span class="req">*</span></label>
              <p class="field-sub">원하시는 상품을 클릭하여 담고 수량을 조정해 주세요.</p>
            </div>
            <span class="selected-count-tag" v-if="selectedItemList.length > 0">
              선택된 상품: {{ selectedItemList.length }}종 (총 {{ selectedItemList.reduce((s, i) => s + i.quantity, 0) }}개)
            </span>
          </div>

          <div class="form-products-grid">
            <div
              v-for="product in store.products"
              :key="product.id"
              class="form-product-item"
              :class="{ selected: getQuantity(product.id) > 0 }"
            >
              <div class="item-check-row" @click="toggleProduct(product.id)">
                <div class="custom-checkbox" :class="{ checked: getQuantity(product.id) > 0 }">
                  <i v-if="getQuantity(product.id) > 0" class="material-icons check-icon">check</i>
                </div>
                <span class="form-prod-name">{{ product.name }}</span>
              </div>

              <!-- 상품 사진 스와이프 (최대 5장 지원) -->
              <div class="form-prod-img-box">
                <ProductImageSwipe
                  :images="product.images || [product.image]"
                  :fallback-image="product.image"
                  :alt="product.name"
                  aspect-ratio="1/1"
                  @click="toggleProduct(product.id)"
                />
                <span class="form-prod-price-badge">{{ product.price.toLocaleString() }}원</span>
              </div>

              <!-- 수량 컨트롤러 -->
              <div class="qty-controller" v-if="getQuantity(product.id) > 0">
                <button type="button" class="btn-qty" @click.stop="decreaseQuantity(product.id)">-</button>
                <span class="qty-val font-mono">{{ getQuantity(product.id) }}</span>
                <button type="button" class="btn-qty" @click.stop="increaseQuantity(product.id)">+</button>
              </div>
              <div v-else class="qty-placeholder" @click="toggleProduct(product.id)">
                <span>+ 상품 담기</span>
              </div>

              <!-- 📝 상품 상세 설명 (제작 안내, 핏 설명) -->
              <div v-if="product.details" class="prod-details-container">
                <!-- 선택되었을 때 기본 펼침 / 미선택 시 토글 버튼 또는 항시 컴팩트 안내 -->
                <div
                  v-if="getQuantity(product.id) > 0 || expandedDetails[product.id]"
                  class="prod-details-card"
                  :class="{ 'is-selected': getQuantity(product.id) > 0 }"
                  @click.stop
                >
                  <div class="prod-details-header">
                    <span class="prod-details-badge">💡 제작·핏 안내</span>
                    <button
                      v-if="getQuantity(product.id) === 0"
                      type="button"
                      class="btn-close-mini-details"
                      @click.stop="toggleDetails(product.id)"
                      title="접기"
                    >
                      ✕
                    </button>
                  </div>
                  <p class="prod-details-text">{{ product.details }}</p>
                </div>
                <button
                  v-else
                  type="button"
                  class="btn-toggle-details"
                  @click.stop="toggleDetails(product.id)"
                  title="제작 및 핏 안내 보기"
                >
                  <i class="material-icons details-icon-mini">help_outline</i>
                  <span>제작/핏 안내</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 필드 6: 배송 방식 선택 -->
        <div class="form-section-card">
          <label class="field-label">배송 방식 <span class="req">*</span></label>
          <div class="shipping-options-list">
            <label
              v-for="shipping in SHIPPING_OPTIONS"
              :key="shipping.id"
              class="shipping-radio-label"
              :class="{ active: form.shippingId === shipping.id }"
            >
              <input
                type="radio"
                name="shipping"
                :value="shipping.id"
                v-model="form.shippingId"
                class="radio-input"
              />
              <div class="shipping-info-wrap">
                <div class="shipping-title-row">
                  <span class="ship-name">{{ shipping.name }}</span>
                  <span class="ship-price">+{{ shipping.cost.toLocaleString() }}원</span>
                </div>
                <span class="ship-desc">{{ shipping.desc }}</span>
              </div>
            </label>
          </div>
        </div>

        <!-- 💡 선택하신 상품의 맞춤제작 & 핏 참고사항 요약 안내 -->
        <div v-if="selectedProductsWithDetails.length > 0" class="form-section-card selected-details-notice-card">
          <div class="selected-details-head">
            <span class="details-notice-icon">🧶</span>
            <div class="details-notice-title-box">
              <h4 class="details-notice-title">선택하신 상품의 맞춤제작·핏 안내</h4>
              <p class="details-notice-sub">특별한 옵션(귀뚫린 버전 등) 요청 시 아래 [배송 시 요청사항]란에 적어주세요!</p>
            </div>
          </div>
          <div class="selected-details-list">
            <div
              v-for="p in selectedProductsWithDetails"
              :key="p.id"
              class="selected-detail-row"
            >
              <div class="selected-detail-prod-head">
                <span class="detail-prod-badge">{{ p.name }}</span>
                <span class="detail-prod-qty">{{ getQuantity(p.id) }}개</span>
              </div>
              <p class="selected-detail-desc">{{ p.details }}</p>
            </div>
          </div>
        </div>

        <!-- 필드 7: 배송 시 요청사항 / 기타 메모 -->
        <div class="form-section-card">
          <label class="field-label" for="b-memo">배송 시 요청사항 / 기타 메모</label>
          <span class="field-sub">예: 문 앞에 놓아주세요, 복숭아 세라 색상(파랑/분홍) 등</span>
          <textarea
            id="b-memo"
            v-model="form.memo"
            rows="2"
            class="form-textarea"
            placeholder="남기실 메모가 있다면 자유롭게 적어주세요 :)"
          ></textarea>
        </div>

        <!-- 필드 8: 입금하실 계좌 확인 & 입금자명 -->
        <div class="form-section-card bank-notice-card">
          <div class="field-label-row">
            <label class="field-label">입금하실 계좌 확인</label>
            <span class="field-sub">주문서 제출 후 아래 계좌로 입금해 주세요.</span>
          </div>

          <div class="bank-display-box">
            <div class="bank-line">
              <span class="bank-name-badge">{{ store.settings.bankName }}</span>
              <span class="bank-number font-mono">{{ store.settings.accountNumber }}</span>
              <span class="bank-owner">예금주: {{ store.settings.accountHolder }}</span>
            </div>
            <button type="button" class="btn-copy-acc" @click="copyAccount">계좌 복사</button>
          </div>

          <!-- 입금자명 입력 -->
          <div class="depositor-input-wrap">
            <label class="sub-label" for="dep-name">실제 입금자명 (주문자명과 다른 경우 꼭 기재)</label>
            <input
              id="dep-name"
              v-model="form.depositorName"
              type="text"
              class="form-control"
              :placeholder="form.buyerName ? `기본: ${form.buyerName}` : '입금자명 입력'"
            />
          </div>
        </div>

        <!-- 최종 결제 금액 요약 카드 -->
        <div class="order-summary-sticky">
          <div class="summary-line">
            <span>선택 상품 금액</span>
            <span class="font-bold">{{ totalProductPrice.toLocaleString() }}원</span>
          </div>
          <div class="summary-line">
            <span>배송비 ({{ currentShipping.name }})</span>
            <span class="font-bold">+{{ currentShipping.cost.toLocaleString() }}원</span>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-line total-line">
            <span>최종 결제 금액</span>
            <span class="total-highlight font-mono">{{ finalTotal.toLocaleString() }}원</span>
          </div>

          <!-- 제출 버튼 -->
          <button type="submit" class="btn-submit-order" :disabled="isSubmitting || selectedItemList.length === 0">
            <span v-if="isSubmitting">주문서 전송 중...</span>
            <span v-else-if="selectedItemList.length === 0">주문할 상품을 선택해주세요</span>
            <span v-else>총 {{ finalTotal.toLocaleString() }}원 주문서 제출하기 💌</span>
          </button>
        </div>
      </form>

      <!-- 🧶 주문 최종 확인 모달 (정말로 주문 할건지 2차 확인) -->
      <transition name="modal-fade">
        <div v-if="isConfirmModalOpen" class="confirm-modal-backdrop" @click.self="isConfirmModalOpen = false">
          <div class="confirm-modal-sheet" role="dialog" aria-modal="true">
            <!-- 모바일 드래그 핸들 바 -->
            <div class="confirm-drag-handle" @click="isConfirmModalOpen = false">
              <div class="handle-bar"></div>
            </div>

            <!-- 헤더 -->
            <div class="confirm-header">
              <div class="c-title-group">
                <div class="c-badge-row">
                  <span class="c-icon">🧶</span>
                  <span class="c-tag">주문 최종 확인</span>
                </div>
                <h3 class="c-main-title">정말로 주문하시겠습니까?</h3>
                <p class="c-subtitle">입력하신 주문 정보가 맞는지 마지막으로 확인해주세요.</p>
              </div>
              <button type="button" class="btn-close-c" @click="isConfirmModalOpen = false" aria-label="닫기">
                <i class="material-icons">close</i>
              </button>
            </div>

            <!-- 확인 바디 -->
            <div class="confirm-body">
              <!-- 1. 주문자 & 배송지 카드 -->
              <div class="c-card c-buyer-card">
                <div class="c-row">
                  <span class="c-label">수령인</span>
                  <span class="c-val font-bold">{{ form.buyerName }} <span class="c-subval">(@{{ form.instagramId }})</span></span>
                </div>
                <div class="c-row">
                  <span class="c-label">연락처</span>
                  <span class="c-val font-mono">{{ form.phone }}</span>
                </div>
                <div class="c-row">
                  <span class="c-label">배송지</span>
                  <span class="c-val">{{ form.address }}</span>
                </div>
                <div class="c-row">
                  <span class="c-label">배송방식</span>
                  <span class="c-val">{{ currentShipping.name }} (+{{ currentShipping.cost.toLocaleString() }}원)</span>
                </div>
                <div v-if="form.memo" class="c-row">
                  <span class="c-label">요청사항</span>
                  <span class="c-val">{{ form.memo }}</span>
                </div>
              </div>

              <!-- 2. 선택한 상품 목록 요약 -->
              <div class="c-card c-items-card">
                <div class="c-items-head">
                  <span class="c-items-title">선택하신 뜨개옷</span>
                  <span class="c-items-count">{{ selectedItemList.reduce((s, i) => s + i.quantity, 0) }}개</span>
                </div>
                <div class="c-items-list">
                  <div v-for="item in selectedItemList" :key="item.product.id" class="c-item-item">
                    <img :src="item.product.image" :alt="item.product.name" class="c-item-thumb" />
                    <div class="c-item-details">
                      <span class="c-item-name">{{ item.product.name }}</span>
                      <span class="c-item-qty font-mono">{{ item.product.price.toLocaleString() }}원 × {{ item.quantity }}개</span>
                      <span v-if="item.product.details" class="c-item-details-note font-mono">💡 {{ item.product.details }}</span>
                    </div>
                    <span class="c-item-price font-mono font-bold">{{ (item.product.price * item.quantity).toLocaleString() }}원</span>
                  </div>
                </div>
              </div>

              <!-- 3. 최종 결제 금액 박스 -->
              <div class="c-total-box">
                <div class="c-total-flex">
                  <span class="c-total-txt">최종 입금하실 금액</span>
                  <span class="c-total-amt font-mono">{{ finalTotal.toLocaleString() }}원</span>
                </div>
                <p class="c-deposit-info">
                  입금자명: <b>{{ form.depositorName.trim() || form.buyerName.trim() }}</b>
                  ({{ store.settings.bankName }} {{ store.settings.accountNumber }})
                </p>
              </div>

              <!-- 4. 핸드메이드 유의사항 알림 -->
              <div class="c-notice-box">
                <span class="c-notice-icon">⚠️</span>
                <p class="c-notice-txt">
                  100% 핸드메이드 주문 제작 특성상, <b>주문서 접수 및 제작 착수 후 단순 변심으로 인한 교환 및 환불이 불가</b>합니다.
                </p>
              </div>
            </div>

            <!-- 하단 확인 버튼들 -->
            <div class="confirm-footer">
              <button type="button" class="btn-c-cancel" @click="isConfirmModalOpen = false">
                수정할게요
              </button>
              <button type="button" class="btn-c-submit" :disabled="isSubmitting" @click="confirmAndSubmitOrder">
                <span v-if="isSubmitting">주문서 접수 중...</span>
                <span v-else>네, 정말로 주문할게요 💌</span>
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.order-page {
  padding: 18px 14px 110px; /* 하단 네비게이션 바(62px)에 컨텐츠가 가려지지 않도록 안전 여백 확보 */
  min-height: auto;
}

.order-container {
  max-width: 680px;
  margin: 0 auto;
}

/* 폼 상단 헤더 */
.order-form-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-hero {
  background: #ffffff;
  border: 1px solid #ebdcd0;
  border-radius: 20px;
  padding: 28px 24px;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
  border-top: 6px solid #ff758f;
}

.top-yarn-badge {
  display: inline-block;
  background: #fff0f3;
  color: #ff4d6d;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 12px;
  margin-bottom: 10px;
}

.form-main-title {
  font-size: 1.8rem;
  font-weight: 900;
  color: #2b1f1d;
  margin: 0 0 8px;
}

.form-guide-text {
  font-size: 0.92rem;
  color: #6b5c58;
  margin: 0 0 4px;
}

.form-highlight-text {
  font-size: 0.92rem;
  font-weight: 700;
  color: #ff4d6d;
  margin: 0;
}

/* 공지 아코디언/박스 */
.notice-accordion {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.accordion-item {
  background: #ffffff;
  border: 1px solid #ebdcd0;
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.acc-badge {
  background: #ff4d6d;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 6px;
}

.acc-badge.bg-blue {
  background: #3b82f6;
}

.acc-badge.bg-amber {
  background: #f59e0b;
}

.acc-badge.bg-purple {
  background: #8b5cf6;
}

.acc-body {
  font-size: 0.82rem;
  color: #4b3e3b;
  line-height: 1.6;
  white-space: pre-line;
  word-break: keep-all;
}

/* 필드 카드 */
.form-section-card {
  background: #ffffff;
  border: 1px solid #ebdcd0;
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.field-label-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 4px;
}

.field-label {
  font-size: 0.95rem;
  font-weight: 700;
  color: #2b1f1d;
}

.req {
  color: #ff4d6d;
}

.field-sub {
  font-size: 0.78rem;
  color: #8c7e7b;
}

.input-with-prefix {
  display: flex;
  align-items: center;
  border: 1.5px solid #e8ded4;
  border-radius: 12px;
  background: #fdfcfb;
  overflow: hidden;
  transition: all 0.2s;
}

.input-with-prefix:focus-within {
  border-color: #ff758f;
  box-shadow: 0 0 0 3px rgba(255, 117, 143, 0.15);
}

.prefix {
  padding: 0 12px;
  font-weight: 700;
  color: #ff758f;
  font-size: 1rem;
}

.form-control.with-pref {
  border: none;
  background: transparent;
  flex: 1;
  padding-left: 0;
}

.form-control,
.form-textarea {
  width: 100%;
  border: 1.5px solid #e8ded4;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 0.92rem;
  color: #2b1f1d;
  background: #fdfcfb;
  outline: none;
  transition: all 0.2s;
}

.form-control:focus,
.form-textarea:focus {
  border-color: #ff758f;
  box-shadow: 0 0 0 3px rgba(255, 117, 143, 0.15);
  background: #ffffff;
}

/* 상품 선택 그리드 (구글 폼 재현) */
.form-products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  margin-top: 6px;
}

.form-product-item {
  border: 1.5px solid #ebdcd0;
  border-radius: 16px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #ffffff;
  transition: all 0.2s;
  cursor: pointer;
}

.form-product-item:hover {
  border-color: #ff758f;
}

.form-product-item.selected {
  border-color: #ff4d6d;
  background: #fff7f8;
  box-shadow: 0 4px 12px rgba(255, 77, 109, 0.15);
}

.item-check-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.custom-checkbox {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 2px solid #d1c5b8;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.custom-checkbox.checked {
  background: #ff4d6d;
  border-color: #ff4d6d;
}

.check-icon {
  font-size: 14px;
  color: #ffffff;
}

.form-prod-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: #2b1f1d;
  flex: 1;
}

.form-prod-img-box {
  position: relative;
  width: 100%;
  padding-top: 80%;
  background: #fdfaf6;
  border-radius: 12px;
  overflow: hidden;
}

.form-prod-img-box :deep(.product-image-swipe) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  background: transparent;
}

.form-prod-img-box :deep(.slide-img) {
  padding: 6px;
  object-fit: contain;
}

.form-prod-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 6px;
}

.form-prod-price-badge {
  position: absolute;
  bottom: 6px;
  right: 6px;
  background: rgba(43, 31, 29, 0.85);
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 6px;
  white-space: nowrap;
}

.qty-controller {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border: 1px solid #ff758f;
  border-radius: 8px;
  padding: 2px;
}

.btn-qty {
  width: 28px;
  height: 28px;
  border: none;
  background: #fff0f3;
  color: #ff4d6d;
  border-radius: 6px;
  font-weight: 800;
  font-size: 1rem;
  cursor: pointer;
}

.btn-qty:hover {
  background: #ff758f;
  color: #fff;
}

.qty-val {
  font-weight: 800;
  color: #ff4d6d;
  font-size: 0.95rem;
}

.qty-placeholder {
  text-align: center;
  padding: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  color: #8c7e7b;
  background: #f7f3ee;
  border-radius: 8px;
}

.selected-count-tag {
  background: #fff0f3;
  color: #ff4d6d;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 8px;
}

/* 📝 개별 상품 카드 내 상세 설명 (제작·핏 안내) */
.prod-details-container {
  margin-top: 4px;
}

.prod-details-card {
  background: #fff8f9;
  border: 1px solid #ffd8df;
  border-radius: 10px;
  padding: 8px 10px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 4px rgba(255, 77, 109, 0.06);
}

.prod-details-card.is-selected {
  background: #fff0f3;
  border-color: #ffb3c1;
  box-shadow: 0 2px 6px rgba(255, 77, 109, 0.12);
}

.prod-details-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.prod-details-badge {
  font-size: 0.72rem;
  font-weight: 800;
  color: #ff4d6d;
  display: flex;
  align-items: center;
  gap: 3px;
}

.btn-close-mini-details {
  border: none;
  background: transparent;
  color: #a08c87;
  font-size: 0.72rem;
  cursor: pointer;
  padding: 0 2px;
}

.prod-details-text {
  font-size: 0.75rem;
  line-height: 1.45;
  color: #5c4a45;
  white-space: pre-line;
  word-break: keep-all;
  overflow-wrap: break-word;
  margin: 0;
}

.btn-toggle-details {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: #fdf8f4;
  border: 1px dashed #e8d8cc;
  border-radius: 8px;
  padding: 4px 6px;
  font-size: 0.72rem;
  font-weight: 700;
  color: #8c7873;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-toggle-details:hover {
  background: #fff0f3;
  border-color: #ffb3c1;
  color: #ff4d6d;
}

.details-icon-mini {
  font-size: 13px;
}

/* 🧶 선택한 상품들의 맞춤제작·핏 안내 요약 카드 (요청사항 바로 위) */
.selected-details-notice-card {
  background: linear-gradient(135deg, #fff7f8 0%, #fffbf8 100%);
  border: 1.5px solid #ffccd5;
  border-radius: 18px;
  box-shadow: 0 4px 14px rgba(255, 77, 109, 0.08);
  padding: 16px;
}

.selected-details-head {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 12px;
}

.details-notice-icon {
  font-size: 1.5rem;
  background: #fff0f3;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(255, 77, 109, 0.15);
}

.details-notice-title-box {
  flex: 1;
}

.details-notice-title {
  font-size: 0.94rem;
  font-weight: 800;
  color: #2b1f1d;
  margin: 0 0 2px;
}

.details-notice-sub {
  font-size: 0.76rem;
  color: #ff4d6d;
  font-weight: 700;
  margin: 0;
  line-height: 1.35;
}

.selected-details-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.selected-detail-row {
  background: #ffffff;
  border: 1px solid #ffe3e8;
  border-radius: 12px;
  padding: 10px 12px;
}

.selected-detail-prod-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.detail-prod-badge {
  background: #ff4d6d;
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 6px;
}

.detail-prod-qty {
  font-size: 0.74rem;
  font-weight: 700;
  color: #8c7e7b;
}

.selected-detail-desc {
  font-size: 0.8rem;
  line-height: 1.5;
  color: #4a3b37;
  white-space: pre-line;
  word-break: keep-all;
  margin: 0;
}

/* 주문 확인 모달 내 상세 안내 문구 */
.c-item-details-note {
  display: block;
  font-size: 0.72rem;
  color: #ff4d6d;
  font-weight: 600;
  line-height: 1.35;
  margin-top: 3px;
  white-space: pre-line;
}

/* 배송 방식 선택 */
.shipping-options-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.shipping-radio-label {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1.5px solid #ebdcd0;
  border-radius: 12px;
  padding: 12px 14px;
  cursor: pointer;
  background: #ffffff;
  transition: all 0.2s;
}

.shipping-radio-label.active {
  border-color: #ff758f;
  background: #fff8f9;
}

.radio-input {
  accent-color: #ff4d6d;
  width: 18px;
  height: 18px;
}

.shipping-info-wrap {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.shipping-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ship-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: #2b1f1d;
}

.ship-price {
  font-size: 0.9rem;
  font-weight: 800;
  color: #ff4d6d;
}

.ship-desc {
  font-size: 0.76rem;
  color: #8c7e7b;
}

/* 입금 계좌 */
.bank-display-box {
  background: #fff8f0;
  border: 1px solid #fed7aa;
  border-radius: 14px;
  padding: 14px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.bank-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.bank-name-badge {
  background: #f97316;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
}

.bank-number {
  font-size: 1.05rem;
  font-weight: 800;
  color: #431407;
}

.bank-owner {
  font-size: 0.8rem;
  color: #9a3412;
}

.btn-copy-acc {
  background: #f97316;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
}

.depositor-input-wrap {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sub-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #6b5c58;
}

/* 하단 요약 */
.order-summary-sticky {
  background: #ffffff;
  border: 2px solid #ff758f;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 8px 24px rgba(255, 117, 143, 0.2);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  font-size: 0.92rem;
  color: #5c4e4b;
}

.summary-divider {
  height: 1px;
  background: #ebdcd0;
  margin: 4px 0;
}

.total-line {
  font-size: 1.15rem;
  font-weight: 800;
  color: #2b1f1d;
}

.total-highlight {
  color: #ff4d6d;
  font-size: 1.35rem;
}

.btn-submit-order {
  margin-top: 8px;
  padding: 16px;
  background: linear-gradient(135deg, #ff758f 0%, #ff4d6d 100%);
  color: #ffffff;
  border: none;
  border-radius: 14px;
  font-size: 1.05rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(255, 77, 109, 0.35);
  transition: all 0.2s;
}

.btn-submit-order:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 77, 109, 0.45);
}

.btn-submit-order:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* 완료 화면 스타일 */
.order-success-card {
  background: #ffffff;
  border: 1px solid #ebdcd0;
  border-radius: 24px;
  padding: 32px 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.success-header {
  text-align: center;
}

.celebrate-emoji {
  font-size: 3rem;
  display: inline-block;
}

.success-title {
  font-size: 1.45rem;
  font-weight: 800;
  color: #2b1f1d;
  margin: 8px 0 4px;
}

.success-subtitle {
  font-size: 0.88rem;
  color: #6b5c58;
  margin: 0;
}

.order-meta-box {
  background: #fbf7f2;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.85rem;
}

.meta-row {
  display: flex;
  justify-content: space-between;
}

.meta-row .label {
  color: #8c7e7b;
}

.meta-row .value {
  color: #2b1f1d;
  font-weight: 600;
  text-align: right;
}

.ordered-items-box {
  border: 1px solid #ebdcd0;
  border-radius: 16px;
  padding: 16px;
}

.sub-heading {
  font-size: 0.95rem;
  font-weight: 800;
  color: #2b1f1d;
  margin: 0 0 12px;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-img {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #ebdcd0;
}

.item-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: #2b1f1d;
}

.item-qty-price {
  font-size: 0.78rem;
  color: #8c7e7b;
}

.item-subtotal {
  font-size: 0.9rem;
  font-weight: 700;
  color: #ff4d6d;
}

.total-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #ebdcd0;
  padding-top: 12px;
  margin-top: 12px;
  font-weight: 700;
}

.final-price {
  font-size: 1.25rem;
  color: #ff4d6d;
}

.bank-deposit-card {
  background: #fff8f0;
  border: 1.5px solid #fed7aa;
  border-radius: 16px;
  padding: 16px;
}

.bank-title-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.bank-tag {
  background: #ea580c;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
}

.bank-timer {
  font-size: 0.78rem;
  color: #9a3412;
}

.bank-box-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 8px;
}

.bank-acc-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.bank-num {
  font-size: 1.15rem;
  font-weight: 800;
  color: #431407;
}

.btn-copy-lg {
  background: #ea580c;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
}

.deposit-tip {
  font-size: 0.8rem;
  color: #7c2d12;
  margin: 0;
}

.deposit-timer-notice {
  margin-top: 8px;
  padding: 8px 12px;
  background: #fef2f2;
  border: 1px solid #fee2e2;
  border-radius: 8px;
  font-size: 0.78rem;
  color: #b91c1c;
  line-height: 1.4;
}

.success-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}

.btn-kakao-receipt {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #fee500;
  color: #191919;
  border: none;
  border-radius: 14px;
  padding: 15px;
  font-size: 0.98rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(254, 229, 0, 0.4);
  transition: transform 0.2s;
}

.btn-kakao-receipt:hover {
  transform: translateY(-2px);
}

.kakao-bubble-icon {
  font-size: 1.25rem;
}

.btn-lookup {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #2b1f1d;
  color: #ffffff;
  border: none;
  border-radius: 14px;
  padding: 14px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-new-order {
  background: #ff758f;
  color: #ffffff;
  border: none;
  border-radius: 14px;
  padding: 14px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-go-home {
  text-align: center;
  color: #8c7e7b;
  font-size: 0.88rem;
  font-weight: 600;
  text-decoration: none;
  padding: 8px;
}

@media (max-width: 640px) {
  .order-page {
    padding: 12px 10px 16px;
    min-height: auto;
  }
  .order-form-card {
    gap: 12px;
  }
  .order-success-card {
    padding: 20px 16px;
    gap: 14px;
    border-radius: 18px;
  }
  .form-hero {
    padding: 18px 14px;
    border-radius: 16px;
  }
  .form-main-title {
    font-size: 1.4rem;
  }
  .form-guide-text {
    font-size: 0.84rem;
  }
  .form-section-card {
    padding: 18px 14px;
    border-radius: 16px;
  }
  .form-products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  .form-product-item {
    padding: 8px;
    gap: 6px;
    border-radius: 12px;
  }
  .form-prod-name {
    font-size: 0.78rem;
  }
  .prod-details-card {
    padding: 6px 8px;
    border-radius: 8px;
  }
  .prod-details-badge {
    font-size: 0.68rem;
  }
  .prod-details-text {
    font-size: 0.7rem;
    line-height: 1.4;
  }
  .btn-toggle-details {
    padding: 3px 5px;
    font-size: 0.68rem;
  }
  .selected-details-notice-card {
    padding: 14px 12px;
    border-radius: 14px;
  }
  .qty-controller .btn-qty {
    width: 32px;
    height: 32px;
  }
  .bank-display-box {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  .btn-copy-acc {
    width: 100%;
    padding: 10px;
    text-align: center;
  }
  .order-summary-sticky {
    padding: 16px;
    border-radius: 16px;
  }
  .btn-submit-order {
    padding: 15px;
    font-size: 0.98rem;
  }
}

/* ========================================================
   주문 최종 확인 모달 (Confirmation Modal)
   ======================================================== */
.confirm-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(43, 31, 29, 0.6);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: flex-end; /* 모바일: 바텀 시트 */
  justify-content: center;
  padding: 0;
}

@media (min-width: 641px) {
  .confirm-modal-backdrop {
    align-items: center; /* 데스크톱: 중앙 다이얼로그 */
    padding: 20px;
  }
}

.confirm-modal-sheet {
  width: 100%;
  max-width: 520px;
  max-height: 90dvh;
  background: #ffffff;
  border-top-left-radius: 28px;
  border-top-right-radius: 28px;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: sheetUp 0.26s cubic-bezier(0.16, 1, 0.3, 1);
}

@media (min-width: 641px) {
  .confirm-modal-sheet {
    border-radius: 24px;
    box-shadow: 0 20px 50px rgba(43, 31, 29, 0.25);
    animation: popModal 0.24s cubic-bezier(0.16, 1, 0.3, 1);
  }
}

@keyframes sheetUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@keyframes popModal {
  from { transform: scale(0.92); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.confirm-drag-handle {
  width: 100%;
  padding: 10px 0 4px;
  display: flex;
  justify-content: center;
  cursor: pointer;
}

.confirm-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 12px 20px 14px;
  border-bottom: 1px solid #f0e6dd;
  gap: 12px;
}

.c-badge-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.c-icon {
  font-size: 1.25rem;
}

.c-tag {
  background: #fff0f3;
  color: #ff4d6d;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 8px;
}

.c-main-title {
  margin: 0;
  font-size: 1.18rem;
  font-weight: 900;
  color: #2b1f1d;
  letter-spacing: -0.3px;
}

.c-subtitle {
  margin: 4px 0 0;
  font-size: 0.8rem;
  color: #8c7e7b;
}

.btn-close-c {
  background: #f4ede6;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #705b55;
  cursor: pointer;
}

.confirm-body {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 16px 20px;
  background: #fdfbf9;
  display: flex;
  flex-direction: column;
  gap: 12px;
  -webkit-overflow-scrolling: touch;
}

/* 요약 카드 */
.c-card {
  background: #ffffff;
  border: 1px solid #ebdcd0;
  border-radius: 16px;
  padding: 14px 16px;
}

.c-buyer-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.c-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  font-size: 0.84rem;
  gap: 10px;
}

.c-label {
  color: #8c7e7b;
  font-weight: 600;
  flex-shrink: 0;
  width: 58px;
}

.c-val {
  color: #2b1f1d;
  text-align: right;
  word-break: break-all;
}

.c-subval {
  color: #ff758f;
  font-weight: 600;
}

/* 상품 목록 */
.c-items-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px dashed #ebdcd0;
}

.c-items-title {
  font-size: 0.84rem;
  font-weight: 800;
  color: #422006;
}

.c-items-count {
  font-size: 0.76rem;
  font-weight: 700;
  background: #fff0f3;
  color: #ff4d6d;
  padding: 2px 8px;
  border-radius: 10px;
}

.c-items-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.c-item-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.c-item-thumb {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  object-fit: cover;
  background: #fbf5ee;
  border: 1px solid #ebdcd0;
}

.c-item-details {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.c-item-name {
  font-size: 0.82rem;
  font-weight: 700;
  color: #2b1f1d;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.c-item-qty {
  font-size: 0.74rem;
  color: #8c7e7b;
}

.c-item-price {
  font-size: 0.86rem;
  color: #2b1f1d;
}

/* 최종 금액 */
.c-total-box {
  background: #fff8f9;
  border: 1.5px solid #ffd4dc;
  border-radius: 16px;
  padding: 14px 16px;
}

.c-total-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.c-total-txt {
  font-size: 0.92rem;
  font-weight: 800;
  color: #4a1d24;
}

.c-total-amt {
  font-size: 1.3rem;
  font-weight: 900;
  color: #ff3366;
}

.c-deposit-info {
  margin: 0;
  font-size: 0.76rem;
  color: #8c7e7b;
  line-height: 1.45;
}

/* 주의사항 */
.c-notice-box {
  display: flex;
  gap: 8px;
  background: #fffbeb;
  border: 1px solid #fef3c7;
  border-radius: 14px;
  padding: 12px 14px;
  align-items: flex-start;
}

.c-notice-icon {
  font-size: 1.1rem;
}

.c-notice-txt {
  margin: 0;
  font-size: 0.76rem;
  color: #92400e;
  line-height: 1.5;
}

/* 하단 버튼 */
.confirm-footer {
  padding: 14px 20px max(14px, env(safe-area-inset-bottom));
  background: #ffffff;
  border-top: 1px solid #f0e6dd;
  display: flex;
  gap: 10px;
}

.btn-c-cancel {
  flex: 1;
  background: #f7f3ee;
  border: 1px solid #ebdcd0;
  color: #634d47;
  padding: 14px;
  border-radius: 14px;
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-c-cancel:hover {
  background: #ede3da;
}

.btn-c-submit {
  flex: 2;
  background: linear-gradient(135deg, #ff758f 0%, #ff4d6d 100%);
  border: none;
  color: #ffffff;
  padding: 14px;
  border-radius: 14px;
  font-size: 0.96rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(255, 77, 109, 0.4);
  transition: transform 0.15s, box-shadow 0.15s;
}

.btn-c-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(255, 77, 109, 0.5);
}

.btn-c-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
