import { css, cx, injectGlobal } from "@emotion/css";
import {StyleUtils} from "~/styleUtils/styleUtils";
import {_uiUtil} from "@/utils/core/ui/uiUtil";
import {useSidebarStore} from "~/stores/useSidebarStore";
import {HeaderStyleData} from "~/components/header/style/HeaderStyle";

const { setMedia } = _uiUtil();
const { getSidebarMenuListWidth } = useSidebarStore();

/************************************************************
 * style data
 ************************************************************/


/************************************************************
 * style
 ************************************************************/
export const LayoutStyle = {
  Default : css`
    width: 100%;
    height: 100%;
  `,

  Container : css`
    ${StyleUtils.FlexUtils("stretch", "flex-start")};
    width: 100%;
    height: calc( 100% - ${HeaderStyleData.height} );
    background: var( --primary-color );
  `,

  Main : css`
    //width: calc( 100% - 5rem - 18.7rem );
    width: 100%;
    height: 100%;
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
      .header {
        .menu-list {
          display: none;
        }
      }
      
      .sidebar {
        position: fixed;
        left: 0;
        transform: translateX( -20rem );
        z-index: 100;

        .menu-list {
          background: var( --primary-color );
        }
        
        .menu-button-list {
          display: none;
        }
      }
      
     .menu {
       display: none;
     }
    `,

    /** [ 768px ] */
    768 : css`
      
    `,

    /** [ 640px ] */
    640 : css`
      
    `,

    /** [ 520px ] */
    520 : css`
      .header {
        .center {
          display: none;
        }
      }
    `,

    /** [ 450px ] */
    450 : css `
    `
  },
}

/************************************************************
 * style override
 ************************************************************/
LayoutStyle.Default = cx(
  LayoutStyle.Default,
  // option ( max | min )
  setMedia( MediaStyle.Media,  "max" )
);