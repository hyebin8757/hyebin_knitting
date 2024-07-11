import {css} from "@emotion/css";

export const UiUtils = {
  // ellipsis ( line 1 )
  Ellipsis : ( maxWidth : string | number ) => {
    return css`
      display: inline-block;
      max-width: ${ maxWidth };
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `
  },

  // ellipsis ( multiline )
  MultilineEllipsis : ( line : string | number ) => {
    return css`
      display: -webkit-box;
      overflow: hidden;
      text-overflow: ellipsis;
      -webkit-line-clamp: ${ line };
      -webkit-box-orient: vertical;
    `;
  }
}