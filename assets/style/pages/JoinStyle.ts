import { css, injectGlobal } from "@emotion/css";
import {StyleUtils} from "~/styleUtils/styleUtils";
import {_uiUtil} from "~/utils/core/ui/uiUtil";
import {LoginStyle} from "~/assets/style/pages/LoginStyle";

const { setMedia } = _uiUtil();

/************************************************************
 * style data
 ************************************************************/


/************************************************************
 * style
 ************************************************************/
export const JoinStyle = {
  Default : css`
    ${LoginStyle.Default}; 
    flex-direction: column;
  `,

  Container : css`
    max-width: 50rem;
    width: 100%;
    height: auto;
    min-height: 62rem;
    padding: 2rem;
    border-radius: 2rem;
    background: var( --white-color );
    
    @media (max-width: 360px) {
      padding: 1.2rem;
      border-radius: 1.2rem;
    }
    
    > div {
      &:nth-child(3) {
        margin-top: 2rem;
      }
    }
    
    .is-right {
      text-align: right;
    }
  `,

  Title : css`
    ${LoginStyle.Title};
  `,

  JoinItem : css`
    .v-input {
      + .v-input {
        margin-top: 1rem;
      }
    }
    
    .v-radio-group {
      .v-selection-control-group {
        flex-direction: row;
      }  
    }
    
    em {
      color: var( --system-red-color );
    }
  `,

  JoinBtn : css`
    ${LoginStyle.LoginBtn};
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
