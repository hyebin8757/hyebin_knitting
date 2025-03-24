
/** project **/
export type ProjectList = {
    title : string,
    service : string,
    path : string,
    imgSrc : string,
    tagList? : { name : string }[],
    workList? : any,
    localImg? : boolean,
    isBest? : boolean,
    isSecurity? : boolean,
    isWorkBtn? : boolean,
}
