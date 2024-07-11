import { css } from "@emotion/css";
import {_uiUtil} from "@/utils/core/ui/uiUtil";

const { setMedia } = _uiUtil();

/************************************************************
 * style data
 ************************************************************/
export const CommonLayoutStyle = {
  headerHeight: 5.8, // 헤더 높이
  contentXPadding: 2, // 컨텐트 X 패딩
  bottomNavigationHeight: 5.8, // 하단 탭 높이
}

/************************************************************
 * style
 ************************************************************/
export const UserLayoutStyle = {
  Default : css`
    background-color: var( --background-color-1 );
    
    &.is-floating {
      header {
        z-index: 0 !important;
        transition: none;
      }
    }
  `,


  Container : css`
    margin: 0 auto;
    height: 100%;
    padding : ${ CommonLayoutStyle.headerHeight }rem 0 ${ CommonLayoutStyle.bottomNavigationHeight }rem;
    
    main,
    .content {
      width: 100%;
      height: 100%;
    }
    
    .content {
      padding-bottom: 1.6rem;
    }
    
    .content__body {
      padding-bottom: 0;
    }
  `,

  ContainerMedia : {
    1280 : css`
    `,

    1024 : css`
    `,

    768 : css`
      
    `,

    640 : css`
      
    `,
  },

  SideMenu : css `
  `
}

/************************************************************
 * style override
 ************************************************************/
UserLayoutStyle.Container = css`
  ${ UserLayoutStyle.Container };
  ${ setMedia( UserLayoutStyle.ContainerMedia, 'min' ) };
`;