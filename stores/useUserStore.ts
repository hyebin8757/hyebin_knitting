import {ref,computed} from "vue";
import Cookies from "js-cookie";
import {defineStore} from "pinia";

const { isNotEmpty } = useUtil.typeValidation;

interface UserModel {
  id? : string,
  password? : string,
}

export const useUserStore = defineStore( "user", () => {
  const loginUser = ref<UserModel>( {} );

  const getLoginUser = computed( () => loginUser.value );

  // 로그인중인지 체크.
  const isLogin = computed(() => {
    return isNotEmpty( loginUser.value );
  });

  const setUserInfo = ( userInfo : UserModel ) => {
    // sessionStorage.setItem( "user", `${userInfo}` );

    const z = JSON.stringify( userInfo );

    sessionStorage.setItem( "user", JSON.stringify( userInfo ) );

    console.log( JSON.parse( z ) );
  }

  const login = ( user: UserModel ) => {
    loginUser.value = user;
  };

  const logout = () => {
    // user pinia store 초기화
    resetState();

    // 카테고리 pinia store 초기화
    sessionStorage.removeItem( "user" );

    location.href = "/login/login";
  };

  /**
   * 로그아웃 시 user pinia store 제거
   */
  const resetState = () => {
    loginUser.value = {};
  }

  return {
    loginUser,
    getLoginUser,
    isLogin,
    setUserInfo,
    login,
    logout,
  };
}, {
  persist : {
    storage: persistedState.sessionStorage,
  }
} );