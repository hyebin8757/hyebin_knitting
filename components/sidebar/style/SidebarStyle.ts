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
    min-width: 15rem;
    max-width: 25rem;
    height: 100%;
    
    .resize-bar {
      width: 2px;
      height: 100%;
      background: var( --black-color );
      cursor: col-resize;
      
      &.is-active,
      &:hover {
        background: var( --system-green-lighten-color );
      }
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
