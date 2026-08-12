-- ==============================================================================
-- 💖 우리 둘만의 공간 (우주 ♥ 혜빈 🐾 땅콩)
-- Supabase Database Security-Enhanced DDL Schema Script
-- ==============================================================================

-- 1. 통합 Key-Value JSONB 데이터 테이블 생성 (기존 데이터 100% 보존)
CREATE TABLE IF NOT EXISTS public.couple_data (
    id VARCHAR(100) PRIMARY KEY,
    content JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_id_length CHECK (char_length(id) >= 2)
);

-- 2. RLS (Row Level Security) 강제 활성화
ALTER TABLE public.couple_data ENABLE ROW LEVEL SECURITY;

-- 3. 기존 정책 제거 후 보안 강화 RLS 정책 설정
DROP POLICY IF EXISTS "Allow anonymous read and write to couple_data" ON public.couple_data;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.couple_data;
DROP POLICY IF EXISTS "Enable insert and update for all users" ON public.couple_data;

-- [보안 정책 1] 누구나 데이터 조회 가능 (Read)
CREATE POLICY "Enable read access for all users"
ON public.couple_data
FOR SELECT
TO public
USING (true);

-- [보안 정책 2] 검증된 커플 데이터 ID 키만 안전하게 추가/수정/삭제 가능 (Insert/Update/Delete)
CREATE POLICY "Enable insert and update for all users"
ON public.couple_data
FOR ALL
TO public
USING (id IN ('livingCategories', 'customUtilityCategories', 'ddays', 'utilityRecords', 'livingRecords', 'debts', 'schedules'))
WITH CHECK (id IN ('livingCategories', 'customUtilityCategories', 'ddays', 'utilityRecords', 'livingRecords', 'debts', 'schedules'));

-- 4. 인덱스 생성 (조회 속도 최적화)
CREATE INDEX IF NOT EXISTS idx_couple_data_id ON public.couple_data(id);
CREATE INDEX IF NOT EXISTS idx_couple_data_updated_at ON public.couple_data(updated_at DESC);

-- 5. updated_at 자동 갱신 트리거 생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_couple_data_updated_at ON public.couple_data;

CREATE TRIGGER update_couple_data_updated_at
BEFORE UPDATE ON public.couple_data
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
