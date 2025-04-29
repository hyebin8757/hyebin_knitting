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
export const BaseButtonGroupStyle = {
  Default : css`
    ${StyleUtils.FlexUtils("center", "flex-start")};
    gap: 1rem;
    margin-right: 2rem;

    .button-item {
      ${StyleUtils.FlexUtils("center", "center")};
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 50%;
      color: var( --white-color );
      cursor: pointer;

      label {
        display: none;
      }

      [ class ^= "material" ] {
        font-size: 1.1rem;
        font-weight: 700;
      }

      &.close {
        color: var( --system-red-darken-color );
        background: var( --system-red-lighten-color );
      }

      &.remove {
        color: var( --system-yellow-darken-color );
        background: var( --system-yellow-color );
      }

      &.zoom {
        color: var( --system-green-darken-color );
        background: var( --system-green-lighten-color );
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

/************************************************************
 * style override
 ************************************************************/
