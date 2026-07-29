import { css, cx } from "@emotion/css";
import {StyleUtils} from "~/styleUtils/styleUtils";
import {_uiUtil} from "~/utils/core/ui/uiUtil";

const { setMedia } = _uiUtil();

export const AttendanceStyle = {
  Default : css`
    padding: 2rem;
    color: var(--white-color);

    @media (max-width: 360px) {
      padding: 1rem 0.8rem;
    }
  `,

  ProfileCard : css`
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 1.6rem;
    padding: 1.4rem;
    margin-bottom: 1.4rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;

    @media (max-width: 360px) {
      padding: 1rem;
      border-radius: 1.2rem;
    }

    .profile-info {
      display: flex;
      align-items: center;
      gap: 1.2rem;

      .avatar {
        width: 4.8rem;
        height: 4.8rem;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--primary-lighten-color-1), var(--primary-darken-color-1));
        ${StyleUtils.FlexUtils("center", "center")};
        font-size: 1.8rem;
        font-weight: 700;
        color: var(--white-color);

        @media (max-width: 360px) {
          width: 4rem;
          height: 4rem;
          font-size: 1.5rem;
        }
      }

      .meta {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;

        .name {
          font-size: 1.6rem;
          font-weight: 700;

          @media (max-width: 360px) {
            font-size: 1.4rem;
          }
        }

        .dates {
          font-size: 1.15rem;
          color: var(--text-color-3);
          display: flex;
          gap: 0.8rem;

          @media (max-width: 360px) {
            font-size: 1rem;
            gap: 0.4rem;
            flex-wrap: wrap;
          }
        }
      }
    }

    .stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      padding-top: 0;

      .stat-item {
        ${StyleUtils.FlexUtils("center", "center")};
        flex-direction: column;
        gap: 0.4rem;
        background: rgba(255, 255, 255, 0.02);
        padding: 0.8rem;
        border-radius: 0.8rem;

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

    @media (max-width: 360px) {
      padding: 1rem 0.6rem;
      border-radius: 1.2rem;
      margin-bottom: 1.6rem;
    }

    .cal-header {
      ${StyleUtils.FlexUtils("center", "space-between")};
      margin-bottom: 2rem;

      .cal-title {
        font-size: 1.8rem;
        font-weight: 700;

        @media (max-width: 360px) {
          font-size: 1.45rem;
        }
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

          @media (max-width: 360px) {
            width: 3rem;
            height: 3rem;
          }
          
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

      @media (max-width: 360px) {
        font-size: 1rem;
      }
    }

    .cal-days {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 0.8rem;
      text-align: center;

      @media (max-width: 360px) {
        gap: 0.25rem;
      }

      .day {
        aspect-ratio: 1;
        ${StyleUtils.FlexUtils("center", "center")};
        font-size: 1.4rem;
        font-weight: 500;
        border-radius: 50%;
        position: relative;
        cursor: pointer;

        @media (max-width: 360px) {
          font-size: 1.15rem;
        }

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

      @media (max-width: 360px) {
        gap: 0.2rem;
      }

      .legend-item {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 1.1rem;
        color: var(--text-color-3);

        @media (max-width: 360px) {
          font-size: 0.95rem;
          gap: 0.2rem;
        }

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
      color: #ff4d4d !important;
      background: rgba(255, 77, 77, 0.15) !important;
      border: 1px solid rgba(255, 77, 77, 0.3) !important;
      
      &:hover {
        background: rgba(255, 77, 77, 0.25) !important;
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
