import {css, cx, injectGlobal} from "@emotion/css";
import {StyleUtils} from "~/styleUtils/styleUtils";
import {_uiUtil} from "~/utils/core/ui/uiUtil";
import {useUtil} from "~/utils/useUtil";

const { setMedia } = _uiUtil();
const { useImage } = useUtil.AssetResolverUtil;


/************************************************************
 * style data
 ************************************************************/

/************************************************************
 * style
 ************************************************************/
export const DarkModeStyle = {
  Default : css`
    
 `,

  Main : css`
    .main {
      background: url(${useImage("/assets/images/bg/bg_main_light.png")}) repeat center center/cover;
      
      .main-title {
        color: #303030;
      }
      
      .code-box {
        .code-box-header {
          span {
            color: #303030;
          }
        }
        
        .code-box-content {
          background: #FFFFFF;
        } 
      }
    }
  `,

  Header : css`
    .header {
      border-bottom: 1px solid #C2C2C2;
    }
  `,

  Menu : css`
    .menu {
      border-bottom: 1px solid #C2C2C2;
      
      .v-btn {
        &:before {
          background: #303030;
        }
      }
    }
  `,

  Sidebar : css`
    .sidebar {
      > div {
        &:nth-of-type(1) {
          border-right-color: #C2C2C2;
        }
      }
      
      .v-list {
        .v-list-item {
          &.is-active,
          &:hover {
            color: #FFFFFF;
          }
          
          &:last-of-type {
            &.is-active,
            &:hover {
              svg {
                filter: brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(34deg) brightness(108%) contrast(101%);
              }
            }
          }
        }
      }
      
      .resize-bar {
        background: #C2C2C2;

        &.is-active,
        &:hover {
          background: var( --secondary-lighten-color-1 );
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
DarkModeStyle.Default = css`
    html[dark-mode=true] {
      ${cx(
        DarkModeStyle.Main,
        DarkModeStyle.Header,
        DarkModeStyle.Menu,
        DarkModeStyle.Sidebar,
      )}
    },
`;