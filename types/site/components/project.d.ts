
/** project **/
export type ProjectList = {
    title : string,
    content : string,
    path : string,
    imgSrc : string,
    date? : string,
    tagList? : { name : string }[],
    workList? : any,
    localImg? : boolean,
    isSecurity? : boolean,
    isWorkBtn? : boolean,
}
