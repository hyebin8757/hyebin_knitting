import { css, cx } from "@emotion/css";
import {StyleUtils} from "~/styleUtils/styleUtils";
import {_uiUtil} from "~/utils/core/ui/uiUtil";

const { setMedia } = _uiUtil();

export const LoginStyle = {
  Default: css`
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #050d17; /* 모바일 외부 배경 */
  `,

  Container: css`
    width: 100%;
    max-width: 640px;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #081524; /* 모바일 내부 로그인 배경 */
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.6);
    position: relative;
    overflow: hidden;
    padding: 4rem 2rem;
  `,

  FormBg: css`
    display: none;
  `,

  FormCard: css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex: 1;
    width: 100%;
    padding: 2rem;
  `,

  Title: css`
    text-align: center;
    margin-bottom: 4rem;
    font-size: 2.6rem;
    font-weight: 800;
    color: var(--white-color);
    letter-spacing: -0.05rem;

    span {
      display: block;
      margin-top: 0.8rem;
      font-size: 1.4rem;
      color: var(--primary-lighten-color-1);
      font-weight: 500;
    }
  `,

  Content: css`
    width: 100%;
  `,

  Form: css`
    width: 100%;
  `,

  InfoArea: css`
    display: flex;
    flex-direction: column;
    gap: 2rem;
  `,

  InfoItem: css`
    .is-flex {
      ${StyleUtils.FlexUtils("center", "space-between")};
      margin-bottom: 0.8rem;

      em {
        font-style: normal;
        font-size: 1.1rem;
        color: var(--secondary-darken-color-2);
        opacity: 0.8;
      }
    }

    .title {
      font-size: 1.4rem;
      font-weight: 600;
      color: var(--white-color);
    }

    /* Vuetify text field customization for dark theme */
    .v-input {
      background: rgba(255, 255, 255, 0.05) !important;
      border: 1px solid rgba(255, 255, 255, 0.08) !important;
      border-radius: 1rem !important;
      
      input {
        color: var(--white-color) !important;
      }
    }
  `,

  LoginBtn: css`
    margin-top: 3.2rem;
    width: 100%;

    .v-btn {
      width: 100%;
      height: 5.4rem !important;
      border-radius: 1.2rem !important;
      font-size: 1.6rem !important;
      font-weight: 700 !important;
      color: var(--white-color) !important;
      background: linear-gradient(135deg, var(--primary-darken-color-1) 0%, #153c6c 100%) !important;
      box-shadow: 0 4px 12px rgba(35, 102, 180, 0.3);
      
      &:hover {
        opacity: 0.9;
      }
    }
  `,

  MenuList: css`
    margin-top: 2.4rem;
    
    ul {
      ${StyleUtils.FlexUtils("center", "center")};
      gap: 1.6rem;

      li {
        font-size: 1.2rem;
        color: var(--text-color-3);
        cursor: pointer;
        transition: color 0.2s ease;

        &:hover {
          color: var(--primary-lighten-color-1);
        }
      }
    }
  `,

  LoginTooltip: css``,
};