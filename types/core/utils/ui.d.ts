import {MediaSizeOption,MediaWidthOption} from "@/types/core/styleUtils/size";

export interface UIUtil {
  /** 해당 media 를 반환합니다 */
  setMedia : ( mediaSize : MediaSizeOption,  widthOption : MediaWidthOption ) => string | string[],
}
