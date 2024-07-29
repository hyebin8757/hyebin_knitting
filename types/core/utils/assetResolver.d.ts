import {Image} from "mdast";

export interface AssetResolverUtil {
    useImage : ( path : string ) => Image | undefined
}