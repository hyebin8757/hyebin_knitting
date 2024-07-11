/**
 *
 * TimeFormat 유틸
 */
export interface TimeFormatUtil {

  /**
   * 단축 URL의 생성 시간 표기 규칙에 따라 가져옵니다.
   * 1분 이내 - '방금 전'
   * 1분 이상 ~ 59분 이내 - '5분 전'
   * 1시간 이상 ~ 24시간 이내 - '3시간 전'
   * 24시간 이상 ~ 7일 이내 - '5일 전'
   * 7일 이상 - '2024-02-15'
   * @param date
   */
  formatTimeDifference: ( date : string ) => string;
}