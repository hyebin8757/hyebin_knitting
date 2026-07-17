import { css, cx } from "@emotion/css";
import {StyleUtils} from "~/styleUtils/styleUtils";
import {_uiUtil} from "~/utils/core/ui/uiUtil";

const { setMedia } = _uiUtil();

export const AttendanceStyle = {
  Default : css`
    padding: 2rem;
    color: var(--white-color);
  `,

  ProfileCard : css`
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 1.6rem;
    padding: 2rem;
    margin-bottom: 2.4rem;
    display: flex;
    flex-direction: column;
    gap: 1.6rem;

    .profile-info {
      display: flex;
      align-items: center;
      gap: 1.6rem;

      .avatar {
        width: 5.6rem;
        height: 5.6rem;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--primary-lighten-color-1), var(--primary-darken-color-1));
        ${StyleUtils.FlexUtils("center", "center")};
        font-size: 2rem;
        font-weight: 700;
        color: var(--white-color);
      }

      .meta {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;

        .name {
          font-size: 1.8rem;
          font-weight: 700;
        }

        .dates {
          font-size: 1.2rem;
          color: var(--text-color-3);
          display: flex;
          gap: 1rem;
        }
      }
    }

    .stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.2rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 1.6rem;

      .stat-item {
        ${StyleUtils.FlexUtils("center", "center")};
        flex-direction: column;
        gap: 0.6rem;
        background: rgba(255, 255, 255, 0.02);
        padding: 1.2rem;
        border-radius: 1rem;

        .label {
          font-size: 1.2rem;
          color: var(--text-color-3);
        }

        .value {
          font-size: 2rem;
          font-weight: 700;
          
          &.work {
            color: var(--system-green-color);
          }
          &.miss {
            color: var(--system-red-color);
          }
        }
      }
    }
  `,

  CalendarContainer : css`
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 1.6rem;
    padding: 2rem;
    margin-bottom: 2.4rem;

    .cal-header {
      ${StyleUtils.FlexUtils("center", "space-between")};
      margin-bottom: 2rem;

      .cal-title {
        font-size: 1.8rem;
        font-weight: 700;
      }

      .cal-nav {
        display: flex;
        gap: 0.8rem;
        
        button {
          width: 3.6rem;
          height: 3.6rem;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          ${StyleUtils.FlexUtils("center", "center")};
          cursor: pointer;
          color: var(--white-color);
          border: none;
          
          &:hover {
            background: rgba(255, 255, 255, 0.1);
          }
        }
      }
    }

    .cal-weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      text-align: center;
      font-size: 1.2rem;
      font-weight: 600;
      color: var(--text-color-3);
      margin-bottom: 1.2rem;
    }

    .cal-days {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 0.8rem;
      text-align: center;

      .day {
        aspect-ratio: 1;
        ${StyleUtils.FlexUtils("center", "center")};
        font-size: 1.4rem;
        font-weight: 500;
        border-radius: 50%;
        position: relative;
        cursor: pointer;

        &.other-month {
          color: rgba(255, 255, 255, 0.15);
        }

        &.today {
          border: 1px solid var(--primary-lighten-color-1);
        }

        &.status-day {
          background: rgba(27, 197, 105, 0.15);
          color: var(--system-green-color);
          font-weight: 700;
        }

        &.status-night {
          background: rgba(70, 78, 232, 0.15);
          color: var(--primary-lighten-color-1);
          font-weight: 700;
        }

        &.status-field {
          background: rgba(243, 190, 79, 0.15);
          color: var(--system-yellow-color);
          font-weight: 700;
        }

        &.status-absent {
          background: rgba(225, 60, 60, 0.15);
          color: var(--system-red-color);
          font-weight: 700;
        }

        &.status-leave {
          background: rgba(155, 93, 229, 0.15);
          color: #b5179e;
          font-weight: 700;
        }
      }
    }

    .cal-legend {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      justify-items: center;
      gap: 0.6rem;
      margin-top: 1.6rem;
      padding-top: 1.6rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);

      .legend-item {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 1.1rem;
        color: var(--text-color-3);

        .dot {
          width: 0.8rem;
          height: 0.8rem;
          border-radius: 50%;

          &.day { background: var(--system-green-color); }
          &.night { background: var(--primary-lighten-color-1); }
          &.field { background: var(--system-yellow-color); }
          &.absent { background: var(--system-red-color); }
          &.leave { background: #b5179e; }
        }
      }
    }
  `,

  ActionArea : css`
    display: flex;
    flex-direction: column;
    gap: 1rem;

    .check-btn {
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

      &:disabled, &.v-btn--disabled {
        background: rgba(255, 255, 255, 0.05) !important;
        color: rgba(255, 255, 255, 0.3) !important;
        box-shadow: none !important;
        cursor: not-allowed;
      }
    }

    .cancel-btn {
      width: 100%;
      height: 5.4rem !important;
      border-radius: 1.2rem !important;
      font-size: 1.6rem !important;
      font-weight: 700 !important;
      color: var(--text-color-1) !important;
      background: rgba(255, 255, 255, 0.1) !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
      
      &:hover {
        background: rgba(255, 255, 255, 0.15) !important;
      }
    }

    .leave-btn {
      width: 100%;
      height: 5.4rem !important;
      border-radius: 1.2rem !important;
      font-size: 1.6rem !important;
      font-weight: 700 !important;
      color: var(--white-color) !important;
      background: linear-gradient(135deg, #e05780 0%, #b5179e 100%) !important;
      box-shadow: 0 4px 12px rgba(181, 23, 158, 0.3);
      
      &:hover {
        opacity: 0.9;
      }
    }
  `,
}
