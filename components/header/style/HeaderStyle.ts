import { css, injectGlobal } from "@emotion/css";
import {StyleUtils} from "~/styleUtils/styleUtils";
import {_uiUtil} from "~/utils/core/ui/uiUtil";

const { setMedia } = _uiUtil();

/************************************************************
 * style data
 ************************************************************/
export const HeaderStyleData = {
  height : '4rem',
}

/************************************************************
 * style
 ************************************************************/
export const HeaderStyle = {
  Default : css`
    ${StyleUtils.FlexUtils("center", "space-between")};
    height: ${HeaderStyleData.height};
    padding: 1rem 1.4rem;
    background: var( --gradation-color-1 );
  }
  `,

  Left : css`
    flex: 0.2;
  `,

  Center : css`
    ${StyleUtils.FlexUtils("center", "center")};
    gap: 1rem;
    flex: 1;
  `,

  Right : css`
    
  `,

  ButtonGroup : css`
    ${StyleUtils.FlexUtils("center", "flex-start")};
    gap: 1rem;
    
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

  Title : css`
    font-size: 1.6rem;
    color: var( --white-color );
  `,

  Profile : css`
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: var( --white-color );
    
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }
  `,

  TooltipProfile : css`
    .header-profile {
      img {
        width: 25rem;
        height: 30rem;
      }
    }
  `,

  SearchInput : css`
    &.v-input {
      width: 20rem;
      height: 3rem;
      
      .v-input__control {
        min-height: 3rem;
      }
    }
  `,
}

/************************************************************
 * global style
 ************************************************************/
injectGlobal`
  ${HeaderStyle.TooltipProfile};
`;


/************************************************************
 * media style
 ************************************************************/
const HeaderMediaStyle = {
  HeaderMedia : {
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
