
/** alert **/
export interface  AlertOption {
    title : string,
    text : string,
    type? : AlertType,
    checkBtnText? : string,
    closeBtnText? : string,
    isFooter? : boolean,
    isCheckBtn? : boolean,
    isCloseBtn? : boolean,
}

export type  AlertType =  "error" | "success" | "warning" | "info" | undefined;