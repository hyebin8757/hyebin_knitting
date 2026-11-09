-- ==============================================================================
-- 🧶 앉은누이 뜨개옷장 (혜빈이와 먼작콩 공방)
-- Supabase Database Schema & Tables
-- ==============================================================================

-- 1. 주문 테이블 (knitting_orders)
CREATE TABLE IF NOT EXISTS public.knitting_orders (
    id VARCHAR(100) PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    instagram_id VARCHAR(100) NOT NULL,
    buyer_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    shipping_id VARCHAR(50) NOT NULL,
    shipping_type VARCHAR(100) NOT NULL,
    shipping_cost INT NOT NULL DEFAULT 4000,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_product_amount INT NOT NULL DEFAULT 0,
    total_amount INT NOT NULL DEFAULT 0,
    depositor_name VARCHAR(100),
    memo TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, paid, making, shipping, completed, cancelled
    tracking_number VARCHAR(100),
    status_history JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 환불/취소 요청 테이블 (knitting_refunds)
CREATE TABLE IF NOT EXISTS public.knitting_refunds (
    id VARCHAR(100) PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    order_id VARCHAR(100) REFERENCES public.knitting_orders(id) ON DELETE CASCADE,
    buyer_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    amount INT NOT NULL,
    reason TEXT NOT NULL,
    refund_bank VARCHAR(100) NOT NULL,
    refund_account VARCHAR(100) NOT NULL,
    refund_holder VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'requested', -- requested, processing, completed, rejected
    admin_note TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 고객 의견 / 문의 테이블 (knitting_inquiries)
CREATE TABLE IF NOT EXISTS public.knitting_inquiries (
    id VARCHAR(100) PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    type VARCHAR(50) NOT NULL, -- 상품문의, 커스텀제작, 배송문의, 건의사항, 기타
    name VARCHAR(100) NOT NULL,
    contact VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'unread', -- unread, read, answered
    admin_reply TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 리뷰 테이블 (knitting_reviews)
CREATE TABLE IF NOT EXISTS public.knitting_reviews (
    id VARCHAR(100) PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    author VARCHAR(100) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    product_name VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    image TEXT,
    likes INT NOT NULL DEFAULT 0,
    is_verified BOOLEAN DEFAULT TRUE,
    is_visible BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 상점 및 카카오톡 알림 설정 테이블 (knitting_settings)
CREATE TABLE IF NOT EXISTS public.knitting_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'main_settings',
    bank_name VARCHAR(100) DEFAULT '카카오뱅크',
    account_number VARCHAR(100) DEFAULT '3333-12-8924018',
    account_holder VARCHAR(100) DEFAULT '전혜빈',
    sound_alert_enabled BOOLEAN DEFAULT TRUE,
    browser_notification_enabled BOOLEAN DEFAULT TRUE,
    kakao_alert_enabled BOOLEAN DEFAULT TRUE,
    kakao_access_token TEXT,
    kakao_js_key TEXT,
    kakao_notify_order BOOLEAN DEFAULT TRUE,
    kakao_notify_refund BOOLEAN DEFAULT TRUE,
    kakao_notify_review BOOLEAN DEFAULT TRUE,
    kakao_notify_inquiry BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책 설정 (누구나 주문 및 문의 등록 가능, 관리자 조회/수정)
ALTER TABLE public.knitting_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knitting_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knitting_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knitting_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knitting_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert and select knitting_orders" ON public.knitting_orders FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public insert and select knitting_refunds" ON public.knitting_refunds FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public insert and select knitting_inquiries" ON public.knitting_inquiries FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public insert and select knitting_reviews" ON public.knitting_reviews FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public select and update knitting_settings" ON public.knitting_settings FOR ALL TO public USING (true) WITH CHECK (true);
