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
   * - 오브젝트인지 확인합니다
   *
   * @param { * } o - object to check
   *
   * @returns { boolean }
   */
  isObject: <T>( checkObject: any ) => checkObject is T;

  /**
   * - boolean 타입인지 확인합니다
   *
   * @param {*} v - variable to check
   *
   * @returns {boolean}
   */
  isBoolean: ( checkObject: any ) => checkObject is boolean;

  /**
   * 값이 비어있으면 true를 반환합니다.
   *
   * 1. number : 값이 있다면 제외
   * 2. string : "",
   * 3. array.length : 0
   * 4. null
   * 5. object properties가 1개도 없음
   * @param {any} checkTarget - 체크할 타겟
   * @return {boolean} 비어있지 않다면 true를 반환합니다. true라면 checkTarget을 checkTarget을 null로 간주합니다.
   * */
  isEmptyExceptZero: ( checkTarget: any ) => checkTarget is null | void

  /**
   * 값이 비어있지 않으면 true를 반환합니다.
   *
   * @param {any} checkTarget
   * @return {boolean} 비어있지 않다면 true를 반환합니다. true라면 checkTarget을 T로 간주합니다.
   * */
  isNotEmpty: <T>( checkTarget: any ) => checkTarget is T

  /**
   * 값이 비어있지 않으면 true를 반환합니다.
   *
   * @param {any} checkTarget
   * @return {boolean} 비어있지 않다면 true를 반환합니다. true라면 checkTarget을 T로 간주합니다.
   * */
  isNotEmptyExceptZero: <T>( checkTarget: any ) => checkTarget is T

  /**
   * 빈 객체인지 검사합니다.
   *
   * @param {Object} checkObject - 검사할 객체
   * @warning 객체의 Property가 모두 비열거형일 경우 재대로된 체크가 불가능합니다.
   * */
  isEmptyObject: ( checkTarget: any ) => checkTarget is {},

  /**
   * 값이 숫자인지 검사합니다.
   * @param  {string} value
   */
  isNumber: ( checkTarget: string ) => boolean,

  /**
   * 값이 string 인지 검사합니다
   * @param { string } checkTarget
   */
  isString: <T>( checkTarget: T ) => checkTarget is string;

  /**
   * 값이 숫자인지 소수점인지를 검사합니다. ( 음수 제외 )
   * */
  isNumberIncludeFloat: ( checkTarget: string ) => boolean,

  isFunction: <T>( checkTarget: any ) => checkTarget is T | (() => any),

  isUndefined: ( checkTarget: any ) => boolean;

  /**
   * 모바일인지 확인
   */
  isMobile : () => boolean,
}

/**
 * 유효성 검증 유틸 > form 검증
 * */
export interface FormValidationUtil {
  /**
   * 연락처를 010 - xxxx - xxxx 처럼 3개로 받아서 검증할 경우 사용합니다.
   *
   * 앞 번호는 010,011,016,017,018,019 만 허용합니다.
   * 중간 번호는 3 자리 또는 4 자리를 허용합니다.
   * 뒷 번호는 4 자리만 허용합니다.
   *
   * 위 조건이 모두 맞아야 true 를 반환하고, 아닐 경우 false 를 반환합니다.
   *
   * @param phonePart1
   * @param phonePart2
   * @param phonePart3
   * @returns boolean
   */
  isPhone: ( phonePart1: string, phonePart2: string, phonePart3: string ) => boolean,

  /**
   * - 해당 값이 숫자로만되어있는지 체크합니다
   */
  isNumber: ( numberValue: string ) => boolean;

  /**
   * - 해당 string 이 'vc.ru, com , kr' 같은 'http' protocol 을 포함하고 있는지 여부를 반환합니다
   * @param link
   */
  isProtocol: ( link: string ) => boolean;

  /**
   * 하이푼없이 사업자번호 체크하는 로직
   * ex) 1234512345
   * @param businessNumber
   */
  isBusinessNumber: ( businessNumber: string ) => boolean,

  /**
   * 하이푼없이 법인번호를 체크하는 로직
   * ex) 10자리 ~13자리
   * @param businessNumber
   */
  isCorporateNumber: ( corporateNumber: string ) => boolean,

  /**
   * 하이푼없이 휴대폰번호를 체크하는 로직
   * ex)01012341234
   * @param phone
   */
  isPhone2: ( phone: string ) => boolean,
  /**
   * 하이푼없이 생년월일 체크하는 로직
   * ex ) yyyymmdd
   * @param birthday
   */
  isBirthday: ( birthday: string ) => boolean,

  /**
   * 이메일 체크하는 로직
   * ex ) abcd@naver.com
   * @param birthday
   */
  isEmail: ( email: string ) => boolean,

  /**
   * - 영문인지 체크하는 로직
   *
   * @ex) hi there
   *
   * @param { string } alpha - 검사할 문자 or 문자열
   * @param { boolean } includeSpecialChar - 특수문자 포함여부( default : true )
   * @param { boolean } includeNumber - 숫자 포함여부( default : true )
   * @param { boolean } includeKorean - 한글 포함여부( default : false )
   */
  isAlpha: ( alpha: string, includeSpecialChar = true, includeNumber = true, includeKorean = false ) => boolean,

  /**
   * - URL 체크하는 로직
   * ex) https://www.naver.com
   * @param url
   */
  isUrl: ( url: string ) => boolean;
}

