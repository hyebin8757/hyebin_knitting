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
export const ProjectStyle = {
  Default : css`
    
  `,

  ProjectItem : css`
    
  `,

  ProjectTitle : css`
    
  `,

  CardWrapper: css`

  `,

  Card : css`

  `,

  CardImg : css`

  `,

  CardTitle : css`

  `,

  CardContent : css`

  `,

  CardText : css`

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
const MainMediaStyle = {
  MainMedia : {
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
