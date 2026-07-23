import { css, cx, injectGlobal } from "@emotion/css";
import {StyleUtils} from "~/styleUtils/styleUtils";
import {_uiUtil} from "@/utils/core/ui/uiUtil";

const { setMedia } = _uiUtil();

/************************************************************
 * style data
 ************************************************************/

/************************************************************
 * style
 ************************************************************/
export const UserLayoutStyle = {
  Default : css`
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    background-color: #050d17; /* 모바일 외부 배경 (데스크톱 대응용 어두운 테두리 배경) */
  `,

  Container : css`
    width: 100%;
    max-width: 640px;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: var(--primary-color); /* #0c2034 */
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.6);
    position: relative;
    overflow: hidden;
  `,

  Header : css`
    ${StyleUtils.FlexUtils("center", "space-between")};
    padding: 1.6rem 2rem;
    background: rgba(12, 32, 52, 0.85);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    z-index: 10;
    height: 6rem;

    .header-logo {
      font-size: 1.8rem;
      font-weight: 800;
      color: var(--white-color);
      letter-spacing: -0.05rem;
      display: flex;
      align-items: center;
      gap: 0.8rem;

      .logo-badge {
        font-size: 1rem;
        background: var(--primary-darken-color-1);
        padding: 0.2rem 0.6rem;
        border-radius: 0.4rem;
        font-weight: 600;
        color: var(--white-color);
      }
    }

    .header-user {
      ${StyleUtils.FlexUtils("center", "flex-end")};
      gap: 0.6rem;
      font-size: 1.3rem;
      color: var(--text-color-3);

      strong {
        color: var(--white-color);
        font-weight: 600;
      }
    }
  `,

  Main : css`
    flex: 1;
    overflow-y: auto;
    background-color: #081524; /* 모바일 컨텐츠 영역 배경 */
    padding-bottom: 5.6rem; /* Bottom Navigation 높이 확보 */
    
    &::-webkit-scrollbar {
      width: 4px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }
  `,

  BottomNav : css`
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 5.2rem;
    background: rgba(12, 32, 52, 0.95);
    backdrop-filter: blur(15px);
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    z-index: 10;

    .nav-item {
      ${StyleUtils.FlexUtils("center", "center")};
      flex-direction: column;
      gap: 0.3rem;
      color: var(--text-color-3);
      text-decoration: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      cursor: pointer;

      i {
        font-size: 1.8rem;
        transition: transform 0.3s ease;
      }

      span {
        font-size: 1rem;
        font-weight: 500;
      }

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 3px;
        background: var(--primary-lighten-color-1);
        border-radius: 3px 3px 0 0;
        transition: width 0.3s ease;
      }

      &:hover {
        color: var(--primary-lighten-color-1);
        i {
          transform: translateY(-2px);
        }
      }

      &.router-link-active {
        color: var(--primary-lighten-color-1);
        
        i {
          transform: translateY(-2px) scale(1.1);
          color: var(--primary-lighten-color-1);
        }

        span {
          font-weight: 700;
          color: var(--white-color);
        }

        &::after {
          width: 40px;
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
    /** [ 640px ] */
    640 : css`
    `,
  },
}

/************************************************************
 * style override
 ************************************************************/
UserLayoutStyle.Default = cx(
  UserLayoutStyle.Default,
  setMedia( MediaStyle.Media, "max" )
);
