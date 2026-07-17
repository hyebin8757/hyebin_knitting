import {ref} from "vue";
import {defineStore} from "pinia";
import CryptoJS from "crypto-js";

interface UserModel {
  id? : string,
  password? : string,
  hasChangedCredentials?: boolean;
}

export interface WorkerModel {
  name: string;
  role: string;
  phone: string;
  group: number;
  checkedIn: boolean;
  status: "day" | "night" | "field" | "absent" | "leave" | "none";
  location: string;
}

export interface NoticeModel {
  id: number;
  title: string;
  date: string;
  content: string;
  author: string;
}

export const useUserStore = defineStore( "user", () => {
  // 로그인 유무 확인
  const isLogin = ref<boolean>( false );
  
  // 역할 관리 ('member' | 'admin')
  const userRole = ref<"member" | "admin">("member");

  // Mock 조합원 데이터 리스트 (1~8조, 4조 제외 총 7개 조)
  const workers = ref<WorkerModel[]>([
    { name: "홍길동", role: "반장", phone: "010-5678-1234", group: 1, checkedIn: true, status: "day", location: "경인서부" },
    { name: "이순신", role: "조합원", phone: "010-1111-2222", group: 1, checkedIn: true, status: "night", location: "인천" },
    { name: "강감찬", role: "조합원", phone: "010-3333-4444", group: 1, checkedIn: false, status: "none", location: "" },
    
    { name: "김유신", role: "좌상", phone: "010-5555-6666", group: 2, checkedIn: true, status: "field", location: "객선" },
    { name: "을지문덕", role: "조합원", phone: "010-7777-8888", group: 2, checkedIn: true, status: "day", location: "남항" },
    { name: "장보고", role: "조합원", phone: "010-9999-0000", group: 2, checkedIn: false, status: "none", location: "" },
    
    { name: "권율", role: "조장", phone: "010-1234-5678", group: 3, checkedIn: true, status: "leave", location: "임항" },
    { name: "서희", role: "조합원", phone: "010-2345-6789", group: 3, checkedIn: true, status: "day", location: "현장" },
    { name: "계백", role: "조합원", phone: "010-3456-7890", group: 3, checkedIn: false, status: "none", location: "" },
    
    { name: "신돌석", role: "조합원", phone: "010-4567-8901", group: 5, checkedIn: true, status: "day", location: "야간" },
    { name: "최무선", role: "조합원", phone: "010-5678-9012", group: 5, checkedIn: false, status: "none", location: "" },
    { name: "임꺽정", role: "조합원", phone: "010-6789-0123", group: 5, checkedIn: false, status: "none", location: "" },

    { name: "곽재우", role: "조합원", phone: "010-7890-1234", group: 6, checkedIn: true, status: "day", location: "경인서부" },
    { name: "사명대사", role: "조합원", phone: "010-8901-2345", group: 7, checkedIn: true, status: "field", location: "인천" },
    { name: "김시민", role: "조합원", phone: "010-9012-3456", group: 8, checkedIn: true, status: "night", location: "남항" },
  ]);

  // 현장 작업 데이터
  const fieldWorks = ref<any[]>([
    {
      id: 1,
      location: "남항 부두 A선석",
      cargo: "컨테이너 화물 하역 작업",
      details: "오전 09:00 ~ 오후 18:00 컨테이너 크레인 하역 및 트랙터 이동 작업. 지반 침하 주의.",
      safetyInstruction: "크레인 작업 반경 내 보행 금지 및 유도원 배치 필수",
    },
    {
      id: 2,
      location: "임항 제3부두",
      cargo: "벌크선 선적 보조",
      details: "벨트 컨베이어 라인 모니터링 및 선내 투입 배치. 미세먼지 마스크 착용 필.",
      safetyInstruction: "낙하 위험 구역 진입 통제 및 무전 통신 철저 준수",
    },
  ]);

  // 공지사항 데이터
  const notices = ref<any[]>([
    {
      id: 1,
      title: "하반기 안전 보건 교육 실시 및 이수 의무 안내",
      date: "2026-07-15",
      content: "모든 조합원은 하반기 필수 법정 의무 교육인 현장 보건 및 응급처치 교육 과정을 온라인 혹은 오프라인 지정 일자에 맞춰 반드시 이수해 주시기 바랍니다. 미이수 시 현장 배치가 제한될 수 있습니다.",
    },
    {
      id: 2,
      title: "복지 기금 신청 서류 및 마감 기한 공지",
      date: "2026-07-12",
      content: "2026년도 자녀 학자금 및 긴급 복지 기금 지원 신청서 마감일은 이번 달 31일까지입니다. 구비서류를 지참하시어 조합 사무실로 방문 접수 또는 이메일 접수를 마쳐주시기 바랍니다.",
    },
    {
      id: 3,
      title: "폭염 대비 조합원 그늘막 쉼터 얼음물 공급 운영",
      date: "2026-07-10",
      content: "기온 상승으로 현장 근무자들의 온열 질환을 예방하고자 각 초소 및 그늘막 대기 구역에 일일 얼음물과 식염포도당이 배송 및 상시 비치됩니다. 충분한 수분 섭취와 휴식을 취하십시오.",
    },
  ]);

  // 로그인 데이터 설정 및 암호화
  const setUserInfo = ( userInfo : UserModel ) => {
    const encryptedData = CryptoJS.AES.encrypt( JSON.stringify( userInfo ), "info" ).toString();

    sessionStorage.setItem( "user", encryptedData );
  }

  // 로그인 정보 복호화
  const getLoginUser = () => {
    const rawData = sessionStorage.getItem( "user" );
    if (!rawData) {
      // 최초 가입 정보 (어드민이 미리 등록한 정보)
      return { id: "testUser", password: "0000", hasChangedCredentials: false };
    }
    try {
      const decryptData = CryptoJS.AES.decrypt( rawData , 'info').toString(CryptoJS.enc.Utf8);
      return decryptData ? JSON.parse( decryptData ) : { id: "testUser", password: "0000", hasChangedCredentials: false };
    } catch (e) {
      return { id: "testUser", password: "0000", hasChangedCredentials: false };
    }
  }

  // 로그인 유무 설정
  const setLogin = ( state : boolean ) => {
    isLogin.value = state;
  }

  // ID/비밀번호 변경 액션 (최초 1회 제한용)
  const changeCredentials = (newId: string, newPassword: string) => {
    const userInfo: UserModel = {
      id: newId,
      password: newPassword,
      hasChangedCredentials: true
    };
    setUserInfo(userInfo);
  }

  // 조합원 개별 배치 지정
  const deployWorker = (name: string, location: string) => {
    const idx = workers.value.findIndex(w => w.name === name);
    if (idx !== -1) {
      workers.value[idx].location = location;
      if (location && workers.value[idx].status === "none") {
        workers.value[idx].checkedIn = true;
        workers.value[idx].status = "day";
      }
    }
  }

  // 조별 단체 배치 지정
  const deployGroup = (groupId: number, location: string) => {
    workers.value.forEach(w => {
      if (w.group === groupId && w.checkedIn) {
        w.location = location;
      }
    });
  }

  // 로그아웃
  const logout = () => {
    sessionStorage.removeItem( "user" );
    sessionStorage.removeItem( "sidebar" );
    sessionStorage.removeItem( "menu" );

    location.href = "/login";
  };

  return {
    isLogin,
    userRole,
    workers,
    fieldWorks,
    notices,
    getLoginUser,
    setUserInfo,
    setLogin,
    changeCredentials,
    deployWorker,
    deployGroup,
    logout,
  };
}, {
  persist : {
    storage: persistedState.sessionStorage,
  }
} );