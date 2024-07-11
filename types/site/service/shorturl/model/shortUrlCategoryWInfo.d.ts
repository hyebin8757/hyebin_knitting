import  type { TreeNodeModel, FileModel } from "~/types";
import {FLAG_YN} from "~/constants";

/**
 * ShortUrlCategoryWInfo (ShortUrlCategory 객체 )
 * */
export interface ShortUrlCategoryWInfo extends TreeNodeModel {

  lang?: "KO" | string,
  partOid?: string,
  categoryType?: string,
  orderNo?: 0 | number,
  descr?: string,

  inputUser?: string,
  inputDate?: Date | string,
  modUser?: string,
  modDate?: Date | string,
  displayYn?: FLAG_YN.YES | FLAG_YN.NO,
  useVerifyYn?: FLAG_YN.NO | FLAG_YN.YES,
  autoVerifyYn?: FLAG_YN.NO | FLAG_YN.YES,

  customField1?: string,

  iconFile?: FileModel,

  dataCountVC ?: 0 | number,
  checkNameVC ?: string,
  urlCountVC ?: 0 | number,

  childTreeNodeList?: ShortUrlCategoryWInfo[],
  langCategoryList?: ShortUrlCategoryWInfo[],
  childShortCategoryInfoList?: ShortUrlCategoryWInfo[],

  isActive?: boolean,

}