import { css, injectGlobal } from "@emotion/css";
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