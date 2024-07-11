
/**
 * Html 유틸
 * */
export interface CategoryUtil {
    convertFullPathNameToHtml : ( value : string, splitType : string ) => string | undefined,
    shortenFullPathName : ( fullPathNameVC : string ) => string,
}

