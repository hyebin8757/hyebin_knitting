import { _typeValidationUtil }  from "./core/validation/typeValidationUtil"
import {_uiUtil} from "~/utils/core/ui/uiUtil";
import { assetResolverUtil }  from "~/utils/core/ui/assetResolverUtil";
import {UIUtil} from "~/types/core/utils/ui";
import {AssetResolverUtil} from "~/types";

/**
 * Util 모듈을 사용할 수 있도록 injection 시킵니다.
 * */
export const useUtil  = {

    get typeValidation() {
        return _typeValidationUtil();
    },

    get AssetResolverUtil(): AssetResolverUtil {
        return assetResolverUtil();
    },


    get uiUtil() : UIUtil {
        return _uiUtil();
    },
}
