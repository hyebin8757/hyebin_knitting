import { defineStore } from "pinia";
import { ref } from "vue";
import { createClient } from "@supabase/supabase-js";

const getEnvValue = (key: string): string => {
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key]!;
  }
  return "";
};

const supabaseUrl = getEnvValue("SUPABASE_URL") || "https://jhxsmhbykctjqmgonjym.supabase.co";
const supabaseKey = getEnvValue("SUPABASE_KEY") || "sb_publishable_jdE2Pnj22VaOdB7vTIYSjw_T9jzjJRp";
const supabase = createClient(supabaseUrl, supabaseKey);

// Data interfaces
export interface DDayItem {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  icon?: string;
  isMain?: boolean;
}

export interface UtilityCategoryItem {
  id: string;
  name: string; // 전기세, 도시가스, 관리비, 수도세, 인터넷, 마통 이자, 보증금 이자 + 추가 항목
  amount: number;
}

export interface MonthlyUtilityRecord {
  year: number; // e.g. 2026
  month: number; // 1 ~ 12
  items: UtilityCategoryItem[];
  memo?: string;
}

export interface LivingCategoryItem {
  id: string;
  category: string; // 식비, 문화생활, 생필품, 기타 등
  title: string;
  amount: number;
  date: string; // YYYY-MM-DD
  paidBy?: '우주' | '혜빈' | '공동';
}

export interface MonthlyLivingRecord {
  year: number;
  month: number;
  targetSavings: number; // 모으는 금액
  items: LivingCategoryItem[];
}

export interface DebtItem {
  id: string;
  owner: '우주' | '혜빈' | '공동';
  title: string; // 대출/빚 이름
  totalAmount: number; // 총 원금
  remainingAmount: number; // 잔여 원금
  interestRate: number; // 이율 (%)
  monthlyPayment: number; // 월 상환액 (원금+이자 또는 원금)
  monthlyInterest: number; // 월 이자액
  totalMonths: number; // 총 기간 (개월)
  remainingMonths: number; // 남은 개월 수
  memo?: string;
}

export interface ScheduleItem {
  id: string;
  owner: '우주' | '혜빈' | '공동';
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  category: '약속' | '기념일' | '일상' | '중요';
  memo?: string;
  isCompleted?: boolean;
}

export const useCoupleStore = defineStore("couple", () => {
  // --- 0. Custom Categories List ---
  const livingCategories = ref<string[]>(["식비", "문화생활", "생필품", "기타"]);
  const customUtilityCategories = ref<string[]>([]);

  const addLivingCategory = (catName: string) => {
    const trimmed = catName.trim();
    if (trimmed && !livingCategories.value.includes(trimmed)) {
      livingCategories.value.push(trimmed);
      syncToSupabase("livingCategories", livingCategories.value);
    }
  };

  const deleteLivingCategory = (catName: string) => {
    livingCategories.value = livingCategories.value.filter((c) => c !== catName);
    syncToSupabase("livingCategories", livingCategories.value);
  };

  const addCustomUtilityCategory = (catName: string) => {
    const trimmed = catName.trim();
    if (trimmed && !customUtilityCategories.value.includes(trimmed)) {
      customUtilityCategories.value.push(trimmed);
      syncToSupabase("customUtilityCategories", customUtilityCategories.value);
    }
  };

  // --- 1. D-Day Data ---
  const ddays = ref<DDayItem[]>([]);

  // --- 2. Utility Bills Data (공과금) ---
  const utilityRecords = ref<MonthlyUtilityRecord[]>([]);

  // --- 3. Living Expenses Data (생활비 & 모인 금액) ---
  const livingRecords = ref<MonthlyLivingRecord[]>([]);

  // --- 4. Debts / Loans Data (각자 빚) ---
  const debts = ref<DebtItem[]>([]);

  // --- 5. Schedules / Promises Data (약속 & 일정) ---
  const schedules = ref<ScheduleItem[]>([]);

  // --- Helper Methods ---

  const getDaysCount = (startDateStr: string) => {
    if (!startDateStr) return 0;
    const start = new Date(startDateStr);
    const today = new Date();
    start.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const getUtilityTotal = (record: MonthlyUtilityRecord) => {
    if (!record || !record.items) return 0;
    return record.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  };

  const getUtilityPerPerson = (record: MonthlyUtilityRecord) => {
    return Math.round(getUtilityTotal(record) / 2);
  };

  const getUtilityRecord = (year: number, month: number) => {
    let rec = utilityRecords.value.find((r) => r.year === year && r.month === month);
    if (!rec) {
      rec = {
        year,
        month,
        items: [
          { id: "u1", name: "전기세", amount: 0 },
          { id: "u2", name: "도시가스", amount: 0 },
          { id: "u3", name: "관리비", amount: 0 },
          { id: "u4", name: "수도세", amount: 0 },
          { id: "u5", name: "인터넷", amount: 0 },
          { id: "u6", name: "마통 이자", amount: 0 },
          { id: "u7", name: "보증금 이자", amount: 0 },
        ],
      };
    }
    return rec;
  };

  const saveUtilityRecord = (year: number, month: number, items: UtilityCategoryItem[], memo?: string) => {
    const idx = utilityRecords.value.findIndex((r) => r.year === year && r.month === month);
    if (idx !== -1) {
      utilityRecords.value[idx].items = items;
      utilityRecords.value[idx].memo = memo;
    } else {
      utilityRecords.value.push({ year, month, items, memo });
    }
    syncToSupabase("utilityRecords", utilityRecords.value);
  };

  // Living Expenses helpers
  const getLivingRecord = (year: number, month: number) => {
    let rec = livingRecords.value.find((r) => r.year === year && r.month === month);
    if (!rec) {
      rec = { year, month, targetSavings: 0, items: [] };
    }
    return rec;
  };

  const saveLivingTarget = (year: number, month: number, target: number) => {
    let rec = livingRecords.value.find((r) => r.year === year && r.month === month);
    if (!rec) {
      rec = { year, month, targetSavings: target, items: [] };
      livingRecords.value.push(rec);
    } else {
      rec.targetSavings = target;
    }
    syncToSupabase("livingRecords", livingRecords.value);
  };

  const saveLivingItem = (year: number, month: number, item: Partial<LivingCategoryItem> & { id?: string }) => {
    let rec = livingRecords.value.find((r) => r.year === year && r.month === month);
    if (!rec) {
      rec = { year, month, targetSavings: 0, items: [] };
      livingRecords.value.push(rec);
    }
    if (item.id) {
      const idx = rec.items.findIndex((i) => i.id === item.id);
      if (idx !== -1) {
        rec.items[idx] = { ...rec.items[idx], ...item } as LivingCategoryItem;
      }
    } else {
      const newItem: LivingCategoryItem = {
        id: "l_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
        category: item.category || "식비",
        title: item.title || "새 지출",
        amount: Number(item.amount) || 0,
        date: item.date || new Date().toISOString().split("T")[0],
        paidBy: item.paidBy || "공동",
      };
      rec.items.push(newItem);
    }
    syncToSupabase("livingRecords", livingRecords.value);
  };

  const deleteLivingItem = (year: number, month: number, itemId: string) => {
    const rec = getLivingRecord(year, month);
    if (rec) {
      rec.items = rec.items.filter((i) => i.id !== itemId);
      syncToSupabase("livingRecords", livingRecords.value);
    }
  };

  // Debts CRUD
  const saveDebt = (debtData: Partial<DebtItem> & { id?: string }) => {
    if (debtData.id) {
      const idx = debts.value.findIndex((d) => d.id === debtData.id);
      if (idx !== -1) {
        debts.value[idx] = { ...debts.value[idx], ...debtData } as DebtItem;
      }
    } else {
      const newDebt: DebtItem = {
        id: "d_" + Date.now(),
        owner: debtData.owner || "공동",
        title: debtData.title || "새 대출",
        totalAmount: Number(debtData.totalAmount) || 0,
        remainingAmount: Number(debtData.remainingAmount) || 0,
        interestRate: Number(debtData.interestRate) || 0,
        monthlyPayment: Number(debtData.monthlyPayment) || 0,
        monthlyInterest: Number(debtData.monthlyInterest) || 0,
        totalMonths: Number(debtData.totalMonths) || 12,
        remainingMonths: Number(debtData.remainingMonths) || 12,
        memo: debtData.memo || "",
      };
      debts.value.push(newDebt);
    }
    syncToSupabase("debts", debts.value);
  };

  const deleteDebt = (id: string) => {
    debts.value = debts.value.filter((d) => d.id !== id);
    syncToSupabase("debts", debts.value);
  };

  // Schedules CRUD
  const saveSchedule = (schedData: Partial<ScheduleItem> & { id?: string }) => {
    if (schedData.id) {
      const idx = schedules.value.findIndex((s) => s.id === schedData.id);
      if (idx !== -1) {
        schedules.value[idx] = { ...schedules.value[idx], ...schedData } as ScheduleItem;
      }
    } else {
      const newSched: ScheduleItem = {
        id: "s_" + Date.now(),
        owner: schedData.owner || "공동",
        title: schedData.title || "새 일정",
        date: schedData.date || new Date().toISOString().split("T")[0],
        time: schedData.time || "12:00",
        category: schedData.category || "약속",
        memo: schedData.memo || "",
        isCompleted: false,
      };
      schedules.value.push(newSched);
    }
    syncToSupabase("schedules", schedules.value);
  };

  const deleteSchedule = (id: string) => {
    schedules.value = schedules.value.filter((s) => s.id !== id);
    syncToSupabase("schedules", schedules.value);
  };

  const toggleScheduleComplete = (id: string) => {
    const s = schedules.value.find((item) => item.id === id);
    if (s) {
      s.isCompleted = !s.isCompleted;
      syncToSupabase("schedules", schedules.value);
    }
  };

  // D-Day CRUD
  const saveDDay = (ddayData: Partial<DDayItem> & { id?: string }) => {
    if (ddayData.id) {
      const idx = ddays.value.findIndex((d) => d.id === ddayData.id);
      if (idx !== -1) {
        ddays.value[idx] = { ...ddays.value[idx], ...ddayData } as DDayItem;
      }
    } else {
      const newDDay: DDayItem = {
        id: "dday_" + Date.now(),
        title: ddayData.title || "새 기념일",
        date: ddayData.date || new Date().toISOString().split("T")[0],
        icon: ddayData.icon || "favorite",
        isMain: false,
      };
      ddays.value.push(newDDay);
    }
    syncToSupabase("ddays", ddays.value);
  };

  const deleteDDay = (id: string) => {
    ddays.value = ddays.value.filter((d) => d.id !== id);
    syncToSupabase("ddays", ddays.value);
  };

  const isLoaded = ref(false);

  // --- Supabase Sync & Fetch ---
  const syncToSupabase = async (key: string, data: any) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(`couple_${key}`, JSON.stringify(data));
      }
      await supabase.from("couple_data").upsert({
        id: key,
        content: data,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      // Fallback local persistence
    }
  };

  // 도시가스 0원 항목 전체 삭제 후 Supabase에 즉시 저장
  const cleanupDosiGas = async (): Promise<number> => {
    const cleaned = utilityRecords.value.map((rec: any) => ({
      ...rec,
      items: (rec.items || []).filter(
        (item: any) => !(item.name === "도시가스" && (Number(item.amount) || 0) === 0)
      ),
    }));
    const removedCount = utilityRecords.value.reduce((sum: number, rec: any, i: number) => {
      const before = (rec.items || []).length;
      const after = (cleaned[i].items || []).length;
      return sum + (before - after);
    }, 0);
    utilityRecords.value = cleaned;
    if (typeof window !== "undefined") localStorage.setItem("couple_utilityRecords", JSON.stringify(cleaned));
    await syncToSupabase("utilityRecords", cleaned);
    return removedCount;
  };

  const fetchAllData = async () => {
    try {
      // Supabase is the single source of truth.
      // We do NOT pre-load from localStorage to avoid showing stale/old data.
      const { data, error } = await supabase.from("couple_data").select("*");
      if (!error && data) {
        // Track which keys Supabase returned
        const fetchedKeys = new Set(data.map((row: any) => row.id));

        data.forEach((row: any) => {
          if (row.id === "livingCategories" && row.content) {
            livingCategories.value = row.content;
            if (typeof window !== "undefined") localStorage.setItem("couple_livingCategories", JSON.stringify(row.content));
          }
          if (row.id === "customUtilityCategories" && row.content) {
            customUtilityCategories.value = row.content;
            if (typeof window !== "undefined") localStorage.setItem("couple_customUtilityCategories", JSON.stringify(row.content));
          }
          if (row.id === "ddays" && row.content) {
            ddays.value = row.content;
            if (typeof window !== "undefined") localStorage.setItem("couple_ddays", JSON.stringify(row.content));
          }
          if (row.id === "utilityRecords" && row.content) {
            // 매 로드 시 도시가스 0원 항목 자동 제거 후 변경사항있으면 Supabase에 다시 저장
            const rawRecords: any[] = row.content;
            const cleanedRecords = rawRecords.map((rec: any) => ({
              ...rec,
              items: (rec.items || []).filter(
                (item: any) => !(item.name === "도시가스" && (Number(item.amount) || 0) === 0)
              ),
            }));
            const hadChanges = JSON.stringify(rawRecords) !== JSON.stringify(cleanedRecords);
            utilityRecords.value = cleanedRecords;
            if (typeof window !== "undefined") localStorage.setItem("couple_utilityRecords", JSON.stringify(cleanedRecords));
            if (hadChanges) {
              // 백그라운드로 Supabase에 클린 데이터 저장
              syncToSupabase("utilityRecords", cleanedRecords);
            }
          }
          if (row.id === "livingRecords" && row.content) {
            livingRecords.value = row.content;
            if (typeof window !== "undefined") localStorage.setItem("couple_livingRecords", JSON.stringify(row.content));
          }
          if (row.id === "debts" && row.content) {
            debts.value = row.content;
            if (typeof window !== "undefined") localStorage.setItem("couple_debts", JSON.stringify(row.content));
          }
          if (row.id === "schedules" && row.content) {
            schedules.value = row.content;
            if (typeof window !== "undefined") localStorage.setItem("couple_schedules", JSON.stringify(row.content));
          }
        });

        // If a key is NOT in Supabase, reset to empty and clear localStorage cache
        if (!fetchedKeys.has("ddays")) {
          ddays.value = [];
          if (typeof window !== "undefined") localStorage.removeItem("couple_ddays");
        }
        if (!fetchedKeys.has("utilityRecords")) {
          utilityRecords.value = [];
          if (typeof window !== "undefined") localStorage.removeItem("couple_utilityRecords");
        }
        if (!fetchedKeys.has("livingRecords")) {
          livingRecords.value = [];
          if (typeof window !== "undefined") localStorage.removeItem("couple_livingRecords");
        }
        if (!fetchedKeys.has("debts")) {
          debts.value = [];
          if (typeof window !== "undefined") localStorage.removeItem("couple_debts");
        }
        if (!fetchedKeys.has("schedules")) {
          schedules.value = [];
          if (typeof window !== "undefined") localStorage.removeItem("couple_schedules");
        }

      } else if (error) {
        // Supabase failed - fall back to localStorage as last resort
        if (typeof window !== "undefined") {
          const localDdays = localStorage.getItem("couple_ddays");
          if (localDdays) ddays.value = JSON.parse(localDdays);
          const localUtils = localStorage.getItem("couple_utilityRecords");
          if (localUtils) utilityRecords.value = JSON.parse(localUtils);
          const localLiving = localStorage.getItem("couple_livingRecords");
          if (localLiving) livingRecords.value = JSON.parse(localLiving);
          const localDebts = localStorage.getItem("couple_debts");
          if (localDebts) debts.value = JSON.parse(localDebts);
          const localSchedules = localStorage.getItem("couple_schedules");
          if (localSchedules) schedules.value = JSON.parse(localSchedules);
        }
      }
    } catch (e) {
      // Network failure fallback
    } finally {
      isLoaded.value = true;
    }
  };

  const clearAllData = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("couple_livingCategories");
      localStorage.removeItem("couple_customUtilityCategories");
      localStorage.removeItem("couple_ddays");
      localStorage.removeItem("couple_utilityRecords");
      localStorage.removeItem("couple_livingRecords");
      localStorage.removeItem("couple_debts");
      localStorage.removeItem("couple_schedules");
    }
    utilityRecords.value = [];
    livingRecords.value = [];
    debts.value = [];
    schedules.value = [];

    try {
      await supabase.from("couple_data").delete().neq("id", "");
    } catch (e) {}
  };

  return {
    isLoaded,
    livingCategories,
    customUtilityCategories,
    addLivingCategory,
    deleteLivingCategory,
    addCustomUtilityCategory,
    ddays,
    utilityRecords,
    livingRecords,
    debts,
    schedules,
    getDaysCount,
    getUtilityTotal,
    getUtilityPerPerson,
    getUtilityRecord,
    saveUtilityRecord,
    getLivingRecord,
    saveLivingTarget,
    saveLivingItem,
    deleteLivingItem,
    saveDebt,
    deleteDebt,
    saveSchedule,
    deleteSchedule,
    toggleScheduleComplete,
    saveDDay,
    deleteDDay,
    fetchAllData,
    clearAllData,
    cleanupDosiGas,
  };
});
