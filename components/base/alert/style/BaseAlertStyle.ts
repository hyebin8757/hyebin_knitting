import { css, injectGlobal } from "@emotion/css";
import {_uiUtil} from "~/utils/core/ui/uiUtil";
import {StyleUtils} from "~/styleUtils/styleUtils";

const { setMedia } = _uiUtil();

/************************************************************
 * style data
 ************************************************************/


/************************************************************
 * style
 ************************************************************/
export const BaseAlertStyle = {
  Default : css`
    position: fixed !important;
    top: 50%;
    left: 50%;
    transform: translate( -50%, -50% );
    
    &.v-alert {
      background: #0d1e33 !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
      border-radius: 1.6rem !important;
      color: #ffffff !important;
      box-shadow: 0 12px 30px rgba(0,0,0,0.5) !important;
      padding: 2.2rem !important;
      width: 320px !important;
      max-width: 90vw;
      z-index: 9999 !important;
    }
    
    &.v-alert--type-warning,
    &.v-alert--type-error,
    &.v-alert--type-success,
    &.v-alert--type-info {
      background: #0d1e33 !important;
      color: #ffffff !important;
    }
    
    .v-alert__prepend {
      margin-inline-end: 1.2rem !important;
      
      .v-icon {
        color: var(--secondary-darken-color-2) !important;
        font-size: 2.6rem;
      }
    }

    &.v-alert--type-error .v-icon {
      color: var(--system-red-color) !important;
    }
    &.v-alert--type-success .v-icon {
      color: var(--system-green-color) !important;
    }
    &.v-alert--type-info .v-icon {
      color: var(--primary-lighten-color-1) !important;
    }
    
    .v-alert__content {
      font-size: 1.4rem;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.9) !important;
      
      .v-alert-title {
        margin-bottom: 0.8rem;
        font-size: 1.8rem;
        font-weight: 700;
        color: #ffffff !important;
      }
    }
  `,

  Footer : css`
    ${StyleUtils.FlexUtils("center", "flex-end")};
    gap: 1rem;
    margin-top: 1.6rem;
    
    .v-btn {
      background: rgba(255, 255, 255, 0.08) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      color: #ffffff !important;
      border-radius: 0.8rem !important;
      font-weight: 600 !important;
      padding: 0.6rem 1.6rem !important;
      height: auto !important;
      font-size: 1.3rem !important;
      
      &:hover {
        background: rgba(255, 255, 255, 0.15) !important;
      }
    }
  `,
}

/************************************************************
 * global style
 ************************************************************/
injectGlobal`
`;

/************************************************************
 * media style
 ************************************************************/

/************************************************************
 * style override
 ************************************************************/
