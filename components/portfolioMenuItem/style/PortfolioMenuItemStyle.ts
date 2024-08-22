import { css, injectGlobal } from "@emotion/css";
import {StyleUtils} from "~/styleUtils/styleUtils";
import {_uiUtil} from "~/utils/core/ui/uiUtil";

const { setMedia } = _uiUtil();

/************************************************************
 * style data
 ************************************************************/


/************************************************************
 * style
 ************************************************************/
export const PortfolioMenuItemStyle = {
  Default : css`
    
    &[class *= "menu-item"] {
      opacity: 1 !important;
      cursor: pointer;
      transition: all 0.5s;
      z-index: 1000;
      
      &:hover {
        transform: scale( 1.1 );
      }
    }
    
    &.menu-item {
      &__0 {
        top: 45% !important;
        left: 45% !important;
      }
      
      &__1 {
        top: 30% !important;
        left: 30% !important;
      }
      
      &__2 {
        top: 60% !important;
        left: 60% !important;
      }
    }
  `,

  Img : css`
    svg {
      width: 10rem;
    }
  `
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
