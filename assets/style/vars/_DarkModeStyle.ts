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

  Header : css`
    .header {
      border-bottom: 1px solid #C2C2C2;
      
      .left {
        .button-group {
          .button-item {
            color: #303030;
          }
        }
      }
    }
  `,

  Menu : css`
    .menu {
      border-bottom: 1px solid #C2C2C2;
      
      .v-btn {
        &:before {
          background: #303030;
        }

        &:last-of-type {
          &:before {
            display: inline-block;
          }
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
        .v-list-item:not( .bookmark-list, .v-list-group__header ) {
          &.is-active,
          &:hover {
            .v-list-item-title {
                color: #FFFFFF;
            }
            
            svg.js-svg {
              filter: brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(34deg) brightness(108%) contrast(101%);
            }
            
            .bookmark {
              &.is-active {
                color: #FFFFFF !important;
              }
            }
          }

          &.is-active {
            .bookmark {
              &.is-active {
                color: #FFFFFF !important;
                
                &:hover {
                  color: #FFFFFF !important;
                }
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
      
      .cat-box {
        .v-btn {
          &::after {
            filter: initial;
          }
        }
      }
    }
  `,

  About : css`
    .about {
      .console-box {
        background: #FFF;
        box-shadow: 0 3px 8px rgba( 0, 0, 0, 0.8 );

        .v-input {
          background: #FFFBEE;
        }
      }

      p,
      li {
        color: #303030;
      }

      b {
        color: var( --system-green-darken-color );
      }
    }
  `,

  Project : css`
    .project {
      .v-slide-group {
        border-bottom: 1px solid #C2C2C2;
        
        .v-btn {
          &:before {
            background: #303030;
          }
          
          &:last-of-type {
            &:before {
              display: inline-block;
            }
          }
        }
      }
    }
  `,

  Input : css`
    .v-field--variant-solo {
      background: transparent;
    }
  `,

  Tooltip : css`
    .v-overlay {
      &.v-tooltip {
        .v-overlay__content {
          background: #FFF;
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
        DarkModeStyle.Header,
        DarkModeStyle.Menu,
        DarkModeStyle.Sidebar,
        DarkModeStyle.Main,
        DarkModeStyle.About,
        DarkModeStyle.Project,
        DarkModeStyle.Input,
        DarkModeStyle.Tooltip,
      )}
    },
`;