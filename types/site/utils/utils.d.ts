import { CoreUtils } from "~/types/core/utils/utils";
import { VisitUtil } from "~/types/site/utils/visit";
import {CategoryUtil} from "~/types/site/utils/category";
import {TimeFormatUtil} from "~/types/site/utils/timeFormat";
import {ShorturlUtil} from "~/types/site/utils/shorturl";

export * from "./visit";
export * from "./category";
export * from "./timeFormat";
export * from "./shorturl";
/**
 * 사이트 Utils interface
 *
 * @extends CoreUtils
 * @description 추후 사이트 별로 이름을 변경하시면 됩니다.
 * */
export interface SiteUtils extends CoreUtils {

  get visitUtil () : VisitUtil,

  get categoryUtil () : CategoryUtil,

  get timeFormatUtil () : TimeFormatUtil,

  get shorturlUtil () : ShorturlUtil,
}