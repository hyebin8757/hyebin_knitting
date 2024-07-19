/**
 * 유효성 검증 유틸 > Type 검증
 * */
export interface TypeValidationUtil {

  /**
   * 값이 비어있으면 true를 반환합니다.
   *
   * 1. number : 0
   * 2. string : "",
   * 3. array.length : 0
   * 4. null
   * 5. object properties가 1개도 없음
   * @param {any} checkTarget - 체크할 타겟
   * @return {boolean} 비어있지 않다면 true를 반환합니다. true라면 checkTarget을 checkTarget을 null로 간주합니다.
   * */
  isEmpty: ( checkTarget: any ) => checkTarget is void | null

  /**
   * 값이 비어있지 않으면 true를 반환합니다.
   *
   * @param {any} checkTarget
   * @return {boolean} 비어있지 않다면 true를 반환합니다. true라면 checkTarget을 T로 간주합니다.
   * */
  isNotEmpty: <T>( checkTarget: any ) => checkTarget is T

  /**
   * 빈 객체인지 검사합니다.
   *
   * @param {Object} checkObject - 검사할 객체
   * @warning 객체의 Property가 모두 비열거형일 경우 재대로된 체크가 불가능합니다.
   * */
  isEmptyObject: ( checkTarget: any ) => checkTarget is {},

  /**
   * 모바일인지 확인
   */
  isMobile : () => boolean,
}

