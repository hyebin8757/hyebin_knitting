import {TypeValidationUtil} from "~/types";

export const _typeValidationUtil = (): TypeValidationUtil => {

  const isEmpty = ( value: any ): value is null | void => {

    if ( "number" === typeof value && 0 < value ) {
      return false
    }
    else {
      return (isEmptyObject( value ) ||
        null === value
        || 0 === value.length
        || false === value
        || "" === value);
    }
  }

  const isEmptyExceptZero = ( value: any ): value is null | void => {

    return (isEmptyObject( value ) ||
        null === value
        || 0 === value.length
        || false === value
        || "" === value)
      || undefined === value;
  }

  const isNotEmpty = <T>( val: any ): val is T => {
    return !isEmpty( val );
  }

  const isNotEmptyExceptZero = <T>( val: any ): val is T => {
    return !isEmptyExceptZero( val );
  }

  const isEmptyObject = ( obj: any ): obj is {} => {
    // eslint-disable-next-line no-unreachable-loop
    for ( const name in obj ) {
      return false;
    }
    return true;
  }

  const isNumber = ( value: string ) => {

    const numberCheck = /^\d+$/;

    if ( numberCheck.test( value ) ) {
      return true;
    }

    return false;
  }

  /**
   * - 해당 객체의 정확한 타입을 반환합니다
   * --> typeof 연산자( 부정확한 타입을 반환하는 오류 ) 대신 사용합니다
   */
  const _typeOf = ( o: any ): string => {
    // @ts-ignore
    return Object.prototype.toString.call( o ).match( /\s([a-zA-Z]+)/ )[1].toLowerCase();
  }

  /**
   * - 오브젝트인지 확인합니다
   *
   * @param { * } o - object to check
   *
   * @returns { boolean }
   */
  const isObject = <T>( o: any ): o is T => {
    return ("object" === _typeOf( o ) && null !== o && o.constructor);
  }

  /**
   * - boolean 타입인지 확인합니다
   *
   * @param {*} v - variable to check
   *
   * @returns {boolean}
   */
  const isBoolean = ( v: any ): v is boolean => {
    return "boolean" === _typeOf( v );
  }

  /**
   * - 함수인지 확인합니다
   *
   * @param { * } fn - function to check
   * @returns { boolean }
   */
  const isFunction = <T>( fn: any ): fn is T | (() => any) => {
    return ("function" === _typeOf( fn ) || "asyncfunction" === _typeOf( fn ));
  }

  /**
   * - 해당 값이 undefined 인지 확인합니다
   */
  const isUndefined = ( v: any ): boolean => {
    return "undefined" === _typeOf( v );
  }

  /**
   * - string 타입인지 확인합니다
   *
   * @param { * } v - string to check
   * @returns { boolean }
   */
  const isString = ( v: any ): v is string => {
    return "string" === _typeOf( v );
  }

  /**
   * 음수 양수 소수점 포함하여 체크합니다.
   * */
  const isNumberIncludeFloat = ( value: string ) => {

    const regex = /^-?\d+(\.\d+)?$/;
    return regex.test( value );

  }

  /**
   * 모바일인지 확인
   */
  const isMobile = () => {
    let result = false;
    let isIos = /(ipod|iphone|ipad)/i.test( navigator.userAgent ); //ios
    let isIpad = /(ipad)/i.test( navigator.userAgent ); //ipad
    let isAndroid = /android/i.test( navigator.userAgent ); //android

    let detectMob = window.innerWidth <= 1024;

    if ( isIos || isIpad || isAndroid || detectMob ) {
      result = true;
    }

    // console.log( "checkMobile", result )
    return result;
  }

  return {
    isEmpty,
    isNotEmpty,
    isObject,
    isBoolean,
    isString,
    isEmptyObject,
    isNumber,
    isFunction,
    isUndefined,
    isNumberIncludeFloat,
    isEmptyExceptZero,
    isNotEmptyExceptZero,
    isMobile,
  }
}
