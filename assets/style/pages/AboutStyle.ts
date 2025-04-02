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
export const AboutStyle = {
  Default : css`
    ${CommonStyle.DefaultPadding};
  `,

  Title : css`
    font-size: 4.8rem;
    color: #D4CAB2;
  `,

  Introduction : css`
    display: block;
    margin: 2rem 0;
    font-size: 1.8rem;
    font-weight: 500;
    color: #9CA6AD;
  `,

  ConsoleBox : css`
    padding: 1rem;
    border-radius: 1rem;
    font-size: 1.6rem;
    font-weight: 500;
    color: #2CBC8C;
    background: #14344b;
    
    em {
      color: #E7D19F;
    }
    
    > div {
      ${StyleUtils.FlexUtils("center", "flex-start")};
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
