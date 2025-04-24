import {css, cx, injectGlobal} from "@emotion/css";
import {StyleUtils} from "~/styleUtils/styleUtils";
import {_uiUtil} from "~/utils/core/ui/uiUtil";
import {MenuStyleData} from "~/components/menu/style/MenuStyle";
import {useUtil} from "~/utils/useUtil";

const { setMedia } = _uiUtil();
const { useImage } = useUtil.AssetResolverUtil;


/************************************************************
 * style data
 ************************************************************/

/************************************************************
 * style
 ************************************************************/
export const MainStyle = {
  Default : css`
    position: relative;
    width: 100%;
    height: calc( 100% - ${MenuStyleData.menuHeight}rem );
    overflow: hidden;
    background: url(${useImage("/assets/images/bg/bg_main.png")}) repeat center center/cover;;
  `,

  Title : css`
    ${StyleUtils.FlexUtils("center", "flex-start")};
    width: fit-content;
    padding: 1rem 0 1rem 1rem;
    border-radius: 1rem;
    font-size: 4rem;
    font-weight: bold;
    white-space: nowrap;
    color: var( --white-color );
    z-index: 100;
    
    img {
      width: 6rem !important;
      height: 6rem !important;
    }
  `,

  Content : css`
    ${StyleUtils.FlexUtils("stretch", "flex-start")};
  `,


  CodeBox : css`
  `,

  CodeBoxHeader : css`
  `,

  CodeBoxHeaderButton : css`
  `,

  CodeBoxContent : css`
  `,

  CatBox : css`
    
    > img {
      width: 50rem;
      height: auto;
    }
    
    .v-btn {
      width: 3rem;
      height: 3rem;
      
      img {
        width: 100%;
        height: 100%;
      }
    }
  `,

  CatBoxGuide : css`
  `,

  ButtonGroup : css`
    ${StyleUtils.FlexUtils("center", "flex-start")};
    gap: 1.5rem;
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
const MainMediaStyle = {
  MainMedia : {
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
MainStyle.Default = cx(
  MainStyle.Default,
);