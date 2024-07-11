import {FLAG_YN} from "~/constants";
import {FileModel} from "~/types";

/**
 * ShortUrlModel (ShortUrlL 객체 )
 * */
export interface ShortUrlWInfo {

  shortUrlOid?: string,               // ShortUrl oid
  originUrl?: string,                 // 원본 URL
  shortUrl: string,                  // 단축 URL
  classifyCategoryOid?: string,       // 분류 카테고리 oid
  title?: string,                     // 제목

  descr?: string,                     // 설명
  mainImageUrl?: string,              // 대표이미지
  expireDate?: string,                // 만료일
  pwd?: string,                       // 비밀번호
  autoYn?: FLAG_YN.YES | string,      // 단축 URL 생성 YN

  openYn?: FLAG_YN.NO | string,       // 공개여부(공개된 URL 여부)
  visitCount?: 0 | number,            // 방문수
  systemOid?: string,                 // 시스템 OID
  generateCount?: number,             // 자동 단축 URL 생성 실행 횟수
  inputUser?: string,                 // 등록자

  inputDate?: string,                 //등록일자
  modUser?: string,                   // 수정자
  modDate?: string,                   // 수정일자

  customField1?: string,              // 커스텀 필드1
  customField2?: string,              // 커스텀 필드2
  customField3?: string,              // 커스텀 필드3

  inputUserNameVC?: string,           // 등록자 이름
  inputUserIdVC?: string,             // 등록자 ID
  categoryFullPathNameVC?: string,    // 카테고리 fullPathNameVC
  shortUrlCountVC?: number,           // url 개수
  isAfterExpireDate?: boolean,        // 만료일이 지났는지 여부

  mainImageFileInfo?: FileModel,      // 대표 이미지 파일 객체
  extraInfoMap?: object,              // 부가적인 정보가 필요시

  no?: 1 | number,                    // 페이지 리스트 번호
  isChecked?: boolean,                // 페이지 리스트에서 체크박스 사용 시
  isUseExpireDate?: boolean,          // 생성 및 수정 페이지에서 URL 만료일을 사용 여부
  isUsePwd?: boolean,                 // 생성 및 수정 페이지에서 비밀번호 사용 여부
}