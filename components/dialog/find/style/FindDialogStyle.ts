import { css, injectGlobal } from "@emotion/css";
import {StyleUtils} from "~/styleUtils/styleUtils";
import {_uiUtil} from "~/utils/core/ui/uiUtil";
import {CommonStyle} from "assets/style/CommonStyle";

const { setMedia } = _uiUtil();

/************************************************************
 * style data
 ************************************************************/


/************************************************************
 * style
 ************************************************************/
export const FindDialogStyle = {
  Default : css`
    ${CommonStyle.Dialog};

    @media screen and (max-width: 1024px) {
      &.v-dialog {
        .v-overlay__content {
          width: 90% !important;
          max-width: 95% !important;
          margin: 1.5rem !important;
        }
      }
    }
  `,

  FindGuide : css`
    width: 100%;
    height: fit-content;
    padding-bottom: 2rem;
    text-align: right;

    @media screen and (max-width: 1024px) {
      text-align: left;
      padding-bottom: 1.5rem;
    }
  `,

  IdFrom : css`
    ${StyleUtils.FlexUtils("stretch", "flex-start")};
    gap: 2rem;
    
    .v-slide-group {
      .v-btn {
        padding: 0 2rem;
        font-size: 1.4rem;
        text-align: center;
        
        &:hover {
          color: var( --primary-darken-color-1 );
        }
      }
    }
    
    .v-window,
    .tab-content {
      width: 100%;
      height: 100%;
    }

    .tab-content {
      border-radius: 1rem;
      background: var( --background-color-1 );
      
      .v-card-text {
        padding: 3rem !important;
      }
    }
    
    .tab-item {
      .title {
        margin-bottom: 1rem;
        font-size: 1.8rem;
        font-weight: 500;
      }
      
      + .tab-item {
        margin-top: 2rem;
      }
      
      .tab-item__sub-guide {
        display: inline-block;
        margin-bottom: 1rem;
      }
    }
    
    .tab-item__guide {
      margin-top: 2rem;
      font-size: 1.2rem;
    }

    @media screen and (max-width: 1024px) {
      flex-direction: column;
      gap: 1.5rem;

      .v-tabs {
        width: 100%;
        border-bottom: 1px solid var( --border-color-1 );
      }

      .v-slide-group {
        .v-btn {
          padding: 0 1.2rem;
          font-size: 1.3rem;
        }
      }

      .tab-content {
        .v-card-text {
          padding: 2rem !important;
        }
      }
    }
  `,

  PasswordFrom : css`
    padding: 3rem;
    border-radius: 1rem;
    background: var( --background-color-1 );
    
    .password-item {
      .title {
        margin-bottom: 1rem;
        font-size: 1.8rem;
        font-weight: 500;
      }
      
      + .password-item {
        margin-top: 2rem;
      }
    } 
    
    .password-guide {
      margin-top: 2rem;
      font-size: 1.2rem;
      
      em {
        color: var( --primary-darken-color-1 );
        cursor: pointer;
        
        &:hover {
          font-weight: 700;
          text-decoration: underline;  
        }
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
 * style override
 ************************************************************/
