import {css, injectGlobal} from "@emotion/css";
import {StyleUtils} from "~/styleUtils/styleUtils";
import {_uiUtil} from "~/utils/core/ui/uiUtil";

const { useImage } = useUtil.AssetResolverUtil;
const { setMedia } = _uiUtil();

/************************************************************
 * global style
 ************************************************************/
injectGlobal`
  
`

/************************************************************
 * style data
 ************************************************************/

/************************************************************
 * style
 ************************************************************/
export const ManagerStyle = {
  Default : css`
    
  `,

  Layout : css`
    header {
      ${StyleUtils.FlexUtils('center','flex-end' )};
      gap: 1rem;
      min-height: 4rem;
      padding: 1rem 2rem;
      border-bottom: 1px solid var( --border-color-1 );
      font-size: 1.5rem;

      .user-name {
        font-weight: 700;
      }

      .user-mode__button{
        &.v-btn {
          height: 2rem;
          padding: 0 1rem;
          border: 2px solid var( --border-color-1 );
          color: var( --text-color-4 );

          &:hover {
            color: var( --primary-color );
            border-color: var( --primary-color );
          }
        }
      }

      .logout__button {
        &.v-btn {
          padding: 0;
          color: var( --text-color-3 );

          [ class ^= "material" ] {
            font-size: 2rem;
          }

          &:hover {
            color: var( --primary-color );
          }
        }
      }
    }
    
    .container {
      ${StyleUtils.FlexUtils('stretch','flex-start' )};
      width: 100%;
      height: 100%;
    }
    
    .sidebar {
      width: 100%;
      height: 100%;
      max-width: 24rem;
      padding-top: 2rem;
      border-right: 1px solid var( --border-color-1 );
      
      .sidebar__title{
        width: calc( 100% - 3.2rem );
        height: 5.4rem;
        margin: 0 1.6rem 2rem;
        border-radius: 3rem;
        font-size: 2rem;
        font-weight: 700;
        text-align: center;
        line-height: 5.4rem;
        color: var( --white-color );
        background: var( --primary-color );
      }
      
      .sidebar__list {
        li {
          padding: 1rem 2rem;
          font-size: 1.8rem;
          cursor: pointer;
          
          + li {
            border-top: 1px solid var( --border-color-1 );
          }

          &.is-active {
            font-weight: 700;
          }
          
          &:last-child {
            border-bottom: 1px solid var( --border-color-1 );
          }
          
          &.is-active,
          &:hover {
            color: var( --primary-darken-color-1 );
            background: var( --primary-lighten-color-2 );
          }
        }
      }
    }
    
    .content {
      width: 100%;
      padding: 2rem;
    }
    
    .search-view {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
      
      > .search__item {
        width: 100%;
        
        > span {
          min-width: 8rem;
          white-space: nowrap;
        }
        
        &.select-input {
          .search__item {
            &:nth-of-type(1) {
              width: 10%;
            }

            &:nth-of-type(2) {
              width: 90%;
              max-width: 32.5rem;
            }
          }
        }
        
        .v-input,
        .dp__main {
          height: 4rem !important;
        }
        
        .dp__main {
          max-width: 30rem;
          
          [ class ^= "material" ] {
            font-size: 2rem !important;
          }
        }
      }
      
      .search__button-group {
        .v-btn {
          &:first-of-type {
            color: var( --white-color );
            background: var( --text-color-4 );
          }
        }
      }
    }

    .theme-main {
      border: 2px solid #ccc;
      overflow: hidden;

      table {
        width: 100%;
      }
      
      &.bd-strong {
        th, td {
          border-right: 2px solid #ccc;

          &:last-child {
            border-right: 0 none;
          }
        }
      }

      &.bb-head-tr {
        thead {
          border-bottom: 0 none;

          tr {
            border-bottom: 2px solid #ccc;
          }
        }

        &-lgray {
          thead {
            border-bottom: 2px solid #ccc;

            tr {
              border-bottom: 1px solid #ccc;
            }
          }
        }
      }

      thead {
        background: #ededed;
        border-bottom: 2px solid #898989;
      }

      tr.no-data {
        height: 0;
        padding: 0;
        border: 0 none;
        display: table-row;

        td {
          height: 0;
          padding: 0;
          border: 0 none;

          i {
            color: $primaryColor;
            margin-right: 0.5rem;
          }
        }
      }

      tbody {
        tr {
          border-bottom: 2px solid #898989;

          &:last-child {
            border-bottom: 0 none;
          }
        }
      }

      th, td {
        height: 5.7rem;
        padding: 1rem;
        vertical-align: middle;
        letter-spacing: -0.5px;
        word-break: break-word;
        word-wrap: break-word;
        text-align: center;
        border-right: 1px solid #ccc;
      }

      th {
        font-size: 1.8rem;
        font-weight: 500;
        color: #363636;
      }

      td {
        &.active {
          cursor: pointer;

          &:hover {
            color: var( --primary-color );
            text-decoration: underline;
          }
        }

        &:last-child {
          border: 0 none;
        }

        &.tl {
          > span {
            padding-left: 1rem;
          }

          > span.pdleft0 {
            padding-left: 0;
          }
        }
      }
      
      .v-checkbox {
        .v-label {
          display: none;
        }
      }
    }
  `,
  
  UrlCreationStatusList : css`
    .list-header {
      ${StyleUtils.FlexUtils('center','space-between' )};
      margin-bottom: 1rem;
    }
  `,

  UrlCreationStatusEdit : css`
    .short-url-info {
      > span {
        display: none;
      }
    }
  `,
}



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

    `,

    /** [ 350px ] */
    350 : css `
      
    `
  },
}


/************************************************************
 * style override
 ************************************************************/
