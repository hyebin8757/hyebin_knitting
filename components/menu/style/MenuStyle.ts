import { css, cx, injectGlobal } from "@emotion/css";
import {_uiUtil} from "~/utils/core/ui/uiUtil";
import {StyleUtils} from "~/styleUtils/styleUtils";
import {CommonStyle} from "assets/style/CommonStyle";

const { setMedia } = _uiUtil();

/************************************************************
 * style data
 ************************************************************/
export const MenuStyleData = {
  menuHeight: 4.8,
}

/************************************************************
 * style
 ************************************************************/
export const MenuStyle = {
  Default : css`
    ${StyleUtils.FlexUtils("center", "flex-start")};
    ${CommonStyle.MenuBtn};
    height: ${MenuStyleData.menuHeight}rem;
    
    .v-btn {
      svg {
        width: 1.8rem;
        height: 1.8rem;
      }
      
      &.is-active {
        border-bottom: 2px solid var( --system-green-lighten-color );
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
MenuStyle.Default = cx(
  MenuStyle.Default,
  // option ( max | min )
  setMedia( MediaStyle.Media,  "max" )
);