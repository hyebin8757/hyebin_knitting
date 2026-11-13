<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useKnittingStore, type NotificationItem } from "~/stores/useKnittingStore";

const router = useRouter();
const store = useKnittingStore();

const activeTab = ref<"all" | "order" | "refund" | "inquiry" | "review">("all");
const copySuccessId = ref<string>("");
const testKakaoStatus = ref<string>("");

const filteredNotifications = computed(() => {
  if (activeTab.value === "all") {
    return store.notifications;
  }
  return store.notifications.filter((n) => n.type === activeTab.value);
});

const getTabCount = (type: "all" | "order" | "refund" | "inquiry" | "review") => {
  if (type === "all") return store.notifications.length;
  return store.notifications.filter((n) => n.type === type).length;
};

const handleItemClick = (item: NotificationItem) => {
  store.markNotificationAsRead(item.id);
  if (item.link) {
    if (item.link.startsWith("/admin") && !store.isAdminLoggedIn) {
      // 일반 방문자가 주문 알림을 누른 경우, 관리자 로그인이 아니라 주문 조회 모달을 띄워줌
      store.isNotificationModalOpen = false;
      store.isOrderLookupModalOpen = true;
      return;
    }
    if (item.link === "/reviews" && !store.isAdminLoggedIn) {
      store.isNotificationModalOpen = false;
      return;
    }
    store.isNotificationModalOpen = false;
    router.push(item.link);
  }
};

const copyText = async (id: string, text: string) => {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    copySuccessId.value = id;
    store.showToast("클립보드에 복사되었습니다! ✨");
    setTimeout(() => {
      copySuccessId.value = "";
    }, 2000);
  } catch (err) {
    console.error("복사 실패:", err);
  }
};

const sendTestNotification = async () => {
  testKakaoStatus.value = "발송 중...";
  // 알림음 및 진동
  store.playChimeSound();
  store.triggerVibration();

  // 테스트 알림 항목 추가
  store.addNotification({
    type: "order",
    title: "🛍️ [테스트] 실시간 알림 수신 성공!",
    message: "실시간 모바일 알림음과 진동, 카카오톡 푸시가 정상 작동 중입니다 ✨",
    link: "/admin",
    metadata: {
      buyerName: "테스트 주문자",
      amount: 14000,
      phone: "010-0000-0000",
    },
  });

  if (store.settings.kakaoAlertEnabled && store.settings.kakaoAccessToken) {
    const res = await store.sendKakaoTalkMessage("🔔 [테스트] 앉은누이 뜨개옷장 모바일 알림이 정상적으로 수신되었습니다! 🧶");
    if (res?.success) {
      testKakaoStatus.value = "카톡 & 모바일 알림 완료! 💛";
    } else {
      testKakaoStatus.value = "알림 완료 (카톡 토큰 확인 필요)";
    }
  } else {
    testKakaoStatus.value = "모바일 소리/진동 알림 완료! 🔔";
  }

  setTimeout(() => {
    testKakaoStatus.value = "";
  }, 3500);
};

const closeModal = () => {
  store.isNotificationModalOpen = false;
};
</script>

<template>
  <transition name="modal-fade">
    <div v-if="store.isNotificationModalOpen" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-sheet" role="dialog" aria-modal="true">
        <!-- 모바일 드래그 핸들 바 -->
        <div class="mobile-drag-handle" @click="closeModal">
          <div class="handle-bar"></div>
        </div>

        <!-- 모달 헤더 -->
        <header class="sheet-header">
          <div class="header-title-box">
            <div class="title-with-badge">
              <span class="bell-emoji">🔔</span>
              <h2 class="title-text">실시간 알림 센터</h2>
              <span v-if="store.unreadNotificationCount > 0" class="unread-pill">
                {{ store.unreadNotificationCount }}개 안읽음
              </span>
            </div>
            <p class="subtitle">
              {{ store.isAdminLoggedIn ? '새 주문, 환불, 리뷰, 고객 문의를 실시간으로 확인하세요' : '주문 진행 상황 및 공방 알림을 확인하세요 ✨' }}
            </p>
          </div>

          <div class="header-actions">
            <button
              v-if="store.notifications.length > 0 && store.unreadNotificationCount > 0"
              type="button"
              class="btn-mark-all"
              @click="store.markAllNotificationsAsRead"
              title="모든 알림 읽음 처리"
            >
              <i class="material-icons">done_all</i>
              <span>모두 읽음</span>
            </button>
            <button type="button" class="btn-close" @click="closeModal" aria-label="닫기">
              <i class="material-icons">close</i>
            </button>
          </div>
        </header>

        <!-- 필터 탭 -->
        <nav class="filter-tabs">
          <button
            type="button"
            class="tab-btn"
            :class="{ active: activeTab === 'all' }"
            @click="activeTab = 'all'"
          >
            <span>전체</span>
            <span class="tab-badge">{{ getTabCount("all") }}</span>
          </button>
          <button
            type="button"
            class="tab-btn"
            :class="{ active: activeTab === 'order' }"
            @click="activeTab = 'order'"
          >
            <span>🛍️ 주문</span>
            <span class="tab-badge">{{ getTabCount("order") }}</span>
          </button>
          <button
            type="button"
            class="tab-btn"
            :class="{ active: activeTab === 'refund' }"
            @click="activeTab = 'refund'"
          >
            <span>💸 환불</span>
            <span class="tab-badge">{{ getTabCount("refund") }}</span>
          </button>
          <button
            type="button"
            class="tab-btn"
            :class="{ active: activeTab === 'inquiry' }"
            @click="activeTab = 'inquiry'"
          >
            <span>💌 문의</span>
            <span class="tab-badge">{{ getTabCount("inquiry") }}</span>
          </button>
          <button
            type="button"
            class="tab-btn"
            :class="{ active: activeTab === 'review' }"
            @click="activeTab = 'review'"
          >
            <span>⭐ 후기</span>
            <span class="tab-badge">{{ getTabCount("review") }}</span>
          </button>
        </nav>

        <!-- 알림 리스트 바디 -->
        <div class="sheet-body">
          <transition-group name="list-anim" tag="div" class="notification-list">
            <!-- 알림 항목 카드 -->
            <article
              v-for="item in filteredNotifications"
              :key="item.id"
              class="notif-card"
              :class="[`type-${item.type}`, { unread: !item.isRead }]"
              @click="handleItemClick(item)"
            >
              <!-- 좌측 타입 아이콘 -->
              <div class="card-icon-col">
                <div class="icon-circle" :class="`icon-${item.type}`">
                  <span v-if="item.type === 'order'">🛍️</span>
                  <span v-else-if="item.type === 'refund'">💸</span>
                  <span v-else-if="item.type === 'inquiry'">💌</span>
                  <span v-else-if="item.type === 'review'">⭐</span>
                  <span v-else>🔔</span>
                </div>
                <span v-if="!item.isRead" class="unread-dot" title="읽지 않은 알림"></span>
              </div>

              <!-- 중앙 내용 -->
              <div class="card-content-col">
                <div class="card-top-row">
                  <span class="type-tag" :class="`tag-${item.type}`">
                    {{ item.type === 'order' ? '주문' : item.type === 'refund' ? '환불' : item.type === 'inquiry' ? '문의' : item.type === 'review' ? '포토후기' : '알림' }}
                  </span>
                  <h3 class="card-title">{{ item.title }}</h3>
                  <time class="card-time">{{ item.createdAt }}</time>
                </div>

                <p class="card-message">{{ item.message }}</p>

                <!-- 추가 메타데이터 미리보기 -->
                <div v-if="item.metadata" class="meta-chips">
                  <span v-if="item.metadata.buyerName" class="chip chip-buyer">
                    👤 {{ item.metadata.buyerName }}
                  </span>
                  <span v-if="item.metadata.amount" class="chip chip-price">
                    💰 {{ item.metadata.amount.toLocaleString() }}원
                  </span>
                  <span v-if="item.metadata.orderId" class="chip chip-id">
                    #{{ item.metadata.orderId }}
                  </span>
                  <span v-if="item.metadata.productName" class="chip chip-product">
                    🧶 {{ item.metadata.productName }}
                  </span>
                </div>

                <!-- 빠른 액션 버튼들 -->
                <div class="card-actions" @click.stop>
                  <button
                    v-if="item.metadata?.orderId"
                    type="button"
                    class="action-btn"
                    @click="copyText(item.id + '-id', item.metadata.orderId)"
                  >
                    <i class="material-icons">content_copy</i>
                    <span>{{ copySuccessId === item.id + '-id' ? '복사완료!' : '주문번호 복사' }}</span>
                  </button>
                  <button
                    v-if="item.link"
                    type="button"
                    class="action-btn highlight"
                    @click="handleItemClick(item)"
                  >
                    <i class="material-icons">arrow_forward</i>
                    <span>{{ item.type === 'review' ? '후기 보기' : (store.isAdminLoggedIn ? '상세보기' : '조회하기') }}</span>
                  </button>
                </div>
              </div>

              <!-- 개별 삭제 버튼 -->
              <button
                type="button"
                class="btn-delete"
                @click.stop="store.deleteNotification(item.id)"
                title="알림 삭제"
              >
                <i class="material-icons">close</i>
              </button>
            </article>
          </transition-group>

          <!-- 빈 상태 (Empty State) -->
          <div v-if="filteredNotifications.length === 0" class="empty-state">
            <div class="empty-icon-wrap">
              <span class="empty-emoji">🌿</span>
            </div>
            <h4 class="empty-title">도착한 알림이 없습니다</h4>
            <p class="empty-desc">
              새로운 뜨개옷 주문, 취소/환불, 문의, 포토 후기가 들어오면<br />
              이곳에 실시간으로 표시되고 소리/진동이 울립니다.
            </p>
            <button type="button" class="btn-send-test" @click="sendTestNotification">
              <span class="btn-icon">⚡</span>
              <span>알림 테스트 발송해보기</span>
            </button>
          </div>
        </div>

        <!-- 하단 간편 컨트롤 & 알림 설정 바 -->
        <footer class="sheet-footer">
          <div class="quick-toggles">
            <!-- 소리 알림 스위치 -->
            <label class="toggle-pill" :class="{ active: store.settings.soundAlertEnabled }">
              <input
                type="checkbox"
                v-model="store.settings.soundAlertEnabled"
                @change="store.saveToLocalStorage"
                class="sr-only"
              />
              <span class="pill-icon">{{ store.settings.soundAlertEnabled ? '🔊' : '🔇' }}</span>
              <span class="pill-text">소리</span>
            </label>

            <!-- 진동 알림 스위치 -->
            <label class="toggle-pill" :class="{ active: store.settings.soundAlertEnabled }">
              <span class="pill-icon">📳</span>
              <span class="pill-text">진동</span>
            </label>

            <!-- 카카오톡 연동 상태 -->
            <div class="kakao-status-pill">
              <span class="kakao-icon">💛</span>
              <span class="kakao-text">
                {{ store.settings.kakaoAccessToken ? '카톡 연동됨' : '카톡 미연동' }}
              </span>
            </div>
          </div>

          <div class="footer-actions">
            <!-- 테스트 알림 발송 버튼 -->
            <button
              type="button"
              class="btn-test-trigger"
              @click="sendTestNotification"
              title="소리, 진동, 카카오톡 알림 테스트"
            >
              <span>{{ testKakaoStatus || '🔔 알림 테스트' }}</span>
            </button>

            <!-- 모두 비우기 -->
            <button
              v-if="store.notifications.length > 0"
              type="button"
              class="btn-clear-all"
              @click="store.clearAllNotifications"
            >
              모두 비우기
            </button>
          </div>
        </footer>
      </div>
    </div>
  </transition>
</template>

<style scoped>
/* 배경 오버레이 */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(43, 31, 29, 0.55);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: flex-end; /* 모바일: 하단 바텀시트 */
  justify-content: center;
  padding: 0;
}

@media (min-width: 641px) {
  .modal-backdrop {
    align-items: center; /* 데스크톱: 중앙 다이얼로그 */
    padding: 20px;
  }
}

/* 바텀시트 본체 */
.modal-sheet {
  width: 100%;
  max-width: 560px;
  max-height: 88dvh;
  background: #ffffff;
  border-top-left-radius: 28px;
  border-top-right-radius: 28px;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  -webkit-overflow-scrolling: touch;
  animation: slideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

@media (min-width: 641px) {
  .modal-sheet {
    border-radius: 24px;
    box-shadow: 0 20px 50px rgba(43, 31, 29, 0.22);
    animation: popCenter 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes popCenter {
  from {
    transform: scale(0.92);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* 모바일 드래그 핸들 */
.mobile-drag-handle {
  width: 100%;
  padding: 10px 0 4px;
  display: flex;
  justify-content: center;
  cursor: pointer;
}

.handle-bar {
  width: 44px;
  height: 5px;
  background: #e2d9d2;
  border-radius: 3px;
}

/* 헤더 */
.sheet-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 12px 20px 14px;
  border-bottom: 1px solid #f1eae2;
  gap: 12px;
}

.title-with-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.bell-emoji {
  font-size: 1.3rem;
  animation: bellRing 2.4s infinite ease-in-out;
}

@keyframes bellRing {
  0%, 100% { transform: rotate(0); }
  10%, 30% { transform: rotate(14deg); }
  20%, 40% { transform: rotate(-14deg); }
  50% { transform: rotate(0); }
}

.title-text {
  margin: 0;
  font-size: 1.18rem;
  font-weight: 800;
  color: #2b1f1d;
  letter-spacing: -0.3px;
}

.unread-pill {
  font-size: 0.72rem;
  font-weight: 700;
  color: #ff3366;
  background: #ffe4e9;
  padding: 3px 8px;
  border-radius: 12px;
}

.subtitle {
  margin: 4px 0 0;
  font-size: 0.8rem;
  color: #8c7e7b;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-mark-all {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #fbf5ef;
  border: 1px solid #ecdcd2;
  color: #634d47;
  padding: 6px 10px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.btn-mark-all i {
  font-size: 16px;
  color: #ff4d6d;
}

.btn-mark-all:hover {
  background: #f4e8dc;
}

.btn-close {
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
  transition: background 0.2s;
}

.btn-close:hover {
  background: #e8dcd2;
}

.btn-close i {
  font-size: 18px;
}

/* 필터 탭 바 */
.filter-tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: #faf6f1;
  border-bottom: 1px solid #f1eae2;
  overflow-x: auto;
  scrollbar-width: none;
}

.filter-tabs::-webkit-scrollbar {
  display: none;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  background: #ffffff;
  border: 1px solid #e7dcd2;
  color: #6d5b56;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.tab-btn.active {
  background: #ff4d6d;
  color: #ffffff;
  border-color: #ff4d6d;
  box-shadow: 0 3px 8px rgba(255, 77, 109, 0.3);
}

.tab-badge {
  font-size: 0.7rem;
  background: rgba(0, 0, 0, 0.08);
  padding: 1px 6px;
  border-radius: 10px;
  font-weight: 700;
}

.tab-btn.active .tab-badge {
  background: rgba(255, 255, 255, 0.3);
  color: #ffffff;
}

/* 바디 (스크롤 영역) */
.sheet-body {
  flex: 1;
  overflow-y: auto;
  padding: 14px 16px;
  background: #fdfbf9;
  -webkit-overflow-scrolling: touch;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 알림 카드 */
.notif-card {
  position: relative;
  display: flex;
  gap: 12px;
  padding: 14px;
  background: #ffffff;
  border-radius: 18px;
  border: 1.5px solid #f0e6dd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  cursor: pointer;
  transition: all 0.2s ease;
}

.notif-card:hover {
  transform: translateY(-1px);
  border-color: #e5d4c6;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
}

.notif-card.unread {
  background: #fffdf9;
  border-color: #ffd4dc;
  box-shadow: 0 4px 14px rgba(255, 77, 109, 0.08);
}

/* 타입별 테두리 포인트 */
.notif-card.type-order.unread {
  border-left: 4px solid #ff4d6d;
}
.notif-card.type-refund.unread {
  border-left: 4px solid #f97316;
}
.notif-card.type-inquiry.unread {
  border-left: 4px solid #8b5cf6;
}
.notif-card.type-review.unread {
  border-left: 4px solid #eab308;
}

/* 아이콘 컬럼 */
.card-icon-col {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icon-circle {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.icon-order {
  background: #ffe5ec;
}
.icon-refund {
  background: #ffedd5;
}
.icon-inquiry {
  background: #ede9fe;
}
.icon-review {
  background: #fef9c3;
}

.unread-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ff3366;
  border: 2px solid #ffffff;
  animation: pulseDot 1.8s infinite;
}

@keyframes pulseDot {
  0% { transform: scale(0.9); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.8; }
  100% { transform: scale(0.9); opacity: 1; }
}

/* 카드 콘텐츠 */
.card-content-col {
  flex: 1;
  min-width: 0;
}

.card-top-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.type-tag {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 8px;
}

.tag-order { background: #ffe5ec; color: #ff3366; }
.tag-refund { background: #ffedd5; color: #ea580c; }
.tag-inquiry { background: #ede9fe; color: #7c3aed; }
.tag-review { background: #fef9c3; color: #b45309; }

.card-title {
  margin: 0;
  font-size: 0.88rem;
  font-weight: 700;
  color: #2b1f1d;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-time {
  font-size: 0.7rem;
  color: #a89a96;
}

.card-message {
  margin: 0 0 8px;
  font-size: 0.82rem;
  color: #5c4a45;
  line-height: 1.45;
  word-break: break-all;
}

/* 메타 칩스 */
.meta-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}

.chip {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
  background: #f5ede6;
  color: #634d47;
}

.chip-price {
  background: #eef8f1;
  color: #0f766e;
  font-weight: 700;
}

.chip-id {
  background: #f1f3f9;
  color: #3b5998;
}

/* 카드 액션 버튼 */
.card-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: #f7efe7;
  border: 1px solid #ebd8cb;
  color: #614d47;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
}

.action-btn i {
  font-size: 13px;
}

.action-btn:hover {
  background: #eedfd2;
}

.action-btn.highlight {
  background: #fff0f3;
  border-color: #ffd0da;
  color: #ff3366;
}

.action-btn.highlight:hover {
  background: #ffe2e8;
}

/* 개별 삭제 버튼 */
.btn-delete {
  background: none;
  border: none;
  color: #b5a4a0;
  cursor: pointer;
  padding: 4px;
  height: 28px;
  width: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-delete:hover {
  background: #f3eae2;
  color: #ff4d6d;
}

.btn-delete i {
  font-size: 16px;
}

/* 빈 상태 */
.empty-state {
  text-align: center;
  padding: 48px 20px;
}

.empty-icon-wrap {
  width: 72px;
  height: 72px;
  margin: 0 auto 16px;
  background: #fbf6f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #e5d7cc;
}

.empty-emoji {
  font-size: 2.2rem;
}

.empty-title {
  margin: 0 0 6px;
  font-size: 1.05rem;
  font-weight: 700;
  color: #3b2a26;
}

.empty-desc {
  margin: 0 0 20px;
  font-size: 0.82rem;
  color: #8c7e7b;
  line-height: 1.5;
}

.btn-send-test {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ff4d6d;
  color: #ffffff;
  border: none;
  padding: 10px 18px;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(255, 77, 109, 0.3);
  transition: transform 0.2s;
}

.btn-send-test:hover {
  transform: translateY(-2px);
}

/* 하단 푸터 바 */
.sheet-footer {
  padding: 12px 18px calc(12px + env(safe-area-inset-bottom, 0px));
  background: #fbf7f2;
  border-top: 1px solid #f0e6dd;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.quick-toggles {
  display: flex;
  align-items: center;
  gap: 6px;
}

.toggle-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #ffffff;
  border: 1px solid #ebd9cd;
  padding: 5px 10px;
  border-radius: 16px;
  font-size: 0.74rem;
  font-weight: 600;
  color: #634d47;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s;
}

.toggle-pill.active {
  border-color: #ff4d6d;
  color: #ff3366;
}

.kakao-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #fee500;
  padding: 5px 10px;
  border-radius: 16px;
  font-size: 0.74rem;
  font-weight: 700;
  color: #191919;
}

.footer-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-test-trigger {
  background: #ff4d6d;
  color: #ffffff;
  border: none;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-test-trigger:hover {
  background: #e63956;
}

.btn-clear-all {
  background: none;
  border: none;
  color: #a3918d;
  font-size: 0.74rem;
  cursor: pointer;
  text-decoration: underline;
  padding: 4px 6px;
}

.btn-clear-all:hover {
  color: #ff4d6d;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

/* 트랜지션 애니메이션 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.list-anim-move,
.list-anim-enter-active,
.list-anim-leave-active {
  transition: all 0.25s ease;
}

.list-anim-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.list-anim-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
