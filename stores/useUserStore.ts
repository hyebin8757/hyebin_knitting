import { ref } from "vue";
import { defineStore } from "pinia";
import CryptoJS from "crypto-js";
import { createClient } from "@supabase/supabase-js";

const getEnvValue = (key: string): string => {
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key]!;
  }
  return "";
};

const supabaseUrl = getEnvValue("SUPABASE_URL") || "https://fuuowmiapdqrrkkytiux.supabase.co";
const supabaseKey = getEnvValue("SUPABASE_KEY") || "sb_publishable_TmguTJ2on1AnBu2cE460JQ_Hhch2lbt";
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
  loginId?: string;
  loginPassword?: string;
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

  // 회비 관련 납부 내역
  const dues = ref<any[]>([]);

  // 회비 관련 비고/지출 내역
  const duesExpenses = ref<any[]>([]);

  // 현재 로그인한 사용자 정보
  const loggedInUser = ref<any>(null);

  // 전체 출퇴근 기록 대장
  const attendanceRecords = ref<any[]>([]);

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
          joinDate: w.join_date || "",
          loginId: w.login_id || "",
          loginPassword: w.login_password || ""
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

      // 4. 출퇴근 기록 조회
      const { data: dbAttendance, error: errAttendance } = await supabase.from("attendance").select("*");
      if (dbAttendance) {
        attendanceRecords.value = dbAttendance;
      }

      // 5. 회비 납부 내역 조회
      const { data: dbDues, error: errDues } = await supabase.from("dues").select("*");
      if (dbDues) {
        dues.value = dbDues;
      }

      // 6. 회비 비고/지출 내역 조회
      const { data: dbDuesExp, error: errDuesExp } = await supabase.from("dues_expenses").select("*").order("id", { ascending: true });
      if (dbDuesExp) {
        duesExpenses.value = dbDuesExp;
      }

      // 로그인 세션 정보 복구 매핑
      const savedUser = getLoginUser();
      if (savedUser && savedUser.id && savedUser.id !== "testUser") {
        isLogin.value = true;
        if (savedUser.id === 'admin') {
          userRole.value = 'admin';
          loggedInUser.value = { name: '관리자', role: '관리자', phone: '010-0000-0000', group: 0 };
        } else {
          userRole.value = 'member';
          const matched = workers.value.find(w => w.name === savedUser.id || w.loginId === savedUser.id);
          if (matched) {
            loggedInUser.value = matched;
          } else {
            // 혹시 아직 매칭하지 못한 경우의 임시 정보
            loggedInUser.value = { name: savedUser.id, role: '조합원', phone: savedUser.password, group: 1 };
          }
        }
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

  // ID/비밀번호 및 개인정보 변경 액션 (최초 1회 제한용)
  const changeCredentials = async (newId: string, newPassword: string, phone: string = "", joinDate: string = "", birthDate: string = "") => {
    const supabase = getSupabase();
    const currentName = loggedInUser.value?.name;
    if (currentName) {
      const idx = workers.value.findIndex(w => w.name === currentName);
      if (idx !== -1) {
        workers.value[idx].loginId = newId;
        workers.value[idx].loginPassword = newPassword;
        workers.value[idx].phone = phone;
        workers.value[idx].joinDate = joinDate;
        workers.value[idx].birthDate = birthDate;
        if (supabase) {
          try {
            await supabase.from('workers').update({
              login_id: newId,
              login_password: newPassword,
              phone: phone,
              join_date: joinDate,
              birth_date: birthDate
            }).eq('name', currentName);
          } catch (e) {
            console.error("Update credentials failed", e);
          }
        }
        loggedInUser.value.loginId = newId;
        loggedInUser.value.loginPassword = newPassword;
        loggedInUser.value.phone = phone;
        loggedInUser.value.joinDate = joinDate;
        loggedInUser.value.birthDate = birthDate;
      }
    }
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

      // 오늘자 출퇴근 기록도 업데이트
      const todayStr = getTodayStr();
      const recordIdx = attendanceRecords.value.findIndex(r => r.worker_name === name && r.date === todayStr);
      if (recordIdx !== -1) {
        attendanceRecords.value[recordIdx].location = location;
        if (supabase) {
          try {
            await supabase.from("attendance").update({ location }).eq("worker_name", name).eq("date", todayStr);
          } catch (e) { console.error("Attendance location update failed", e); }
        }
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

    // 오늘자 출퇴근 기록도 업데이트
    const todayStr = getTodayStr();
    for (const w of workers.value) {
      if (w.group === groupId && w.checkedIn) {
        const recordIdx = attendanceRecords.value.findIndex(r => r.worker_name === w.name && r.date === todayStr);
        if (recordIdx !== -1) {
          attendanceRecords.value[recordIdx].location = location;
          if (supabase) {
            try {
              await supabase.from("attendance").update({ location }).eq("worker_name", w.name).eq("date", todayStr);
            } catch (e) { console.error("Attendance location group update failed", e); }
          }
        }
      }
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

  const getTodayStr = () => {
    const date = new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // 출근 취소 (관리자용 / 사용자용 공용)
  const cancelCheckIn = async (name: string) => {
    const supabase = getSupabase();
    const idx = workers.value.findIndex(w => w.name === name);
    if (idx !== -1) {
      workers.value[idx].checkedIn = false;
      workers.value[idx].status = 'none';
      workers.value[idx].location = '';
      if (supabase) {
        try {
          const { error } = await supabase.from('workers').update({ checked_in: false, status: 'none', location: '' }).eq('name', name);
          if (error) console.error('Worker cancel update failed:', error);
        } catch (e) { console.error('Cancel check-in failed', e); }
      }
    }

    const todayStr = getTodayStr();
    attendanceRecords.value = attendanceRecords.value.filter(r => !(r.worker_name === name && r.date === todayStr));
    if (supabase) {
      try {
        const { error } = await supabase.from('attendance').delete().eq('worker_name', name).eq('date', todayStr);
        if (error) console.error('Attendance cancel delete failed:', error);
      } catch (e) { console.error('Attendance delete failed', e); }
    }
    
    // 최종 상태 동기화
    await fetchAllData();
  }

  // 출근/조퇴 등록
  const checkInWorker = async (name: string, status: "day" | "night" | "field" | "absent" | "leave") => {
    const supabase = getSupabase();
    const idx = workers.value.findIndex(w => w.name === name);
    if (idx !== -1) {
      workers.value[idx].checkedIn = (status !== "absent" && status !== "none");
      workers.value[idx].status = status;
      if (supabase) {
        try {
          const { error } = await supabase.from('workers').update({ checked_in: workers.value[idx].checkedIn, status }).eq('name', name);
          if (error) console.error('Worker status update failed:', error);
        } catch (e) { console.error('Worker status update failed', e); }
      }
    }

    const todayStr = getTodayStr();
    const record = { worker_name: name, date: todayStr, status, location: idx !== -1 ? workers.value[idx].location : "" };
    const existingIdx = attendanceRecords.value.findIndex(r => r.worker_name === name && r.date === todayStr);
    if (existingIdx !== -1) {
      attendanceRecords.value[existingIdx].status = status;
      if (supabase) {
        try {
          const { error } = await supabase.from('attendance').update({ status }).eq('worker_name', name).eq('date', todayStr);
          if (error) console.error('Attendance status update failed:', error);
        } catch (e) { console.error('Attendance update failed', e); }
      }
    } else {
      if (supabase) {
        try {
          const { data, error } = await supabase.from('attendance').insert([record]).select();
          if (error) {
            console.error('Attendance insert failed:', error);
          } else if (data && data.length > 0) {
            attendanceRecords.value.push(data[0]);
          }
        } catch (e) { console.error('Attendance insert failed', e); }
      } else {
        attendanceRecords.value.push(record);
      }
    }

    // 최종 상태 동기화
    await fetchAllData();
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

  // 조합원 로그인 정보 초기화 (관리자용)
  const resetWorkerCredentials = async (workerName: string) => {
    const supabase = getSupabase();
    const idx = workers.value.findIndex(w => w.name === workerName);
    if (idx !== -1) {
      const worker = workers.value[idx];
      const defaultId = worker.name;
      const defaultPassword = worker.phone.replace(/[^0-9]/g, '').slice(-4);
      
      worker.loginId = defaultId;
      worker.loginPassword = defaultPassword;
      
      if (supabase) {
        try {
          await supabase.from('workers').update({
            login_id: defaultId,
            login_password: defaultPassword
          }).eq('name', workerName);
        } catch (e) {
          console.error("Reset worker credentials failed", e);
        }
      }
    }
  }

  // 회비 납부 추가
  const saveDueAction = async (workerName: string, month: string, amount: number, paymentMethod: string) => {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { error } = await supabase.from('dues').insert([{
          worker_name: workerName,
          month,
          amount,
          payment_method: paymentMethod
        }]);
        if (error) console.error("Save due failed:", error);
      } catch (e) { console.error("Save due failed", e); }
    }
    await fetchAllData();
  };

  // 회비 납부 삭제
  const deleteDueAction = async (id: number) => {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { error } = await supabase.from('dues').delete().eq('id', id);
        if (error) console.error("Delete due failed:", error);
      } catch (e) { console.error("Delete due failed", e); }
    }
    await fetchAllData();
  };

  // 회비 비고/지출 등록 및 수정
  const saveExpenseAction = async (id: number | null, month: string, amount: number, description: string) => {
    const supabase = getSupabase();
    if (supabase) {
      try {
        if (id) {
          const { error } = await supabase.from('dues_expenses').update({
            month,
            amount,
            description
          }).eq('id', id);
          if (error) console.error("Update expense failed:", error);
        } else {
          const { error } = await supabase.from('dues_expenses').insert([{
            month,
            amount,
            description
          }]);
          if (error) console.error("Insert expense failed:", error);
        }
      } catch (e) { console.error("Save expense failed", e); }
    }
    await fetchAllData();
  };

  // 회비 비고/지출 삭제
  const deleteExpenseAction = async (id: number) => {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { error } = await supabase.from('dues_expenses').delete().eq('id', id);
        if (error) console.error("Delete expense failed:", error);
      } catch (e) { console.error("Delete expense failed", e); }
    }
    await fetchAllData();
  };

  const getSupabaseInstance = () => {
    return getSupabase();
  };

  // 로그아웃
  const logout = () => {
    sessionStorage.removeItem( "user" );
    sessionStorage.removeItem( "sidebar" );
    sessionStorage.removeItem( "menu" );
    localStorage.removeItem( "auto_login" );
    localStorage.removeItem( "auto_login_id" );
    localStorage.removeItem( "auto_login_password" );
    location.href = "/login";
  };

  return {
    getSupabase: getSupabaseInstance,
    isLogin,
    userRole,
    workers,
    fieldWorks,
    notices,
    dues,
    duesExpenses,
    saveDueAction,
    deleteDueAction,
    saveExpenseAction,
    deleteExpenseAction,
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
    loggedInUser,
    attendanceRecords,
    checkInWorker,
    getTodayStr,
    resetWorkerCredentials,
    logout,
  };
}, {
  persist : true
} );