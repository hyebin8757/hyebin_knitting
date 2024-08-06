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
export const loginStyle = {
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

  FormCard : css`
    width: 100%;
    height: 100%;
    max-width: 50rem;
    max-height: 35rem;
    padding: 2rem;
    border-radius: 2rem;
    background: var( --white-color );
  `,

  Title : css`
    ${StyleUtils.FlexUtils("center", "center")};
    gap: 0.5rem;
    margin-bottom: 2rem;
    font-size: 3rem;
    font-weight: 700;
    
    img {
      width: 3rem;
      height: 3rem;
    }
  `,

  Content : css`
    
  `,

  Form : css`
    
  `,

  InfoArea : css`
    
  `,

  InfoItem : css`
    &:nth-of-type(2) {
      margin-top: 1rem;
    }
    
    .title {
      display: inline-block;
      margin-bottom: 1rem;
      font-size: 1.4rem;
      font-weight: 500;
    }
    
    .v-input {
      padding: 1rem;
      border: 1px solid var( --border-color-1 );
      border-radius: 1rem;
      
      * {
        padding: 0;
      }
      
      .v-field--variant-solo {
        box-shadow: none;
      }

      .v-input__append {
        align-items: center;
      }
      
      input {
        min-height: 2rem;
      }
    }
  `,

  LoginBtn : css`
    margin: 2rem 0;
    
    .v-btn {
      width: 100%;
      height: 4rem;
      font-size: 1.6rem;
      font-weight: 700;
      color: var( --white-color );
      background: var( --system-green-color );
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
