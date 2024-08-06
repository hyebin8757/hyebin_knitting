import { css, injectGlobal } from "@emotion/css";
import {StyleUtils} from "~/styleUtils/styleUtils";
import {_uiUtil} from "~/utils/core/ui/uiUtil";
import {CommonStyle} from "assets/style/CommonStyle";

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

  Tab : css`
    &.v-tabs {
      ${CommonStyle.MenuBtn};
      
      .v-btn {
        :nth-of-type(3) {
          img {
            filter: brightness(0) saturate(100%) invert(14%) sepia(77%) saturate(5289%) hue-rotate(351deg) brightness(90%) contrast(81%);
          }
        }
      }
    }
  `,

  CardTextBox : css`
    &.v-card-text {
      ${CommonStyle.DefaultPadding};
    }
  `,

  ProjectItem : css`
    &.project-item {
      
      + .project-item {
        margin-top: 3rem;
      }
    }
  `,

  ProjectTitle : css`
    margin-bottom: 4rem;
    
    h2 {
      font-size: 3rem;
      color: var( --white-color );
    }
  `,

  CardWrapper: css`
    width: 100vw;
    
    .swiper-wrapper {
      position: relative;
      left: -35rem;
    }
    
    .swiper-slide {
      width: fit-content;
      height: 100%;
      max-width: 80rem;
      max-height: 100rem;
      border-radius: 1rem;
      background-size: cover;
      background-position: center;
    }
  `,

  Card : css`
    ${StyleUtils.FlexUtils("stretch", "flex-start")};
    gap: 2rem;
    border-radius: 2rem;
    background: var( --white-color );
  `,

  CardImg : css`
    width: 40rem;
    height: 30rem;
    border-radius: 2rem 0 0 2rem;
    border-bottom: 1px solid var( --border-color-1 );
    
    img {
      display: block;
      width: 100%;
      height: 100%;
      min-height: 30.1rem;
      border-radius: 2rem 0 0 2rem;
    }
  `,

  CardContainer : css`
    ${StyleUtils.FlexUtils("flex-start", "space-between", "", "column")};
    width: 25rem;
    padding: 1rem;
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

  CardTag : css`
    margin-top: 1rem;
    font-size: 1.2rem;
    font-weight: 500;
    color: var( --text-color-2 );
  `,

  CardBtnGroup : css`
    ${StyleUtils.FlexUtils("center", "flex-end")};
    gap: 1rem;
    width: 100%;
    padding: 0 1rem 1rem 0;
    
    .v-btn {
      padding: 0.5rem 1rem;
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
