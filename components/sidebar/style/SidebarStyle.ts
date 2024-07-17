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
export const SidebarStyle = {
  Default : css`
    ${StyleUtils.FlexUtils("stretch", "flex-start")};
    height: 100%;
  `,

  MenuButtonList : css`
    width: 5rem;
    height: 100%;
    border-right: 1px solid var( --border-color-1 );
    
    .v-btn {
      width: 100%;
      color: var( --white-color );
      
      + .v-btn {
        margin-top: 1rem;
      }
    }
  `,

  MenuList : css`
    .v-list {
      background: transparent;
      
      .v-list-item {
        color: var( --white-color );
        .v-list-item__overlay {
          display: none;
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
const SidebarMediaStyle = {
  SidebarMedia : {
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
