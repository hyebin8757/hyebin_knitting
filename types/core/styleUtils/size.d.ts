
/** style size 유틸 **/

/**
 *  component size
 */
export interface StyleSizeOption {
    XS?  : string,
    S ?  : string,
    L ?  : string,
    XL?  : string,
}

export type CommonStyleSize = '' | 'XS' | 'S' | 'L' | 'XL';


/**
 *  media size
 */
export interface MediaSizeOption {
    1280? : string,
    1024? : string,
    768? : string,
    640? : string,
    [ key : string | number ] : string,
}

export type MediaWidthOption = 'min' | 'max';