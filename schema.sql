-- ==============================================================================
-- 💖 우리 둘만의 공간 (우주 ♥ 혜빈 🐾 땅콩)
-- Supabase Database DDL Schema & Data Reset Script
-- ==============================================================================

-- 1. 통합 Key-Value JSONB 데이터 테이블 (앱 데이터 양방향 자동 동기화용)
CREATE TABLE IF NOT EXISTS public.couple_data (
    id VARCHAR(100) PRIMARY KEY,
    content JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RLS (Row Level Security) 활성화
ALTER TABLE public.couple_data ENABLE ROW LEVEL SECURITY;

-- 3. 익명 및 공개 읽기/쓰기 허용 정책 생성 (로그인 페이지 없는 모바일 앱 환경)
DROP POLICY IF EXISTS "Allow anonymous read and write to couple_data" ON public.couple_data;

CREATE POLICY "Allow anonymous read and write to couple_data"
ON public.couple_data
FOR ALL
USING (true)
WITH CHECK (true);

-- 4. updated_at 자동 갱신 트리거 생성
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

-- ==============================================================================
-- 💥 기존 테스트 데이터 전체 초기화 (Supabase DB 초기화용)
-- 아래 구문을 실행하면 Supabase DB의 기존 테스트 데이터가 완전히 삭제됩니다.
-- ==============================================================================
TRUNCATE TABLE public.couple_data;
