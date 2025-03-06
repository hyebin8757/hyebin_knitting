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
export const ProjectCardStyle = {
  Default : css`
    width: 40rem;
    height: fit-content;
  `,

  ImgBox : css`
    width: 100%;
    height: 25rem;
    border-radius: 1rem;
    box-shadow: 0 0 15px 0 #00000040;
    
    img {
      width: 100%;
      height: 100%;
      border-radius: 1rem;
    }
  `,

  Title : css`
    margin: 1.2rem 0;
    color: var( --white-color );
    
    h2 {
      font-size: 2rem;  
    }
  `,

  InfoBox : css`
    padding: 1.6rem;
    border-radius: 1rem;
    background: var( --background-color-1 );
  `,

  LabelBox : css`
    ${StyleUtils.FlexUtils("center", "flex-start", "wrap" )};
    gap: 1rem;
    
    .v-chip.v-chip--size-default {
      font-size: 1.2rem;
      font-weight: 500;
    }
  `,

  DataBox : css`
    margin-top: 2rem;
    
    li {
      ${StyleUtils.FlexUtils("stretch", "flex-start" )};
      gap: 1rem;
      font-size: 1.4rem;
      font-weight: 500;
      
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
ProjectCardStyle.Default = cx(
  ProjectCardStyle.Default,
  // option ( max | min )
  setMedia( MediaStyle.Media,  "max" ),
);