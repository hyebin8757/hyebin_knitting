import { css, cx, injectGlobal } from "@emotion/css";
import {StyleUtils} from "~/styleUtils/styleUtils";
import {_uiUtil} from "~/utils/core/ui/uiUtil";
import { ColorStyle } from "assets/style/vars/_ColorStyle";
import { ResetStyle } from "~/assets/style/base/_Reset"
import { DarkModeStyle } from "assets/style/vars/_DarkModeStyle";
import "@fontsource/noto-sans-kr/korean.css";
import "swiper/css";
import "swiper/css/effect-cards";

const { setMedia } = _uiUtil();

/************************************************************
 * style data
 ************************************************************/

/************************************************************
 * style
 ************************************************************/
export const CommonStyle = {
  Default : css`
    html,
    body,
    #__nuxt,
    #__layout,
    .wrapper,
    main,
    #__layout > div {
      width: 100%;
      height: 100%;
    }

    .v-application__wrap {
      min-height: 100%;
      max-height: 100%;
    }

    html {
      font-size: 10px;
      // 새로고침 시 세로 스크롤 없을 때 좌, 우로 움직이는 현상 때문에 추가함
      overflow-y: scroll;
    }

    .main-container {
      height: 100%;
    }

    .inner-container {
      padding: 2rem 4rem;
    }

    .content {
      &-body {

        .view,
        .list {
          padding: 2.8rem 4rem;
          border-radius: 2rem;
          box-shadow: 0 1px 13px rgba( 0, 0, 0, 0.04 );
          background-color: var( --white-color );

          +.view,
          +.list {
            margin-top: 4rem;
          }
        }
      }
    }

    /*=== no-data ===*/
    div.no-data {
      ${StyleUtils.FlexUtils("center","center")};
      width: 100%;
      font-size: 1.8rem;

      .material-icons {
        margin-right: 0.4rem;
        color: var( --primary-lighten-color-1 );
      }

      p {
        font-size: 1.8rem;
      }
    }

    // title
    .title-item {
      // tit
      &--tit {
        font-size: 2.5rem;
        font-weight: 700;
      }
    }

    /* v-btn */
    .v-btn {
      letter-spacing: 0;
    }

    /* v-chip */
    .v-chip {
      ${StyleUtils.FlexUtils("center","center")};
    }

    .blind {
      position: absolute;
      overflow: hidden;
      clip: rect(0 0 0 0);
      margin: -1px;
      width: 1px;
      height: 1px;
    }
  `,

  DefaultPadding : css`
    padding: 2rem 3rem;
  `,

  Input : css`
    .v-input {
      min-height: 4rem;
      padding: 1rem;
      border: 1px solid var( --border-color-1 );
      border-radius: 1rem;
      background: var( --white-color );
      
      * {
        padding: 0 !important;
      }


      input {
        height: 100%;
        min-height: 2rem;
        padding: 0 0 0 1rem;
        font-size: 1.4rem;
      }
      
      &.v-input--density-compact {
        --v-input-control-height : 10px;
        --v-input-padding-top : 0;

        .v-field__prepend-inner,
        .v-field__append-inner,
        .v-field__clearable {
          align-items: center;
          
          i {
            font-size: 1.8rem;
          }
        }
      }

      .v-input__details {
        display: none;
      }


      .v-field--variant-solo {
        box-shadow: none;
      }
      
      .v-field__input {
        min-height: fit-content;
      }

      .v-input__append {
        align-items: center;
      }
    }
  `,

  Button : css`
    .v-btn {
      position: relative;
      min-width: initial !important;
      
      &.v-btn--size-default {
        padding: 0;
      }
      
      &.v-btn--elevated:hover, 
      &.v-btn--elevated:focus {
        box-shadow: none;
      }

      .v-btn__overlay {
        display: none;
      }
      
      &:hover {
        &:before {
          content: "";
          display: inline-block;
          position: absolute;
          top: 0;
          left: 0;
          z-index: 5;
          width: 100%;
          height: 100%;
          opacity: 0.2;
          background: currentColor;
        }
      }
    }
  `,

  Radio : css`
    .v-radio-group {
      .v-label {
        font-size: 1.4rem;
      }

      .mdi-radiobox-marked {
        color: var( --primary-darken-color-1 );
      }
      
      .v-radio {
        &:hover {
          i,
          .v-label {
            color: var( --primary-darken-color-1 );
          }
        }

        .v-selection-control__input {
          :hover::before {
            opacity: 0;
          }
        }

        &.v-selection-control--dirty {
          .v-label {
            &.v-label--clickable {
              font-weight: 700;
              color: var( --primary-darken-color-1 );
            }
          }
        }
      }
    }
  `,

  Tooltip : css`
    .v-overlay {
      &.v-tooltip {
        .v-overlay__content {
          font-size: 1.4rem;
          font-weight: 500;
          color: var( --text-color-1 );
          background: var( --white-color );
          
          &.black-tooltip {
            color: var( --white-color );
            background: rgba( 0, 0, 0, 0.8 );
          }
        }
      }
    }
  `,

  MenuBtn : css`
    .v-btn {
      position: relative;
      height: 4.8rem !important;
      padding: 0 1rem !important;
      border-radius: 0 !important;
      font-size: 1.2rem;
      color: var(--white-color);

      &.is-active,
      &.v-tab--selected,
      &:hover {
        color: var( --system-green-lighten-color );
        background: rgba(255, 255, 255, 0.2);
      }

      &:after {
        display: none;
      }

      &:before {
        position: absolute;
        top: 0;
        left: initial;
        right: 0;
        content: "";
        width: 1px;
        height: 100%;
        opacity: 0.3;
        background: var(--disabled-bg-color-1);
      }

      &:last-of-type {
        &:before {
          display: none;
        }
      }

      .v-btn__content {
        gap: 0.5rem;
      }

      [ class ^= "material" ] {
        font-size: 1.6rem;
      }

      img {
        width: 1.2rem;
        height: 1.2rem;
      }
    }
  `,

  Dialog : css`
    &.v-dialog {
      .v-overlay__content {
        > .v-card {
          .v-card-item {
            color: var( --white-color );
            background: var( --primary-darken-color-1 );
          }

          > .v-card-text {
            padding: 2rem !important;
          }

          .v-card-actions {
            .v-btn {
              height: fit-content;
              padding: 1rem;
              color: var( --white-color );
              background: var( --primary-darken-color-1 );
            }
          }
        }
      }
    }
  `,

  Pagination : css`
    .pagination {
      .v-btn {
        --v-btn-height: initial !important;
      }
    }
  `,

  Scroll: css`
    &::-webkit-scrollbar {
      width: 4px;
      height: 4px;
    }

    &::-webkit-scrollbar-track {
      border-radius: 20px;
      background-color: #FFFFFF;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 20px;
      background-color: #DEDEDE;
    }
  `,
}

/************************************************************
 * media style
 ************************************************************/
const MediaStyle = {
  Media : {
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

    `
  },
}

/************************************************************
 * global style
 ************************************************************/
const GlobalStyle = {
  CoreCommon  : CommonStyle.Default,
  Reset       : ResetStyle.Default,
  Color       : ColorStyle.Default,
  Main        : DarkModeStyle.Default,
  Pagination  : CommonStyle.Pagination,
}

injectGlobal`
  ${cx(
    GlobalStyle.CoreCommon,
    GlobalStyle.Reset,
    GlobalStyle.Color,
    GlobalStyle.Main,
    GlobalStyle.Pagination,
    CommonStyle.Input,
    CommonStyle.Button,
    CommonStyle.Radio,
    CommonStyle.Tooltip,
  )}
`;


/************************************************************
 * style override
 ************************************************************/

