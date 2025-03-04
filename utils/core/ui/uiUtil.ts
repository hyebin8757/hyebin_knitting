import { UIUtil } from "@/types";
import { css } from "@emotion/css";
import {
  MediaSizeOption,
  MediaWidthOption,
} from "@/types/core/styleUtils/size";
import { _typeValidationUtil } from "@/utils/core/validation/typeValidationUtil";

const { isEmpty } = _typeValidationUtil();

/**
 * - ui 관련 util 입니다
 */
export const _uiUtil = (): UIUtil => {
  /**
   *  style 의 media 를 반환 합니다
   *  ex )
   *   media : {
   *       1280 : css`
   *       `,
   *
   *       1024 : css`
   *       `,
   *
   *       768 : css`
   *       `,
   *
   *       640 : css`
   *       `,
   *     },
   *
   */
  const setMedia = (
    mediaSize: MediaSizeOption,
    widthOption: MediaWidthOption = "max"
  ): string | string[] => {
    if (isEmpty(mediaSize)) {
      return "";
    }

    let mediaList: string[] = [];

    Object.keys(mediaSize).forEach((width) => {
      mediaList.push(css`
        @media screen and (${widthOption}-width: ${width}px) {
          ${mediaSize[width]}
        }
      `);
    });

    return mediaList.reverse();
  };

  return {
    setMedia,
  };
};
