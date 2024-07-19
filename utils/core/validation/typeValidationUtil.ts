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

  const isNotEmpty = <T>( val: any ): val is T => {
    return !isEmpty( val );
  }

  const isEmptyObject = ( obj: any ): obj is {} => {
    // eslint-disable-next-line no-unreachable-loop
    for ( const name in obj ) {
      return false;
    }
    return true;
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
    isEmptyObject,
    isMobile,
  }
}
