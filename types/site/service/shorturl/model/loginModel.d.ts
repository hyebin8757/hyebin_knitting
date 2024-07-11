
/**
 * LoginModel (로그인 응답 )
 * */
export interface LoginModel {

  success?: boolean,
  userId: string,
  userName?: string,
  userOid: string,

  isManager?: boolean,
  isNoDuplicateCheck?: boolean,
  loginLastDate?: string,
  defaultCategoryOid?: string,

  // 로그인 실패시
  errorMessage?: string,
  error?: string,

}
