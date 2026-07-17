import { useUserStore } from "~/stores/useUserStore";

export default defineNuxtRouteMiddleware((to) => {
  // 로그인 페이지, 랜딩 페이지, 회원가입 페이지는 통과시킵니다.
  if (to.path === "/login" || to.path === "/login/login" || to.path === "/" || to.path === "/join") {
    return;
  }

  const userStore = useUserStore();

  // 로그인되지 않은 상태로 다른 페이지 접근 시 로그인 페이지로 강제 이동
  if (!userStore.isLogin) {
    return navigateTo("/login/login");
  }
});
