<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useKnittingStore, type OrderItem, type RefundItem, type InquiryItem, type ProductItem, type PopupNotice } from "~/stores/useKnittingStore";
import AdminOrderEditModal from "~/components/AdminOrderEditModal.vue";
import AdminProductModal from "~/components/AdminProductModal.vue";
import UserNoticeModal from "~/components/UserNoticeModal.vue";

const router = useRouter();
const store = useKnittingStore();

// 주문서 & 맞춤 사진 수정 모달 상태
const isOrderEditModalOpen = ref(false);
const editingOrder = ref<OrderItem | null>(null);

const openOrderEditModal = (order: OrderItem) => {
  editingOrder.value = order;
  isOrderEditModalOpen.value = true;
};

// 🛍️ 주문서 상품(카탈로그) 등록 & 수정 모달 상태
const isProductModalOpen = ref(false);
const selectedProductToEdit = ref<ProductItem | null>(null);

const openAddProductModal = () => {
  selectedProductToEdit.value = null;
  isProductModalOpen.value = true;
};

const openEditProductModal = (prod: ProductItem) => {
  selectedProductToEdit.value = prod;
  isProductModalOpen.value = true;
};

const handleDeleteProduct = (productId: string) => {
  store.deleteProduct(productId);
};

const handleResetProducts = () => {
  store.resetProductsToDefault();
};

// 탭: 'orders' | 'products' | 'notices' | 'popups' | 'refunds' | 'inquiries' | 'reviews' | 'settings' (스토어와 양방향 연동)
const currentTab = computed({
  get: () => store.adminActiveTab,
  set: (val: "orders" | "products" | "notices" | "popups" | "refunds" | "inquiries" | "reviews" | "settings") => {
    store.switchAdminTab(val);
  },
});

// 📢 공지 & 주문안내 관리 폼 상태 (이미지 2~5번)
const noticesForm = ref({
  noticeContent: "",
  shippingContent: "",
  cautionContent: "",
  washingContent: "",
  shopIntro: "",
  instagramId: "",
  makingPeriod: "",
  courierInfo: "",
  bankName: "카카오뱅크",
  accountNumber: "3333-12-8924018",
  accountHolder: "전혜빈",
});

const syncNoticesForm = () => {
  noticesForm.value = {
    noticeContent: store.siteNotices.noticeContent,
    shippingContent: store.siteNotices.shippingContent,
    cautionContent: store.siteNotices.cautionContent,
    washingContent: store.siteNotices.washingContent,
    shopIntro: store.siteNotices.shopIntro,
    instagramId: store.siteNotices.instagramId,
    makingPeriod: store.siteNotices.makingPeriod,
    courierInfo: store.siteNotices.courierInfo,
    bankName: store.settings.bankName || "카카오뱅크",
    accountNumber: store.settings.accountNumber || "3333-12-8924018",
    accountHolder: store.settings.accountHolder || "전혜빈",
  };
};

// 공지 & 주문안내 저장 핸들러
const saveSiteNotices = () => {
  store.updateSiteNotices({
    noticeContent: noticesForm.value.noticeContent.trim(),
    shippingContent: noticesForm.value.shippingContent.trim(),
    cautionContent: noticesForm.value.cautionContent.trim(),
    washingContent: noticesForm.value.washingContent.trim(),
    shopIntro: noticesForm.value.shopIntro.trim(),
    instagramId: noticesForm.value.instagramId.trim(),
    makingPeriod: noticesForm.value.makingPeriod.trim(),
    courierInfo: noticesForm.value.courierInfo.trim(),
  });

  // 공식 계좌 정보도 함께 동기화
  store.updateAdminSettings({
    bankName: noticesForm.value.bankName.trim(),
    accountNumber: noticesForm.value.accountNumber.trim(),
    accountHolder: noticesForm.value.accountHolder.trim(),
  });

  store.showAlert("📢 공지사항 및 주문 안내 문구가 성공적으로 저장되었습니다!\n홈페이지, 주문서 작성 페이지, 푸터에 실시간으로 즉시 반영되었습니다. ✨", {
    title: "공지 & 주문안내 저장 완료",
    type: "success",
  });
};

// 기본 공지 문구 복원
const handleResetNotices = () => {
  store.resetSiteNoticesToDefault();
  syncNoticesForm();
};

// 🌟 사용자 팝업 안내 & 신상품 안내 관리 폼 상태
const popupForm = ref<PopupNotice>({
  isActive: true,
  type: "product",
  targetProductId: "apple",
  badgeText: "NEW 신상품 출시 안내",
  title: "2026 앉은누이 귀여운 신상 컬렉션 오픈!",
  content: `동글동글 귀여운 인형 친구들을 위한 맞춤 사과 뜨개옷이 새롭게 출시되었습니다!
100% 핸드메이드 정성으로 한 땀 한 땀 제작되는 맞춤 뜨개옷을 지금 바로 주문서에서 만나보세요 ✨`,
  imageUrl: "/images/products/apple.jpg",
  isAlways: true,
  startDate: "2026-11-01T00:00",
  endDate: "2026-12-31T23:59",
  actionButtonText: "신상품 바로 보러가기",
  showActionButton: true,
});

const selectedTargetProduct = computed(() => {
  if (!popupForm.value.targetProductId) return null;
  return store.products.find((p) => p.id === popupForm.value.targetProductId) || null;
});

const syncPopupForm = () => {
  if (store.popupNotice) {
    popupForm.value = { ...store.popupNotice };
  }
};

watch(
  () => store.popupNotice,
  () => {
    syncPopupForm();
  },
  { immediate: true, deep: true }
);

// 신상품 타겟 변경 시 이미지 및 버튼명 자동 동기화
const handlePopupProductSelect = () => {
  if (popupForm.value.type === "product" && popupForm.value.targetProductId) {
    const found = store.products.find((p) => p.id === popupForm.value.targetProductId);
    if (found) {
      popupForm.value.imageUrl = found.image || (found.images && found.images[0]) || "";
      popupForm.value.actionButtonText = `${found.name} 바로 보러가기`;
    }
  }
};

// 팝업 설정 저장
const savePopupNoticeSettings = () => {
  const sanitizeLeadingEmoji = (str: string) =>
    (str || "").replace(/^[\s\p{Extended_Pictographic}\u200d\ufe0f🍎🧶📢🌟🛒🛍️👉✨]+/u, "").trim();

  store.updatePopupNotice({
    isActive: popupForm.value.isActive,
    type: popupForm.value.type,
    targetProductId: popupForm.value.targetProductId,
    badgeText: sanitizeLeadingEmoji(popupForm.value.badgeText),
    title: popupForm.value.title.trim(),
    content: popupForm.value.content.trim(),
    imageUrl: popupForm.value.imageUrl.trim(),
    isAlways: popupForm.value.isAlways,
    startDate: popupForm.value.startDate,
    endDate: popupForm.value.endDate,
    actionButtonText: sanitizeLeadingEmoji(popupForm.value.actionButtonText),
    showActionButton: popupForm.value.showActionButton,
  });

  store.showAlert("🌟 사용자 팝업 안내 설정이 성공적으로 저장되었습니다!\n방문자가 사이트 접속 시 설정된 기간과 조건에 따라 모달이 노출됩니다. ✨", {
    title: "팝업 안내 설정 저장 완료",
    type: "success",
  });
};

// 팝업 기본 설정 복원
const handleResetPopupNotice = () => {
  store.resetPopupNoticeToDefault();
  syncPopupForm();
};

// 팝업 실시간 미리보기 모달 열기
const openPopupPreview = () => {
  store.popupNotice = { ...popupForm.value };
  store.isUserNoticeModalOpen = true;
};

// 관리자 메뉴/탭 선택 시 해당 콘텐츠 영역으로 부드럽게 자동 스크롤 이동
const scrollToContent = () => {
  if (typeof window === "undefined") return;
  nextTick(() => {
    const el = document.getElementById("admin-content-panel");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
};

watch(
  () => store.adminActiveTab,
  () => {
    scrollToContent();
  }
);

watch(
  () => store.adminScrollTrigger,
  () => {
    scrollToContent();
  }
);

// 주문 필터
const orderStatusFilter = ref<string>("all");
const orderSearchQuery = ref<string>("");

// 환불 필터
const refundStatusFilter = ref<string>("all");

// 문의 필터
const inquiryStatusFilter = ref<string>("all");

// 운송장 번호 입력 임시 상태
const trackingInputs = ref<Record<string, string>>({});

// 관리자 답변/메모 임시 상태
const replyInputs = ref<Record<string, string>>({});

// 계좌 & 알림 설정 폼
const settingsForm = ref({
  soundAlertEnabled: true,
  browserNotificationEnabled: true,
  // 카카오톡 알림
  kakaoAlertEnabled: true,
  kakaoAccessToken: "",
  kakaoJsKey: "",
  kakaoNotifyOrder: true,
  kakaoNotifyRefund: true,
  kakaoNotifyReview: true,
  kakaoNotifyInquiry: true,
  // 공식 계좌
  bankName: "카카오뱅크",
  accountNumber: "",
  accountHolder: "",
});

// 🔐 관리자 비밀번호 변경 폼
const pwForm = ref({
  currentPassword: "",
  newPassword: "",
  newPasswordConfirm: "",
  showPassword: false,
});

onMounted(() => {
  store.loadFromLocalStorage();
  if (!store.isAdminLoggedIn) {
    router.push("/admin/login");
    return;
  }

  // 기존 설정값 폼에 주입
  settingsForm.value = {
    soundAlertEnabled: store.settings.soundAlertEnabled ?? true,
    browserNotificationEnabled: store.settings.browserNotificationEnabled ?? true,
    kakaoAlertEnabled: store.settings.kakaoAlertEnabled ?? true,
    kakaoAccessToken: store.settings.kakaoAccessToken || "",
    kakaoJsKey: store.settings.kakaoJsKey || "",
    kakaoNotifyOrder: store.settings.kakaoNotifyOrder ?? true,
    kakaoNotifyRefund: store.settings.kakaoNotifyRefund ?? true,
    kakaoNotifyReview: store.settings.kakaoNotifyReview ?? true,
    kakaoNotifyInquiry: store.settings.kakaoNotifyInquiry ?? true,
    bankName: store.settings.bankName || "카카오뱅크",
    accountNumber: store.settings.accountNumber || "3333-12-8924018",
    accountHolder: store.settings.accountHolder || "전혜빈",
  };

  // 운송장 번호 초깃값 세팅
  store.orders.forEach((o) => {
    if (o.trackingNumber) {
      trackingInputs.value[o.id] = o.trackingNumber;
    }
  });

  // 문의 메모 초깃값 세팅
  store.inquiries.forEach((inq) => {
    if (inq.adminReply) {
      replyInputs.value[inq.id] = inq.adminReply;
    }
  });

  // 📢 공지 & 주문안내 문구 폼 주입
  syncNoticesForm();
});

// 주문 필터링
const filteredOrders = computed(() => {
  return store.orders.filter((order) => {
    if (orderStatusFilter.value !== "all" && order.status !== orderStatusFilter.value) {
      return false;
    }
    const q = orderSearchQuery.value.trim().toLowerCase();
    if (!q) return true;
    return (
      order.id.toLowerCase().includes(q) ||
      order.buyerName.toLowerCase().includes(q) ||
      order.instagramId.toLowerCase().includes(q) ||
      order.phone.includes(q) ||
      order.address.toLowerCase().includes(q)
    );
  });
});

// 환불 필터링
const filteredRefunds = computed(() => {
  return store.refunds.filter((ref) => {
    if (refundStatusFilter.value !== "all" && ref.status !== refundStatusFilter.value) {
      return false;
    }
    return true;
  });
});

// 문의 필터링
const filteredInquiries = computed(() => {
  return store.inquiries.filter((inq) => {
    if (inquiryStatusFilter.value !== "all" && inq.status !== inquiryStatusFilter.value) {
      return false;
    }
    return true;
  });
});

// 주문 상태 변경
const changeOrderStatus = (orderId: string, newStatus: OrderItem["status"]) => {
  const tracking = trackingInputs.value[orderId] || undefined;
  store.updateOrderStatus(orderId, newStatus, tracking);
  store.showToast(`주문 상태가 '${store.getStatusLabel(newStatus)}'(으)로 변경되었습니다.`, "success");
};

// 운송장 번호 저장
const saveTrackingNumber = (orderId: string) => {
  const tracking = trackingInputs.value[orderId]?.trim() || "";
  store.updateOrderStatus(orderId, "shipping", tracking, `운송장 등록 완료: ${tracking}`);
  store.showToast(`운송장번호(${tracking})가 저장되고 배송 중으로 전환되었습니다.`, "success");
};

// 주소 복사
const copyText = (text: string, label: string) => {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    navigator.clipboard.writeText(text);
    store.showToast(`${label}이(가) 복사되었습니다: ${text}`, "success");
  }
};

// 환불 처리
const handleRefundAction = (refundId: string, status: RefundItem["status"]) => {
  store.updateRefundStatus(refundId, status);
  store.showToast(`환불 요청이 '${status === "completed" ? "환불 완료" : "반려"}' 처리되었습니다.`, "success");
};

// 문의 상태 토글 & 메모 저장
const saveInquiryReply = (inquiryId: string) => {
  const reply = replyInputs.value[inquiryId] || "";
  store.updateInquiryStatus(inquiryId, reply ? "answered" : "read", reply);
  store.showToast("답변 및 처리 메모가 저장되었습니다. ✨", "success");
};

// 카카오톡 테스트 알림 전송
const isTestingKakao = ref(false);
const testKakaoTalk = async () => {
  if (!settingsForm.value.kakaoAccessToken.trim()) {
    store.showAlert("카카오 액세스 토큰을 먼저 입력하거나 '카카오 로그인으로 연동'을 진행해 주세요!", {
      title: "카카오 연동 필요",
      type: "warning",
    });
    return;
  }
  isTestingKakao.value = true;
  store.updateAdminSettings({
    kakaoAlertEnabled: true,
    kakaoAccessToken: settingsForm.value.kakaoAccessToken.trim(),
  });

  const res = await store.sendKakaoTalkMessage(
    "🔔 [뜨개공방 카카오톡 테스트 알림]\n\n관리자 카카오톡 실시간 연동이 정상 작동합니다! 💛\n새 주문, 환불 요청, 새 리뷰, 고객 문의가 접수되면 이 채팅방으로 즉시 카톡 알림이 도착합니다."
  );

  isTestingKakao.value = false;
  if (res.success) {
    store.showAlert("🎉 관리자 카카오톡('나와의 채팅')으로 테스트 알림이 발송되었습니다! 카카오톡 앱을 확인해보세요.", {
      title: "카톡 알림 발송 성공",
      type: "success",
    });
  } else {
    store.showAlert(`카카오톡 발송 실패:\n${res.reason}\n\n* 토큰 유효기간 또는 '카카오톡 메시지 전송(talk_message)' 권한 설정을 확인해주세요.`, {
      title: "카톡 발송 실패",
      type: "error",
    });
  }
};

// 카카오 SDK 로그인 연동
const loginWithKakaoSdk = () => {
  const kakao = typeof window !== "undefined" ? (window as any).Kakao : null;
  if (!kakao) {
    store.showAlert("카카오 SDK 로딩 중입니다. 잠시 후 다시 시도해 주세요.", { type: "warning" });
    return;
  }
  const appKey = settingsForm.value.kakaoJsKey?.trim() || "539e6a00f074d209172922dd81d3f9b2";
  if (!kakao.isInitialized()) {
    try {
      kakao.init(appKey);
    } catch (e) {
      console.warn("Kakao init warning:", e);
    }
  }

  if (typeof kakao.Auth?.login === "function") {
    kakao.Auth.login({
      scope: "talk_message",
      success: function (authObj: any) {
        if (authObj.access_token) {
          settingsForm.value.kakaoAccessToken = authObj.access_token;
          store.updateAdminSettings({
            kakaoAccessToken: authObj.access_token,
            kakaoAlertEnabled: true,
          });
          store.showAlert("💛 카카오톡 로그인이 성공적으로 완료되었습니다!\n이제 '내 카톡으로 테스트 알림 보내기'를 눌러 확인해보세요.", {
            title: "카카오 로그인 완료",
            type: "success",
          });
        }
      },
      fail: function (err: any) {
        store.showAlert("카카오 로그인 취소 또는 오류:\n" + (err?.error_description || JSON.stringify(err)), {
          title: "로그인 오류",
          type: "error",
        });
      },
    });
  } else if (typeof kakao.Auth?.authorize === "function") {
    // SDK v2일 경우 리다이렉트 로그인 지원
    kakao.Auth.authorize({
      redirectUri: window.location.href.split("#")[0].split("?")[0],
      scope: "talk_message",
    });
  } else {
    store.showAlert("카카오 인증 모듈이 준비 중입니다. 잠시 후 다시 시도해 주시거나 아래 가이드에 따라 발급받으신 토큰을 입력창에 넣어주세요.", {
      type: "warning",
      title: "알림",
    });
  }
};

// 알림음 및 진동 테스트
const testNotificationSound = () => {
  store.playChimeSound();
  store.triggerVibration();
  store.showToast("🔔 띵동! 크리스탈 차임벨과 진동이 울렸습니다.", "info");
};

// 계좌 및 알림 설정 저장
const saveSettings = () => {
  const payload: any = {
    soundAlertEnabled: settingsForm.value.soundAlertEnabled,
    browserNotificationEnabled: settingsForm.value.browserNotificationEnabled,
    kakaoAlertEnabled: settingsForm.value.kakaoAlertEnabled,
    kakaoAccessToken: settingsForm.value.kakaoAccessToken.trim(),
    kakaoJsKey: settingsForm.value.kakaoJsKey.trim(),
    kakaoNotifyOrder: settingsForm.value.kakaoNotifyOrder,
    kakaoNotifyRefund: settingsForm.value.kakaoNotifyRefund,
    kakaoNotifyReview: settingsForm.value.kakaoNotifyReview,
    kakaoNotifyInquiry: settingsForm.value.kakaoNotifyInquiry,
    bankName: settingsForm.value.bankName.trim(),
    accountNumber: settingsForm.value.accountNumber.trim(),
    accountHolder: settingsForm.value.accountHolder.trim(),
  };

  store.updateAdminSettings(payload);
  store.showAlert("카카오톡 알림 및 계좌 설정이 안전하게 저장되었습니다!", {
    title: "설정 저장 완료",
    type: "success",
  });
};

// 🔐 관리자 비밀번호 변경
const handleChangePassword = () => {
  if (!pwForm.value.currentPassword) {
    store.showAlert("현재 관리자 비밀번호를 입력해주세요.", {
      title: "비밀번호 변경 안내",
      type: "warning",
    });
    return;
  }

  if (!store.verifyAdminPassword(pwForm.value.currentPassword)) {
    store.showAlert("현재 비밀번호가 일치하지 않습니다. 다시 확인해주세요.", {
      title: "비밀번호 불일치",
      type: "warning",
    });
    return;
  }

  if (!pwForm.value.newPassword || pwForm.value.newPassword.trim().length < 4) {
    store.showAlert("새 비밀번호는 최소 4자 이상 입력해주세요.", {
      title: "비밀번호 자릿수 오류",
      type: "warning",
    });
    return;
  }

  if (pwForm.value.newPassword !== pwForm.value.newPasswordConfirm) {
    store.showAlert("새 비밀번호와 확인 입력이 일치하지 않습니다. 다시 확인해주세요.", {
      title: "비밀번호 확인 불일치",
      type: "warning",
    });
    return;
  }

  if (pwForm.value.newPassword === pwForm.value.currentPassword) {
    store.showAlert("기존 비밀번호와 동일합니다. 다른 새로운 비밀번호를 입력해주세요.", {
      title: "비밀번호 변경 안내",
      type: "warning",
    });
    return;
  }

  const success = store.changeAdminPassword(pwForm.value.newPassword);
  if (success) {
    pwForm.value.currentPassword = "";
    pwForm.value.newPassword = "";
    pwForm.value.newPasswordConfirm = "";

    store.showAlert("관리자 비밀번호가 성공적으로 변경되었습니다! 🔐\n다음 로그인 시 변경된 새 비밀번호로 접속해주세요.", {
      title: "비밀번호 변경 완료",
      type: "success",
    });
  }
};

// 로그아웃
const handleLogout = () => {
  store.logoutAdmin();
  router.push("/admin/login");
};
</script>

<template>
  <div class="admin-dashboard-page">
    <div class="admin-container">
      <!-- 상단 헤더 바 -->
      <div class="admin-topbar">
        <div class="topbar-left">
          <span class="admin-badge">ADMIN CENTER</span>
          <h1 class="admin-title">뜨개옷 공방 관리자 대시보드</h1>
          <div class="live-monitor-pill">
            <span class="live-dot"></span>
            <span class="live-text">실시간 새 주문 감지 중 (자동 소리+진동 대기)</span>
          </div>
        </div>

        <div class="topbar-right">
          <!-- 🔔 실시간 알림 모달 열기 버튼 -->
          <button class="btn-open-notif-modal" @click="store.isNotificationModalOpen = true" title="실시간 알림 모달 열기">
            <i class="material-icons btn-bell-icon">notifications</i>
            <span class="btn-text">실시간 알림</span>
            <span v-if="store.unreadNotificationCount > 0" class="admin-notif-badge">
              {{ store.unreadNotificationCount }}
            </span>
          </button>

          <!-- 알림음 테스트 버튼 -->
          <button class="btn-test-sound" @click="testNotificationSound" title="주문 알림음 및 진동 테스트">
            <i class="material-icons">notifications_active</i>
            <span class="btn-text">소리·진동 테스트</span>
          </button>

          <!-- 상점 이동 버튼 -->
          <nuxt-link to="/" class="btn-nav-site" title="구매자 상점 페이지로 이동">
            <i class="material-icons">storefront</i>
            <span class="btn-text">상점 둘러보기</span>
          </nuxt-link>

          <!-- 로그아웃 버튼 -->
          <button class="btn-logout" @click="handleLogout" title="관리자 로그아웃">
            <i class="material-icons">logout</i>
            <span class="btn-text">로그아웃</span>
          </button>
        </div>
      </div>

      <!-- 상단 KPI 지표 요약 카드 그리드 (클릭 시 해당 탭 & 상태로 즉시 필터 이동) -->
      <div class="kpi-grid">
        <div class="kpi-card" @click="currentTab = 'orders'; orderStatusFilter = 'all'" title="전체 주문 보기">
          <div class="kpi-icon bg-pink">🛍️</div>
          <div class="kpi-content">
            <span class="kpi-label">전체 주문</span>
            <span class="kpi-value font-mono">{{ store.orders.length }}건</span>
          </div>
        </div>

        <div class="kpi-card" @click="currentTab = 'orders'; orderStatusFilter = 'pending'" title="입금 대기 주문 필터">
          <div class="kpi-icon bg-amber">⏳</div>
          <div class="kpi-content">
            <span class="kpi-label">입금 대기</span>
            <span class="kpi-value font-mono text-amber">{{ store.pendingCount }}건</span>
          </div>
        </div>

        <div class="kpi-card" @click="currentTab = 'orders'; orderStatusFilter = 'making'" title="제작/준비 중 주문 필터">
          <div class="kpi-icon bg-blue">🧶</div>
          <div class="kpi-content">
            <span class="kpi-label">제작 / 준비 중</span>
            <span class="kpi-value font-mono text-blue">{{ store.paidCount + store.makingCount }}건</span>
          </div>
        </div>

        <div class="kpi-card" @click="currentTab = 'orders'; orderStatusFilter = 'shipping'" title="배송 중/완료 주문 필터">
          <div class="kpi-icon bg-purple">🚚</div>
          <div class="kpi-content">
            <span class="kpi-label">배송 중 / 완료</span>
            <span class="kpi-value font-mono text-purple">{{ store.shippingCount + store.completedCount }}건</span>
          </div>
        </div>

        <div class="kpi-card" :class="{ alert: store.pendingRefundsCount > 0 }" @click="currentTab = 'refunds'; refundStatusFilter = 'requested'" title="환불 요청 관리">
          <div class="kpi-icon bg-red">💸</div>
          <div class="kpi-content">
            <span class="kpi-label">환불 요청</span>
            <span class="kpi-value font-mono text-red">{{ store.pendingRefundsCount }}건</span>
          </div>
        </div>

        <div class="kpi-card" :class="{ alert: store.unreadInquiriesCount > 0 }" @click="currentTab = 'inquiries'; inquiryStatusFilter = 'unread'" title="고객 의견/문의 관리">
          <div class="kpi-icon bg-green">💌</div>
          <div class="kpi-content">
            <span class="kpi-label">신규 문의/의견</span>
            <span class="kpi-value font-mono text-green">{{ store.unreadInquiriesCount }}건</span>
          </div>
        </div>
      </div>

      <!-- 탭 네비게이션 -->
      <div id="admin-content-panel" class="admin-tabs">
        <button
          class="tab-btn"
          :class="{ active: currentTab === 'orders' }"
          @click="currentTab = 'orders'"
        >
          <i class="material-icons">receipt_long</i>
          <span>주문 관리</span>
          <span class="tab-badge">{{ store.orders.length }}</span>
        </button>

        <button
          class="tab-btn"
          :class="{ active: currentTab === 'products' }"
          @click="currentTab = 'products'"
        >
          <i class="material-icons">checkroom</i>
          <span>주문서 상품 관리</span>
          <span class="tab-badge">{{ store.products.length }}</span>
        </button>

        <!-- 📢 신규 메뉴: 공지 & 주문안내 관리 (2~5번 이미지) -->
        <button
          class="tab-btn"
          :class="{ active: currentTab === 'notices' }"
          @click="currentTab = 'notices'"
        >
          <i class="material-icons">campaign</i>
          <span>공지 & 주문안내</span>
          <span class="tab-badge">4건</span>
        </button>

        <!-- 🌟 신규 메뉴: 팝업 공지 & 신상품 안내 관리 -->
        <button
          class="tab-btn"
          :class="{ active: currentTab === 'popups' }"
          @click="currentTab = 'popups'"
        >
          <i class="material-icons">auto_awesome</i>
          <span>사용자 팝업 안내</span>
          <span v-if="store.popupNotice.isActive" class="tab-badge bg-badge-pink">ON</span>
        </button>

        <button
          class="tab-btn"
          :class="{ active: currentTab === 'refunds' }"
          @click="currentTab = 'refunds'"
        >
          <i class="material-icons">published_with_changes</i>
          <span>환불 관리</span>
          <span v-if="store.pendingRefundsCount > 0" class="tab-badge bg-red">{{ store.pendingRefundsCount }}</span>
        </button>

        <button
          class="tab-btn"
          :class="{ active: currentTab === 'inquiries' }"
          @click="currentTab = 'inquiries'"
        >
          <i class="material-icons">support_agent</i>
          <span>고객 문의</span>
          <span v-if="store.unreadInquiriesCount > 0" class="tab-badge bg-green">{{ store.unreadInquiriesCount }}</span>
        </button>

        <button
          class="tab-btn"
          :class="{ active: currentTab === 'reviews' }"
          @click="currentTab = 'reviews'"
        >
          <i class="material-icons">photo_camera</i>
          <span>리뷰 관리</span>
          <span class="tab-badge">{{ store.reviews.length }}</span>
        </button>

        <button
          class="tab-btn"
          :class="{ active: currentTab === 'settings' }"
          @click="currentTab = 'settings'"
        >
          <i class="material-icons">tune</i>
          <span>알림 & 상점 설정</span>
        </button>
      </div>

      <!-- 탭 1: 구매 (주문) 관리 -->
      <div v-if="currentTab === 'orders'" class="tab-panel">
        <div class="panel-header">
          <!-- 필터 칩들 -->
          <div class="filter-chips">
            <button
              class="chip"
              :class="{ active: orderStatusFilter === 'all' }"
              @click="orderStatusFilter = 'all'"
            >
              전체 ({{ store.orders.length }})
            </button>
            <button
              class="chip"
              :class="{ active: orderStatusFilter === 'pending' }"
              @click="orderStatusFilter = 'pending'"
            >
              입금대기 ({{ store.pendingCount }})
            </button>
            <button
              class="chip"
              :class="{ active: orderStatusFilter === 'paid' }"
              @click="orderStatusFilter = 'paid'"
            >
              입금확인 ({{ store.paidCount }})
            </button>
            <button
              class="chip"
              :class="{ active: orderStatusFilter === 'making' }"
              @click="orderStatusFilter = 'making'"
            >
              제작중 ({{ store.makingCount }})
            </button>
            <button
              class="chip"
              :class="{ active: orderStatusFilter === 'shipping' }"
              @click="orderStatusFilter = 'shipping'"
            >
              배송중 ({{ store.shippingCount }})
            </button>
            <button
              class="chip"
              :class="{ active: orderStatusFilter === 'completed' }"
              @click="orderStatusFilter = 'completed'"
            >
              배송완료 ({{ store.completedCount }})
            </button>
            <button
              class="chip"
              :class="{ active: orderStatusFilter === 'cancelled' }"
              @click="orderStatusFilter = 'cancelled'"
            >
              취소/환불
            </button>
          </div>

          <!-- 검색창 -->
          <div class="search-box">
            <i class="material-icons">search</i>
            <input
              v-model="orderSearchQuery"
              type="text"
              placeholder="주문자명, 인스타ID, 연락처, 주문번호 검색"
              class="search-inp"
            />
          </div>
        </div>

        <!-- 주문 목록 -->
        <div v-if="filteredOrders.length === 0" class="empty-list-box">
          <span class="empty-icon">📦</span>
          <p class="empty-txt">해당 조건의 주문 내역이 없습니다.</p>
        </div>

        <div v-else class="orders-list">
          <div v-for="order in filteredOrders" :key="order.id" class="admin-order-card">
            <!-- 상단 바 -->
            <div class="order-top">
              <div class="order-id-group">
                <span class="order-id-txt font-mono">{{ order.id }}</span>
                <span class="order-time">{{ order.createdAt }}</span>
              </div>
              <div class="order-top-right">
                <span class="status-pill" :style="{ backgroundColor: store.getStatusColor(order.status) }">
                  {{ store.getStatusLabel(order.status) }}
                </span>
                <button
                  type="button"
                  class="btn-order-edit-top"
                  @click="openOrderEditModal(order)"
                  title="주문서 및 맞춤 사진 수정"
                >
                  <i class="material-icons">edit</i>
                  <span>주문서/사진 수정</span>
                </button>
              </div>
            </div>

            <!-- 맞춤제작 / 주문 첨부 사진 (등록되어 있을 때) -->
            <div v-if="order.customImage" class="order-attached-photo-banner">
              <div class="photo-banner-head">
                <span class="photo-banner-badge">📸 맞춤제작 / 주문 첨부 사진</span>
                <button
                  type="button"
                  class="btn-photo-quick-edit"
                  @click="openOrderEditModal(order)"
                  title="사진 수정하기"
                >
                  사진 변경
                </button>
              </div>
              <div class="photo-banner-body" @click="store.previewImageUrl = order.customImage">
                <img :src="order.customImage" alt="주문 첨부 사진" class="order-photo-img" />
                <span class="photo-zoom-tag">🔍 클릭 시 원본 확대</span>
              </div>
            </div>

            <!-- 주문자 정보 그리드 -->
            <div class="order-grid">
              <!-- 고객 정보 -->
              <div class="info-sec">
                <h4 class="sec-title">👤 주문자 정보</h4>
                <div class="info-row">
                  <span class="lbl">성함</span>
                  <span class="val font-bold">{{ order.buyerName }}</span>
                </div>
                <div class="info-row">
                  <span class="lbl">인스타그램</span>
                  <a
                    :href="'https://instagram.com/' + order.instagramId"
                    target="_blank"
                    rel="noopener"
                    class="val text-pink font-bold insta-link"
                    title="인스타그램 방문"
                  >
                    @{{ order.instagramId }} ↗
                  </a>
                </div>
                <div class="info-row">
                  <span class="lbl">연락처</span>
                  <span class="val font-mono contact-val">
                    {{ order.phone }}
                    <a :href="'tel:' + order.phone" class="btn-mini-call" title="전화 걸기">📞 통화</a>
                  </span>
                </div>
                <div class="info-row">
                  <span class="lbl">입금자명</span>
                  <span class="val">{{ order.depositorName || order.buyerName }}</span>
                </div>
              </div>

              <!-- 배송 정보 -->
              <div class="info-sec">
                <h4 class="sec-title">🚚 배송 정보</h4>
                <div class="info-row">
                  <span class="lbl">배송방식</span>
                  <span class="val font-bold">{{ order.shippingType }} ({{ order.shippingCost.toLocaleString() }}원)</span>
                </div>
                <div class="info-row">
                  <span class="lbl">배송지</span>
                  <span class="val">
                    {{ order.address }}
                    <button class="btn-mini-copy" @click="copyText(order.address, '배송지 주소')">주소 복사</button>
                  </span>
                </div>
                <div class="info-row" v-if="order.memo">
                  <span class="lbl">요청메모</span>
                  <span class="val memo-val">{{ order.memo }}</span>
                </div>
                <div class="info-row admin-note-row" v-if="order.adminNotes">
                  <span class="lbl">관리자메모</span>
                  <span class="val admin-note-val">{{ order.adminNotes }}</span>
                </div>
              </div>

              <!-- 주문 상품 목록 -->
              <div class="info-sec items-sec">
                <h4 class="sec-title">🧶 주문 상품 구성</h4>
                <div class="items-grid">
                  <div v-for="item in order.items" :key="item.productId" class="order-item-badge">
                    <img :src="item.image" :alt="item.productName" class="item-img-mini" />
                    <div class="item-meta">
                      <span class="item-title">{{ item.productName }}</span>
                      <span class="item-price-qty">{{ item.price.toLocaleString() }}원 × {{ item.quantity }}개</span>
                    </div>
                  </div>
                </div>
                <div class="total-bar">
                  <span>총 결제금액</span>
                  <span class="total-amt font-mono">{{ order.totalAmount.toLocaleString() }}원</span>
                </div>
              </div>
            </div>

            <!-- 운송장 번호 입력 & 하단 액션 버튼 -->
            <div class="order-bottom-bar">
              <div class="tracking-input-group">
                <label class="tracking-lbl">운송장 번호:</label>
                <input
                  v-model="trackingInputs[order.id]"
                  type="text"
                  placeholder="운송장 번호 입력"
                  class="tracking-inp font-mono"
                />
                <button class="btn-save-track" @click="saveTrackingNumber(order.id)">
                  저장 & 배송중 전환
                </button>
              </div>

              <!-- 빠른 상태 변경 버튼 그룹 -->
              <div class="status-btn-group">
                <button
                  v-if="order.status === 'pending'"
                  class="btn-status bg-blue"
                  @click="changeOrderStatus(order.id, 'paid')"
                >
                  ✓ 입금 확인
                </button>
                <button
                  v-if="['pending', 'paid'].includes(order.status)"
                  class="btn-status bg-pink"
                  @click="changeOrderStatus(order.id, 'making')"
                >
                  🧶 제작 시작
                </button>
                <button
                  v-if="['paid', 'making'].includes(order.status)"
                  class="btn-status bg-purple"
                  @click="changeOrderStatus(order.id, 'shipping')"
                >
                  🚚 배송 출발
                </button>
                <button
                  v-if="order.status === 'shipping'"
                  class="btn-status bg-green"
                  @click="changeOrderStatus(order.id, 'completed')"
                >
                  ✨ 배송 완료
                </button>
                <button
                  v-if="order.status !== 'cancelled'"
                  class="btn-status bg-gray"
                  @click="changeOrderStatus(order.id, 'cancelled')"
                >
                  주문 취소
                </button>
                <button
                  type="button"
                  class="btn-status bg-pink-light btn-order-edit"
                  @click="openOrderEditModal(order)"
                  title="주문서 상세 정보 및 맞춤 사진 수정"
                >
                  ✏️ 주문서/사진 수정
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 탭: 주문서 상품 (카탈로그) 관리 -->
      <div v-if="currentTab === 'products'" class="tab-panel">
        <div class="panel-header products-panel-header">
          <div class="panel-header-titles">
            <h3 class="panel-title">🧶 주문서 상품 (카탈로그) 목록 관리</h3>
            <p class="panel-desc">
              홈페이지 카탈로그 및 주문서 페이지에 노출되는 뜨개옷 상품의 사진, 이름, 가격, 태그를 실시간으로 추가·수정할 수 있습니다.
            </p>
          </div>

          <div class="panel-header-actions">
            <button
              type="button"
              class="btn-reset-prods"
              @click="handleResetProducts"
              title="초기 기본 9개 상품으로 복구"
            >
              <i class="material-icons">restart_alt</i>
              <span>기본 상품 복원</span>
            </button>
            <button
              type="button"
              class="btn-add-new-prod"
              @click="openAddProductModal"
              title="새 주문서 상품 추가"
            >
              <i class="material-icons">add</i>
              <span>새 상품 등록</span>
            </button>
          </div>
        </div>

        <!-- 상품 목록 그리드 (2번 이미지와 100% 일치하는 카드 레이아웃) -->
        <div class="admin-products-grid">
          <div
            v-for="prod in store.products"
            :key="prod.id"
            class="admin-prod-card"
          >
            <!-- 상품 썸네일 & 뱃지 -->
            <div class="prod-card-thumb-wrap" @click="openEditProductModal(prod)">
              <img :src="prod.image" :alt="prod.name" class="prod-card-thumb" />
              <span
                class="prod-badge-tag"
                :style="{ backgroundColor: prod.badgeColor || '#ff4d6d' }"
              >
                {{ prod.tag }}
              </span>
              <span class="prod-photo-count-badge font-mono" title="등록된 사진 수">
                📸 {{ (prod.images && prod.images.length) || 1 }}장
              </span>
              <span class="thumb-hover-hint">클릭 시 수정</span>
            </div>

            <!-- 상품 텍스트 정보 -->
            <div class="prod-card-content">
              <div class="prod-card-title-row">
                <h4 class="prod-card-name" @click="openEditProductModal(prod)">{{ prod.name }}</h4>
                <span class="prod-card-price font-mono font-bold">{{ prod.price.toLocaleString() }}원</span>
              </div>

              <p class="prod-card-desc">{{ prod.description }}</p>

              <!-- 카드 액션 버튼들 -->
              <div class="prod-card-actions">
                <button
                  type="button"
                  class="btn-edit-prod"
                  @click="openEditProductModal(prod)"
                  title="상품 정보 및 사진 수정"
                >
                  <i class="material-icons">edit</i>
                  <span>수정</span>
                </button>
                <button
                  type="button"
                  class="btn-del-prod"
                  @click="handleDeleteProduct(prod.id)"
                  title="상품 삭제"
                >
                  <i class="material-icons">delete_outline</i>
                  <span>삭제</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 📢 탭: 공지 & 주문안내 문구 관리 (사용자 주문 2~5번 이미지 내용 수정) -->
      <div v-if="currentTab === 'notices'" class="tab-panel">
        <div class="panel-header notices-panel-header">
          <div class="panel-header-titles">
            <h3 class="panel-title">📢 공지 & 주문안내 문구 관리</h3>
            <p class="panel-desc">
              메인 홈페이지 공지사항, 주문서 상단 안내문(공지/배송/유의/세탁주의), 공식 입금 계좌, 공방 소개글을 관리자가 직접 수정하고 실시간으로 반영합니다.
            </p>
          </div>
        </div>

        <div class="notices-form-grid">
          <!-- 1. 📢 공지사항 (2번 & 5번 이미지 Notice) -->
          <div class="notice-editor-card card-notice-pink">
            <div class="editor-card-header">
              <span class="editor-badge bg-badge-pink">공지사항</span>
              <div class="editor-header-meta">
                <h4 class="editor-title">📢 공지사항 (Notice)</h4>
                <span class="editor-hint">홈페이지 및 주문서 최상단에 노출되는 제작기간 및 환불 정책</span>
              </div>
            </div>
            <div class="editor-body">
              <textarea
                v-model="noticesForm.noticeContent"
                rows="4"
                class="form-textarea notice-textarea"
                placeholder="공지사항 내용을 입력하세요 (줄바꿈 지원)"
              ></textarea>
            </div>
          </div>

          <!-- 2. 📦 배송 안내 문구 (2번 & 5번 이미지 Shipping) -->
          <div class="notice-editor-card card-notice-blue">
            <div class="editor-card-header">
              <span class="editor-badge bg-badge-blue">배송안내</span>
              <div class="editor-header-meta">
                <h4 class="editor-title">📦 배송 안내 문구 (Shipping Guide)</h4>
                <span class="editor-hint">일반 택배, GS반택/CU알뜰택배 금액 및 편의점 지점명 입력 안내</span>
              </div>
            </div>
            <div class="editor-body">
              <textarea
                v-model="noticesForm.shippingContent"
                rows="4"
                class="form-textarea notice-textarea"
                placeholder="배송 안내 문구를 입력하세요"
              ></textarea>
            </div>
          </div>

          <!-- 3. ⚠️ 주문 유의사항 문구 (5번 이미지 Caution) -->
          <div class="notice-editor-card card-notice-amber">
            <div class="editor-card-header">
              <span class="editor-badge bg-badge-amber">유의사항</span>
              <div class="editor-header-meta">
                <h4 class="editor-title">⚠️ 주문 유의사항 (Caution)</h4>
                <span class="editor-hint">주문서 페이지 상단에 노출 (24시간 미입금 자동 취소, 입금자명 메모 등)</span>
              </div>
            </div>
            <div class="editor-body">
              <textarea
                v-model="noticesForm.cautionContent"
                rows="4"
                class="form-textarea notice-textarea"
                placeholder="주문 유의사항을 입력하세요"
              ></textarea>
            </div>
          </div>

          <!-- 4. 🫧 세탁 시 주의사항 문구 (2번 & 5번 이미지 Washing Care) -->
          <div class="notice-editor-card card-notice-purple">
            <div class="editor-card-header">
              <span class="editor-badge bg-badge-purple">세탁주의</span>
              <div class="editor-header-meta">
                <h4 class="editor-title">🫧 세탁 시 주의사항 (Washing Care)</h4>
                <span class="editor-hint">뜨개옷 관리법, 미온수 중성세제 울샴푸 손세탁, 타월 드라이 안내</span>
              </div>
            </div>
            <div class="editor-body">
              <textarea
                v-model="noticesForm.washingContent"
                rows="4"
                class="form-textarea notice-textarea"
                placeholder="세탁 주의사항을 입력하세요"
              ></textarea>
            </div>
          </div>

          <!-- 5. 🧶 공방 소개 & 인스타그램 상담 안내 (3번 이미지) -->
          <div class="notice-editor-card card-notice-brand">
            <div class="editor-card-header">
              <span class="editor-badge bg-badge-brand">공방소개</span>
              <div class="editor-header-meta">
                <h4 class="editor-title">🧶 공방 브랜드 소개 & 상담 안내</h4>
                <span class="editor-hint">푸터 및 인스타그램 계정(@hyebin_knit), 제작 소요 기간, 이용 택배사</span>
              </div>
            </div>
            <div class="editor-body">
              <div class="form-group mb-3">
                <label class="input-label">공방 슬로건 & 소개 문구</label>
                <textarea
                  v-model="noticesForm.shopIntro"
                  rows="2"
                  class="notice-textarea"
                  placeholder="공방 소개글을 입력하세요"
                ></textarea>
              </div>

              <div class="editor-grid-3">
                <div class="form-group">
                  <label class="input-label">인스타그램 계정 ID</label>
                  <input
                    v-model="noticesForm.instagramId"
                    type="text"
                    class="notice-input font-mono"
                    placeholder="@hyebin_knit"
                  />
                </div>
                <div class="form-group">
                  <label class="input-label">제작 소요 기간 안내</label>
                  <input
                    v-model="noticesForm.makingPeriod"
                    type="text"
                    class="notice-input"
                    placeholder="입금 확인 후 약 3~7 영업일 소요"
                  />
                </div>
                <div class="form-group">
                  <label class="input-label">이용 택배사 목록</label>
                  <input
                    v-model="noticesForm.courierInfo"
                    type="text"
                    class="notice-input"
                    placeholder="CJ대한통운 / 우체국 / GS25·CU 편의점 택배"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 6. 💳 공식 입금 계좌 정보 (3번 & 4번 이미지) -->
          <div class="notice-editor-card card-notice-bank">
            <div class="editor-card-header">
              <span class="editor-badge bg-badge-bank">입금계좌</span>
              <div class="editor-header-meta">
                <h4 class="editor-title">💳 공식 입금 계좌 관리</h4>
                <span class="editor-hint">주문서 계좌 확인 박스, 푸터 및 주문 조회 시 고객에게 표시되는 계좌 정보</span>
              </div>
            </div>
            <div class="editor-body">
              <div class="editor-grid-3">
                <div class="form-group">
                  <label class="input-label">은행명</label>
                  <input
                    v-model="noticesForm.bankName"
                    type="text"
                    class="notice-input font-bold"
                    placeholder="카카오뱅크"
                  />
                </div>
                <div class="form-group">
                  <label class="input-label">계좌번호 (하이픈 포함)</label>
                  <input
                    v-model="noticesForm.accountNumber"
                    type="text"
                    class="notice-input font-mono font-bold"
                    placeholder="3333-12-8924018"
                  />
                </div>
                <div class="form-group">
                  <label class="input-label">예금주</label>
                  <input
                    v-model="noticesForm.accountHolder"
                    type="text"
                    class="notice-input font-bold"
                    placeholder="전혜빈"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 하단 전폭 저장 바 -->
        <div class="notices-bottom-actions">
          <button
            type="button"
            class="btn-reset-prods"
            @click="handleResetNotices"
          >
            <i class="material-icons">restart_alt</i>
            <span>기본 문구 복원</span>
          </button>
          <button
            type="button"
            class="btn-save-notices-bottom"
            @click="saveSiteNotices"
          >
            <i class="material-icons">check_circle</i>
            <span>공지 & 주문안내 전체 저장하기</span>
          </button>
        </div>
      </div>

      <!-- 🌟 탭: 사용자 팝업 & 신상품 안내 관리 -->
      <div v-if="currentTab === 'popups'" class="tab-panel">
        <div class="panel-header notices-panel-header">
          <div class="panel-header-titles">
            <h3 class="panel-title">📢 사용자 팝업 & 신상품 안내 설정</h3>
            <p class="panel-desc">
              사용자가 사이트에 방문했을 때 화면에 띄울 공지사항 및 신상품 출시 안내 팝업 모달을 설정합니다.
              노출 기간 설정, 새 상품 바로가기 링크, "오늘 하루 보지 않기" 기능을 지원합니다.
            </p>
          </div>
          <div class="panel-actions">
            <button
              type="button"
              class="btn-preview-popup"
              @click="openPopupPreview"
              title="설정된 팝업 미리보기"
            >
              <i class="material-icons">preview</i>
              <span>팝업 미리보기</span>
            </button>
          </div>
        </div>

        <div class="notices-form-grid">
          <!-- 1. 팝업 활성화 & 팝업 유형 선택 카드 -->
          <div class="notice-editor-card card-notice-pink">
            <div class="editor-card-header">
              <span class="editor-badge bg-badge-pink">기본 설정</span>
              <div class="editor-header-meta">
                <h4 class="editor-title">🔔 팝업 노출 여부 및 유형 선택</h4>
                <span class="editor-hint">팝업 활성화 및 공지 or 신상품 안내 모드를 선택합니다</span>
              </div>
            </div>
            <div class="editor-body">
              <div class="popup-config-grid">
                <!-- 활성화 토글 -->
                <div class="form-group">
                  <label class="input-label">팝업 모달 노출 상태</label>
                  <div class="toggle-card-row">
                    <label class="switch">
                      <input type="checkbox" v-model="popupForm.isActive" />
                      <span class="slider"></span>
                    </label>
                    <span class="toggle-status-txt" :class="{ 'text-pink font-bold': popupForm.isActive }">
                      {{ popupForm.isActive ? '🟢 사용자에게 팝업 노출 중 (ON)' : '⚪ 팝업 숨김 (OFF)' }}
                    </span>
                  </div>
                </div>

                <!-- 팝업 유형 라디오 -->
                <div class="form-group">
                  <label class="input-label">팝업 안내 유형</label>
                  <div class="popup-type-selector">
                    <button
                      type="button"
                      class="btn-type-opt"
                      :class="{ active: popupForm.type === 'product' }"
                      @click="popupForm.type = 'product'; handlePopupProductSelect();"
                    >
                      <span class="type-opt-icon">🧶</span>
                      <div class="type-opt-text">
                        <strong>새 상품 안내</strong>
                        <small>상품 바로가기 연동</small>
                      </div>
                    </button>
                    <button
                      type="button"
                      class="btn-type-opt"
                      :class="{ active: popupForm.type === 'notice' }"
                      @click="popupForm.type = 'notice'"
                    >
                      <span class="type-opt-icon">📢</span>
                      <div class="type-opt-text">
                        <strong>일반 공지사항</strong>
                        <small>공지 / 배송 / 이벤트</small>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. 새 상품 안내 타겟 상품 설정 (type === 'product' 일 때) -->
          <div v-if="popupForm.type === 'product'" class="notice-editor-card card-notice-brand">
            <div class="editor-card-header">
              <span class="editor-badge bg-badge-brand">신상품 연동</span>
              <div class="editor-header-meta">
                <h4 class="editor-title">🎯 새 상품 바로가기 대상 상품 선택</h4>
                <span class="editor-hint">사용자가 팝업에서 버튼을 클릭하면 해당 상품 주문서로 즉시 이동합니다</span>
              </div>
            </div>
            <div class="editor-body">
              <div class="popup-config-grid">
                <div class="form-group">
                  <label class="input-label">안내할 대상 상품 선택 <span class="req">*</span></label>
                  <select
                    v-model="popupForm.targetProductId"
                    class="notice-input"
                    @change="handlePopupProductSelect"
                  >
                    <option v-for="p in store.products" :key="p.id" :value="p.id">
                      {{ p.name }} ({{ p.price.toLocaleString() }}원)
                    </option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="input-label">바로가기 버튼 문구</label>
                  <input
                    v-model="popupForm.actionButtonText"
                    type="text"
                    class="notice-input"
                    placeholder="예: 신상품 바로 보러가기"
                  />
                </div>
              </div>

              <!-- 선택된 상품 간이 미리보기 카드 -->
              <div v-if="selectedTargetProduct" class="target-prod-preview-card">
                <img :src="selectedTargetProduct.image" :alt="selectedTargetProduct.name" class="target-prod-img" />
                <div class="target-prod-info">
                  <div class="target-prod-name-row">
                    <span class="target-badge">{{ selectedTargetProduct.tag || 'BEST' }}</span>
                    <strong class="target-prod-name">{{ selectedTargetProduct.name }}</strong>
                    <span class="target-prod-price">{{ selectedTargetProduct.price.toLocaleString() }}원</span>
                  </div>
                  <p class="target-prod-desc">{{ selectedTargetProduct.description }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. 팝업 타이틀 및 본문 내용 작성 -->
          <div class="notice-editor-card card-notice-blue">
            <div class="editor-card-header">
              <span class="editor-badge bg-badge-blue">내용 입력</span>
              <div class="editor-header-meta">
                <h4 class="editor-title">✏️ 팝업 타이틀 및 상세 안내 문구</h4>
                <span class="editor-hint">사용자 모달에 표시될 제목과 본문 내용을 입력합니다</span>
              </div>
            </div>
            <div class="editor-body">
              <div class="popup-config-grid">
                <div class="form-group">
                  <label class="input-label">상단 뱃지 문구</label>
                  <input
                    v-model="popupForm.badgeText"
                    type="text"
                    class="notice-input"
                    placeholder="예: NEW 신상품 출시 안내"
                  />
                </div>
                <div class="form-group">
                  <label class="input-label">팝업 메인 타이틀 (제목)</label>
                  <input
                    v-model="popupForm.title"
                    type="text"
                    class="notice-input font-bold"
                    placeholder="예: 2026 앉은누이 귀여운 가을 신상 오픈!"
                  />
                </div>
              </div>

              <div class="form-group mt-3">
                <label class="input-label">팝업 상세 안내 본문 (줄바꿈 지원)</label>
                <textarea
                  v-model="popupForm.content"
                  rows="4"
                  class="notice-textarea"
                  placeholder="팝업 본문 내용을 입력하세요"
                ></textarea>
              </div>

              <!-- 팝업 이미지 URL -->
              <div class="form-group mt-3">
                <label class="input-label">팝업 대표 이미지 URL (선택)</label>
                <input
                  v-model="popupForm.imageUrl"
                  type="text"
                  class="notice-input font-mono"
                  placeholder="https://... 또는 /images/products/apple.jpg"
                />
              </div>

              <!-- 일반 공지일 때 버튼 설정 -->
              <div v-if="popupForm.type === 'notice'" class="popup-config-grid mt-3">
                <div class="form-group">
                  <label class="input-label">하단 바로가기 버튼 표시</label>
                  <label class="switch">
                    <input type="checkbox" v-model="popupForm.showActionButton" />
                    <span class="slider"></span>
                  </label>
                </div>
                <div v-if="popupForm.showActionButton" class="form-group">
                  <label class="input-label">버튼 문구</label>
                  <input
                    v-model="popupForm.actionButtonText"
                    type="text"
                    class="notice-input"
                    placeholder="예: 주문서 바로가기"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 4. 노출 기간 설정 카드 -->
          <div class="notice-editor-card card-notice-amber">
            <div class="editor-card-header">
              <span class="editor-badge bg-badge-amber">기간 설정</span>
              <div class="editor-header-meta">
                <h4 class="editor-title">📅 팝업 노출 기간 설정</h4>
                <span class="editor-hint">설정한 기간 동안에만 사용자에게 팝업이 노출되며, 기간 경과 시 자동 종료됩니다</span>
              </div>
            </div>
            <div class="editor-body">
              <div class="form-group mb-3">
                <label class="dont-show-label">
                  <input
                    type="checkbox"
                    v-model="popupForm.isAlways"
                    class="dont-show-checkbox"
                  />
                  <strong>상시 노출 (기간 제한 없이 항상 노출)</strong>
                </label>
              </div>

              <div v-if="!popupForm.isAlways" class="popup-config-grid">
                <div class="form-group">
                  <label class="input-label">노출 시작 일시</label>
                  <input
                    v-model="popupForm.startDate"
                    type="datetime-local"
                    class="notice-input font-mono"
                  />
                </div>
                <div class="form-group">
                  <label class="input-label">노출 종료 일시</label>
                  <input
                    v-model="popupForm.endDate"
                    type="datetime-local"
                    class="notice-input font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 하단 전폭 저장 바 -->
        <div class="notices-bottom-actions">
          <button
            type="button"
            class="btn-reset-prods"
            @click="handleResetPopupNotice"
          >
            <i class="material-icons">restart_alt</i>
            <span>기본 설정 복원</span>
          </button>
          <button
            type="button"
            class="btn-preview-bottom"
            @click="openPopupPreview"
          >
            <i class="material-icons">preview</i>
            <span>미리보기</span>
          </button>
          <button
            type="button"
            class="btn-save-notices-bottom"
            @click="savePopupNoticeSettings"
          >
            <i class="material-icons">check_circle</i>
            <span>팝업 안내 설정 저장하기</span>
          </button>
        </div>
      </div>

      <!-- 탭 2: 환불 / 취소 관리 -->
      <div v-if="currentTab === 'refunds'" class="tab-panel">
        <div class="panel-header">
          <div class="filter-chips">
            <button
              class="chip"
              :class="{ active: refundStatusFilter === 'all' }"
              @click="refundStatusFilter = 'all'"
            >
              전체 ({{ store.refunds.length }})
            </button>
            <button
              class="chip"
              :class="{ active: refundStatusFilter === 'requested' }"
              @click="refundStatusFilter = 'requested'"
            >
              요청 대기 ({{ store.pendingRefundsCount }})
            </button>
            <button
              class="chip"
              :class="{ active: refundStatusFilter === 'completed' }"
              @click="refundStatusFilter = 'completed'"
            >
              환불 완료
            </button>
            <button
              class="chip"
              :class="{ active: refundStatusFilter === 'rejected' }"
              @click="refundStatusFilter = 'rejected'"
            >
              반려
            </button>
          </div>
        </div>

        <div v-if="filteredRefunds.length === 0" class="empty-list-box">
          <span class="empty-icon">💸</span>
          <p class="empty-txt">환불 요청 내역이 없습니다.</p>
        </div>

        <div v-else class="refunds-list">
          <div v-for="refItem in filteredRefunds" :key="refItem.id" class="refund-card">
            <div class="ref-top">
              <div>
                <span class="ref-id font-mono">{{ refItem.id }}</span>
                <span class="ref-order">원주문: <b>{{ refItem.orderId }}</b></span>
                <span class="ref-date">{{ refItem.createdAt }}</span>
              </div>
              <span class="status-pill" :class="refItem.status">
                {{ refItem.status === 'requested' ? '환불 요청' : refItem.status === 'completed' ? '환불 완료' : '반려됨' }}
              </span>
            </div>

            <div class="ref-body">
              <div class="ref-info-row">
                <span class="lbl">신청자</span>
                <span class="val font-bold">{{ refItem.buyerName }} ({{ refItem.phone }})</span>
              </div>
              <div class="ref-info-row">
                <span class="lbl">환불 금액</span>
                <span class="val font-bold text-red">{{ refItem.amount.toLocaleString() }}원</span>
              </div>
              <div class="ref-info-row">
                <span class="lbl">환불 사유</span>
                <span class="val">{{ refItem.reason }}</span>
              </div>
              <div class="ref-info-row bank-row">
                <span class="lbl">환불 계좌</span>
                <span class="val font-mono">
                  {{ refItem.refundBank }} {{ refItem.refundAccount }} (예금주: {{ refItem.refundHolder }})
                  <button class="btn-mini-copy" @click="copyText(`${refItem.refundBank} ${refItem.refundAccount}`, '환불 계좌')">
                    계좌 복사
                  </button>
                </span>
              </div>
            </div>

            <div class="ref-actions" v-if="refItem.status === 'requested'">
              <button class="btn-ref-complete" @click="handleRefundAction(refItem.id, 'completed')">
                ✓ 환불 입금 완료 처리
              </button>
              <button class="btn-ref-reject" @click="handleRefundAction(refItem.id, 'rejected')">
                반려 처리
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 탭 3: 고객 의견 / 문의 관리 -->
      <div v-if="currentTab === 'inquiries'" class="tab-panel">
        <div class="panel-header">
          <div class="filter-chips">
            <button
              class="chip"
              :class="{ active: inquiryStatusFilter === 'all' }"
              @click="inquiryStatusFilter = 'all'"
            >
              전체 ({{ store.inquiries.length }})
            </button>
            <button
              class="chip"
              :class="{ active: inquiryStatusFilter === 'unread' }"
              @click="inquiryStatusFilter = 'unread'"
            >
              미확인 ({{ store.unreadInquiriesCount }})
            </button>
            <button
              class="chip"
              :class="{ active: inquiryStatusFilter === 'answered' }"
              @click="inquiryStatusFilter = 'answered'"
            >
              답변/완료됨
            </button>
          </div>
        </div>

        <div v-if="filteredInquiries.length === 0" class="empty-list-box">
          <span class="empty-icon">💌</span>
          <p class="empty-txt">등록된 고객 의견이나 문의가 없습니다.</p>
        </div>

        <div v-else class="inquiries-list">
          <div v-for="inq in filteredInquiries" :key="inq.id" class="inquiry-card">
            <div class="inq-top">
              <div class="inq-badge-line">
                <span class="inq-type-badge">{{ inq.type }}</span>
                <span class="inq-author font-bold">{{ inq.name }}</span>
                <span class="inq-contact">({{ inq.contact }})</span>
                <span class="inq-date">{{ inq.createdAt }}</span>
              </div>
              <span class="status-pill" :class="inq.status">
                {{ inq.status === 'unread' ? '미확인 신규' : inq.status === 'answered' ? '답변/처리완료' : '확인됨' }}
              </span>
            </div>

            <div class="inq-content-box">
              <p class="inq-content">{{ inq.content }}</p>
            </div>

            <!-- 관리자 메모 / 답변 영역 -->
            <div class="inq-reply-box">
              <label class="reply-lbl">관리자 메모 / 답변 내용</label>
              <div class="reply-input-row">
                <input
                  v-model="replyInputs[inq.id]"
                  type="text"
                  placeholder="예: 인스타 DM으로 사이즈 상담 완료함"
                  class="reply-inp"
                />
                <button class="btn-save-reply" @click="saveInquiryReply(inq.id)">
                  저장 & 처리완료
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 탭 4: 리뷰 관리 -->
      <div v-if="currentTab === 'reviews'" class="tab-panel">
        <div class="reviews-admin-list">
          <div v-for="rev in store.reviews" :key="rev.id" class="rev-admin-row">
            <div class="rev-admin-info">
              <div class="rev-admin-top">
                <span class="font-bold">{{ rev.author }}</span>
                <span class="rev-stars">★ {{ rev.rating }}점</span>
                <span class="rev-prod-name">{{ rev.productName }}</span>
                <span class="rev-admin-date">{{ rev.createdAt }}</span>
              </div>
              <p class="rev-admin-text">{{ rev.content }}</p>
            </div>

            <div class="rev-admin-actions">
              <button
                class="btn-toggle-vis"
                :class="{ hidden: !rev.isVisible }"
                @click="store.toggleReviewVisibility(rev.id)"
              >
                {{ rev.isVisible ? '표시 중' : '숨김 상태' }}
              </button>
              <button class="btn-del-rev" @click="store.deleteReview(rev.id)">
                삭제
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 탭 5: 휴대폰 알림 & 상점 설정 -->
      <div v-if="currentTab === 'settings'" class="tab-panel">
        <div class="settings-grid">
          <!-- 알림 설정 카드 (휴대폰 알림 핵심) -->
          <div class="setting-card highlight-card">
            <div class="card-title-group">
              <span class="card-icon">📱</span>
              <div>
                <h3 class="setting-title">스마트폰 실시간 알림 센터 (카카오톡 연동)</h3>
                <p class="setting-sub">주문, 환불, 리뷰, 고객 문의가 접수될 때마다 카카오톡과 폰으로 알림이 울립니다.</p>
              </div>
            </div>

            <!-- 💛 1. 카카오톡 관리자 실시간 알림 연동 -->
            <div class="kakao-section">
              <div class="kakao-header">
                <div class="kakao-title-row">
                  <span class="kakao-logo">💬</span>
                  <div>
                    <span class="kakao-badge">국내 1위 카톡 메신저 알림</span>
                    <h4 class="kakao-title">관리자 카카오톡 실시간 알림</h4>
                  </div>
                </div>
                <label class="switch">
                  <input type="checkbox" v-model="settingsForm.kakaoAlertEnabled" />
                  <span class="slider"></span>
                </label>
              </div>

              <p class="kakao-desc">
                고객이 <b>주문, 환불 신청, 포토 리뷰 작성, 의견/문의</b>를 보낼 때마다 관리자의 카카오톡('나와의 채팅')으로 띵동! 소리와 함께 상세 내용이 즉시 도착합니다.
              </p>

              <!-- 이벤트별 카톡 수신 선택 체크박스 -->
              <div class="kakao-events-box">
                <span class="events-label">🔔 카카오톡 알림을 받을 이벤트를 선택해주세요:</span>
                <div class="events-grid">
                  <label class="event-check-label">
                    <input type="checkbox" v-model="settingsForm.kakaoNotifyOrder" />
                    <span>🛍️ 신규 주문 접수 시</span>
                  </label>
                  <label class="event-check-label">
                    <input type="checkbox" v-model="settingsForm.kakaoNotifyRefund" />
                    <span>💸 환불 / 취소 신청 시</span>
                  </label>
                  <label class="event-check-label">
                    <input type="checkbox" v-model="settingsForm.kakaoNotifyReview" />
                    <span>⭐ 새 포토 리뷰 등록 시</span>
                  </label>
                  <label class="event-check-label">
                    <input type="checkbox" v-model="settingsForm.kakaoNotifyInquiry" />
                    <span>💌 고객 문의 / 의견 접수 시</span>
                  </label>
                </div>
              </div>

              <!-- 카카오 토큰 입력 및 원클릭 연동 버튼 -->
              <div class="kakao-token-grid">
                <div class="form-group">
                  <label class="token-lbl">카카오톡 Access Token (액세스 토큰)</label>
                  <input
                    v-model="settingsForm.kakaoAccessToken"
                    type="text"
                    placeholder="카카오 개발자센터에서 발급받은 액세스 토큰 붙여넣기"
                    class="form-control font-mono"
                  />
                </div>
                <div class="kakao-btn-row">
                  <button type="button" class="btn-kakao-login" @click="loginWithKakaoSdk">
                    <span class="kakao-btn-icon">💬</span>
                    <span>카카오 로그인으로 1초 연동</span>
                  </button>
                  <button
                    type="button"
                    class="btn-kakao-test"
                    :disabled="isTestingKakao"
                    @click="testKakaoTalk"
                  >
                    <span v-if="isTestingKakao">발송 중...</span>
                    <span v-else>💛 내 카톡으로 테스트 알림 보내기</span>
                  </button>
                </div>
              </div>

              <!-- 1분 카카오 연동 가이드 -->
              <div class="kakao-guide-box">
                <span class="guide-badge-kakao">💡 1분 초간단 카카오톡 알림 설정 가이드 (100% 무료):</span>
                <ol class="kakao-steps">
                  <li><b>developers.kakao.com</b>(카카오 개발자센터)에 카카오 계정으로 무료 로그인합니다.</li>
                  <li>상단 <b>[내 애플리케이션]</b> → <b>[애플리케이션 추가하기]</b> (앱 이름: 뜨개옷장).</li>
                  <li>좌측 메뉴 <b>[카카오 로그인]</b> 활성화 → <b>[동의항목]</b>에서 <b>'카카오톡 메시지 전송(talk_message)'</b>을 '이용 중 동의'로 설정합니다.</li>
                  <li>상단 메뉴 <b>[도구] → [REST API 테스트]</b>에서 '토큰 발급' 후 토큰을 위 입력창에 붙여넣거나, '카카오 로그인으로 1초 연동'을 누르면 즉시 연동 완료!</li>
                  <li>위 <b>'내 카톡으로 테스트 알림 보내기'</b>를 누르면 관리자 휴대폰 카톡으로 띵동! 테스트 메시지가 도착합니다.</li>
                </ol>
              </div>
            </div>

            <!-- 2. 소리 & 진동 설정 -->
            <div class="setting-item">
              <div class="item-text">
                <span class="item-name">🔊 크리스탈 차임 소리 및 모바일 진동</span>
                <span class="item-desc">새 주문 접수 시 맑은 4단 알림 차임벨과 진동이 울립니다.</span>
              </div>
              <div class="item-action">
                <label class="switch">
                  <input type="checkbox" v-model="settingsForm.soundAlertEnabled" />
                  <span class="slider"></span>
                </label>
              </div>
            </div>

            <!-- 알림음 테스트 버튼 -->
            <div class="sound-test-bar">
              <button type="button" class="btn-test-chime" @click="testNotificationSound">
                <i class="material-icons">notifications_active</i>
                <span>스마트폰 소리 & 진동 테스트 울리기</span>
              </button>
            </div>
          </div>

          <!-- 입금 계좌 설정 카드 -->
          <div class="setting-card">
            <div class="card-title-group">
              <span class="card-icon">🏦</span>
              <div>
                <h3 class="setting-title">공식 입금 계좌 설정</h3>
                <p class="setting-sub">주문서 및 주문 조회 화면에 노출되는 공식 계좌 정보를 관리합니다.</p>
              </div>
            </div>

            <div class="form-grid-3">
              <div class="form-group">
                <label>은행명</label>
                <input v-model="settingsForm.bankName" type="text" class="form-control" />
              </div>
              <div class="form-group">
                <label>계좌번호</label>
                <input v-model="settingsForm.accountNumber" type="text" class="form-control font-mono" />
              </div>
              <div class="form-group">
                <label>예금주</label>
                <input v-model="settingsForm.accountHolder" type="text" class="form-control" />
              </div>
            </div>

            <button type="button" class="btn-save-settings" @click="saveSettings">
              <i class="material-icons">save</i>
              <span>계좌 및 알림 설정 저장하기</span>
            </button>
          </div>

          <!-- 🔐 관리자 비밀번호 변경 전용 카드 -->
          <div class="setting-card card-security">
            <div class="card-title-group">
              <span class="card-icon"><i class="material-icons" style="font-size: 1.5rem; color: #ff4d6d;">lock</i></span>
              <div>
                <h3 class="setting-title">관리자 비밀번호 변경</h3>
                <p class="setting-sub">관리자 페이지 접속에 사용할 비밀번호를 안전하게 변경합니다.</p>
              </div>
            </div>

            <div class="form-grid-3">
              <div class="form-group">
                <label>현재 비밀번호 <span class="req">*</span></label>
                <input
                  v-model="pwForm.currentPassword"
                  :type="pwForm.showPassword ? 'text' : 'password'"
                  placeholder="현재 비밀번호 입력"
                  class="form-control"
                />
              </div>
              <div class="form-group">
                <label>새 비밀번호 (4자 이상) <span class="req">*</span></label>
                <input
                  v-model="pwForm.newPassword"
                  :type="pwForm.showPassword ? 'text' : 'password'"
                  placeholder="새로운 비밀번호 입력"
                  class="form-control"
                />
              </div>
              <div class="form-group">
                <label>새 비밀번호 확인 <span class="req">*</span></label>
                <input
                  v-model="pwForm.newPasswordConfirm"
                  :type="pwForm.showPassword ? 'text' : 'password'"
                  placeholder="새 비밀번호 다시 입력"
                  class="form-control"
                />
              </div>
            </div>

            <div class="pw-action-row">
              <label class="toggle-pw-label">
                <input type="checkbox" v-model="pwForm.showPassword" />
                <span>비밀번호 표시하기</span>
              </label>

              <button type="button" class="btn-change-pw" @click="handleChangePassword">
                <i class="material-icons">vpn_key</i>
                <span>비밀번호 변경하기</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ✏️ 주문서 및 맞춤 사진 수정 모달 -->
    <AdminOrderEditModal
      v-model="isOrderEditModalOpen"
      :order="editingOrder"
    />

    <!-- 🛍️ 주문서 상품(카탈로그) 등록 및 수정 모달 -->
    <AdminProductModal
      v-model="isProductModalOpen"
      :product="selectedProductToEdit"
    />

    <!-- 🌟 사용자 팝업 안내 미리보기 모달 (관리자 화면에서도 즉시 실시간 확인 가능) -->
    <UserNoticeModal />
  </div>
</template>

<style scoped>
.admin-dashboard-page {
  padding: 32px 16px 80px;
  background-color: #faf7f2;
  min-height: calc(100vh - 80px);
}

.admin-container {
  max-width: 1040px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 상단 탑바 */
.admin-topbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: #ffffff;
  border: 1px solid #ebdcd0;
  border-radius: 20px;
  padding: 20px 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
}

.topbar-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.admin-badge {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 1px;
  color: #ff4d6d;
}

.admin-title {
  font-size: 1.5rem;
  font-weight: 900;
  color: #2b1f1d;
  margin: 0;
}

.live-monitor-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  width: fit-content;
  margin-top: 4px;
}

.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.9);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.3);
    opacity: 1;
  }
  100% {
    transform: scale(0.9);
    opacity: 0.8;
  }
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-open-notif-modal {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  background: #ff4d6d;
  color: #ffffff;
  border: none;
  padding: 8px 14px;
  border-radius: 12px;
  font-size: 0.84rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(255, 77, 109, 0.35);
  transition: all 0.2s;
}

.btn-open-notif-modal:hover {
  background: #e63956;
  transform: translateY(-1px);
}

.btn-bell-icon {
  font-size: 1.15rem;
}

.admin-notif-badge {
  background: #ffffff;
  color: #ff3366;
  font-size: 0.7rem;
  font-weight: 900;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.btn-test-sound {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff0f3;
  border: 1px solid #ffd6de;
  color: #c9184a;
  padding: 8px 14px;
  border-radius: 12px;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-nav-site {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f7f3ee;
  border: 1px solid #e8ded4;
  color: #5c4e4b;
  padding: 8px 14px;
  border-radius: 12px;
  font-size: 0.84rem;
  font-weight: 700;
  text-decoration: none;
}

.btn-logout {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #ef4444;
  padding: 8px 14px;
  border-radius: 12px;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
}

/* KPI 지표 그리드 */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 14px;
}

.kpi-card {
  background: #ffffff;
  border: 1px solid #ebdcd0;
  border-radius: 18px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

.kpi-card.alert {
  border-color: #ff758f;
  background: #fff8f9;
}

.kpi-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
}

.bg-pink {
  background: #fff0f3;
}
.bg-amber {
  background: #fffbeb;
}
.bg-blue {
  background: #eff6ff;
}
.bg-purple {
  background: #f5f3ff;
}
.bg-red {
  background: #fef2f2;
}
.bg-green {
  background: #f0fdf4;
}

.kpi-content {
  display: flex;
  flex-direction: column;
}

.kpi-label {
  font-size: 0.76rem;
  color: #8c7e7b;
  font-weight: 600;
}

.kpi-value {
  font-size: 1.25rem;
  font-weight: 900;
  color: #2b1f1d;
}

.text-amber {
  color: #d97706;
}
.text-blue {
  color: #2563eb;
}
.text-purple {
  color: #7c3aed;
}
.text-red {
  color: #dc2626;
}
.text-green {
  color: #16a34a;
}

/* 탭 네비게이션 */
.admin-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  border-bottom: 2px solid #ebdcd0;
  padding-bottom: 8px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  border: 1px solid #ebdcd0;
  border-radius: 14px;
  padding: 10px 16px;
  font-size: 0.88rem;
  font-weight: 700;
  color: #5c4e4b;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: #faf4ee;
  color: #ff4d6d;
}

.tab-btn.active {
  background: #ff758f;
  color: #ffffff;
  border-color: #ff758f;
  box-shadow: 0 4px 12px rgba(255, 117, 143, 0.3);
}

.tab-badge {
  background: rgba(0, 0, 0, 0.1);
  color: inherit;
  font-size: 0.72rem;
  padding: 2px 7px;
  border-radius: 10px;
}

.tab-badge.bg-red {
  background: #ef4444;
  color: #fff;
}
.tab-badge.bg-green {
  background: #22c55e;
  color: #fff;
}

/* 패널 공통 */
.tab-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.panel-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip {
  background: #ffffff;
  border: 1px solid #ebdcd0;
  border-radius: 18px;
  padding: 6px 14px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #6b5c58;
  cursor: pointer;
  transition: all 0.2s;
}

.chip.active {
  background: #2b1f1d;
  color: #ffffff;
  border-color: #2b1f1d;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  border: 1px solid #ebdcd0;
  border-radius: 12px;
  padding: 6px 12px;
}

.search-inp {
  border: none;
  outline: none;
  font-size: 0.84rem;
  min-width: 220px;
}

.empty-list-box {
  background: #ffffff;
  border: 1px solid #ebdcd0;
  border-radius: 20px;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 2.8rem;
}

.empty-txt {
  font-size: 0.95rem;
  color: #8c7e7b;
  margin: 8px 0 0;
}

/* 주문 카드 */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.admin-order-card {
  background: #ffffff;
  border: 1.5px solid #ebdcd0;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f3ebe1;
  padding-bottom: 12px;
}

.order-id-txt {
  font-size: 1rem;
  font-weight: 800;
  color: #2b1f1d;
}

.order-time {
  font-size: 0.78rem;
  color: #8c7e7b;
  margin-left: 8px;
}

.status-pill {
  color: #ffffff;
  font-size: 0.78rem;
  font-weight: 800;
  padding: 4px 12px;
  border-radius: 12px;
}

.order-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.info-sec {
  background: #fcfbfa;
  border: 1px solid #f0eae1;
  border-radius: 14px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sec-title {
  font-size: 0.85rem;
  font-weight: 800;
  color: #4b3e3b;
  margin: 0 0 4px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
}

.info-row .lbl {
  color: #8c7e7b;
}

.info-row .val {
  color: #2b1f1d;
  text-align: right;
}

.btn-mini-copy {
  background: #ede6dd;
  border: none;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 0.7rem;
  cursor: pointer;
  margin-left: 4px;
}

.items-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.order-item-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border: 1px solid #ebdcd0;
  border-radius: 8px;
  padding: 4px 8px;
}

.item-img-mini {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  object-fit: cover;
}

.item-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: #2b1f1d;
}

.item-price-qty {
  font-size: 0.72rem;
  color: #8c7e7b;
  margin-left: 6px;
}

.total-bar {
  display: flex;
  justify-content: space-between;
  border-top: 1px dashed #ebdcd0;
  padding-top: 8px;
  margin-top: 4px;
  font-weight: 800;
}

.total-amt {
  color: #ff4d6d;
  font-size: 1.05rem;
}

.order-bottom-bar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  border-top: 1px solid #f3ebe1;
  padding-top: 14px;
}

.tracking-input-group {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.tracking-lbl {
  font-size: 0.8rem;
  font-weight: 700;
  color: #5c4e4b;
}

.tracking-inp {
  border: 1px solid #d1c5b8;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 0.82rem;
}

.btn-save-track {
  background: #3b82f6;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
}

.status-btn-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.btn-status {
  border: none;
  color: #ffffff;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s;
}

.btn-status:hover {
  transform: translateY(-1px);
}

.btn-status.bg-blue {
  background: #2563eb;
}
.btn-status.bg-pink {
  background: #ec4899;
}
.btn-status.bg-purple {
  background: #8b5cf6;
}
.btn-status.bg-green {
  background: #10b981;
}
.btn-status.bg-gray {
  background: #6b7280;
}
.btn-status.bg-pink-light {
  background: #fff0f3;
  color: #ff4d6d;
  border: 1.5px solid #ffccd5;
}
.btn-status.bg-pink-light:hover {
  background: #ffe3e8;
}

.btn-order-edit {
  font-weight: 800;
  box-shadow: 0 2px 6px rgba(255, 77, 109, 0.15);
}

.btn-order-edit-top {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #fff0f3;
  border: 1.5px solid #ffccd5;
  color: #ff4d6d;
  border-radius: 10px;
  padding: 4px 10px;
  font-size: 0.76rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-order-edit-top i {
  font-size: 0.95rem;
}

.btn-order-edit-top:hover {
  background: #ff4d6d;
  color: #ffffff;
}

.order-top-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 첨부 맞춤 사진 배너 */
.order-attached-photo-banner {
  background: #fff8f9;
  border: 1.5px solid #ffccd5;
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.photo-banner-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.photo-banner-badge {
  font-size: 0.78rem;
  font-weight: 800;
  color: #ff4d6d;
}

.btn-photo-quick-edit {
  background: #ffffff;
  border: 1px solid #ffccd5;
  color: #ff4d6d;
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
}

.photo-banner-body {
  position: relative;
  width: 100%;
  max-height: 180px;
  border-radius: 10px;
  overflow: hidden;
  background: #000000;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.order-photo-img {
  width: 100%;
  max-height: 180px;
  object-fit: contain;
  transition: transform 0.2s;
}

.photo-banner-body:hover .order-photo-img {
  transform: scale(1.02);
}

.photo-zoom-tag {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.65);
  color: #ffffff;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 700;
}

.admin-note-row {
  background: #fffbeb;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid #fef08a;
}

.admin-note-val {
  color: #92400e !important;
  font-weight: 700;
}

/* ========================================================
   공지 & 주문안내 관리 스타일 (이미지 2~5번)
   ======================================================== */
.notices-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.notices-form-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.notice-editor-card {
  background: #ffffff;
  border: 1.5px solid #ebdcd0;
  border-radius: 18px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 4px 14px rgba(43, 31, 29, 0.03);
}

.card-notice-pink { border-left: 5px solid #ff4d6d; }
.card-notice-blue { border-left: 5px solid #3b82f6; }
.card-notice-amber { border-left: 5px solid #f59e0b; }
.card-notice-purple { border-left: 5px solid #8b5cf6; }
.card-notice-brand { border-left: 5px solid #ff758f; }
.card-notice-bank { border-left: 5px solid #f59e0b; }

.editor-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.editor-badge {
  font-size: 0.68rem;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 6px;
  color: #ffffff;
  white-space: nowrap;
}

.bg-badge-pink { background: #ff4d6d; }
.bg-badge-blue { background: #3b82f6; }
.bg-badge-amber { background: #f59e0b; }
.bg-badge-purple { background: #8b5cf6; }
.bg-badge-brand { background: #ff758f; }
.bg-badge-bank { background: #eab308; }

.editor-header-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.editor-title {
  font-size: 0.96rem;
  font-weight: 800;
  color: #2b1f1d;
  margin: 0;
}

.editor-hint {
  font-size: 0.74rem;
  color: #8c7875;
}

.editor-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notice-textarea {
  width: 100%;
  font-size: 0.84rem;
  line-height: 1.6;
  border: 1.5px solid #ebdcd0;
  border-radius: 12px;
  padding: 10px 12px;
  box-sizing: border-box;
  background: #fdfbf7;
  color: #2b1f1d;
  outline: none;
  font-family: inherit;
  transition: border-color 0.2s;
}

.input-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
}

.edit-hint-pill {
  font-size: 0.68rem;
  font-weight: 700;
  color: #ff4d6d;
  background: #fff0f3;
  border: 1px solid #ffd6de;
  padding: 1.5px 6px;
  border-radius: 6px;
}

/* 입력 영역 명확한 박스/영역 표시 (위의 textarea 스타일과 100% 동일한 고급스러운 인풋 박스) */
.notice-textarea,
.notice-input,
.notice-editor-card .form-input,
.notice-editor-card .form-textarea {
  width: 100%;
  font-size: 0.88rem;
  line-height: 1.5;
  border: 1.5px solid #ebdcd0;
  border-radius: 12px;
  padding: 10px 14px;
  box-sizing: border-box;
  background: #fdfbf7;
  color: #2b1f1d;
  outline: none;
  font-family: inherit;
  transition: all 0.2s ease;
  box-shadow: inset 0 1px 3px rgba(43, 31, 29, 0.04);
}

.notice-input {
  height: 42px;
}

.notice-textarea:hover,
.notice-input:hover,
.notice-editor-card .form-input:hover,
.notice-editor-card .form-textarea:hover {
  border-color: #ff758f;
  background: #ffffff;
  box-shadow: inset 0 1px 3px rgba(43, 31, 29, 0.06), 0 2px 8px rgba(255, 117, 143, 0.1);
}

.notice-textarea:focus,
.notice-input:focus,
.notice-editor-card .form-input:focus,
.notice-editor-card .form-textarea:focus {
  border-color: #ff4d6d;
  background: #ffffff;
  box-shadow: 0 0 0 3.5px rgba(255, 77, 109, 0.18);
}

.notice-editor-card {
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.notice-editor-card .form-group {
  width: 100%;
  box-sizing: border-box;
}

.editor-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
}

/* 태블릿 및 모바일 반응형 (640px 이하 1열 전폭 레이아웃 전환) */
@media (max-width: 768px) {
  .editor-grid-3 {
    grid-template-columns: 1fr !important;
    gap: 10px !important;
  }
}

.notices-bottom-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 0;
}

.btn-save-notices-bottom {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #ff4d6d;
  color: #ffffff;
  border: none;
  border-radius: 14px;
  padding: 12px 24px;
  font-size: 0.92rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(255, 77, 109, 0.35);
  transition: all 0.2s;
}

.btn-save-notices-bottom:hover {
  background: #e63956;
  transform: translateY(-1px);
}

/* 🌟 팝업 설정 전용 스타일 */
.btn-preview-popup,
.btn-preview-bottom {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #fdfbf7;
  color: #ff4d6d;
  border: 1.5px solid #ffccd5;
  border-radius: 14px;
  padding: 10px 18px;
  font-size: 0.88rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-preview-popup:hover,
.btn-preview-bottom:hover {
  background: #fff0f3;
  border-color: #ff4d6d;
  transform: translateY(-1px);
}

.popup-config-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  width: 100%;
  box-sizing: border-box;
}

.toggle-card-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.toggle-status-txt {
  font-size: 0.86rem;
  color: #635350;
}

.popup-type-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  width: 100%;
}

.btn-type-opt {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fdfbf7;
  border: 1.5px solid #ebdcd0;
  border-radius: 14px;
  padding: 10px 14px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-type-opt .type-opt-icon {
  font-size: 1.3rem;
}

.btn-type-opt .type-opt-text strong {
  display: block;
  font-size: 0.88rem;
  color: #2b1f1d;
}

.btn-type-opt .type-opt-text small {
  display: block;
  font-size: 0.72rem;
  color: #8c7e7b;
}

.btn-type-opt.active {
  border-color: #ff4d6d;
  background: #fff0f3;
  box-shadow: 0 0 0 3px rgba(255, 77, 109, 0.15);
}

.btn-type-opt.active .type-opt-text strong {
  color: #ff4d6d;
}

/* 타겟 상품 간이 미리보기 카드 */
.target-prod-preview-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fdfbf7;
  border: 1.5px solid #ffd6de;
  border-radius: 16px;
  padding: 12px 14px;
  margin-top: 12px;
}

.target-prod-img {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  object-fit: cover;
  border: 1px solid #ebdcd0;
}

.target-prod-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.target-prod-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.target-badge {
  background: #ff4d6d;
  color: #ffffff;
  font-size: 0.68rem;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 6px;
}

.target-prod-name {
  font-size: 0.95rem;
  color: #2b1f1d;
}

.target-prod-price {
  font-size: 0.85rem;
  font-weight: 700;
  color: #ff4d6d;
}

.target-prod-desc {
  font-size: 0.78rem;
  color: #8c7e7b;
  margin: 0;
  line-height: 1.35;
}

/* ========================================================
   주문서 상품 (카탈로그) 관리 패널 스타일
   ======================================================== */
.products-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.panel-header-titles {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.panel-desc {
  font-size: 0.82rem;
  color: #8c7e7b;
  margin: 0;
  line-height: 1.4;
}

.panel-header-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-add-new-prod {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #ff4d6d 0%, #ff758f 100%);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  padding: 10px 18px;
  font-size: 0.88rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(255, 77, 109, 0.25);
  transition: transform 0.15s, box-shadow 0.2s;
}

.btn-add-new-prod:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(255, 77, 109, 0.35);
}

.btn-reset-prods {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #ffffff;
  border: 1.5px solid #ebdcd0;
  color: #6b5c58;
  border-radius: 12px;
  padding: 9px 14px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-reset-prods:hover {
  background: #fdfaf7;
  border-color: #d8c2b5;
}

/* 상품 그리드 (2번 이미지 카드 디자인 100% 반영) */
.admin-products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 16px;
  margin-top: 14px;
}

.admin-prod-card {
  background: #ffffff;
  border: 1.5px solid #ebdcd0;
  border-radius: 18px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.03);
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}

.admin-prod-card:hover {
  transform: translateY(-2px);
  border-color: #ffccd5;
  box-shadow: 0 8px 20px rgba(255, 77, 109, 0.1);
}

.prod-card-thumb-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  background: #fdfbf7;
  overflow: hidden;
  cursor: pointer;
}

.prod-card-thumb {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 10px;
  box-sizing: border-box;
  transition: transform 0.25s ease;
}

.prod-card-thumb-wrap:hover .prod-card-thumb {
  transform: scale(1.05);
}

.prod-badge-tag {
  position: absolute;
  top: 10px;
  left: 10px;
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  z-index: 2;
}

.prod-photo-count-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(43, 31, 29, 0.75);
  color: #ffffff;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2.5px 7px;
  border-radius: 10px;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 2;
}

.thumb-hover-hint {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.65);
  color: #ffffff;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 6px;
  opacity: 0;
  transition: opacity 0.2s;
}

.prod-card-thumb-wrap:hover .thumb-hover-hint {
  opacity: 1;
}

.prod-card-content {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.prod-card-title-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.prod-card-name {
  font-size: 0.98rem;
  font-weight: 800;
  color: #2b1f1d;
  margin: 0;
  cursor: pointer;
  line-height: 1.35;
  word-break: keep-all;
}

.prod-card-price {
  font-size: 1.05rem;
  font-weight: 900;
  color: #ff4d6d;
  white-space: nowrap;
}

.prod-card-desc {
  font-size: 0.78rem;
  color: #7a6a67;
  line-height: 1.45;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.prod-card-actions {
  display: flex;
  gap: 6px;
  border-top: 1px dashed #ebdcd0;
  padding-top: 10px;
  margin-top: 4px;
}

.btn-edit-prod {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: #fff0f3;
  border: 1px solid #ffd6de;
  color: #ff4d6d;
  border-radius: 10px;
  padding: 8px 10px;
  font-size: 0.8rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-edit-prod:hover {
  background: #ffe3e8;
}

.btn-del-prod {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: #fdf2f2;
  border: 1px solid #fecaca;
  color: #ef4444;
  border-radius: 10px;
  padding: 8px 8px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-del-prod:hover {
  background: #fee2e2;
}

/* 환불 카드 */
.refunds-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.refund-card {
  background: #ffffff;
  border: 1.5px solid #fed7aa;
  border-radius: 18px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ref-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ref-id {
  font-weight: 800;
  color: #b45309;
}

.ref-order {
  font-size: 0.82rem;
  margin: 0 8px;
}

.ref-date {
  font-size: 0.76rem;
  color: #8c7e7b;
}

.ref-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.85rem;
}

.ref-info-row {
  display: flex;
  justify-content: space-between;
}

.ref-actions {
  display: flex;
  gap: 10px;
  border-top: 1px dashed #fed7aa;
  padding-top: 10px;
}

.btn-ref-complete {
  background: #16a34a;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-ref-reject {
  background: #ef4444;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
}

/* 문의 카드 */
.inquiries-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.inquiry-card {
  background: #ffffff;
  border: 1px solid #ebdcd0;
  border-radius: 18px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.inq-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.inq-type-badge {
  background: #fff0f3;
  color: #c9184a;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 6px;
}

.inq-content-box {
  background: #fbf9f6;
  border-radius: 12px;
  padding: 12px;
}

.inq-content {
  font-size: 0.88rem;
  color: #3f2f2c;
  line-height: 1.6;
  margin: 0;
}

.inq-reply-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.reply-lbl {
  font-size: 0.78rem;
  font-weight: 700;
  color: #6b5c58;
}

.reply-input-row {
  display: flex;
  gap: 8px;
}

.reply-inp {
  flex: 1;
  border: 1px solid #d1c5b8;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 0.84rem;
}

.btn-save-reply {
  background: #ff758f;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
}

/* 리뷰 관리 */
.reviews-admin-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rev-admin-row {
  background: #ffffff;
  border: 1px solid #ebdcd0;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.rev-admin-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.rev-stars {
  color: #f59e0b;
  font-weight: 800;
  font-size: 0.85rem;
}

.rev-prod-name {
  color: #ff758f;
  font-size: 0.82rem;
  font-weight: 700;
}

.rev-admin-date {
  font-size: 0.75rem;
  color: #8c7e7b;
}

.rev-admin-text {
  font-size: 0.86rem;
  color: #4b3e3b;
  margin: 0;
}

.rev-admin-actions {
  display: flex;
  gap: 8px;
}

.btn-toggle-vis {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-toggle-vis.hidden {
  background: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

.btn-del-rev {
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #ef4444;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
}

/* 설정 탭 */
.settings-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.setting-card {
  background: #ffffff;
  border: 1.5px solid #ebdcd0;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.setting-card.highlight-card {
  border-color: #ff758f;
  background: #fffdfd;
}

.card-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-icon {
  font-size: 2rem;
}

.setting-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #2b1f1d;
  margin: 0;
}

.setting-sub {
  font-size: 0.82rem;
  color: #8c7e7b;
  margin: 2px 0 0;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f3ebe1;
  padding-top: 14px;
}

.item-text {
  display: flex;
  flex-direction: column;
}

.item-name {
  font-size: 0.92rem;
  font-weight: 700;
  color: #2b1f1d;
}

.item-desc {
  font-size: 0.8rem;
  color: #8c7e7b;
}



.sound-test-bar {
  background: #fff0f3;
  border: 1px dashed #ffd6de;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  justify-content: center;
}

.btn-test-chime {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #ff4d6d;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 10px 20px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(255, 77, 109, 0.3);
}

.form-grid-3 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-group label {
  font-size: 0.82rem;
  font-weight: 700;
  color: #4b3e3b;
}

.form-control {
  border: 1.5px solid #ebdcd0;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 0.9rem;
  outline: none;
}

.form-control:focus {
  border-color: #ff758f;
}

.btn-save-settings {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #ff758f 0%, #ff4d6d 100%);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  padding: 12px 28px;
  font-size: 0.95rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(255, 77, 109, 0.35);
  margin-top: 8px;
}

/* 🔐 관리자 비밀번호 변경 스타일 */
.card-security {
  background: #fffafa;
  border: 1.5px solid #ffd0da;
}

.card-security .form-group .req {
  color: #ff4d6d;
  font-weight: bold;
}

.pw-action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px dashed #f2dcdc;
}

.toggle-pw-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  color: #6b5855;
  cursor: pointer;
  user-select: none;
}

.toggle-pw-label input {
  accent-color: #ff4d6d;
  width: 15px;
  height: 15px;
  cursor: pointer;
}

.btn-change-pw {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #2b1f1d;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 10px 22px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(43, 31, 29, 0.18);
}

.btn-change-pw:hover {
  background: #ff4d6d;
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(255, 77, 109, 0.35);
}

.btn-change-pw .material-icons {
  font-size: 1.1rem;
}

/* Switch toggle */
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: #cbd5e1;
  transition: 0.3s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #ff4d6d;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

/* 카카오톡 연동 스타일 */
.kakao-section {
  background: #fefce8;
  border: 2px solid #fde047;
  border-radius: 18px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.kakao-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.kakao-title-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.kakao-logo {
  font-size: 1.6rem;
  background: #fee500;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
}

.kakao-badge {
  background: #ca8a04;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 6px;
}

.kakao-title {
  font-size: 1.05rem;
  font-weight: 900;
  color: #713f12;
  margin: 3px 0 0;
  word-break: keep-all;
  overflow-wrap: break-word;
  line-height: 1.35;
}

.kakao-desc {
  font-size: 0.85rem;
  color: #854d0e;
  line-height: 1.6;
  margin: 0;
}

.kakao-events-box {
  background: #ffffff;
  border: 1px solid #fef08a;
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.events-label {
  font-size: 0.82rem;
  font-weight: 800;
  color: #713f12;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
}

.event-check-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.84rem;
  font-weight: 700;
  color: #422006;
  cursor: pointer;
}

.event-check-label input {
  accent-color: #ca8a04;
  width: 17px;
  height: 17px;
}

.kakao-token-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.token-lbl {
  font-size: 0.8rem;
  font-weight: 700;
  color: #713f12;
}

.kakao-btn-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.btn-kakao-login {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fee500;
  color: #191919;
  border: none;
  border-radius: 10px;
  padding: 10px 18px;
  font-size: 0.85rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.btn-kakao-test {
  background: #ca8a04;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 10px 20px;
  font-size: 0.85rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(202, 138, 4, 0.3);
}

.btn-kakao-test:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.kakao-guide-box {
  background: #ffffff;
  border: 1px solid #fef08a;
  border-radius: 12px;
  padding: 14px 16px;
}

.guide-badge-kakao {
  font-size: 0.82rem;
  font-weight: 800;
  color: #854d0e;
  display: block;
  margin-bottom: 8px;
}

.kakao-steps {
  margin: 0;
  padding-left: 18px;
  font-size: 0.8rem;
  color: #422006;
  line-height: 1.7;
}

.kakao-steps b {
  color: #713f12;
}

.insta-link {
  text-decoration: none;
  color: #ff4d6d;
  font-weight: 700;
  transition: opacity 0.15s;
}

.insta-link:hover {
  text-decoration: underline;
  opacity: 0.85;
}

.contact-val {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-mini-call {
  background: #e0f2fe;
  color: #0284c7;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  padding: 3px 8px;
  font-size: 0.74rem;
  font-weight: 700;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  transition: background 0.15s;
}

.btn-mini-call:active {
  background: #bae6fd;
}

/* ========================================================
   모바일 최적화 (Mobile-First Optimization, 320px~640px 완전 대응)
   ======================================================== */
@media (max-width: 640px) {
  .admin-dashboard-page {
    padding: 10px 0 96px;
    width: 100%;
    box-sizing: border-box;
    overflow-x: hidden;
  }

  .admin-container {
    padding: 0 10px;
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
    box-sizing: border-box;
    gap: 14px;
  }

  .admin-topbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 12px;
    border-radius: 18px;
    width: 100%;
    box-sizing: border-box;
  }

  /* 4개 버튼: 모바일에서 2x2 격자 레이아웃으로 줄바꿈/잘림 없이 쾌적하게 */
  .topbar-right {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin-top: 4px;
  }

  .topbar-right button,
  .topbar-right a {
    width: 100%;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 0 8px;
    font-size: 0.78rem;
    font-weight: 700;
    border-radius: 12px;
    box-sizing: border-box;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .topbar-right .btn-text {
    font-size: 0.76rem;
    font-weight: 700;
  }

  .topbar-right .material-icons {
    font-size: 18px;
  }

  /* KPI 지표 카드: 터치 반응 및 2열 격자 */
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    width: 100%;
    box-sizing: border-box;
  }

  .kpi-card {
    cursor: pointer;
    padding: 12px 10px;
    border-radius: 14px;
    transition: transform 0.12s ease;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    box-sizing: border-box;
  }

  .kpi-card:active {
    transform: scale(0.96);
  }

  .kpi-icon {
    font-size: 1.25rem;
    width: 36px;
    height: 36px;
  }

  .kpi-value {
    font-size: 1.1rem;
  }

  /* 관리자 탭 가로 스크롤 & 가운데 시야 보장 */
  .admin-tabs {
    overflow-x: auto;
    scrollbar-width: none;
    padding: 6px 4px;
    flex-wrap: nowrap;
    -webkit-overflow-scrolling: touch;
    gap: 6px;
    width: 100%;
    box-sizing: border-box;
  }

  .admin-tabs::-webkit-scrollbar {
    display: none;
  }

  .admin-tabs .tab-btn {
    white-space: nowrap;
    flex-shrink: 0;
    padding: 8px 12px;
    font-size: 0.78rem;
    border-radius: 12px;
  }

  /* 필터 칩 */
  .filter-chips {
    overflow-x: auto;
    scrollbar-width: none;
    flex-wrap: nowrap;
    padding-bottom: 4px;
    -webkit-overflow-scrolling: touch;
    gap: 5px;
    width: 100%;
    box-sizing: border-box;
  }

  .filter-chips::-webkit-scrollbar {
    display: none;
  }

  .filter-chips .chip {
    white-space: nowrap;
    flex-shrink: 0;
    padding: 6px 10px;
    font-size: 0.74rem;
  }

  /* ========================================================
     1) 주문 관리 카드 (320px 줄바꿈/깨짐 완전 해결)
     ======================================================== */
  .admin-order-card {
    padding: 14px 12px;
    border-radius: 18px;
    width: 100%;
    box-sizing: border-box;
  }

  .order-top {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    padding-bottom: 10px;
  }

  .order-id-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: 6px;
  }

  .order-id-txt {
    font-size: 0.88rem;
    font-weight: 800;
  }

  .order-time {
    font-size: 0.74rem;
    color: #8c7e7b;
  }

  .order-top-right {
    display: flex;
    justify-content: flex-start;
    width: 100%;
  }

  .status-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    padding: 5px 12px;
    font-size: 0.78rem;
    font-weight: 800;
    border-radius: 8px;
  }

  .order-grid {
    grid-template-columns: 1fr;
    gap: 10px;
    width: 100%;
    box-sizing: border-box;
  }

  .info-sec {
    padding: 12px 10px;
    border-radius: 14px;
  }

  .info-row {
    font-size: 0.82rem;
    gap: 6px;
    word-break: break-all;
  }

  .info-row .lbl {
    min-width: 58px;
    font-size: 0.78rem;
  }

  .order-bottom-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    padding-top: 12px;
  }

  .tracking-input-group {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .tracking-lbl {
    font-size: 0.78rem;
  }

  .tracking-inp {
    width: 100%;
    padding: 10px;
    font-size: 0.82rem;
    box-sizing: border-box;
  }

  .btn-save-track {
    width: 100%;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    padding: 8px;
    font-size: 0.82rem;
    border-radius: 10px;
  }

  .status-btn-group {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
  }

  .btn-status {
    width: 100%;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.82rem;
    border-radius: 10px;
    white-space: nowrap;
  }

  /* ========================================================
     2) 고객문의 관리 카드 (답변 버튼 찌그러짐/줄바꿈 해결)
     ======================================================== */
  .inquiry-card {
    padding: 14px 12px;
    border-radius: 16px;
    width: 100%;
    box-sizing: border-box;
  }

  .inq-top {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .inq-badge-line {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    width: 100%;
  }

  .inq-reply-box {
    margin-top: 10px;
    width: 100%;
    box-sizing: border-box;
  }

  .reply-input-row {
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  .reply-inp {
    width: 100%;
    box-sizing: border-box;
    font-size: 0.84rem;
    padding: 10px;
  }

  .btn-save-reply {
    width: 100%;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    font-size: 0.86rem;
    font-weight: 800;
    border-radius: 10px;
  }

  /* ========================================================
     3) 후기 관리 카드 (1글자씩 세로 붕괴되는 현상 완전 해결)
     ======================================================== */
  .reviews-admin-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }

  .rev-admin-row {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 14px 12px;
    border-radius: 16px;
    width: 100%;
    box-sizing: border-box;
  }

  .rev-admin-info {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .rev-admin-top {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 10px;
    width: 100%;
  }

  .rev-stars {
    white-space: nowrap;
  }

  .rev-prod-name {
    white-space: normal;
    word-break: break-all;
    background: #fff0f3;
    padding: 2px 8px;
    border-radius: 6px;
  }

  .rev-admin-date {
    margin-left: auto;
  }

  .rev-admin-text {
    font-size: 0.85rem;
    line-height: 1.5;
    word-break: break-word;
  }

  .rev-admin-actions {
    width: 100%;
    display: flex;
    gap: 8px;
    border-top: 1px dashed #ebdcd0;
    padding-top: 10px;
  }

  .btn-toggle-vis,
  .btn-del-rev {
    flex: 1;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.82rem;
    border-radius: 10px;
    white-space: nowrap;
  }

  /* ========================================================
     4) 설정 카드
     ======================================================== */
  .settings-grid {
    grid-template-columns: 1fr;
    gap: 14px;
    width: 100%;
    box-sizing: border-box;
  }

  .setting-card {
    padding: 16px 12px;
    border-radius: 18px;
    width: 100%;
    box-sizing: border-box;
  }

  .form-group-item input {
    width: 100%;
    box-sizing: border-box;
  }

  .btn-save-all-settings {
    width: 100%;
    padding: 14px;
    font-size: 0.95rem;
  }

  /* 💛 카카오톡 알림 카드 모바일 최적화 */
  .kakao-section {
    padding: 14px 12px;
  }

  .kakao-header {
    gap: 8px;
    align-items: flex-start;
  }

  .kakao-logo {
    width: 36px;
    height: 36px;
    font-size: 1.4rem;
    border-radius: 10px;
    flex-shrink: 0;
  }

  .kakao-title {
    font-size: 0.94rem;
    line-height: 1.35;
    word-break: keep-all;
    overflow-wrap: break-word;
  }

  /* ✏️ 주문서 수정 버튼 & 사진 배너 모바일 최적화 */
  .btn-order-edit-top span {
    display: none;
  }

  .btn-order-edit-top {
    padding: 4px 6px;
  }

  .btn-order-edit {
    width: 100%;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.84rem;
    margin-top: 4px;
  }

  .photo-banner-body {
    max-height: 140px;
  }

  .order-photo-img {
    max-height: 140px;
  }

  /* 🛍️ 주문서 상품 관리 모바일 최적화 */
  .products-panel-header {
    flex-direction: column;
    align-items: stretch;
  }

  .panel-header-actions {
    width: 100%;
  }

  .btn-add-new-prod,
  .btn-reset-prods {
    flex: 1;
    justify-content: center;
    font-size: 0.8rem;
    padding: 8px 10px;
  }

  .admin-products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .prod-card-content {
    padding: 10px;
    gap: 6px;
  }

  .prod-card-name {
    font-size: 0.86rem;
  }

  .prod-card-price {
    font-size: 0.92rem;
  }

  .prod-card-desc {
    display: none;
  }

  .prod-card-actions {
    flex-direction: column;
    gap: 4px;
    padding-top: 6px;
  }

  .btn-edit-prod,
  .btn-del-prod {
    width: 100%;
    padding: 6px;
    font-size: 0.74rem;
  }

  /* 📢 공지 & 주문안내 관리 모바일 최적화 (320px~640px 깨짐 완전 방지) */
  .notices-panel-header {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .notice-editor-card {
    padding: 14px 10px;
    border-radius: 14px;
    width: 100%;
    box-sizing: border-box;
  }

  .editor-card-header {
    flex-wrap: wrap;
    gap: 6px 10px;
  }

  .editor-grid-3 {
    grid-template-columns: 1fr !important;
    gap: 10px !important;
    width: 100%;
    box-sizing: border-box;
  }

  .editor-grid-3 .form-group {
    width: 100%;
    box-sizing: border-box;
  }

  .editor-grid-3 .notice-input,
  .editor-grid-3 .form-input {
    width: 100%;
    box-sizing: border-box;
    font-size: 0.86rem;
    padding: 10px 12px;
  }

  .notices-bottom-actions {
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  .btn-save-notices-bottom {
    width: 100%;
    justify-content: center;
  }

  .popup-config-grid {
    grid-template-columns: 1fr !important;
    gap: 10px !important;
  }

  .popup-type-selector {
    grid-template-columns: 1fr !important;
    gap: 8px !important;
  }

  .target-prod-preview-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .btn-preview-popup,
  .btn-preview-bottom {
    width: 100%;
    justify-content: center;
  }
}

/* 초소형 모바일 기기 (iPhone SE, 320px~360px) 세밀 조정 */
@media (max-width: 360px) {
  .kakao-title {
    font-size: 0.88rem;
  }
  .admin-container {
    padding: 0 6px;
  }

  .admin-topbar {
    padding: 12px 8px;
  }

  .topbar-right button,
  .topbar-right a {
    padding: 0 4px;
    font-size: 0.72rem;
  }

  .topbar-right .btn-text {
    font-size: 0.72rem;
  }

  .kpi-card {
    padding: 10px 6px;
  }

  .kpi-label {
    font-size: 0.72rem;
  }

  .kpi-value {
    font-size: 1rem;
  }
}
</style>
