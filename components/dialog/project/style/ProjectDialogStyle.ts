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
export const ProjectDialogStyle = {
  Default : css`
    &.v-dialog {
      .v-overlay__content {
        .v-card {
          .v-card-item {
            color: var( --white-color );
            background: var( --primary-darken-color-1 );
          }

          .v-card-text {
            padding: 3rem 2rem !important;
          }
          
          .v-card-actions {
            .v-btn {
              height: fit-content;
              padding: 1rem;
              color: var( --white-color );
              background: var( --primary-darken-color-1 );
            }
          }
        }    
      }
    }
  `,

  WorkList : css`
    font-size: 1.6rem;
    font-weight: 500;
    
    li {
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
