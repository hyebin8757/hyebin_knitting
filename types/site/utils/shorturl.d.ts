import {ShortUrlWInfo} from "~/types";

/**
 * 단축 URL 관련 유틸
 */
export interface ShorturlUtil {

  /**
   * 단축 URL을 환경에 맞춰 URL을 반환합니다.
   * @param shrotUrl
   */
  getShortUrlPath : ( shortUrl : string ) => string;

  /**
   * 내가 만든 URL > 미분류 URL 경로를 가져옵니다.
   */
  getDefaultCategoryListPath : () => string;

  /**
   * tooltip 을 비활성화 합니다.
   */
  setTooltipDisplayNone : ( parentEl : any, textEl : any ) => void;

  /**
   * 대표 이미지를 가져옵니다.
   *
   * @param shortUrlWInfo
   */
  getMainImage : ( shortUrlWInfo : ShortUrlWInfo) => string;

  /**
   * popup 오픈 시 html scroll 설정 합니다.
   */
  setHtmlScroll : ( value : boolean ) => void;

  /**
   * input 에 focus 를 설정 합니다.
   */
  setInputFocus : ( target : any ) => void;

  /**
   * 회사 홈페이지로 이동 합니다.
   */
  goRemarkablePage : () => void;

  /**
   * 데모 모드를 설정 합니다.
   */
  setDemoMode : ( status : boolean ) => void;
}