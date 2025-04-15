import { css, injectGlobal } from "@emotion/css";
import {StyleUtils} from "~/styleUtils/styleUtils";
import {_uiUtil} from "~/utils/core/ui/uiUtil";
import {CommonStyle} from "assets/style/CommonStyle";

const { setMedia } = _uiUtil();

/************************************************************
 * style data
 ************************************************************/

// ${StyleUtils.FlexUtils("center", "flex-start")};
/************************************************************
 * style
 ************************************************************/
export const AboutStyle = {
  Default : css`
    ${CommonStyle.DefaultPadding};
  `,

  Title : css`
    font-size: 4.8rem;
    color: #D4CAB2;
  `,

  Introduction : css`
    display: block;
    margin: 2rem 0;
    font-size: 1.8rem;
    font-weight: 500;
    color: #9CA6AD;
    
    b {
      color: #D4CAB2;
    }
  `,

  ConsoleBox : css`
    position: relative;
    width: 50%;
    padding: 1rem;
    border-radius: 1rem;
    font-size: 1.6rem;
    font-weight: 500;
    color: #2CBC8C;
    background: #14344b;
    
    span {
      display: block;
    }
    
    em {
      color: #E7D19F;
    }
  `,

  ConsoleBoxGuide : css`
    position: absolute;
    top: 1rem;
    right: 2.5rem;
    font-size: 1.4rem;
  `,

  ConsoleDataList : css`
    ${ CommonStyle.Scroll };
    height: fit-content;
    max-height: 22rem;
    margin-bottom: 2rem;
    overflow-y: auto;
    
    > span {
      + span {
        margin-top: 1.5rem;
      }
    }
    
    .v-btn {
      margin-left: 0.5rem;
      
      .material-icons {
        font-size: 2rem;
      }
      
      &:hover {
        color: var( --system-red-color );
      }
    }
  `,

  ConsoleInputBox : css`
    position: relative;
    
    .v-input {
      padding: 1rem 5rem 1rem 1rem;
    }
    
    .v-btn {
      position: absolute;
      top: 50%;
      right: 1rem;
      transform: translateY( -50% );
      width: 2.4rem;
      height: 2.4rem;
    }
  `,

  InfoBox : css`
    
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
