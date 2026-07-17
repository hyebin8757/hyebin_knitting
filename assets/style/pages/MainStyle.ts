import {css, cx, injectGlobal} from "@emotion/css";
import {StyleUtils} from "~/styleUtils/styleUtils";
import {_uiUtil} from "~/utils/core/ui/uiUtil";
import {useUtil} from "~/utils/useUtil";
import { CommonStyle } from "assets/style/CommonStyle";

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
    padding: 3rem;
    overflow: hidden;
    background: #010c17;

    .star-canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 0;
    }
  `,

  Title : css`
    ${StyleUtils.FlexUtils("center", "flex-start")};
    width: fit-content;
    padding: 1rem 0 1rem 1rem;
    border-radius: 1rem;
    font-size: 4rem;
    font-weight: bold;
    white-space: nowrap;
    color: var( --background-color-4 );
    z-index: 100;
    
    img {
      width: 6rem !important;
      height: 6rem !important;
    }
    
    br {
      display: none;
    }
  `,

  Content : css`
    ${StyleUtils.FlexUtils("stretch", "center")};
    gap: 3rem;
    margin-top: 4rem;
    position: relative;
    z-index: 1;
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
    /** [ 1800px ] */
    1800 : css`
      .main-content {

        .code-box{
          position: relative;
        }

        .cat-box {
          position: absolute;
          bottom: 1rem;
          right: 1rem;
          width: 14rem;

          .cat-box-guide {
            width: 10rem;
            font-size: 1.4rem;
          }

          .cat-box-img {
            img {
              &:nth-of-type(1) {
                width: 2rem;
              }
            }
          }
        }

        .skip-tooltip {
          left: 3rem;
          right: auto;
        }
      }
    `,

    /** [ 1280px ] */
    1280 : css`
      .main-title {
        br {
          display: inline-block;
        } 
        
        img {
          display: none;
        }
      }

      .main-content {
        .code-box {
          width: 100%;
        }
      }
    `,

    /** [ 1024px ] */
    1024 : css`
      .main-content {
        .code-box {
          .code-box-content {
            > div {
              white-space: initial;
            }
          }
        }
      }
    `,

    /** [ 768px ] */
    768 : css`
      
    `,

    /** [ 640px ] */
    640 : css`
      .main-title {
        display: none;
      }
      
      .main-content {
        .code-box {
          .code-box-content {
            .code-box-code {
              font-size: 1.4rem;
            }
            
            .skip-tooltip {
              left: 50%;
              right: auto;
              transform: translateX(-50%);
              bottom: 1.5rem;
              font-size: 1.2rem;
              padding: 0.6rem 1.2rem;
              white-space: nowrap;
            }
          }
        }
        
        .cat-box {
          display: none;
        }
      }
    `,

    /** [ 450px ] */
    450 : css `
      padding: 2rem;
      height: 100%;
      
      .main-button-group {
        flex-direction: column;
        gap: 2rem;
        
        .v-btn {
          flex: initial;
          width: 100%;
          max-width: 100%;
        }
      }
    `
  },
}

/************************************************************
 * style override
 ************************************************************/
MainStyle.Default = cx(
  MainStyle.Default,
  // option ( max | min )
  setMedia( MediaStyle.Media,  "max" )
);