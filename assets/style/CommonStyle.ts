import { css, cx, injectGlobal } from "@emotion/css";
import {StyleUtils} from "~/styleUtils/styleUtils";
import {_uiUtil} from "~/utils/core/ui/uiUtil";
import { ColorStyle } from "assets/style/vars/_ColorStyle";
import {ResetStyle} from "~/assets/style/base/_Reset";

const { setMedia } = _uiUtil();

/************************************************************
 * style data
 ************************************************************/

/************************************************************
 * style
 ************************************************************/
export const CommonStyle = {
  Default : css`
    html,
    body,
    #__nuxt,
    #__layout,
    .wrapper,
    main,
    #__layout > div {
      width: 100%;
      height: 100%;
    }

    .v-application__wrap {
      min-height: 100%;
      max-height: 100%;
    }

    html {
      font-size: 10px;
      // 새로고침 시 세로 스크롤 없을 때 좌, 우로 움직이는 현상 때문에 추가함
      overflow-y: scroll;
    }

    .main-container {
      height: 100%;
    }

    .inner-container {
      padding: 2rem 4rem;
    }

    .content {
      &-body {

        .view,
        .list {
          padding: 2.8rem 4rem;
          border-radius: 2rem;
          box-shadow: 0 1px 13px rgba( 0, 0, 0, 0.04 );
          background-color: var( --white-color );

          +.view,
          +.list {
            margin-top: 4rem;
          }
        }
      }
    }

    /*=== no-data ===*/
    div.no-data {
      ${StyleUtils.FlexUtils("center","center")};
      width: 100%;
      font-size: 1.8rem;

      .material-icons {
        margin-right: 0.4rem;
        color: var( --primary-lighten-color-1 );
      }

      p {
        font-size: 1.8rem;
      }
    }

    // title
    .title-item {
      // tit
      &--tit {
        font-size: 2.5rem;
        font-weight: 700;
      }
    }

    /* v-btn */
    .v-btn {
      letter-spacing: 0;
    }

    /* v-chip */
    .v-chip {
      ${StyleUtils.FlexUtils("center","center")};
    }

    .blind {
      position: absolute;
      overflow: hidden;
      clip: rect(0 0 0 0);
      margin: -1px;
      width: 1px;
      height: 1px;
    }
  `,

  Pagination : css`
    .pagination {
      .v-btn {
        --v-btn-height: initial !important;
      }
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
  CoreCommon  : CommonStyle.Default,
  Reset       : ResetStyle.Default,
  Color       : ColorStyle.Default,
  Pagination  : CommonStyle.Pagination,
}

injectGlobal`
  ${cx(
    GlobalStyle.CoreCommon,
    GlobalStyle.Reset,
    GlobalStyle.Color,
    GlobalStyle.Pagination,
  )}
`;


/************************************************************
 * style override
 ************************************************************/