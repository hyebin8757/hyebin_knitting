//@ts-ignore
import {Image} from "mdast";
import {AssetResolverUtil} from "~/types/core/utils/assetResolver";

/**
 * Asset을 찾아서 반환하는 유틸
 * 변수에 경로를 담아서 사용할 경우 여기에서 반환하는 함수를 사용해서 이미지를 명시적으로 반환시켜야 함
 * */
export const assetResolverUtil = function () : AssetResolverUtil {

    /**
     * 설정한 PATH의 모든 Asset을 import 합니다.
     *
     * asset 전체를 import 시키면 안됩니다.
     * */
    const imageLoader = () => {
        return import.meta.glob( "~/assets/**/images/**/*" , {
            eager: true,
            import: "default",
            as : "url"
        }) as unknown;
    }

    const IMAGES = imageLoader() as { [ key : string ] : Image };

    return {

        /**
         * 변수에 담긴 이미지 경로를 받아서 실제 이미지 객체를 반환합니다.
         * 개발과 운영에서 동적으로 이미지를 로드하기 위해서 사용합니다.
         *
         * @param {string} path - 이미지 경로, alias 제거하고 /assets 으로 시작할 것
         * @return Image|undefined
         * */
        useImage ( path : string ) : Image | undefined {
            return IMAGES[ path ];
        },
    }
}

export default assetResolverUtil;


