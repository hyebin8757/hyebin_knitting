import { css, injectGlobal } from "@emotion/css";
import {_uiUtil} from "~/utils/core/ui/uiUtil";
import {StyleUtils} from "~/styleUtils/styleUtils";
import {CommonStyle} from "assets/style/CommonStyle";

const { setMedia } = _uiUtil();

/************************************************************
 * style data
 ************************************************************/


/************************************************************
 * style
 ************************************************************/
export const ContactStyle = {
  Default : css`
    ${StyleUtils.FlexUtils("center", "flex-start")};
    ${CommonStyle.DefaultPadding};
    gap: 8rem;
    width: 100%;
  `,

  Content : css`
    position: relative;
    width: 100%;
  `,

  Emphasis : css`
    position: relative;
    font-size: 4rem;
    color: var( --white-color );
    
    span {
      &:nth-of-type(1) {
        margin-right: 20rem;
      }
    }
    
    em {
      text-transform: uppercase;
      transform: translate(-50%, -50%) skew(10deg) rotate(-10deg);
      top: 50%;
      left: 11rem;
      margin: 0;
      position: absolute;
      text-rendering: optimizeLegibility;
      font-weight: 900;
      color: #ff9eb1;
      white-space: nowrap;

      &:before {
        content: attr(data-heading);
        position: absolute;
        left: 5px;
        top: -4px;
        overflow: hidden;
        width: 100%;
        height: 50%;
        color: #fbf7f4;
        transform: translate( 0, 0) skew(-13deg) scale(1, 1.2);
        z-index: 2;
        text-shadow: 2px -1px 6px rgba(0, 0, 0, 0.2);
      }

      &:after {
        content: attr(data-heading);
        position: absolute;
        left: 1px;
        top: -1px;
        overflow: hidden;
        width: 100%;
        height: 100%;
        z-index: 1;
        color: #d3cfcc;
        transform: translate(0, 0) skew(13deg) scale(1, 0.8);
        clip-path: polygon(0 50%, 100% 50%, 100% 100%, 0% 100%);
        text-shadow: 2px -1px 6px rgba(0, 0, 0, 0.3);
      }
    }
  `,

  ListArea : css`
    padding: 1rem 4rem;
    
    li {
      + li {
        margin-top: 2rem;
      }
    }
  `,

  ListItem : css`
    font-size: 1.8rem;
    color: var( --white-color );
    
    span {
      display: inline-block;
    }

    .title {
      width: 7rem;
    }
    
    .colon {
      margin-right: 1rem;
    }
    
    .text {
      color: var( --primary-lighten-color-1 );
      
      &:hover {
        text-decoration: underline;
      }
      
      a[ref="email"] {
        span {
          &.is-active {
            color: var( --secondary-lighten-color-1 );
            transition: color 0.5s;
          }
        }
      }
    }
  `,

  Video : css`
    position: absolute;
    top: -9rem;
    left: 45rem;
    width: 50rem;
    height: 50rem;
    
    video {
      width: 100%;
      height: 100%;
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
const ContactMediaStyle = {
  ContactMedia : {
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
