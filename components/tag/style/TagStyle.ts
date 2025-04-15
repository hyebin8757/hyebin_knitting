import {css, cx, injectGlobal} from "@emotion/css";
import {StyleUtils} from "~/styleUtils/styleUtils";
import {_uiUtil} from "~/utils/core/ui/uiUtil";

const { setMedia } = _uiUtil();

/************************************************************
 * style data
 ************************************************************/


/************************************************************
 * style
 ************************************************************/
export const TagStyle = {
  Default : css`
    ${StyleUtils.FlexUtils("stretch", "flex-start")};
    gap: 1rem;
    font-size: 2rem;
    font-weight: 500;
    color: var( --white-color );
    
    .tag {
      color:#2CBC8C;;
    }
    
    .option {
      color: #D4CAB2;
    }
    
    .option-text {
      color: var( --primary-lighten-color-1 );
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
TagStyle.Default = cx(
  TagStyle.Default,
  // option ( max | min )
  setMedia( MediaStyle.Media,  "max" ),
);