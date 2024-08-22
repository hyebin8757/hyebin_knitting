import {computed, ref} from "vue";
import {defineStore} from "pinia";
import {useUtil} from "~/utils/useUtil";
import {TabMenuList} from "~/types/site/components/tabMenuList";
import {SidebarMenu} from "~/types/site/components/sidebar";

const { isEmpty, isNotEmpty } = useUtil.typeValidation;

export const useMenuStore = defineStore( "menu", () => {
  // 메뉴 리스트
  const getAfterMenuList = ref<TabMenuList[]>([]);

  // 지워진 메뉴 리스트
  const getMenuGarbageList = ref<TabMenuList[]>([]);

  // 복원 된 메뉴 리스트
  const getRestoreMenuList = ref<TabMenuList[]>([]);

  // 지워진 메뉴가 있는지 확인
  const isMenuGarbageList = computed( () => {
    return isNotEmpty( getMenuGarbageList.value.length );
  });

  // 복원된 메뉴가 있는지 확인
  const isRestoreMenuList = computed( () => {
    return isNotEmpty( getRestoreMenuList.value.length );
  });

  // 메뉴 설정
  const setAfterMenuList = ( menuList : TabMenuList[] ) => {
    if ( isEmpty( menuList ) ) {
      return;
    }

    getAfterMenuList.value = menuList;
  }

  // 지워진 메뉴 설정
  const setMenuGarbageList = ( menu : TabMenuList )  => {
    if ( isEmpty( menu ) ) {
      return;
    }

    getMenuGarbageList.value.push( menu );
  }

  // 복원된 메뉴 설정
  const setRestoreMenuList = ( menuList : TabMenuList[] ) => {
    if ( isEmpty( menuList ) ) {
      return;
    }

    getRestoreMenuList.value = menuList;
  }

  // 지워진 메뉴 리스트 삭제
  const removeMenuGarbageList = ( menu : SidebarMenu ) => {
    if ( isEmpty( menu ) || !isMenuGarbageList.value ) {
      return;
    }

    getMenuGarbageList.value = getMenuGarbageList.value.filter( menuItem => menu.label !== menuItem.value );
  }

  // 리스트 삭제
  const menuReset = () => {
    getMenuGarbageList.value = [];
    getRestoreMenuList.value = [];
  }

  return {
    getAfterMenuList,
    getMenuGarbageList,
    getRestoreMenuList,
    isMenuGarbageList,
    isRestoreMenuList,
    setAfterMenuList,
    setMenuGarbageList,
    setRestoreMenuList,
    removeMenuGarbageList,
    menuReset
  };
}, {
  persist : {
    storage: persistedState.sessionStorage,
  }
} );