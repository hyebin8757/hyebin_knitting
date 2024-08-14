import {computed, ref} from "vue";
import {defineStore} from "pinia";
import {useUtil} from "~/utils/useUtil";
import {SidebarMenu} from "~/types/site/components/sidebar";

const { isEmpty, isNotEmpty } = useUtil.typeValidation;

export const useSidebarStore = defineStore( "sidebar", () => {
  // sidebar menu width
  const getSidebarMenuListWidth = ref<number>( 0 );

  // sidebar menu width size 설정
  const setSidebarMenuListWidth = ( width : number ) => {
    if ( isEmpty( width ) ) {
      return;
    }

    getSidebarMenuListWidth.value = width;
  }

  // 즐겨 찾기 메뉴가 있는지 확인
  const isBookmarkList = computed( () => {
    return isNotEmpty( getBookmarkList.value.length );
  })

  // sidebar 즐겨 찾기 메뉴 리스트
  const getBookmarkList = ref([]);

  // 즐겨 찾기 메뉴 설정
  const setBookmarkList = ( item : SidebarMenu ) => {
    if ( isEmpty( item ) ) {
     return;
    }

    getBookmarkList.value.push( item );

    return getBookmarkList.value;
  };

  // 즐겨 찾기 메뉴 삭제
  const removeBookmarkList = ( item : SidebarMenu ) => {
    if ( isEmpty( item ) ) {
      return;
    }

    getBookmarkList.value = getBookmarkList.value.filter( items => item.label !== items.label );

    return getBookmarkList.value;
  }

  return {
    getSidebarMenuListWidth,
    setSidebarMenuListWidth,
    isBookmarkList,
    getBookmarkList,
    setBookmarkList,
    removeBookmarkList,
  };
}, {
  persist : {
    storage: persistedState.sessionStorage,
  }
} );