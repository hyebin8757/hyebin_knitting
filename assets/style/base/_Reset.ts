import { css, cx, injectGlobal } from "@emotion/css";

/************************************************************
 * style data
 ************************************************************/

/************************************************************
 * style
 ************************************************************/
export const ResetStyle = {
  Default : css`
    body,
    div,
    dl,
    dt,
    dd,
    ul,
    ol,
    li,
    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    pre,
    code,
    form,
    fieldset,
    legend,
    textarea,
    p,
    blockquote,
    th,
    td,
    input,
    select,
    textarea,
    figure,
    button {
      margin: 0;
      padding: 0;
    }

    html,
    body {
      -ms-overflow-style: scrollbar !important;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    html {
      font-family: "Pretendard", "Noto Sans KR", "Noto Sans Korean", -apple-system, "system-ui",  Arial, sans-serif;

      &[android=true] {
        font-family: roboto, -apple-system, "system-ui", "Malgun Gothic",  sans-serif;
        body,
        th,
        td,
        input,
        select,
        textarea,
        button {
          font-family: roboto, -apple-system, "system-ui", "Malgun Gothic",  sans-serif;
        }
      }

      &[ios=true] {
        font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Apple SD Gothic Neo", system-ui,  sans-serif;

        body,
        th,
        td,
        input,
        select,
        textarea,
        button {
          font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Apple SD Gothic Neo", system-ui,  sans-serif;
        }
      }
    }
    
    body,
    th,
    td,
    input,
    select,
    textarea,
    button {
      line-height: 1.5;
      font-family: "Pretendard", "Noto Sans KR", "Noto Sans Korean", -apple-system, "system-ui",  Arial, sans-serif;
      font-size: 11.5px;
      font-weight: 400;
    }

    // 세리프 제거
    input,textarea {
      font-family: "Pretendard", "Noto Sans KR", "Noto Sans Korean", -apple-system, "system-ui",  Arial, sans-serif;
    }

    fieldset,
    img {
      display: block;
      border: 0 none;
    }

    dl,
    ul,
    ol,
    menu,
    li {
      list-style: none;
    }

    blockquote,
    q {
      quotes: none;
    }

    blockquote:before,
    blockquote:after,
    q:before,
    q:after {
      content: none;
    }

    input,
    select,
    textarea,
    button {
      vertical-align: middle;
    }

    button {
      border: 0 none;
      background-color: transparent;
      cursor: pointer;
    }

    button {
      line-height: 1;
    }

    a {
      color: inherit;
      cursor: pointer;
      outline: none;
      text-decoration: none;
    }

    a:focus {
      color: inherit;
      outline: none;
      text-decoration: none;
    }

    address,
    caption,
    cite,
    code,
    dfn,
    em,
    var {
      font-style: normal;
      font-weight: normal;
    }

    label {
      font-weight: 400;
    }

    /* Form Reset  */

    input::-ms-clear,
    input::-ms-reveal {
      display: none;
    }

    ::-webkit-input-placeholder {
      color: #808080;
    }

    ::-moz-placeholder {
      color: #808080;
    }

    :-ms-input-placeholder {
      color: #808080;
    }

    .placeholder {
      color: #808080;
    }

    input:-webkit-autofill {
      -webkit-box-shadow: 0 0 0 1000px white inset;
    }

    select::-ms-expand {
      display: none;
    }

    caption {
      display: none;
      padding: 0;
      font-size: 0;
      visibility: hidden;
    }

    * {
      box-sizing: border-box !important;
    }

    .ml-auto {
      margin-left: auto !important;
    }
    .mr-auto {
      margin-right: auto !important;
    }

    .v-application.v-layout {
      color: var( --text-color-1 );
    }

  `,
}

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
 * global style
 ************************************************************/
const GlobalStyle = {

}

injectGlobal`
  ${cx(
    
  )}
`;


/************************************************************
 * style override
 ************************************************************/