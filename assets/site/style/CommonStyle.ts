import {css, injectGlobal} from "@emotion/css";
import {StyleUtils} from "~/styleUtils/styleUtils";
import {_uiUtil} from "~/utils/core/ui/uiUtil";

const { useImage } = useUtil.AssetResolverUtil;
const { setMedia } = _uiUtil();

/************************************************************
 * global style
 ************************************************************/
injectGlobal`
  /******************
   - v-tooltip 
   ******************/
  .v-tooltip {
    &[tooltip-none = true] {
      display: none;
    }

    &[is-tooltip-active = true] {
      .v-overlay__content {
        background: var( --primary-lighten-color-1 ) !important;
      }
    }

    .v-overlay__content {
      color: var( --white-color ) !important;
      background: rgba( 0,0,0, 0.6) !important;
    }
  }

  /******************
  - v-menu
  ******************/
  .title-menu__list {
    border-radius: 1rem !important;
    
    .v-list {
      padding: 0;
    }
    
    .v-list-item {
      cursor: pointer;
      
      [ class ^= 'material' ] {
        font-size: 1.5rem;
      } 
      
      &:hover {
        background: var( --primary-lighten-color-1 );
        color: var( --white-color );
      }
    }
  }

  .v-menu {
    .v-list-item--active > .v-list-item__overlay,
    .v-list-item[aria-haspopup=menu][aria-expanded=true] > .v-list-item__overlay {
      background: var( --primary-color ) !important;
    }

    .v-list-item:hover,
    .v-list-item:hover > .v-list-item__overlay {
      background: rgba( 54, 153, 246, 0.1 ) !important;
    }
  }

  /******************
    - pagination
  ******************/
  .pagination-row {
    .pagination {
      > li {
        border: 0 none !important;
        font-size: 1.4rem;
        
        &.active {
          font-weight: 700;
        }
      }
    }
  }

  /******************
    - popup toolbar
  ******************/
  .v-toolbar__content  {
    > .v-toolbar-title {
      margin-inline-start : 0 !important;
    }
  }

  /******************
    - btn
  ******************/
  .v-btn {
    &.primary-btn {
      &:hover {
        background: #2973B8 !important;
      }
    }

    &.red-btn {
      &:hover {
        background: #A92D2D !important;
      }
    }

    &.gray-btn {
      &:hover {
        background: #868686 !important;
      }
    }
    
    &.gray-line-btn {
      color: var( --text-color-5 ) !important;
      
      &.is-list {
        &:hover {
          background: rgba(54, 153, 246, 0.15) !important;
        }
      }
      
      &.is-close {
        &:hover {
          background: rgba(0, 0, 0, 0.05) !important;
        }
      }
    }
  }

  /******************
    - dropzone
  ******************/
  .dropzone__item {
    &.jpg,
    &.jpeg,
    &.png,
    &.gif,
    &.svg {
      > img {
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
        width: 100%;
        height: 100%;
        border-radius: 1rem;
        -webkit-transition: opacity .2s linear;
        transition: opacity .2s linear;
      }

      &:hover {
        > img {
          display: none ;
          opacity: 0;
        }
      }
    }
  }
`

/************************************************************
 * style data
 ************************************************************/

/************************************************************
 * style
 ************************************************************/
export const CommonStyle = {
  Default : css`
    
  `,

  QrCode : css`
    border: 4px solid var( --border-color-2 );
    border-radius: 0.8rem;

    img {
      width: 100%;
      height: 100%;
    }
  `,


  ListItemIcon : css`
    &.default-item {
      &:before {
        background: url(${useImage( "/assets/site/images/icon/icon_file.svg" )}) no-repeat center center/cover;
      }
    }
  `,

  EditButtonGroup : css`
    ${StyleUtils.FlexUtils('center','flex-start' )};
    gap: 0.8rem;
    margin-left: 0.5rem;

    > div {
      &:nth-of-type(1) {
        [ class ^= 'material' ] {
          color: var( --text-color-3 );
        }
      }

      &:nth-of-type(2) {
        [ class ^= 'material' ] {
          color: var( --system-red-color );
        }
      }
    }
    
    .v-btn.v-btn--size-default {
      width:  4rem;
      max-height: 4rem;
      padding: 0;
      border-radius: 0.4rem;
    }
  `,

  TitleArea : css`
    ${StyleUtils.FlexUtils('center','flex-start' )};
    gap: 2.4rem;
    height: 4.8rem;
    
    .title {
      font-size: 2.8rem;
      font-weight: 700;
      white-space: nowrap;
    }
    
    .title-form {
      ${StyleUtils.FlexUtils('center','flex-start' )};
    }
    
    .title-parent {
      ${StyleUtils.FlexUtils('center','flex-start' )};
      padding-top: 1rem;
      color: var( --text-color-4 );
      
      > div {
        ${StyleUtils.FlexUtils('center','flex-start' )};
      }
      
      .title {
        ${StyleUtils.UiUtils.Ellipsis('14.5rem')};
        font-size: 2rem;
        cursor: pointer;
        
        &__text {
          vertical-align: super;
        }
      }

      [ class ^= 'material' ] {
        margin-top: -0.5rem;
        font-size: 1.9rem;
      }

      .path-menu {
        padding-bottom:0.9rem;
        font-size: 2.4rem;
        cursor: pointer;
      }

      &:nth-child( n + 5 ) {
        .title {
          ${StyleUtils.UiUtils.Ellipsis('3rem')};
        }
      }
    }
    
    .current-title {
      ${StyleUtils.UiUtils.Ellipsis('100%')};
    }
    
    .title-edit__form {
      ${StyleUtils.FlexUtils('center','flex-start' )};
      
      .v-input {
        width: 32rem;
        font-size: 2.8rem;
        font-weight: 700;
        font-family: "sans-serif";
        
        .v-field {
          border-radius: 0.4rem !important;
        }
      }
      
      .v-btn {
        font-size: 1.4rem;
        border-radius: 0.4rem !important;
        
        &:nth-of-type(2) {
          color: var( --system-red-color );
        }
      }
      
      > span {
        color: var( --border-color-1 );
      }
    }
  `,

  ButtonHover : css`
    &:hover {
      filter: brightness(0.95);
    }
  `,
}



/************************************************************
 * media style
 ************************************************************/
const MediaStyle = {
  TitleAreaMedia : {
    /** [ 1280px ] */
    1280 : css`
    `,

    /** [ 1024px ] */
    1024 : css`
    
    `,

    /** [ 768px ] */
    768 : css`
      
    `,

    /** [ 640px ] */
    640 : css`
      
    `,

    /** [ 450px ] */
    450 : css `
      .title-edit__form {
        .v-input {
          width: 100%;
          min-width: 19rem;
          max-width: 19rem;
        }
      }
    `,

    /** [ 350px ] */
    350 : css `
      .title-parent {
        .title {
          max-width: 7rem;
        }
      }
    `
  },
}


/************************************************************
 * style override
 ************************************************************/


CommonStyle.TitleArea = css`
  ${ CommonStyle.TitleArea };
  ${ setMedia( MediaStyle.TitleAreaMedia, 'max' ) };
`;