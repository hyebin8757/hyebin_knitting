import {ref} from "vue";
import {defineStore} from "pinia";
import CryptoJS from "crypto-js";

interface UserModel {
  id? : string,
  password? : string,
  hasChangedCredentials?: boolean;
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
    const rawData = sessionStorage.getItem( "user" );
    if (!rawData) {
      // 최초 가입 정보 (어드민이 미리 등록한 정보)
      return { id: "testUser", password: "0000", hasChangedCredentials: false };
    }
    try {
      const decryptData = CryptoJS.AES.decrypt( rawData , 'info').toString(CryptoJS.enc.Utf8);
      return decryptData ? JSON.parse( decryptData ) : { id: "testUser", password: "0000", hasChangedCredentials: false };
    } catch (e) {
      return { id: "testUser", password: "0000", hasChangedCredentials: false };
    }
  }

  // 로그인 유무 설정
  const setLogin = ( state : boolean ) => {
    isLogin.value = state;
  }

  // ID/비밀번호 변경 액션 (최초 1회 제한용)
  const changeCredentials = (newId: string, newPassword: string) => {
    const userInfo: UserModel = {
      id: newId,
      password: newPassword,
      hasChangedCredentials: true
    };
    setUserInfo(userInfo);
  }

  // 로그아웃
  const logout = () => {
    sessionStorage.removeItem( "user" );
    sessionStorage.removeItem( "sidebar" );
    sessionStorage.removeItem( "menu" );

    location.href = "/login";
  };

  return {
    isLogin,
    getLoginUser,
    setUserInfo,
    setLogin,
    changeCredentials,
    logout,
  };
}, {
  persist : {
    storage: persistedState.sessionStorage,
  }
} );