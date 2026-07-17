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

  // 기본 조합원 데이터 리스트 (비어있음)
  const workers = ref<WorkerModel[]>([]);

  // 현장 작업 데이터 (비어있음)
  const fieldWorks = ref<any[]>([]);

  // 공지사항 데이터 (비어있음)
  const notices = ref<any[]>([]);

  // Supabase 데이터 초기 로드 및 시딩(자동 데이터베이스 생성 테이블 확인용)
  const fetchAllData = async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    try {
      // 1. 조합원 조회
      const { data: dbWorkers, error: errWorkers } = await supabase.from("workers").select("*");
      if (dbWorkers) {
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
      }

      // 2. 현장작업 조회
      const { data: dbFW, error: errFW } = await supabase.from("field_works").select("*").order("id", { ascending: false });
      if (dbFW) {
        fieldWorks.value = dbFW.map(f => ({
          id: f.id,
          location: f.location,
          cargo: f.cargo,
          details: f.details,
          safetyInstruction: f.safety_instruction || ""
        }));
      }

      // 3. 공지사항 조회
      const { data: dbNotices, error: errNotices } = await supabase.from("notices").select("*").order("id", { ascending: false });
      if (dbNotices) {
        notices.value = dbNotices;
      }
    } catch (e) {
      console.warn("Supabase 데이터 조회 실패 - 로컬 상태 유지", e);
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