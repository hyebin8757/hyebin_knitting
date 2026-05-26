import { css, injectGlobal, cx } from "@emotion/css";
import { StyleUtils } from "~/styleUtils/styleUtils";
import { _uiUtil } from "~/utils/core/ui/uiUtil";
import { CommonStyle } from "~/assets/style/CommonStyle";

const { setMedia } = _uiUtil();

export const MainNoticeDialogStyle = {
  Default: css`
    &.v-dialog {
      .v-overlay__content {
        max-width: 580px !important;
        width: calc(100% - 32px) !important;
        margin: 16px auto;
        
        > .v-card {
          position: relative;
          background: rgba(8, 18, 33, 0.8) !important;
          backdrop-filter: blur(20px) !important;
          -webkit-backdrop-filter: blur(20px) !important;
          border: 1px solid rgba(0, 242, 254, 0.25) !important;
          border-radius: 24px !important;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 
                      0 0 20px rgba(0, 242, 254, 0.15) !important;
          overflow: hidden;
          color: #ffffff !important;
          
          /* flex 레이아웃으로 변경 및 높이 제한 */
          display: flex !important;
          flex-direction: column !important;
          max-height: calc(100vh - 48px) !important;

          // 헤더 스타일링
          .v-card-item {
            padding: 2.4rem 2.8rem 1.6rem !important;
            background: transparent !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
            flex-shrink: 0 !important;

            .v-card-title {
              ${StyleUtils.FlexUtils("center", "space-between")};
              font-size: 2.2rem;
              font-weight: 800;
              letter-spacing: -0.05em;
              background: linear-gradient(135deg, #00f2fe, #4facfe);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              text-shadow: 0 0 30px rgba(0, 242, 254, 0.2);
            }

            .v-btn {
              color: rgba(255, 255, 255, 0.6) !important;
              transition: all 0.3s ease;
              
              &:hover {
                color: #00f2fe !important;
                transform: rotate(90deg);
              }
              
              .material-icons {
                font-size: 2.4rem;
              }
            }
          }

          // 콘텐츠 영역 스타일링
          > .v-card-text {
            padding: 3.2rem 2.8rem !important;
            font-size: 1.6rem;
            line-height: 1.7;
            color: rgba(255, 255, 255, 0.85);
            
            /* 본문에만 유연하게 줄어들도록 설정 및 내부 스크롤 허용 */
            flex: 1 !important;
            overflow-y: auto !important;
            ${CommonStyle.Scroll};
          }

          // 액션 버튼 영역 스타일링
          .v-card-actions {
            padding: 1.6rem 2.8rem 2.4rem !important;
            background: transparent !important;
            border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
            gap: 1.2rem;
            flex-shrink: 0 !important;

            .v-spacer {
              display: none; // 스페이서 대신 양옆 배치나 플렉스 활용
            }
          }
        }
      }
    }

    // 모바일/태블릿용 고대비 및 타이트한 패딩 반응형 스타일
    @media (max-width: 640px) {
      &.v-dialog {
        .v-overlay__content {
          margin: 12px auto;
          width: calc(100% - 24px) !important;

          > .v-card {
            border-radius: 16px !important;
            max-height: calc(100vh - 24px) !important;

            .v-card-item {
              padding: 1.6rem 2rem 1.2rem !important;
              
              .v-card-title {
                font-size: 1.8rem;
              }
              .v-btn .material-icons {
                font-size: 2rem;
              }
            }

            > .v-card-text {
              padding: 2rem 2rem !important;
            }

            .v-card-actions {
              padding: 1.2rem 2rem 1.6rem !important;
            }
          }
        }
      }
    }

    // 라이트 모드 오버라이드
    html[dark-mode="true"] & {
      &.v-dialog {
        .v-overlay__content {
          > .v-card {
            background: rgba(255, 255, 255, 0.85) !important;
            border: 1px solid rgba(79, 70, 229, 0.15) !important;
            box-shadow: 0 20px 50px rgba(79, 70, 229, 0.08), 
                        0 0 20px rgba(79, 70, 229, 0.05) !important;
            color: #1e293b !important;

            .v-card-item {
              border-bottom: 1px solid rgba(79, 70, 229, 0.1) !important;

              .v-card-title {
                background: linear-gradient(135deg, #4f46e5, #7c3aed);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                text-shadow: 0 0 30px rgba(79, 70, 229, 0.1);
              }

              .v-btn {
                color: #475569 !important;
                
                &:hover {
                  color: #4f46e5 !important;
                }
              }
            }

            > .v-card-text {
              color: #334155;
            }

            .v-card-actions {
              border-top: 1px solid rgba(79, 70, 229, 0.1) !important;
            }
          }
        }
      }
    }
  `,

  PopupContent: css`
    text-align: center;
    
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 0.6rem 1.6rem;
      background: linear-gradient(135deg, rgba(0, 242, 254, 0.15), rgba(79, 172, 254, 0.15));
      border: 1px solid rgba(0, 242, 254, 0.3);
      border-radius: 50px;
      color: #00f2fe;
      font-size: 1.3rem;
      font-weight: 700;
      margin-bottom: 2rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      box-shadow: 0 0 15px rgba(0, 242, 254, 0.1);
    }

    .main-title {
      font-size: 2.6rem;
      font-weight: 800;
      line-height: 1.4;
      margin-bottom: 1.6rem;
      color: #ffffff;
      word-break: keep-all;

      span {
        background: linear-gradient(135deg, #00f2fe, #4facfe);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }

    .desc {
      font-size: 1.5rem;
      color: rgba(255, 255, 255, 0.7);
      line-height: 1.7;
      margin-bottom: 2.8rem;
      word-break: keep-all;
      
      strong {
        color: #ffffff;
        font-weight: 600;
      }
    }

    .options-row {
      ${StyleUtils.FlexUtils("center", "flex-start")};
      padding-top: 1rem;
      
      .dont-show-again {
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.8rem;
        user-select: none;
        color: rgba(255, 255, 255, 0.5);
        font-size: 1.3rem;
        transition: color 0.2s ease;

        &:hover {
          color: rgba(255, 255, 255, 0.8);
        }

        input[type="checkbox"] {
          appearance: none;
          width: 18px;
          height: 18px;
          border: 1.5px solid rgba(255, 255, 255, 0.3);
          border-radius: 4px;
          outline: none;
          cursor: pointer;
          position: relative;
          background: rgba(255, 255, 255, 0.05);
          transition: all 0.2s ease;

          &:checked {
            background: #00f2fe;
            border-color: #00f2fe;

            &::after {
              content: "✓";
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              color: #081221;
              font-size: 1.2rem;
              font-weight: 900;
            }
          }
        }
      }
    }

    // 모바일 전용 타이포 및 마진 축소 반응형 스타일
    @media (max-width: 640px) {
      .badge {
        font-size: 1.1rem;
        padding: 0.4rem 1.2rem;
        margin-bottom: 1.2rem;
      }

      .main-title {
        font-size: 2rem;
        margin-bottom: 1.2rem;
        line-height: 1.3;
      }

      .desc {
        font-size: 1.3rem;
        line-height: 1.55;
        margin-bottom: 1.6rem;
        
        br {
          display: none; /* 모바일에서 불필요한 줄바꿈 제거로 밀림 방지 */
        }
      }

      .options-row {
        padding-top: 0.4rem;
        
        .dont-show-again {
          font-size: 1.2rem;
        }
      }
    }

    // 라이트 모드 오버라이드
    html[dark-mode="true"] & {
      .badge {
        background: linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(124, 58, 237, 0.1));
        border: 1px solid rgba(79, 70, 229, 0.2);
        color: #4f46e5;
        box-shadow: 0 0 15px rgba(79, 70, 229, 0.05);
      }

      .main-title {
        color: #1e293b;

        span {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      }

      .desc {
        color: #475569;

        strong {
          color: #1e293b;
        }
      }

      .options-row {
        .dont-show-again {
          color: #64748b;

          &:hover {
            color: #1e293b;
          }

          input[type="checkbox"] {
            border: 1.5px solid rgba(79, 70, 229, 0.3);
            background: rgba(79, 70, 229, 0.03);

            &:checked {
              background: #4f46e5;
              border-color: #4f46e5;

              &::after {
                content: "✓";
                color: #ffffff;
              }
            }
          }
        }
      }
    }
  `,

  ActionButtons: css`
    width: 100%;
    display: flex !important;
    gap: 1.2rem;
    
    .btn-close, .btn-go {
      flex: 1;
      height: 5rem !important;
      border-radius: 12px !important;
      font-size: 1.5rem !important;
      font-weight: 700 !important;
      letter-spacing: -0.02em !important;
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
    }

    .btn-close {
      background: rgba(255, 255, 255, 0.08) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      color: rgba(255, 255, 255, 0.8) !important;

      &:hover {
        background: rgba(255, 255, 255, 0.15) !important;
        color: #ffffff !important;
      }
    }

    .btn-go {
      background: linear-gradient(135deg, #00f2fe, #4facfe) !important;
      color: #081221 !important;
      box-shadow: 0 4px 15px rgba(0, 242, 254, 0.3) !important;

      &:hover {
        box-shadow: 0 6px 20px rgba(0, 242, 254, 0.5) !important;
        transform: translateY(-2px);
      }
      
      &:active {
        transform: translateY(0);
      }
    }

    // 모바일 전용 버튼 높이 및 둥글기 반응형 스타일
    @media (max-width: 640px) {
      gap: 0.8rem;
      
      .btn-close, .btn-go {
        height: 4.2rem !important;
        font-size: 1.35rem !important;
        border-radius: 8px !important;
      }
    }

    // 라이트 모드 오버라이드
    html[dark-mode="true"] & {
      .btn-close {
        background: rgba(79, 70, 229, 0.06) !important;
        border: 1px solid rgba(79, 70, 229, 0.12) !important;
        color: #4f46e5 !important;

        &:hover {
          background: rgba(79, 70, 229, 0.12) !important;
          color: #312e81 !important;
        }
      }

      .btn-go {
        background: linear-gradient(135deg, #4f46e5, #7c3aed) !important;
        color: #ffffff !important;
        box-shadow: 0 4px 15px rgba(79, 70, 229, 0.25) !important;

        &:hover {
          box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4) !important;
          transform: translateY(-2px);
        }

        &:active {
          transform: translateY(0);
        }
      }
    }
  `
};

export const MainNoticeDialogStyleClass = cx(
  CommonStyle.Dialog,
  MainNoticeDialogStyle.Default
);
