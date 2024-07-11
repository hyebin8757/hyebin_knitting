import { css, injectGlobal } from "@emotion/css";
import {StyleUtils} from "~/styleUtils/styleUtils";
import {_uiUtil} from "@/utils/core/ui/uiUtil";

const { setMedia } = _uiUtil();

/************************************************************
 * global style
 ************************************************************/
injectGlobal`
`;

/************************************************************
 * style data
 ************************************************************/
export const LayoutStyleOption = {
  maxWidth : 1330,
}

/************************************************************
 * style
 ************************************************************/
export const UserLayoutStyle = {
  Default : css``,

  PaddingBox : css`
    height: 100%;
    /**
     * header : 4.8rem;
     * breadcrumb : 9.6rem;
     * footer : 22rem;
   */
    max-height: calc( 100% -  4.8rem  - 9.6rem - 22rem );
    padding: 0 2rem;

    &.is-banner-none {
      max-height: calc( 100% -  4.8rem - 8.6rem - 22rem );
    }
    
    &.is-mobile {
      max-height: calc( 100% -  4.8rem  - 22rem );
    }
  `,

  Container : css`
    ${StyleUtils.FlexUtils('stretch','flex-start')};
    gap: 3.5rem;
    position: relative;
    max-width: ${LayoutStyleOption.maxWidth}px;
    height: 100%;
    max-height: calc( 100% - 11.5rem );
    margin: 0 auto;
    padding-bottom: 8rem;
    
    .content {
      height: auto;
      min-height: 100%;
      width: 100%;
    }
    
    main {
      width: 100%;
      height: 100%;
    }

    main {
      max-width: calc( 100% - ${ SidebarData.sidebarWidth + 3 }rem );
      
      &.max-w-full {
        max-width: 100%;
      }
    }
    
    .content__body {
      padding-bottom: 0;
    }
    
    .tree {
      overflow-x: hidden;
    }
  `,

  FrequentBtn : css`
    position: fixed !important;
    right: 1.6rem;
    bottom: 2.1rem;
    width:  4.2rem;
    height: 4.2rem;
    color: var( --white-color ) !important;
    background: var( --secondary-darken-color-2 ) !important;
    z-index: 10;
    
    [ class ^= 'material' ] {
      width: 2.4rem !important;
      font-size: 2.4rem !important;
    }
  `,

  MobileSearchPopup : css`
    .v-overlay__content {
      max-height: 100vh !important;
      height: 100%;
      
      .v-card {
        height: 100%;
        border-radius: 0 !important;

        &-text {
          padding: 0 !important;
          
          .v-input {
            margin: 0 1rem;
          }
        }
      }

      .v-toolbar {
        background: transparent;

        &__content {
          justify-content: flex-end;
        }
      }
    }
  `,
}

/************************************************************
 * media style
 ************************************************************/
const MediaStyle = {
  ContainerMedia : {
    /** [ 1280px ] */
    1280 : css`
      max-width: ${LayoutStyleOption.maxWidth}px;
    `,

    /** [ 1024px ] */
    1024 : css`
      max-width: initial;

      main {
        max-width: initial;
      }
    `,

    /** [ 768px ] */
    768 : css`
      
    `,

    /** [ 640px ] */
    640 : css`
      
    `,

    /** [ 450px ] */
    450 : css `
      &.container {
        height: calc( 100% -  4.8rem  - 13rem - 9.6rem );
      }
      
      .content__body {
        padding-bottom: 2.4rem;
      }
      
      .content__footer {
        flex-direction: column-reverse;
        align-items: flex-start;
        gap: 1.2rem;

        .v-btn.v-btn--size-default {
          width: 100%;
        }
      }
    `
  },
}

/************************************************************
 * style override
 ************************************************************/
UserLayoutStyle.Container = css`
  ${ UserLayoutStyle.Container };
  ${ setMedia( MediaStyle.ContainerMedia, 'max' ) };
`;