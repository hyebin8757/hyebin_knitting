
/** alert **/
export interface  AlertOption {
    title : string,
    text : string,
    type? : AlertType,
    isFooter? : boolean,
    checkBtnText? : string,
    closeBtnText? : string,
}

export type  AlertType =  "error" | "success" | "warning" | "info" | undefined;