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
export const LoginStyle = {
  Default : css`
    ${StyleUtils.FlexUtils( "center", "center" )};
    width: 100vw;
    height: 100vh;
    background: linear-gradient(75deg, rgba(12, 32, 52, 1) 10%, rgb(96, 155, 147) 20%, rgba(12, 32, 52, 1) 100%);
    background-size: 10000px 100%;
    animation: bg 8s linear infinite;

    @keyframes bg {
      0% {
        background-position-x: 0;
      }

      100% {
        background-position-x: 10000px;
      }
    }
  `,

  Container : css`
    ${StyleUtils.FlexUtils("center", "center")};
    width: 100%;
    height: 100%;
    max-width: 100rem;
    max-height: 60rem;
    border-radius: 2rem;
    overflow: hidden;
  `,

  FormBg : css`
    width: 100%;
    height: 100%;
    
    img {
      width: 100%;
      height: 100%;
    }
  `,

  FormCard : css`
    ${StyleUtils.FlexUtils("center", "center", "", "column")};
    width: 100%;
    height: 100%;
    padding: 2rem 5rem;
    background: var( --white-color );
  `,

  Title : css`
    ${StyleUtils.FlexUtils("center", "center")};
    gap: 0.5rem;
    margin-bottom: 4rem;
    font-size: 3rem;
    font-weight: 700;
    cursor: pointer;
    
    img {
      width: 3rem;
      height: 3rem;
    }
  `,

  Content : css`
    width: 100%;
    height: auto;
  `,

  Form : css`
    width: 100%;
    height: fit-content;
  `,

  InfoArea : css`
    
  `,

  InfoItem : css`
    &:nth-of-type(2) {
      margin-top: 2rem;
      .title {
        margin-bottom: 1rem;
      }
    }
    
    .is-flex {
      ${StyleUtils.FlexUtils("center", "flex-start")};
      gap: 0.5rem;
      margin-bottom: 1rem;
      
      [ class ^= "material" ] {
        font-size: 1.7rem;
        cursor: default;
      }
    }
    
    .title {
      display: inline-block;
      font-size: 1.4rem;
      font-weight: 500;
    }
  `,

  LoginBtn : css`
    margin: 2rem 0;
    
    .v-btn {
      &.v-btn--density-default {
        width: 100%;
        height: 4rem;
        font-size: 1.6rem;
        font-weight: 700;
        color: var( --white-color );
        background: var( --system-green-color );  
      }
    }
  `,

  MenuList : css`
    ul {
      ${StyleUtils.FlexUtils("center", "flex-end")};
      gap: 1rem;
      
      li {
        font-size: 1.2rem;
        cursor: pointer;
        
        &:hover {
          color: var( --system-green-darken-color );
        }
      }
    }
  `,

  LoginTooltip : css`
    
  `,
}

/************************************************************
 * global style
 ************************************************************/
injectGlobal`
  ${LoginStyle.LoginTooltip};
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
