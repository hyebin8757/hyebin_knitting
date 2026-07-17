import { ref } from "vue";
import { defineStore } from "pinia";
import CryptoJS from "crypto-js";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "https://fuuowmiapdqrrkkytiux.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY || "sb_publishable_TmguTJ2on1AnBu2cE460JQ_Hhch2lbt";
const globalSupabase = createClient(supabaseUrl, supabaseKey);

const getSupabase = () => {
  return globalSupabase;
};

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
  birthDate?: string;
  joinDate?: string;
}

export interface NoticeModel {
  id: number;
  title: string;
  date: string;
  content: string;
  author?: string;
}

export const useUserStore = defineStore( "user", () => {
  // 로그인 유무 확인
  const isLogin = ref<boolean>( false );
  
  // 역할 관리 ('member' | 'admin')
  const userRole = ref<"member" | "admin">("member");

  // 기본 조합원 데이터 리스트 (로컬 폴백 및 최초 시딩용)
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
      cargo: "벌크선 석탄 선적 보조",
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

  // Supabase 데이터 초기 로드 및 시딩(자동 데이터베이스 생성 테이블 확인용)
  const fetchAllData = async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    try {
      // 1. 조합원 조회
      const { data: dbWorkers, error: errWorkers } = await supabase.from("workers").select("*");
      if (dbWorkers && dbWorkers.length > 0) {
        workers.value = dbWorkers.map(w => ({
          name: w.name,
          role: w.role,
          phone: w.phone,
          group: w.group,
          checkedIn: w.checked_in,
          status: w.status,
          location: w.location || "",
          birthDate: w.birth_date || "",
          joinDate: w.join_date || ""
        }));
      } else if (!errWorkers) {
        // 테이블이 존재하지만 비어있는 경우 시딩 진행
        await supabase.from("workers").insert(workers.value.map(w => ({
          name: w.name,
          role: w.role,
          phone: w.phone,
          group: w.group,
          checked_in: w.checkedIn,
          status: w.status,
          location: w.location,
          birth_date: w.birthDate || "",
          join_date: w.joinDate || ""
        })));
      }

      // 2. 현장작업 조회
      const { data: dbFW, error: errFW } = await supabase.from("field_works").select("*").order("id", { ascending: false });
      if (dbFW && dbFW.length > 0) {
        fieldWorks.value = dbFW;
      } else if (!errFW) {
        await supabase.from("field_works").insert(fieldWorks.value);
      }

      // 3. 공지사항 조회
      const { data: dbNotices, error: errNotices } = await supabase.from("notices").select("*").order("id", { ascending: false });
      if (dbNotices && dbNotices.length > 0) {
        notices.value = dbNotices;
      } else if (!errNotices) {
        await supabase.from("notices").insert(notices.value);
      }
    } catch (e) {
      console.warn("Supabase 연결 실패 혹은 테이블 없음 - 로컬 상태 유지", e);
    }
  };

  // 로그인 데이터 설정 및 암호화
  const setUserInfo = ( userInfo : UserModel ) => {
    const encryptedData = CryptoJS.AES.encrypt( JSON.stringify( userInfo ), "info" ).toString();
    sessionStorage.setItem( "user", encryptedData );
  }

  // 로그인 정보 복호화
  const getLoginUser = () => {
    const rawData = sessionStorage.getItem( "user" );
    if (!rawData) {
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
  const deployWorker = async (name: string, location: string) => {
    const supabase = getSupabase();
    const idx = workers.value.findIndex(w => w.name === name);
    if (idx !== -1) {
      workers.value[idx].location = location;
      if (location && workers.value[idx].status === "none") {
        workers.value[idx].checkedIn = true;
        workers.value[idx].status = "day";
      }
      try {
        await supabase?.from("workers").update({
          location: workers.value[idx].location,
          checked_in: workers.value[idx].checkedIn,
          status: workers.value[idx].status
        }).eq("name", name);
      } catch (e) {
        console.error("Supabase update failed", e);
      }
    }
  }

  // 조별 단체 배치 지정
  const deployGroup = async (groupId: number, location: string) => {
    const supabase = getSupabase();
    workers.value.forEach(w => {
      if (w.group === groupId && w.checkedIn) {
        w.location = location;
      }
    });
    try {
      await supabase?.from("workers").update({ location: location }).eq("group", groupId).eq("checked_in", true);
    } catch (e) {
      console.error("Supabase group update failed", e);
    }
  }

  // 공지사항 데이터베이스 추가/수정 CRUD 액션
  const saveNoticeAction = async (id: number | null, title: string, content: string) => {
    const supabase = getSupabase();
    const todayStr = new Date().toISOString().split("T")[0];
    if (id === null) {
      if (supabase) {
        const { data } = await supabase.from("notices").insert([{ title, content, date: todayStr }]).select();
        if (data && data.length > 0) {
          notices.value.unshift(data[0]);
          return;
        }
      }
      const nextId = notices.value.length > 0 ? Math.max(...notices.value.map(n => n.id)) + 1 : 1;
      notices.value.unshift({ id: nextId, title, content, date: todayStr });
    } else {
      if (supabase) {
        await supabase.from("notices").update({ title, content, date: todayStr }).eq("id", id);
      }
      const idx = notices.value.findIndex((n) => n.id === id);
      if (idx !== -1) {
        notices.value[idx].title = title;
        notices.value[idx].content = content;
        notices.value[idx].date = todayStr;
      }
    }
  }

  // 현장작업 데이터베이스 추가/수정 CRUD 액션
  const saveWorkAction = async (id: number | null, location: string, cargo: string, details: string, safetyInstruction: string) => {
    const supabase = getSupabase();
    if (id === null) {
      if (supabase) {
        const { data } = await supabase.from("field_works").insert([{ location, cargo, details, safety_instruction: safetyInstruction }]).select();
        if (data && data.length > 0) {
          fieldWorks.value.unshift(data[0]);
          return;
        }
      }
      const nextId = fieldWorks.value.length > 0 ? Math.max(...fieldWorks.value.map(w => w.id)) + 1 : 1;
      fieldWorks.value.unshift({ id: nextId, location, cargo, details, safetyInstruction });
    } else {
      if (supabase) {
        await supabase.from("field_works").update({ location, cargo, details, safety_instruction: safetyInstruction }).eq("id", id);
      }
      const idx = fieldWorks.value.findIndex((w) => w.id === id);
      if (idx !== -1) {
        fieldWorks.value[idx].location = location;
        fieldWorks.value[idx].cargo = cargo;
        fieldWorks.value[idx].details = details;
        fieldWorks.value[idx].safetyInstruction = safetyInstruction;
      }
    }
  }

  // 신규 조합원 등록 액션 (어드민용)
  const addWorkerAction = async (name: string, phone: string, role: string, group: number, birthDate: string, joinDate: string) => {
    const supabase = getSupabase();
    const localWorker: WorkerModel = {
      name, role, phone, group,
      checkedIn: false, status: "none", location: "",
      birthDate, joinDate
    };
    if (supabase) {
      try {
        const { data } = await supabase.from("workers").insert([{
          name, role, phone, group,
          checked_in: false, status: "none", location: "",
          birth_date: birthDate, join_date: joinDate
        }]).select();
        if (data && data.length > 0) {
          workers.value.push({
            name: data[0].name, role: data[0].role,
            phone: data[0].phone, group: data[0].group,
            checkedIn: data[0].checked_in, status: data[0].status as any,
            location: data[0].location || "",
            birthDate: data[0].birth_date || "",
            joinDate: data[0].join_date || ""
          });
          return;
        }
      } catch (e) {
        console.error("Supabase insert worker failed", e);
      }
    }
    workers.value.push(localWorker);
  }

  // 출근 취소 (관리자용)
  const cancelCheckIn = async (name: string) => {
    const supabase = getSupabase();
    const idx = workers.value.findIndex(w => w.name === name);
    if (idx !== -1) {
      workers.value[idx].checkedIn = false;
      workers.value[idx].status = 'none';
      workers.value[idx].location = '';
      if (supabase) {
        try {
          await supabase.from('workers').update({ checked_in: false, status: 'none', location: '' }).eq('name', name);
        } catch (e) { console.error('Cancel check-in failed', e); }
      }
    }
  }

  // 조합원 정보 수정 (관리자용)
  const updateWorkerAction = async (originalName: string, name: string, phone: string, role: string, group: number, birthDate: string, joinDate: string) => {
    const supabase = getSupabase();
    const idx = workers.value.findIndex(w => w.name === originalName);
    if (idx !== -1) {
      workers.value[idx] = { ...workers.value[idx], name, phone, role, group, birthDate, joinDate };
      if (supabase) {
        try {
          await supabase.from('workers').update({ name, phone, role, group, birth_date: birthDate, join_date: joinDate }).eq('name', originalName);
        } catch (e) { console.error('Update worker failed', e); }
      }
    }
  }

  // 조합원 삭제 (관리자용)
  const deleteWorkerAction = async (name: string) => {
    const supabase = getSupabase();
    workers.value = workers.value.filter(w => w.name !== name);
    if (supabase) {
      try {
        await supabase.from('workers').delete().eq('name', name);
      } catch (e) { console.error('Delete worker failed', e); }
    }
  }

  // 현장작업 삭제
  const deleteWorkAction = async (id: number) => {
    const supabase = getSupabase();
    fieldWorks.value = fieldWorks.value.filter(w => w.id !== id);
    if (supabase) {
      try {
        await supabase.from('field_works').delete().eq('id', id);
      } catch (e) { console.error('Delete work failed', e); }
    }
  }

  // 공지사항 삭제
  const deleteNoticeAction = async (id: number) => {
    const supabase = getSupabase();
    notices.value = notices.value.filter(n => n.id !== id);
    if (supabase) {
      try {
        await supabase.from('notices').delete().eq('id', id);
      } catch (e) { console.error('Delete notice failed', e); }
    }
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
    fetchAllData,
    getLoginUser,
    setUserInfo,
    setLogin,
    changeCredentials,
    deployWorker,
    deployGroup,
    saveNoticeAction,
    saveWorkAction,
    addWorkerAction,
    cancelCheckIn,
    updateWorkerAction,
    deleteWorkerAction,
    deleteWorkAction,
    deleteNoticeAction,
    logout,
  };
}, {
  persist : {
    storage: false,
  }
} );