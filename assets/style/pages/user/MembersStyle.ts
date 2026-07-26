import { css } from "@emotion/css";
import {StyleUtils} from "~/styleUtils/styleUtils";

export const MembersStyle = {
  Default : css`
    padding: 2rem;
    color: var(--white-color);

    @media (max-width: 360px) {
      padding: 1.2rem;
    }
  `,

  Tabs : css`
    display: flex;
    overflow-x: auto;
    gap: 0.8rem;
    padding-bottom: 1.2rem;
    margin-bottom: 2rem;
    
    &::-webkit-scrollbar {
      height: 3px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 2px;
    }

    .tab-btn {
      padding: 0.8rem 1.6rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 1rem;
      font-size: 1.3rem;
      font-weight: 600;
      white-space: nowrap;
      cursor: pointer;
      color: var(--text-color-3);
      transition: all 0.2s ease;

      @media (max-width: 360px) {
        padding: 0.6rem 1.1rem;
        font-size: 1.15rem;
      }

      &:hover {
        background: rgba(255, 255, 255, 0.08);
        color: var(--white-color);
      }

      &.active {
        background: var(--primary-darken-color-1);
        border-color: var(--primary-lighten-color-1);
        color: var(--white-color);
      }
    }
  `,

  ListContainer : css`
    display: flex;
    flex-direction: column;
    gap: 1.2rem;

    .group-header {
      font-size: 1.6rem;
      font-weight: 700;
      margin-bottom: 0.4rem;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .info-text {
        font-size: 1.2rem;
        color: var(--text-color-3);
        font-weight: 400;
      }
    }

    .member-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 1.2rem;
      padding: 1.6rem;
      display: flex;
      justify-content: space-between;
      align-items: center;

      @media (max-width: 360px) {
        padding: 1.1rem;
      }

      .details {
        display: flex;
        align-items: center;
        gap: 1.2rem;

        @media (max-width: 360px) {
          gap: 0.8rem;
        }

        .role-badge {
          width: 4rem;
          height: 4rem;
          border-radius: 50%;
          ${StyleUtils.FlexUtils("center", "center")};
          font-size: 1.2rem;
          font-weight: 700;

          @media (max-width: 360px) {
            width: 3.4rem;
            height: 3.4rem;
            font-size: 1.05rem;
          }

          &.role-banjang {
            background: rgba(249, 149, 0, 0.15);
            color: var(--secondary-darken-color-1);
            border: 1px solid rgba(249, 149, 0, 0.3);
          }
          &.role-jwasang {
            background: rgba(255, 181, 38, 0.15);
            color: var(--secondary-darken-color-2);
            border: 1px solid rgba(255, 181, 38, 0.3);
          }
          &.role-jojang {
            background: rgba(136, 197, 255, 0.15);
            color: var(--primary-lighten-color-1);
            border: 1px solid rgba(136, 197, 255, 0.3);
          }
          &.role-member {
            background: rgba(255, 255, 255, 0.05);
            color: var(--text-color-3);
          }
        }

        .name-phone {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;

          .name {
            font-size: 1.5rem;
            font-weight: 700;
          }
          .phone {
            font-size: 1.3rem;
            color: var(--text-color-3);
          }
        }
      }

      .action-call {
        width: 3.6rem;
        height: 3.6rem;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        ${StyleUtils.FlexUtils("center", "center")};
        color: var(--primary-lighten-color-1);
        text-decoration: none;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--white-color);
        }
      }
    }
  `,
}
