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
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    .menu-list {
      &:after {
        content: "";
        display: block;
        position: fixed;
        top: 0;
        left: 0;
        z-index: -10;
        width: 100vw;
        height: 100vh;
        background: rgba( 0, 0, 0, 0.5 );
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
    }

    &.is-show-mobile {
      transform: translateX(0) !important;
      
      .menu-list {
        &:after {
          opacity: 1;
          pointer-events: auto;
        } 
      }
    }
  `,

  MenuButtonList : css`
    width: 5rem;
    height: 100%;
    border-right: 1px solid var( --black-color );
    background: var( --primary-lighten-color-3 );
    
    .v-btn {
      &.v-btn--density-default {
        width: 100%;
        height: 4.8rem;
        color: var( --white-color );
        
        &.is-active,
        &:hover {
          color: var( --system-green-lighten-color );
        }
      }
      
      + .v-btn {
        margin-top: 1rem;
      }
    }
  `,

  MenuList : css`
    ${StyleUtils.FlexUtils("stretch", "flex-start")};
    width: fit-content;
    min-width: 17.5rem;
    max-width: 25rem;
    height: 100%;
    
    .resize-bar {
      position: relative;
      width: 10px;
      margin-left: -4px;
      margin-right: -4px;
      height: 100%;
      cursor: col-resize;
      background: transparent;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;

      &::before {
        content: "";
        position: absolute;
        left: 4px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: var( --black-color );
        transition: background 0.2s ease, width 0.2s ease, left 0.2s ease;
      }
      
      &.is-active::before,
      &:hover::before {
        left: 3px;
        width: 4px;
        background: var( --system-green-lighten-color );
      }
    }

    .resize-button {
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var( --system-green-lighten-color );
      border: 2px solid var( --black-color );
      color: var( --black-color );
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
      cursor: col-resize;
      z-index: 20;
      transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
      pointer-events: auto;

      &:hover {
        background: var( --white-color );
        transform: translate(-50%, -50%) scale(1.1);
        box-shadow: 0 6px 14px rgba(0, 0, 0, 0.4);
      }

      &:active {
        transform: translate(-50%, -50%) scale(0.95);
      }

      svg {
        width: 16px;
        height: 16px;
        color: var( --black-color ) !important;
        margin: 0 !important;
      }
    }

    .fade-enter-active,
    .fade-leave-active {
      transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .fade-enter-from,
    .fade-leave-to {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.5);
    }
    
    .v-list {
      width: 100%;
      height: 100%;
      padding: 0;
      background: transparent;

      img {
        width: 1.4rem;
        height: 1.4rem;
      }
      
      svg {
        margin-top: 3px;
        width: 1.8rem;
        height: 1.8rem;
      }
      
      .v-list-group {
        > .v-list-item {
          padding: 0 1rem;
          
          .v-list-item-title {
            font-size: 1.8rem;
            font-weight: 700;
          }

          &:hover {
            color: var( --system-green-lighten-color );
          }
        }
        
        .v-list-group__items {
          .v-list-item {
            ${StyleUtils.FlexUtils("center", "flex-start")};
            gap: 0.8rem;
            min-height: 4rem;
            padding-inline-start: 0 !important;
            padding: 0 1.6rem !important;
            
            .v-list-item-title {
              font-size: 1.6rem;
            }

            &.is-active,
            &:hover {
              background: var( --system-green-darken-color );
            }
            
            .v-list-item__append {
              margin-left: auto;
              
              .bookmark {
                &.is-active {
                  color: var( --secondary-lighten-color-1);
                }
              }
            }
          } 
        }
      }
      
      .v-list-item {
        padding: 0;
        color: var( --white-color );
        cursor: pointer;
        
        .v-list-item__overlay {
          display: none;
        }
      }
    }
  `,

  BookmarkList : css`
    margin-top: 2rem;
    padding: 0 !important;

    .v-list-item {
      ${StyleUtils.FlexUtils("center", "flex-start")};
      gap: 0.8rem;
      min-height: 4rem;
      padding-inline-start: 0 !important;
      padding: 0 1.6rem !important;

      .v-list-item-title {
        font-size: 1.6rem;
      }

      &.is-active,
      &:hover {
        background: var( --system-green-darken-color );
      }

      .v-list-item__append {
        margin-left: auto;

        .bookmark {
          &.is-active {
            color: var( --secondary-lighten-color-1);
          }
        }
      }
    }
  `,

  BookmarkTitle : css`
    ${StyleUtils.FlexUtils("center", "space-between")};
    padding: 1rem;
    border-bottom: 1px solid var( --border-color-1 );
    font-size: 1.6rem;
    font-weight: 500;
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
