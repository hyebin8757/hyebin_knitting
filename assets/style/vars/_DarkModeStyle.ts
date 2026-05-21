import {css, cx, injectGlobal} from "@emotion/css";
import {StyleUtils} from "~/styleUtils/styleUtils";
import {_uiUtil} from "~/utils/core/ui/uiUtil";
import {useUtil} from "~/utils/useUtil";

const { setMedia } = _uiUtil();
const { useImage } = useUtil.AssetResolverUtil;


/************************************************************
 * style data
 * ************************************************************/

/************************************************************
 * style
 * ************************************************************/
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
            
            &.zoom {
              color: #14532D !important; /* Deep forest green */
              background: #22C55E !important; /* Vibrant Mac green */
            }
          }
        }
        
        .mobile-menu-btn {
          color: #303030;
        }

        .menu-list span {
          &:hover {
            color: var(--primary-darken-color-1) !important; /* Premium deep blue on hover */
          }
        }
      }

      .right {
        .v-btn {
          color: #303030 !important;

          &:hover {
            color: var(--primary-darken-color-1) !important; /* Premium deep blue on hover */
          }
        }
      }
    }
  `,

  Menu : css`
    .menu {
      border-bottom: 1px solid #C2C2C2;
      background: #EBECF0;
      
      .v-btn {
        color: #555555 !important;
        background: #EBECF0 !important;
        border-right: 1px solid #C2C2C2 !important;
        border-bottom: 1px solid #C2C2C2 !important;

        &:before {
          display: none !important;
        }

        &.is-active,
        &.v-tab--selected {
          color: #1E1F22 !important;
          background: #FFFFFF !important;
          border-bottom: 3px solid #3574F0 !important;
          font-weight: 600 !important;
        }

        &:hover:not(.is-active) {
          color: #1E1F22 !important;
          background: #F2F2F2 !important;
        }
      }
    }
  `,

  Sidebar : css`
    .sidebar {
      background: #F2F2F2 !important;
      
      > div {
        &:nth-of-type(1) {
          border-right-color: #D1D1D1;
        }
      }

      .menu-button-list {
        background: #EBECF0 !important;
        border-right: 1px solid #D1D1D1 !important;

        .v-btn {
          color: #555555 !important;

          &.is-active,
          &:hover {
            color: #3574F0 !important;
            background: #D2E5FA !important;
          }
        }
      }
      
      .menu-list {
        background: #F2F2F2 !important;
      }
      
      .v-list {
        background: #F2F2F2 !important;

        .v-list-group__header {
          color: #1E1F22 !important;
          
          &:hover {
            background: #ECEDEF !important;
          }
        }

        .v-list-item:not( .bookmark-list, .v-list-group__header ) {
          color: #3C3F41 !important;
          background: transparent !important;

          &.is-active {
            background: #D2E5FA !important;
            color: #1E1F22 !important;
            
            .v-list-item-title {
              color: #1E1F22 !important;
              font-weight: 600 !important;
            }
            
            svg.js-svg {
              filter: none !important;
            }
          }

          &:hover:not(.is-active) {
            background: #ECEDEF !important;
            color: #1E1F22 !important;
            
            .v-list-item-title {
              color: #1E1F22 !important;
            }
            
            svg.js-svg {
              filter: none !important;
            }
          }
        }
      }
      
      .resize-bar {
        background: transparent !important;

        &::before {
          background: #D1D1D1 !important;
        }

        &.is-active,
        &:hover {
          background: transparent !important;
          &::before {
            background: #3574F0 !important;
          }
        }
      }

      .resize-button {
        background: #3574F0 !important;
        border: 2px solid #FFFFFF !important;
        color: #FFFFFF !important;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15) !important;

        svg {
          color: #FFFFFF !important;
        }
        
        &:hover {
          background: #2366B4 !important;
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
        border: 1px solid #D1D1D1 !important;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08) !important;
        
        .code-box-header {
          background: #EBECF0 !important;
          border-bottom: 1px solid #D1D1D1 !important;
          
          span {
            color: #1E1F22 !important;
            font-weight: 600 !important;
          }

          .button-group .button-item {
            &.zoom {
              color: #14532D !important;
              background: #22C55E !important;
            }
          }
        }
        
        .code-box-content {
          background: #FFFFFF;
          
          .code-box-code {
            .tag {
              &-html,
              &-body {
                color : #B25E00; /* 시인성 높은 어두운 오렌지/앰버 (WCAG 4.5:1 이상) */
              }

              &-head,
              &-main {
                color : #0052CC; /* 프리미엄 코발트 블루 (WCAG 4.5:1 이상) */
              }
              
              &-title {
                color : #15803D; /* 딥 포레스트 그린 (WCAG 4.5:1 이상) */
              }

              &-b {
                color : #B91C1C; /* 딥 크림슨 RED (WCAG 4.5:1 이상) */
              }

              &-p {
                color : #0369A1; /* 선명한 오션 블루/시안 (WCAG 4.5:1 이상) */
              }
            }
            
            .text {
              color : #303030; /* 본문 텍스트도 고대비 다크 차콜로 명시 */
            }
          }
        } 

        .skip-tooltip {
          color: #303030 !important;
          background: #E5E7EB !important; /* Premium subtle gray background */
          border: 1px solid #D1D5DB !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05) !important;
          
          &:hover {
            background: #D1D5DB !important;
          }
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
      p,
      li {
        color: #303030;
      }

      p[class*="Introduction"] {
        color: #475569 !important; /* Premium dark gray for introduction */
        
        b {
          color: #0c2034 !important; /* Premium deep navy for emphasized words */
        }
      }

      .console-box {
        background: #FFF;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important; /* Premium light shadow */
        color: #166534 !important; /* Premium high-contrast forest green text */

        .v-input {
          background: #F3F4F6 !important;
          border: 1px solid #D1D5DB !important;
        }

        .console-box-guide {
          color: #4B5563 !important; /* Elegant gray for editor tips */
        }

        em {
          color: #B45309 !important; /* Deep warm gold/amber */
        }

        .v-btn {
          &.reset-btn.v-btn--variant-text {
            background: #FFF;
            color: var(--system-red-color);
            border-color: var(--system-red-color);
          } 
        }
      }

      b {
        color: #166534 !important; /* Solid high-contrast green */
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

      .project-title h2 {
        color: #303030 !important;
      }

      .detail-card-list {
        background: #FFFFFF !important;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05) !important;
      }

      .detail-card-content {
        .title {
          color: #303030 !important;
          font-weight: 700 !important;
        }

        .content {
          color: #4B5563 !important;
        }

        .work-list {
          color: #374151 !important;
        }

        .tag {
          color: #6B7280 !important;
        }

        .btn-area {
          .v-btn {
            color: #FFFFFF !important;
            background: var(--primary-darken-color-1) !important;
          }
        }
      }

      .project-card {
        background: #FFFFFF !important;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05) !important;

        .card-content {
          color: #FFFFFF !important; /* ALWAYS keep text white on dark image overlay! */
        }
        
        .card-title {
          color: #FFFFFF !important;
        }

        .card-text {
          color: #E5E7EB !important;
        }

        .card-tag {
          color: #F3F4F6 !important;
        }

        .card-btn-group {
          .v-btn {
            &:nth-of-type(1) {
              color: #FFFFFF !important;
              background-color: var(--primary-darken-color-1) !important;
            }
            
            &:nth-of-type(2) {
              color: #303030 !important;
              background-color: var(--primary-lighten-color-1) !important;
            }
          }
        }
      }
    }
  `,

  Contact : css`
    .contact {
      .emphasis {
        color: #303030 !important;
        
        em {
          color: #BE123C !important; /* Elegant rose red */
          
          &:before {
            color: #FFF1F2 !important; /* Soft premium rose */
            text-shadow: 2px -1px 6px rgba(0, 0, 0, 0.1) !important;
          }

          &:after {
            color: #FDA4AF !important; /* Soft rose outline */
          }
        }
      }
      
      .list-area {
        b {
          color: #BE123C !important;
        }
      }

      .list-item {
        color: #303030 !important;

        .title {
          color: #9F1239 !important; /* Deep elegant rose */
        }

        .colon {
          color: #9F1239 !important;
        }

        .text {
          color: var(--primary-darken-color-1) !important; /* High contrast rich blue link */
          
          a {
            color: var(--primary-darken-color-1) !important;
          }
        }
      }
    }
  `,

  Login : css`
    .login {
      .form-card {
        background: #FFFFFF !important;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05) !important;
        color: #303030 !important;

        .title {
          color: #303030 !important;
        }

        .info-item {
          .title {
            color: #4B5563 !important;
          }
          
          [class^="material"] {
            color: #4B5563 !important;
          }
        }

        .v-btn {
          &.close-btn {
            border: 1px solid #D1D5DB !important;
            color: #4B5563 !important;
            background: transparent !important;
          }
        }

        .login-btn {
          .v-btn {
            &.v-btn--density-default:not(.close-btn) {
              color: #FFFFFF !important; /* Keep white text on green login button! */
              background: var(--system-green-color) !important;
            }
          }
        }

        .menu-list {
          ul {
            li {
              color: #4B5563 !important;

              &:hover {
                color: var(--system-green-darken-color) !important;
              }
            }
          }
        }
      }
    }
  `,

  Join : css`
    .join {
      .join-container,
      div[class*="Container"] {
        background: #FFFFFF !important;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05) !important;
        color: #303030 !important;

        .title {
          color: #303030 !important;
        }

        .join-item {
          em {
            color: var(--system-red-color) !important;
          }
        }

        .join-btn {
          .v-btn {
            &.v-btn--density-default:not(.close-btn) {
              color: #FFFFFF !important;
              background: var(--system-green-color) !important;
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

    /* Enforce modern white inputs with gray border and dark charcoal text in light mode globally */
    .v-input {
      background: #FFFFFF !important;
      border: 1px solid #D1D5DB !important;
      
      input {
        color: #303030 !important;
      }
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
 * ************************************************************/
injectGlobal`
 
`;


/************************************************************
 * media style
 * ************************************************************/
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
 * ************************************************************/
DarkModeStyle.Default = css`
    html[dark-mode=true] {
      ${cx(
        DarkModeStyle.Header,
        DarkModeStyle.Menu,
        DarkModeStyle.Sidebar,
        DarkModeStyle.Main,
        DarkModeStyle.About,
        DarkModeStyle.Project,
        DarkModeStyle.Contact,
        DarkModeStyle.Login,
        DarkModeStyle.Join,
        DarkModeStyle.Input,
        DarkModeStyle.Tooltip,
      )}
    }
`;