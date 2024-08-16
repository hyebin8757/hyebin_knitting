import {ref} from "vue";
import {defineStore} from "pinia";
import CryptoJS from "crypto-js";

interface UserModel {
  id? : string,
  password? : string,
}

export const useUserStore = defineStore( "user", () => {
  const isLogin = ref<boolean>( false );

  const setUserInfo = ( userInfo : UserModel ) => {

    const encryptedData = CryptoJS.AES.encrypt( JSON.stringify( userInfo ), "info" ).toString();

    sessionStorage.setItem( "user", encryptedData );
  }

  const getLoginUser = () => {
    const decryptData = CryptoJS.AES.decrypt( sessionStorage.getItem( "user" ) || "" , 'info').toString(CryptoJS.enc.Utf8);
    return  decryptData ? JSON.parse( decryptData ) : "";
  }

  const setLogin = ( state : boolean ) => {
    isLogin.value = state;
  }

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