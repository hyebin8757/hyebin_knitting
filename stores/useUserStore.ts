import {ref} from "vue";
import {defineStore} from "pinia";
import CryptoJS from "crypto-js";

interface UserModel {
  id? : string,
  password? : string,
}

export const useUserStore = defineStore( "user", () => {
  // 로그인 유무 확인
  const isLogin = ref<boolean>( false );

  // 로그인 데이터 설정 및 암호화
  const setUserInfo = ( userInfo : UserModel ) => {
    const encryptedData = CryptoJS.AES.encrypt( JSON.stringify( userInfo ), "info" ).toString();

    sessionStorage.setItem( "user", encryptedData );
  }

  // 로그인 정보 복호화
  const getLoginUser = () => {
    const decryptData = CryptoJS.AES.decrypt( sessionStorage.getItem( "user" ) || "" , 'info').toString(CryptoJS.enc.Utf8);

    return  decryptData ? JSON.parse( decryptData ) : "";
  }

  // 로그인 유무 설정
  const setLogin = ( state : boolean ) => {
    isLogin.value = state;
  }

  // 로그아웃
  const logout = () => {
    sessionStorage.removeItem( "user" );
    sessionStorage.removeItem( "sidebar" );
    sessionStorage.removeItem( "menu" );

    location.href = "/login/login";
  };

  return {
    isLogin,
    getLoginUser,
    setUserInfo,
    setLogin,
    logout,
  };
}, {
  persist : {
    storage: persistedState.sessionStorage,
  }
} );