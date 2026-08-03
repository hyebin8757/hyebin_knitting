import { css } from "@emotion/css";
import {StyleUtils} from "~/styleUtils/styleUtils";

export const MypageStyle = {
  Default : css`
    padding: 2rem;
    color: var(--white-color);
    display: flex;
    flex-direction: column;
    gap: 2.4rem;

    @media (max-width: 360px) {
      padding: 1rem 0.8rem;
      gap: 1.6rem;
    }
  `,

  ProfileHeaderCard : css`
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 1.6rem;
    padding: 2.4rem;
    ${StyleUtils.FlexUtils("center", "center")};
    flex-direction: column;
    gap: 1.2rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);

    .avatar {
      width: 8rem;
      height: 8rem;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary-lighten-color-1) 0%, var(--primary-darken-color-1) 100%);
      ${StyleUtils.FlexUtils("center", "center")};
      font-size: 2.8rem;
      font-weight: 800;
      color: var(--white-color);
      box-shadow: 0 0 15px rgba(136, 197, 255, 0.4);
    }

    .name {
      font-size: 2rem;
      font-weight: 700;
      margin-top: 0.4rem;
    }

    .sub {
      font-size: 1.3rem;
      color: var(--text-color-3);
    }
  `,

  InfoListCard : css`
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 1.6rem;
    padding: 1.6rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.6rem;

    .info-row {
      ${StyleUtils.FlexUtils("center", "space-between")};
      padding-bottom: 1.2rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      
      &:last-of-type {
        border-bottom: none;
        padding-bottom: 0;
      }

      .label {
        font-size: 1.3rem;
        color: var(--text-color-3);
      }

      .value {
        font-size: 1.4rem;
        font-weight: 600;
      }

      &.editable {
        cursor: pointer;
        transition: all 0.2s ease;
        padding: 0.6rem 0.8rem;
        margin: -0.2rem -0.8rem;
        border-radius: 0.8rem;

        &:hover {
          background: rgba(136, 197, 255, 0.08);
        }

        .value-group {
          display: flex;
          align-items: center;
          gap: 0.6rem;

          .edit-badge {
            font-size: 1.1rem;
            color: #88c5ff;
            background: rgba(136, 197, 255, 0.15);
            border: 1px solid rgba(136, 197, 255, 0.3);
            border-radius: 0.5rem;
            padding: 0.15rem 0.6rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.2rem;
          }
        }
      }
    }
  `,

  ChangeCard : css`
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 1.6rem;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.6rem;

    .title {
      font-size: 1.6rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.8rem;
    }

    .warning-box {
      font-size: 1.2rem;
      color: var(--secondary-darken-color-2);
      display: flex;
      align-items: flex-start;
      gap: 0.8rem;
      background: rgba(255, 181, 38, 0.05);
      padding: 1.2rem;
      border-radius: 0.8rem;
      line-height: 1.5;
      
      i {
        font-size: 1.8rem;
        margin-top: 0.2rem;
      }
    }

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 1.2rem;

      .input-item {
        display: flex;
        flex-direction: column;
        gap: 0.6rem;

        label {
          font-size: 1.2rem;
          color: var(--text-color-3);
          font-weight: 600;
        }

        .v-input {
          background: rgba(255, 255, 255, 0.04) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          border-radius: 1rem !important;
          box-shadow: none !important;
          
          .v-field {
            background: transparent !important;
            box-shadow: none !important;
          }
          
          .v-field__overlay {
            display: none !important;
          }

          input {
            color: var(--white-color) !important;
            background: transparent !important;
          }
        }
      }
    }

    .change-btn {
      width: 100%;
      height: 4.8rem !important;
      border-radius: 1rem !important;
      font-size: 1.4rem !important;
      font-weight: 700 !important;
      color: var(--white-color) !important;
      background: linear-gradient(135deg, var(--primary-darken-color-1) 0%, #153c6c 100%) !important;
      box-shadow: 0 4px 10px rgba(35, 102, 180, 0.25);
      
      &:disabled {
        background: rgba(255, 255, 255, 0.05) !important;
        color: rgba(255, 255, 255, 0.3) !important;
        box-shadow: none;
        cursor: not-allowed;
      }
    }

    .completed-message {
      text-align: center;
      padding: 1.6rem;
      font-size: 1.4rem;
      color: var(--system-green-color);
      font-weight: 600;
      background: rgba(27, 197, 105, 0.05);
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.8rem;
    }
  `,

  LogoutArea : css`
    margin-top: auto;
    padding-top: 2rem;

    .logout-btn {
      width: 100%;
      height: 5.4rem !important;
      border-radius: 1.2rem !important;
      font-size: 1.6rem !important;
      font-weight: 700 !important;
      color: var(--white-color) !important;
      background: linear-gradient(135deg, rgba(225, 60, 60, 0.8) 0%, rgba(180, 30, 30, 0.8) 100%) !important;
      border: 1px solid rgba(225, 60, 60, 0.4) !important;
      box-shadow: 0 4px 15px rgba(225, 60, 60, 0.2);
      
      &:hover {
        opacity: 0.95;
      }
    }
  `,
}
