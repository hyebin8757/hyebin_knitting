import { _typeValidationUtil }  from "./core/validation/typeValidationUtil"
import {UIUtil} from "~/types/core/utils/ui";
import {_uiUtil} from "~/utils/core/ui/uiUtil";


/**
 * Util 모듈을 사용할 수 있도록 injection 시킵니다.
 *
 * @todo 의존성 해결하는 구조로 가야함, 현재는 각 utils가 각 utils를 의존하는 구조임
 * */
export const useUtil  = {

    get typeValidation() {
        return _typeValidationUtil();
    },



    get uiUtil() : UIUtil {
        return _uiUtil();
    },
}
