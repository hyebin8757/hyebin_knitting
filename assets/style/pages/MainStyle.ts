import {css, cx, injectGlobal} from "@emotion/css";
import {StyleUtils} from "~/styleUtils/styleUtils";
import {_uiUtil} from "~/utils/core/ui/uiUtil";
import {MenuStyleData} from "~/components/menu/style/MenuStyle";
import {useUtil} from "~/utils/useUtil";

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
    overflow: hidden;
  `,

  Background : css`
    .line {
      position: absolute;
      bottom: 20rem;
      left: 0;
      display: inline-block;
      width: 10rem;
      height: 3rem;
      background: #fff;
    }

    .noite {
      background: -webkit-linear-gradient(top, rgb(0, 0, 0) 50%, rgb(25, 19, 39)80%, rgb(43, 32, 72));
      width: 100%;
      height: 100%;
      position: absolute;
      overflow: hidden;
    }

    .constelacao {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: calc( 100% - ${MenuStyleData.menuHeight}rem );
      animation: rotate 600s infinite linear;
      
      &.is-animation-none {
        animation: none;
      }
      
      [ class ^= "page_item" ] {
        position: absolute;
        cursor: pointer;
        transition: all 0.3s;
        
        svg {
          width: 5rem;
          height: 5rem;
        }
        
        &:hover {
          transform: scale( 1.1 );
        }
      }
      
      .page_item-0 {
        top: 50%;
        left: 50%;
      }
      
      .page_item-1 {
        top: 40%;
        left: 40%;
      }
      
      .page_item-2 {
        top: 60%;
        left: 60%;
      }
    }

    .estrela {
      background-color: white;
      border-radius: 50%;
      position: absolute;
      animation-name: estrela;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
    }

    .estrela.style1 { animation-duration: 0.5s; animation-name: estrela; }
    .estrela.style2 { animation-duration: 1s; animation-name: estrela; }
    .estrela.style3 { animation-duration: 1.5s; animation-name: estrela; }
    .estrela.style4 { animation-duration: 2s; animation-name: estrelaDestacada; }

    .estrela.tam1 { width: 1px; height: 1px; }
    .estrela.tam2 { width: 2px; height: 2px; }
    .estrela.tam3 { width: 3px; height: 3px; }

    .estrela.opacity1 { opacity:  1; }
    .estrela.opacity2 { opacity: .5; }
    .estrela.opacity3 { opacity: .1; }

    .meteoro {
      position: absolute;
      background-color: #fff;
      width: 2px;
      height: 2px;
      border-radius: 50%;
      transform: rotate(-35deg);
      animation-timing-function: linear;
      animation-iteration-count: infinite;
      animation-duration: 1s;
    }

    .meteoro:before {
      content: "";
      display: inline-block;
      vertical-align: middle;
      margin-right: 10px;
      width: 0;
      height: 0;
      border-top: 1px solid transparent;
      border-bottom: 1px solid transparent;
      border-left: 85px solid white;
      position: absolute;
      left: 2px;
      top: 0;
    }

    .meteoro.style1 { animation-name: meteoroStyle1; }
    .meteoro.style2 { animation-name: meteoroStyle2; }
    .meteoro.style3 { animation-name: meteoroStyle3; }
    .meteoro.style4 { animation-name: meteoroStyle4; }

    .lua {
      position: absolute;
      right: 200px;
      top: 150px;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      box-shadow: 0 0 160px 0px #fff, 0 0 30px -4px #fff, 0 0 8px 2px rgba(255, 255, 255, 0.26);
      background-color: #fff;
      animation-name: lua;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
      animation-duration: 10s;
      transition: all 0.3s;

      &:hover {
        transform: scale( 1.1 );
      }
    }

    .lua .textura {
      background-image: url("https://raw.githubusercontent.com/interaminense/starry-sky/master/src/img/bgMoon.png");
      background-position: center;
      background-size: 100%;
      width: 100%;
      height: 100%;
      position: absolute;
      left: 0;
      top: 0;
      border-radius: 50%;
      overflow: hidden;
      opacity: 0.4;
    }

    .floresta {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
    }

    .floresta img {
      width: 100%;
      position: absolute;
      bottom: 0;
      left: 0;
    }

    @keyframes escurecer {
      0%   { top: 0; }
      100% { top: 100%; }
    }

    @keyframes estrela {
      0% {
        box-shadow: 0 0 10px 0px rgba(255, 255, 255, 0.05);
      }
      50% {
        box-shadow: 0 0 10px 2px rgba(255, 255, 255, 0.4);
      }
      100% {
        box-shadow: 0 0 10px 0px rgba(255, 255, 255, 0.05);
      }
    }

    @keyframes estrelaDestacada {
      0% {
        background-color: #FFFFFF;
        box-shadow: 0 0 10px 0px rgba(255, 255, 255, 1);
      }
      20% {
        background-color: #FFC4C4;
        box-shadow: 0 0 10px 0px rgb(255, 196, 196, 1);
      }
      80% {
        background-color: #C4CFFF;
        box-shadow: 0 0 10px 0px rgb(196, 207, 255, 1);
      }
      100% {
        background-color: #FFFFFF;
        box-shadow: 0 0 10px 0px rgba(255, 255, 255, 0.2);
      }
    }

    @keyframes meteoroStyle1 {
      0% { opacity: 0; right: 300px; top: 100px; }
      30% { opacity: .3; }
      60% { opacity: .3; }
      100% { opacity: 0; right: 1000px; top: 600px; }
    }

    @keyframes meteoroStyle2 {
      0% { opacity: 0; right: 700px; top: 100px; }
      30% { opacity: 1; }
      60% { opacity: 1; }
      100% { opacity: 0; right: 1400px; top: 600px; }
    }

    @keyframes meteoroStyle3 {
      0% { opacity: 0; right: 300px; top: 300px; }
      30% { opacity: 1; }
      60% { opacity: 1; }
      100% { opacity: 0; right: 1000px; top: 800px; }
    }

    @keyframes meteoroStyle4 {
      0% { opacity: 0; right: 700px; top: 300px; }
      30% { opacity: 1; }
      60% { opacity: 1; }
      100% { opacity: 0; right: 1400px; top: 800px; }
    }

    @keyframes lua {
      0%{
        box-shadow: 0 0 160px 0px #fff, 0 0 30px -4px #fff, 0 0 8px 2px rgba(255, 255, 255, 0.26);
      }
      50% {
        box-shadow: 0 0 80px 0px #fff, 0 0 30px -4px #fff, 0 0 8px 2px rgba(255, 255, 255, 0.26);
      }
      100% {
        box-shadow: 0 0 160px 0px #fff, 0 0 30px -4px #fff, 0 0 8px 2px rgba(255, 255, 255, 0.26);
      }
    }

    @keyframes rotate {
      0% {
        -webkit-transform: rotate(0deg);
      }
      100% {
        -webkit-transform: rotate(360deg);
      }
    }
  `,

  Title : css`
    ${StyleUtils.FlexUtils("center", "flex-start")};
    position: absolute;
    top: 5rem;
    left: 50%;
    transform: translateX( -50% );
    width: fit-content;
    padding: 1rem 0 1rem 1rem;
    border-radius: 1rem;
    font-size: 4rem;
    font-weight: bold;
    white-space: nowrap;
    color: var( --white-color );
    z-index: 10000;
    
    img {
      width: 6rem !important;
      height: 6rem !important;
    }
  `,

  Cat : css`
    position: absolute;
    top: 0;
    left: 0;
    width: 15rem;
    height: 15rem;
    z-index: 10000;
    
    img {
      width: 100%;
      height: 100%;
    }
    
    &.is-rest {
      width: 13rem;
    }
    
    &.is-left {
      transform: scaleX( -1 );
    }
  `,

  Guide : css`
    ${StyleUtils.FlexUtils("center", "flex-start")};
    position: relative;
    width: fit-content;
    margin-top: -5rem;
    padding: 1rem;
    border-radius: 1rem;
    font-size: 2rem;
    font-weight: bold;
    white-space: nowrap;
    background: var( --white-color );

    &:before {
      content: "";
      position: absolute;
      bottom: -2.8rem;
      left: 4.6rem;
      display: inline-block;
      border: 1.5rem solid transparent;
      border-top-color: var( --white-color );
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
MainStyle.Default = cx(
  MainStyle.Default,
  MainStyle.Background,
);