import { css, injectGlobal, cx } from "@emotion/css";
import {StyleUtils} from "~/styleUtils/styleUtils";
import {_uiUtil} from "~/utils/core/ui/uiUtil";

const { setMedia } = _uiUtil();

/************************************************************
 * style data
 ************************************************************/


/************************************************************
 * style
 ************************************************************/
export const BaseDialogStyle = {
  Default : css`
    &.v-dialog {
     
    }
  `,

  Card : css`
    &.v-dialog {
      .v-overlay__content {
        .v-card {
          box-shadow: none;

          .v-card-item {
            padding: 1rem 2rem;

            .v-card-item__content {
              .v-card-title {
                ${StyleUtils.FlexUtils("center", "space-between")};
                font-size: 1.8rem;
              }
            }
          }
          
          .v-card-text {
            padding: 1rem 2rem !important;
            font-size: 1.4rem;
          }
          
          .v-card-actions {
            padding: 1rem 2rem;
            
            .v-btn {
              font-size: 1.4rem;
            }
          }
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
BaseDialogStyle.Default = cx(
  BaseDialogStyle.Default,
  BaseDialogStyle.Card
);