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
    &.project-item {
      
      + .project-item {
        margin-top: 3rem;
      }
    }
  `,

  ProjectTitle : css`
    margin-bottom: 2rem;
    
    h2 {
      font-size: 3rem;
      color: var( --white-color );
    }
  `,

  CardWrapper: css`
    width: 100vw;
    
    .swiper-wrapper {
      position: relative;
      left: -55rem;
    }
    
    .swiper-slide {
      width: 100%;
      height: 100%;
      max-width: 40rem;
      max-height: 40rem;
      border-radius: 1rem;
      background-size: cover;
      background-position: center;
    }
  `,

  Card : css`
    border-radius: 2rem;
    background: var( --white-color );
  `,

  CardImg : css`
    width: 100%;
    height: 15rem;
    border-bottom: 1px solid var( --border-color-1 );
    
    img {
      display: block;
      width: 100%;
      height: 100%;
      border-radius: 2rem 2rem 0 0;
      object-fit: contain;
    }
  `,

  CardContent : css`
    height: 10rem;
    padding: 1rem 
  `,

  CardTitle : css`
    font-size: 1.8rem;
  `,

  CardText : css`
    padding-top: 1rem;
    font-size: 1.4rem;
  `,

  CardBtnGroup : css`
    ${StyleUtils.FlexUtils("center", "flex-end")};
    gap: 1rem;
    padding: 0 1rem 1rem 0;
    
    .v-btn {
      padding: 0.5rem;
      font-size: 1.2rem;
      color: var( --white-color );

      &:nth-of-type(1) {
        background-color: var( --primary-darken-color-1 );
      }
      
      &:nth-of-type(2) {
        background-color: var( --primary-lighten-color-1 );
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
