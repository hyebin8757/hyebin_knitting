import { css, injectGlobal } from "@emotion/css";
import {StyleUtils} from "../../styleUtils/styleUtils";
import {_uiUtil} from "~/utils/core/ui/uiUtil";
import "@fontsource/noto-sans-kr/korean.css";
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';


const { setMedia } = _uiUtil();

/************************************************************
 * style data
 ************************************************************/


/************************************************************
 * style
 ************************************************************/
export const CommonStyle = {
  Default : css``,

  DefaultPadding : css`
    padding: 2rem 3rem;
  `,

  Input : css`
    .v-input {
      &.v-input--density-compact {
        --v-input-control-height : 10px;
        --v-input-padding-top : 0;
        
        
        input {
          height: 100%;
          padding: 0 0 0 1rem;
          font-size: 1.4rem;
        }

        .v-field__prepend-inner,
        .v-field__append-inner,
        .v-field__clearable {
          align-items: center;
          
          i {
            font-size: 1.8rem;
          }
        }
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

  Tooltip : css`
    .v-overlay {
      &.v-tooltip {
        .v-overlay__content {
          font-size: 1.4rem;
          font-weight: 500;
          color: var( --text-color-1 );
          background: var( --white-color );
        }
      }
    }
  `,
}

/************************************************************
 * global style
 ************************************************************/
injectGlobal`
  ${CommonStyle.Default};
  ${CommonStyle.Input};
  ${CommonStyle.Button};
  ${CommonStyle.Tooltip};
`;

/************************************************************
 * media style
 ************************************************************/
const MediaStyle = {
  ContainerMedia : {
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
 * style override
 ************************************************************/
