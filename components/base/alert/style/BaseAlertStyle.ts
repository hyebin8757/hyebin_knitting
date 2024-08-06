import { css, injectGlobal } from "@emotion/css";
import {_uiUtil} from "~/utils/core/ui/uiUtil";
import {StyleUtils} from "~/styleUtils/styleUtils";

const { setMedia } = _uiUtil();

/************************************************************
 * style data
 ************************************************************/


/************************************************************
 * style
 ************************************************************/
export const BaseAlertStyle = {
  Default : css`
    position: fixed !important;
    top: 50%;
    left: 50%;
    transform: translate( -50%, -50% );
    
    .v-alert__content {
      font-size: 1.4rem;
      
      .v-alert-title {
        margin-bottom: 1rem;
        font-size: 2rem;
      }
    }
  `,

  Footer : css`
    ${StyleUtils.FlexUtils("center", "flex-end")};
    gap: 1rem;
    margin-top: 1rem;
    
    .v-btn {
      font-size: 1.4rem;
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

/************************************************************
 * style override
 ************************************************************/
