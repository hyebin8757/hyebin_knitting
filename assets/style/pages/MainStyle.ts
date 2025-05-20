import {css, cx, injectGlobal} from "@emotion/css";
import {StyleUtils} from "~/styleUtils/styleUtils";
import {_uiUtil} from "~/utils/core/ui/uiUtil";
import {MenuStyleData} from "~/components/menu/style/MenuStyle";
import {useUtil} from "~/utils/useUtil";
import { CommonStyle } from "assets/style/CommonStyle";

const { setMedia } = _uiUtil();
const { useImage } = useUtil.AssetResolverUtil;


/************************************************************
 * style data
 ************************************************************/

/************************************************************
 * style
 ************************************************************/
export const MainStyle = {
  Default : css`
    position: relative;
    width: 100%;
    height: calc( 100% - ${MenuStyleData.menuHeight}rem );
    padding: 3rem;
    overflow: hidden;
    background: url(${useImage("/assets/images/bg/bg_main.png")}) repeat center center/cover;
  `,

  Title : css`
    ${StyleUtils.FlexUtils("center", "flex-start")};
    width: fit-content;
    padding: 1rem 0 1rem 1rem;
    border-radius: 1rem;
    font-size: 4rem;
    font-weight: bold;
    white-space: nowrap;
    color: var( --background-color-4 );
    z-index: 100;
    
    img {
      width: 6rem !important;
      height: 6rem !important;
    }
    
    br {
      display: none;
    }
  `,

  Content : css`
    ${StyleUtils.FlexUtils("stretch", "center")};
    gap: 3rem;
    margin-top: 4rem;
  `,


  CodeBox : css`
    width: 100rem;
    border: 1px solid #769DA6;
    border-radius: 2rem;
    overflow: hidden;
  `,

  CodeBoxHeader : css`
    ${StyleUtils.FlexUtils("center", "space-between")};
    height: 4rem;
    padding: 0 2rem;
    border-radius: 2rem 2rem 0 0;
    font-size: 1.6rem;
    font-weight: 500;
    color: var( --background-color-4 );
    background: var( --primary-color );
    
    > div {
      &:nth-of-type(1) {
        ${StyleUtils.FlexUtils("center", "flex-start")};
        gap: 1.5rem;
      }
    }
  `,

  CodeBoxHeaderButton : css`
  `,

  CodeBoxContent : css`
    ${ CommonStyle.Scroll };
    width: 100%;
    height: 54.4rem;
    border-radius: 0 0 2rem 2rem;
    background: #010F1C;
  `,

  CodeBoxPending : css`
    ${StyleUtils.FlexUtils("center", "center")};
    width: 100%;
    height: 100%;
    font-size: 2rem;
    font-weight: 700;
    color: var( --white-color );
    
    > img {
      width: 5rem;
      height: auto;
    }
    
    span {
      img {
        display: inline-block;
        width: 2.4rem;
        height: auto;
        vertical-align: text-bottom;
      } 
    }
  `,

  CodeBoxCode : css`
    width: 100%;
    height: 100%;
    overflow: auto;
    padding: 2.4rem;
    font-size: 1.8rem;
    font-weight: 500;
    color: var( --white-color );
    white-space: pre;

    .hidden {
      visibility: hidden;
    }

    .cursor {
      display: inline-block;
      width: 8px;
      height: 1rem;
      background-color: #ccc;
      animation: blink 0.8s infinite;
    }
    
    [ class ^= "line" ] {
      > [ class ^= "tag" ] {
        &:nth-of-type(1) {
          margin-top: 0.5rem;
        }
      }
    }
    
    .tag-title {
      &:nth-of-type(2) {
        margin-top: 0.5rem;
      }
      
      &:nth-of-type(3) {
        margin-bottom: 0.5rem;
      }
    }
    
    .tag {
      &-html,
      &-body {
        color : #FFCB6B;  
      }

      &-head,
      &-main {
        color : #82AAFF;
      }
      
      &-title {
        color : #C3E88D;
      }

      &-b {
        color : #F07178;;
      }

      &-p {
        color : #7FDBFF;
      }


      &-head,
      &-body {
        padding-left: 1rem;
      }
      
      &-main,
      &-title {
        padding-left: 2rem;
      }

      &-b,
      &-p {
        padding-left: 3rem;
        
        + .text {
          padding-left: 4rem;
        }
      }
      
      &-title {
        + .text {
          padding-left: 3rem;
        }
      }
    }

    @keyframes blink {
      0%, 100% { background: #ccc; }
      50% { background: transparent; }
    }
  `,

  CatBox : css`
    width: 100%;
    max-width: 50rem;
    text-align: center;
    
    .v-btn {
      position: relative;
      width: 15rem;
      height: 3rem;
      background: var( --background-color-4 );
      
      &::after {
        content: "";
        position: absolute;
        display: inline-block;
        width: 3rem;
        height: 3rem;
        opacity: 0;
        left: 50%;
        transform: translate( -50%, 0 );
        border: 0 none !important;
        pointer-events: none;
        transition: none;
        background: url(${useImage("/assets/images/icon/icon_heart.png")}) repeat center center/cover;
        filter: brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(2%) hue-rotate(338deg) brightness(111%) contrast(101%);
      }
      
      &.is-active {
        &::after {
          animation: slideUpFade 1s ease-out forwards;
        }
      }
      
      img {
        width: 3rem;
        height: 3rem;
      }
      
      &:hover {
        background: var( --system-red-color );
        
        img {
          filter: brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(2%) hue-rotate(338deg) brightness(111%) contrast(101%);
        }
      }
    }

    @keyframes slideUpFade {
      0% {
        opacity: 0;
        transform: translateY(-10px);
      }
      30% {
        opacity: 1;
        transform: translateY(-20px);
      }
      70% {
        opacity: 1;
        transform: translateY(-30px);
      }
      100% {
        opacity: 0;
        transform: translateY(-40px);
      }
    }
  `,

  CatBoxGuide : css`
    ${StyleUtils.FlexUtils("center", "center")};
    position: relative;
    width: 40rem;
    height: 5rem;
    margin: 0 auto;
    border-radius: 5rem;
    font-size: 2rem;
    background: var( --background-color-4 );
    
    &:before {
      content: "";
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX( -50% );
      display: inline-block;
      width: 0;
      height: 0;
      border-left: 1rem solid transparent;
      border-right: 1rem solid transparent;
      border-top: 2rem solid var( --background-color-4 );; 
    }
  `,

  CatBoxImg : css`
    position: relative;
    
    img {
      &:nth-of-type(1) {
        position: absolute;
        top: 58%;
        right: 40%;
        width: 100%;
        max-width: 7rem;
        height: auto;
      }
      
      &:nth-of-type(2) {
        width: 100%;
        height: auto;
      }
    }
  `,

  ButtonGroup : css`
    ${StyleUtils.FlexUtils("center", "center")};
    gap: 10rem;
    margin-top: 4rem;

    .v-btn.v-btn--density-default {
      flex: 1;
      max-width: 20rem;
      height: 5rem;
      font-size: 1.8rem;
      font-weight: 700;
      background: var( --background-color-4 );
      
      img {
        width: 3rem;
        height: auto;
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
    /** [ 1800px ] */
    1800 : css`
      .main-content {

        .code-box{
          position: relative;
        }

        .cat-box {
          position: absolute;
          bottom: 1rem;
          right: 1rem;
          width: 14rem;

          .cat-box-guide {
            width: 10rem;
            font-size: 1.4rem;
          }

          .cat-box-img {
            img {
              &:nth-of-type(1) {
                width: 2rem;
              }
            }
          }
        }
      }
    `,

    /** [ 1280px ] */
    1280 : css`
      .main-title {
        br {
          display: inline-block;
        } 
        
        img {
          display: none;
        }
      }

      .main-content {
        .code-box {
          width: 100%;
        }
      }
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
MainStyle.Default = cx(
  MainStyle.Default,
  // option ( max | min )
  setMedia( MediaStyle.Media,  "max" )
);