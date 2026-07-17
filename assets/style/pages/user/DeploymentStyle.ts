import { css } from "@emotion/css";
import {StyleUtils} from "~/styleUtils/styleUtils";
import {_uiUtil} from "~/utils/core/ui/uiUtil";

export const DeploymentStyle = {
  Default : css`
    padding: 2rem;
    color: var(--white-color);
  `,

  DashboardSummary : css`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.2rem;
    margin-bottom: 2.4rem;

    .summary-card {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 1.2rem;
      padding: 1.4rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;

      .label {
        font-size: 1.1rem;
        color: var(--text-color-3);
      }

      .value {
        font-size: 1.8rem;
        font-weight: 700;
        color: var(--primary-lighten-color-1);
      }
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
      padding: 1rem 1.6rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 2rem;
      font-size: 1.3rem;
      font-weight: 600;
      white-space: nowrap;
      cursor: pointer;
      color: var(--text-color-3);
      transition: all 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.08);
        color: var(--white-color);
      }

      &.active {
        background: var(--primary-darken-color-1);
        border-color: var(--primary-lighten-color-1);
        color: var(--white-color);
        box-shadow: 0 4px 10px rgba(35, 102, 180, 0.2);
      }
    }
  `,

  ListContainer : css`
    display: flex;
    flex-direction: column;
    gap: 1.2rem;

    .list-header {
      font-size: 1.6rem;
      font-weight: 700;
      margin-bottom: 0.4rem;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .count {
        font-size: 1.3rem;
        color: var(--primary-lighten-color-1);
        font-weight: 500;
      }
    }

    .member-item {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 1.2rem;
      padding: 1.4rem 1.8rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: background 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.06);
      }

      .info {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;

        .name-wrapper {
          display: flex;
          align-items: center;
          gap: 0.8rem;

          .name {
            font-size: 1.5rem;
            font-weight: 700;
          }

          .badge {
            font-size: 1rem;
            padding: 0.2rem 0.6rem;
            border-radius: 0.4rem;
            font-weight: 600;

            &.leader {
              background: rgba(249, 149, 0, 0.15);
              color: var(--secondary-darken-color-1);
            }
            &.sub-leader {
              background: rgba(255, 181, 38, 0.15);
              color: var(--secondary-darken-color-2);
            }
            &.member {
              background: rgba(136, 197, 255, 0.1);
              color: var(--primary-lighten-color-1);
            }
          }
        }

        .phone {
          font-size: 1.2rem;
          color: var(--text-color-3);
        }
      }

      .status-tag {
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--system-green-color);
        background: rgba(27, 197, 105, 0.1);
        padding: 0.4rem 0.8rem;
        border-radius: 0.6rem;
      }
    }
  `,
}
