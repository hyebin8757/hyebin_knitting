import { DateUtil } from "~/types/core/utils/date";
import { TypeValidationUtil } from "~/types/core/utils/validation";
import { FormValidationUtil } from "~/types/core/utils/validation";
import { RsAlertUtil } from "~/types/core/utils/rsAlert";
import EncryptUtil from "~/utils/core/common/encryptUtil";
import {AssetResolverUtil} from "~/types/core/utils/assetResolver";
import { SessionUtil } from "~/types/core/utils/session";
import { IDGeneratorUtil } from "~/types/core/utils/idGenerator";
import { FormatUtil } from "~/types/core/utils/format";
import { MoneyUtil } from "~/types/core/utils/money";
import { ExcelUtil } from "~/types/core/utils/excel";
import {UIUtil} from "~/types/core/utils/ui";
import { CopyUtil } from "~/types/core/utils/copy";
import { ThumbnailUtil } from "~/types/core/utils/thumbnail";

export * from "./validation";
export * from "./date";
export * from "./format";
export * from "./rsAlert";
export * from "./assetResolver";
export * from "./money";
export * from "./idGenerator";
export * from "./session";
export * from "./excel";
export * from "./ui";
export * from "./copy";
export * from "./thumbnail"


export interface CoreUtils {

    /**
     * type 관련 validation utils
     * */
    get typeValidation () : TypeValidationUtil

    /**
     * form 관련 validation utils
     * */
    get formValidation () : FormValidationUtil

    /**
     * formatUtil
     * */
    get formatUtil () : FormatUtil

    /**
     * dateUtil
     * */
    get dateUtil () : DateUtil

    /**
     * rsAlertUtil
     *
     * */
    get rsAlertUtil () : RsAlertUtil

    /**
     * EncUtils
     *
     * */
    get encryptUtil () : EncryptUtil

    /**
     * UI -> Image
     * */
    get AssetResolverUtil () : AssetResolverUtil

    /**
     * Money Util
     * */
    get moneyUtil () : MoneyUtil

    /**
     * Session Util
     */
    get sessionUtil () : SessionUtil;

    /**
     * ID Generator Util
     */
    get idGeneratorUtil() : IDGeneratorUtil;

    /**
     * Excel Util
     */
    get excelUtil() : ExcelUtil;

    /**
     * UI Util
     */
    get uiUtil() : UIUtil;

    /**
     * Copy Util
     */
    get copyUtil() : CopyUtil;

    /**
     * Thumbnail Util
     */
    get thumbnailUtil() : ThumbnailUtil;

}
