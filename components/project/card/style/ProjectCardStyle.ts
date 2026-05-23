import {css, cx, injectGlobal} from "@emotion/css";
import {StyleUtils} from "~/styleUtils/styleUtils";
import {_uiUtil} from "~/utils/core/ui/uiUtil";
import {ProjectData} from "assets/style/pages/ProjectStyle";
import {useUtil} from "~/utils/useUtil";

const { setMedia } = _uiUtil();
const { useImage } = useUtil.AssetResolverUtil;

/************************************************************
 * style data
 ************************************************************/


/************************************************************
 * style
 ************************************************************/
export const ProjectCardStyle = {
  Default : css`
    ${ ProjectData.Animation };
    position: relative;
    width: 100%;
    max-width: 40rem;
    min-width: 30rem;
    height: 100%;
    flex: 1;
    cursor: url(${useImage("/assets/images/icon/icon_cursor.svg")}), auto;
    
    &:hover {
      z-index: 10;
      
      .info-box {
        opacity: 1;
        visibility: visible;
      }
    }
  `,

  ImgBox : css`
    position: relative;
    width: 100%;
    height: 25rem;
    border-radius: 1rem;
    box-shadow: 0 0 15px 0 #00000040;
    
    img {
      width: 100%;
      height: 100%;
      border-radius: 1rem;
    }
    
    &.is-best {
      &:before {
        ${StyleUtils.FlexUtils("center", "center" )};
        content: "Best";
        position: absolute;
        top: 3rem;
        left: -0.6rem ;
        width: 10rem;
        height: 2rem;
        border-radius: 0.5rem;
        font-size: 1.4rem;
        font-weight: 700;
        transform: rotate( 320deg );
        color: var( --white-color );
        background: var( --primary-lighten-color-1 );
      }
    }
  `,

  Title : css`
    min-height: 6rem;
    margin: 1.2rem 0;
    color: var( --white-color );
    
    h2 {
      font-size: 2rem;  
      
      br {
        display: none;
      }
    }
  `,

  InfoBox : css`
    ${ ProjectData.Animation };
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
    width: 100%;
    min-height: 25rem;
    padding: 1.6rem;
    border-radius: 1rem;
    opacity: 0;
    visibility: hidden;
    background: var( --background-color-1 );
    transition: opacity 0.3s ease, visibility 0.3s ease;
  `,

  Service : css`
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #808080;
    font-size: 1.4rem;
    font-weight: 500;
    
    b {
      display: block;
      margin-top: 0.8rem;
      font-size: 1.6rem;
    }
  `,

  LabelBox : css`
    ${StyleUtils.FlexUtils("center", "flex-start", "wrap" )};
    gap: 1rem;
    
    .v-chip.v-chip--size-default {
      font-size: 1.2rem;
      font-weight: 500;
      color: #FFF;
      background: #2366B4;
    }
  `,

  DataBox : css`
    margin-top: 2rem;
    
    li {
      ${StyleUtils.FlexUtils("stretch", "flex-start" )};
      gap: 1rem;
      font-size: 1.4rem;
      font-weight: 500;
      
      + li {
        margin-top: 1rem;
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
ProjectCardStyle.Default = cx(
  ProjectCardStyle.Default,
  // option ( max | min )
  setMedia( MediaStyle.Media,  "max" ),
);