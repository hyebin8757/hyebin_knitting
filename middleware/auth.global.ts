import { useUserStore } from "~/stores/useUserStore";

export default defineNuxtRouteMiddleware((to) => {
  // 로그인 페이지, 랜딩 페이지, 회원가입 페이지는 통과시킵니다.
  if (to.path === "/login" || to.path === "/login/login" || to.path === "/" || to.path === "/join") {
    return;
  }

  const userStore = useUserStore();

  // sessionStorage 내에 로그인된 암호화 세션 정보가 존재할 경우 인증 통과로 판정
  const hasSession = typeof window !== "undefined" && sessionStorage.getItem("user");

  if (!userStore.isLogin && !hasSession) {
    return navigateTo("/login/login");
  }
});
