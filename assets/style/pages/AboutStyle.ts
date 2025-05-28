import { css, cx, injectGlobal } from "@emotion/css";
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

  Introduction : css`
    display: block;
    font-size: 1.8rem;
    font-weight: 500;
    color: #9CA6AD;
    
    b {
      color: #D4CAB2;
    }
  `,

  ConsoleBox : css`
    position: relative;
    width: 70%;
    margin-top: 2rem;
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

  ConsoleResetButton : css`
    &.v-btn--variant-text {
      position: absolute;
      top: -3.5rem;
      right: 0;
      height: 3.2rem !important;
      font-size: 1.4rem;
      font-weight: 500;
      padding: 0 1rem;
      border: 1px solid var( --system-red-color );
      color: var( --system-red-color );
      background: var( --white-color );
      
      &:hover {
        color: var( --white-color );
        background: rgba( 255, 60, 60, 0.7 );
      }
    }
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
      
      .mdi-close-circle {
        width: 2rem;
        height: 2rem;
      }
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
    margin-top: 2rem;
    
    div {
      + div {
        margin-top: 1.5rem;
      }
    }
  `,

  ExperienceBox : css`
    ul {
      li {
        + li {
          margin-top: 1rem;
        }
      }
    }
    
    > div {
      > b {
        display: inline-block;
        margin-bottom: 1.5rem;
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
      .console-box {
        width: 100%;
      }
    `,

    /** [ 1024px ] */
    1024 : css`
      .console-box {
        .is-mobile-btn {
          &.v-btn--variant-text {
            top: -3.5rem;
            border: 0 none;
            background: transparent !important;
            
            .v-btn__content {
              display: flex;
              align-items: center;
              justify-content: flex-start;
              gap: 0.5rem;
              
              .material-icons {
                font-size: 1.8rem;
              }
            }
          }
        }
      }
    `,

    /** [ 768px ] */
    768 : css`
      
    `,

    /** [ 640px ] */
    640 : css`
      .console-box {
        .console-box-guide {
          display: none;
        }
      }
    `,

    /** [ 450px ] */
    450 : css `
    `
  },
}

/************************************************************
 * style override
 ************************************************************/
AboutStyle.Default = cx(
  AboutStyle.Default,
  // option ( max | min )
  setMedia( MediaStyle.Media,  "max" )
);