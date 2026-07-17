import { css } from "@emotion/css";
import {StyleUtils} from "~/styleUtils/styleUtils";

export const WorkStyle = {
  Default : css`
    padding: 2rem;
    color: var(--white-color);
    display: flex;
    flex-direction: column;
    gap: 2.4rem;
  `,

  WeatherCard : css`
    background: linear-gradient(135deg, #1d3557 0%, #457b9d 100%);
    border-radius: 1.6rem;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.6rem;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);

    .header-weather {
      ${StyleUtils.FlexUtils("center", "space-between")};
      .title {
        font-size: 1.6rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 0.8rem;
      }
      .time {
        font-size: 1.2rem;
        opacity: 0.8;
      }
    }

    .weather-info {
      display: flex;
      justify-content: space-around;
      align-items: center;

      .temp-box {
        text-align: center;
        .temp {
          font-size: 3.2rem;
          font-weight: 800;
        }
        .desc {
          font-size: 1.3rem;
          font-weight: 500;
        }
      }

      .detail-box {
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
        font-size: 1.3rem;
        
        div {
          display: flex;
          justify-content: space-between;
          gap: 1.6rem;
          span:first-of-type {
            opacity: 0.7;
          }
          span:last-of-type {
            font-weight: 600;
          }
        }
      }
    }
  `,

  WorkDetailsCard : css`
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 1.6rem;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.6rem;

    .section-header {
      ${StyleUtils.FlexUtils("center", "space-between")};
      cursor: pointer;
      user-select: none;
      
      .title {
        font-size: 1.6rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 0.8rem;
      }
      
      .arrow-icon {
        font-size: 2rem;
        color: var(--text-color-3);
        transition: transform 0.3s ease;
        
        &.rotated {
          transform: rotate(180deg);
        }
      }
    }

    .work-item-list {
      display: flex;
      flex-direction: column;
      gap: 1.6rem;
      transition: all 0.3s ease;
    }

    .work-item {
      background: rgba(255, 255, 255, 0.02);
      border-radius: 1.2rem;
      padding: 1.6rem;
      border-left: 4px solid var(--primary-lighten-color-1);
      display: flex;
      flex-direction: column;
      gap: 0.8rem;

      .work-header {
        ${StyleUtils.FlexUtils("center", "space-between")};
        .loc {
          font-size: 1.5rem;
          font-weight: 700;
        }
        .badge {
          font-size: 1.1rem;
          background: rgba(27, 197, 105, 0.15);
          color: var(--system-green-color);
          padding: 0.2rem 0.6rem;
          border-radius: 0.4rem;
          font-weight: 600;
        }
      }

      .desc {
        font-size: 1.3rem;
        color: var(--text-color-3);
        line-height: 1.4;
      }

      .safety-rules {
        font-size: 1.2rem;
        color: var(--secondary-darken-color-2);
        display: flex;
        align-items: center;
        gap: 0.6rem;
        background: rgba(255, 181, 38, 0.05);
        padding: 0.8rem 1.2rem;
        border-radius: 0.8rem;
        font-weight: 500;
      }
    }
  `,

  NoticesCard : css`
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 1.6rem;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.6rem;

    .section-header {
      ${StyleUtils.FlexUtils("center", "space-between")};
      cursor: pointer;
      user-select: none;
      
      .title {
        font-size: 1.6rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 0.8rem;
      }
      
      .arrow-icon {
        font-size: 2rem;
        color: var(--text-color-3);
        transition: transform 0.3s ease;
        
        &.rotated {
          transform: rotate(180deg);
        }
      }
    }

    .notice-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .notice-item {
        ${StyleUtils.FlexUtils("center", "space-between")};
        background: rgba(255, 255, 255, 0.02);
        padding: 1.4rem;
        border-radius: 1rem;
        cursor: pointer;
        transition: background 0.2s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.06);
        }

        .nt-title {
          font-size: 1.4rem;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 75%;
        }

        .nt-date {
          font-size: 1.2rem;
          color: var(--text-color-3);
        }
      }
    }
  `,
}
