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
    width: 100%;
    height: 100%;
    
    .v-card-text,
    [ class ^= "v-window" ] {
      width: 100%;
      height: 100%;
    }

    .v-card-text {
      height: calc( 100% - 8.8rem );
    }
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
    width: 100%;
    height: 100%;
    
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
    ${StyleUtils.FlexUtils("stretch", "flex-start")};
    gap: 2rem;
    position: relative;
    width: 100%;
    height: 100%;
  `,

  CentralContainer : css`
    position: relative;
    width: calc( 100% - 50rem );
    visibility: hidden;
    opacity: 0;
    transition: all 0.5s ease;
    
    &.central-1 {
      max-height: 80rem;
    }

    .project-card.curved-move {
      animation: swing-in-left-fwd 3s cubic-bezier(0.175, 0.885, 0.320, 1.275) both;
    }

    @keyframes swing-in-left-fwd {
      0% {
        -webkit-transform: rotateY(100deg);
        transform: rotateY(100deg);
        -webkit-transform-origin: left;
        transform-origin: left;
        opacity: 0;
      }
      100% {
        -webkit-transform: rotateY(0);
        transform: rotateY(0);
        -webkit-transform-origin: left;
        transform-origin: left;
        opacity: 1;
      }
    }

  `,

  DetailCardList :  css`
    ${StyleUtils.FlexUtils("stretch", "flex-start")};
    width: 100%;
    height: 100%;
    max-height: 80rem;
    border-radius: 2rem;
    background: var( --white-color );
  `,

  DetailCardImg : css`
    width: 100%;
    max-width: 110rem;
    height: 100%;
    border-radius: 2rem 0 0 2rem;
    overflow: hidden;
    
    img {
      width: 100%;
      height: 100%;
    }
  `,

  DetailCardContent : css`
    width: 100%;
    min-width: 35rem;
    height: 100%;
    padding: 2rem;
    
    .title {
      font-size: 2.8rem;
      margin-bottom: 2rem;
    }
    
    .content {
      display: inline-block;
      font-size: 1.8rem;
      margin-bottom: 2rem;
    }
    
    .work-list {
      font-size: 1.6rem;
    }
    
    .tag {
      margin: 2rem 0;
      font-size: 1.4rem;
      color: var( --text-color-3 );
    }
    
    .btn-area {
      .v-btn {
        width: fit-content;
        height: 5rem;
        padding: 0 1rem;
        font-size: 1.6rem;
        color: var( --white-color );
        background: var( --primary-darken-color-1 );
        
        [ class ^= "material" ] {
          margin-left: 1rem;
          font-size: 2rem;
        }
      }
    }
  `,

  CardList: css`
    position: relative;
    width: 50rem;
    height: 100%;
    
    .project-card {
      position: absolute;
      left: 0;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      
      &:hover {
        transform: translateY(-20px);
      }
      
      &:nth-of-type(1) {
        top: 0;
        z-index: 1;
      }
      
      &:nth-of-type(2) {
        top: 5vw;
        z-index: 2;
      }

      &:nth-of-type(3) {
        top: 10vw;
        z-index: 3;
      }

      &:nth-of-type(4) {
        top: 15vw;
        z-index: 4;
      }

      &:nth-of-type(5) {
        top: 20vw;
        z-index: 5;
      }
    }
  `,

  Card : css`
    width: 50rem;
    height: fit-content;
    position: relative;
    border-radius: 2rem;
    cursor: pointer;
    background: var( --white-color );
  `,

  CardLine : css`
    padding: 1rem 0;
    text-align: center;
    
    &:before {
      content: "";
      display: inline-block;
      width: 4rem;
      height: 0.5rem;
      border-radius: 1.5rem;
      background: var( --primary-darken-color-1 );
    }
  `,

  CardImg : css`
    position: relative;
    width: 100%;
    height: auto;
    max-width: 50rem;
    max-height: 50rem;
    border-radius: 0 0 2rem 2rem;
    
    img {
      display: block;
      width: 100%;
      height: 100%;
      min-height: 30.1rem;
      border-radius: 0 0 2rem 2rem;
    }
    
    &:before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      display: inline-block;
      width: 100%;
      height: 100%;
      border-radius: 0 0 1.7rem 1.7rem;
      background: rgba( 0, 0, 0, 0.8 );
    }
  `,

  CardContainer : css`
    ${StyleUtils.FlexUtils("flex-start", "space-between", "", "column")};
    width: 100%;
  `,

  CardContent : css`
    position: absolute;
    top: 3rem;
    left: 0;
    height: 10rem;
    padding: 1rem;
    color: var( --white-color );
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
