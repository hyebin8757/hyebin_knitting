-- ==============================================================================
-- 🧶 앉은누이 뜨개옷장 (혜빈이와 먼작콩 공방)
-- Supabase Production Database Schema & Initial Seed Data
-- 프로젝트: hyebin8757의 프로젝트 (taxlvyiijpanfzwrmuih)
-- ==============================================================================

-- 1. 상품 카탈로그 테이블 (knitting_products)
CREATE TABLE IF NOT EXISTS public.knitting_products (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price INT NOT NULL DEFAULT 0,
    image TEXT NOT NULL,
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    tag VARCHAR(50) DEFAULT 'BEST',
    badge_color VARCHAR(50) DEFAULT '#ff4d6d',
    description TEXT,
    details TEXT,
    options JSONB DEFAULT '[]'::jsonb,
    is_popular BOOLEAN DEFAULT false,
    order_num INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 고객 주문서 테이블 (knitting_orders)
CREATE TABLE IF NOT EXISTS public.knitting_orders (
    id VARCHAR(100) PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_at_timestamp BIGINT,
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
    custom_image TEXT,
    admin_notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 환불/취소 요청 테이블 (knitting_refunds)
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

-- 4. 고객 문의 / 의견 테이블 (knitting_inquiries)
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

-- 5. 구매자 포토 후기 테이블 (knitting_reviews)
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

-- 6. 상점 및 카카오톡 알림 설정 테이블 (knitting_settings)
CREATE TABLE IF NOT EXISTS public.knitting_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'main_settings',
    admin_password VARCHAR(100) DEFAULT 'admin1234',
    sound_alert_enabled BOOLEAN DEFAULT TRUE,
    browser_notification_enabled BOOLEAN DEFAULT TRUE,
    kakao_alert_enabled BOOLEAN DEFAULT TRUE,
    kakao_access_token TEXT DEFAULT '',
    kakao_js_key TEXT DEFAULT '539e6a00f074d209172922dd81d3f9b2',
    kakao_notify_order BOOLEAN DEFAULT TRUE,
    kakao_notify_refund BOOLEAN DEFAULT TRUE,
    kakao_notify_review BOOLEAN DEFAULT TRUE,
    kakao_notify_inquiry BOOLEAN DEFAULT TRUE,
    bank_name VARCHAR(100) DEFAULT '카카오뱅크',
    account_number VARCHAR(100) DEFAULT '3333-12-8924018',
    account_holder VARCHAR(100) DEFAULT '전혜빈',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. 홈페이지 및 주문서 공지 문구 관리 테이블 (knitting_site_notices)
CREATE TABLE IF NOT EXISTS public.knitting_site_notices (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'main_notices',
    notice_content TEXT,
    shipping_content TEXT,
    caution_content TEXT,
    washing_content TEXT,
    shop_intro TEXT,
    instagram_id VARCHAR(100) DEFAULT '@hyebin_knit',
    making_period VARCHAR(100) DEFAULT '입금 확인 후 약 3~7 영업일 소요',
    courier_info VARCHAR(100) DEFAULT 'CJ대한통운 / 우체국 / GS25·CU 편의점 택배',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 🔒 RLS (Row Level Security) 설정 및 공개 권한 부여 정책
-- ==============================================================================
ALTER TABLE public.knitting_products ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.knitting_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knitting_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knitting_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knitting_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knitting_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knitting_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knitting_site_notices ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Public full access knitting_products" ON public.knitting_products;
    CREATE POLICY "Public full access knitting_products" ON public.knitting_products FOR ALL TO public USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public full access knitting_orders" ON public.knitting_orders;
    CREATE POLICY "Public full access knitting_orders" ON public.knitting_orders FOR ALL TO public USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public full access knitting_refunds" ON public.knitting_refunds;
    CREATE POLICY "Public full access knitting_refunds" ON public.knitting_refunds FOR ALL TO public USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public full access knitting_inquiries" ON public.knitting_inquiries;
    CREATE POLICY "Public full access knitting_inquiries" ON public.knitting_inquiries FOR ALL TO public USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public full access knitting_reviews" ON public.knitting_reviews;
    CREATE POLICY "Public full access knitting_reviews" ON public.knitting_reviews FOR ALL TO public USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public full access knitting_settings" ON public.knitting_settings;
    CREATE POLICY "Public full access knitting_settings" ON public.knitting_settings FOR ALL TO public USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public full access knitting_site_notices" ON public.knitting_site_notices;
    CREATE POLICY "Public full access knitting_site_notices" ON public.knitting_site_notices FOR ALL TO public USING (true) WITH CHECK (true);
END $$;

-- ==============================================================================
-- ⚡ 실시간 변경 감지 (Supabase Realtime) 등록
-- ==============================================================================
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.knitting_orders;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.knitting_refunds;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.knitting_inquiries;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.knitting_reviews;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- ==============================================================================
-- 📁 사진 파일 업로드용 Storage 버킷 생성 및 공개 정책
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('knitting_images', 'knitting_images', true)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Public Access to knitting_images" ON storage.objects;
    CREATE POLICY "Public Access to knitting_images" ON storage.objects
        FOR ALL TO public USING (bucket_id = 'knitting_images') WITH CHECK (bucket_id = 'knitting_images');
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- ==============================================================================
-- 🗑️ 팝업 관련 테이블 영구 삭제 & 불필요한 상품 정리
-- ==============================================================================
DROP TABLE IF EXISTS public.knitting_popup_notice CASCADE;

-- 사용자가 관리자에서 삭제했던 상품이 재등록되지 않도록 명시적 정리
DELETE FROM public.knitting_products WHERE id IN ('apple_devil', 'peach_sailor');

-- ==============================================================================
-- ⚙️ 상점 및 카카오톡 알림 초기 설정 (이미 존재하는 경우 덮어쓰지 않음)
-- ==============================================================================
INSERT INTO public.knitting_settings (
    id, admin_password, sound_alert_enabled, browser_notification_enabled,
    kakao_alert_enabled, kakao_access_token, kakao_js_key,
    kakao_notify_order, kakao_notify_refund, kakao_notify_review, kakao_notify_inquiry,
    bank_name, account_number, account_holder
) VALUES (
    'main_settings',
    'admin1234',
    true,
    true,
    true,
    '',
    '539e6a00f074d209172922dd81d3f9b2',
    true,
    true,
    true,
    true,
    '케이뱅크',
    '100-136-220182',
    '노혜빈'
) ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 📢 홈페이지 공지 & 주문안내 초기 문구 (이미 존재하는 경우 덮어쓰지 않음)
-- ==============================================================================
INSERT INTO public.knitting_site_notices (
    id, notice_content, shipping_content, caution_content, washing_content,
    shop_intro, instagram_id, making_period, courier_info
) VALUES (
    'main_notices',
    E'• 핸드메이드 특성상 개체마다 약간의 실밥이나 비대칭이 발생할 수 있으며, 샘플사진과 상이할 수 있는 점 참고 부탁드립니다.\n• 제작 후 완성품 사진을 배송 전에 DM으로 보내드립니다.\n• 최대한 꼼꼼하고 정성스럽게 만들려고 노력하고 있습니다.',
    E'• 일반택배 : 4,100원\n• 일반택배(인천지역) : 3,600원\n• 반값택배(CU) : 2,000원 (반드시 수령하실 편의점 점포명과 점포주소를 주소란에 기재해 주세요!)',
    E'• 입금자와 주문자명이 다를 경우 메모란에 꼭 남겨주세요.\n• 주문 제작 특성상 제작 착수 후 단순 변심으로 인한 교환/환불은 불가하며, 제품에 문제가 있는 경우 DM으로 문의 부탁드립니다.\n• 핸드메이드 특성상 발생하는 매듭이나 실 정리 자국, 개체간 미세한 크기, 모양 등은 불량이 아니오니 참고 바랍니다.',
    E'• 소품실로 만든 뜨개제품이기에 가급적 세탁은 지양하오나, 세탁이 필요할 경우 너무 힘을 가하지 않고 울샴푸를 푼 물에 살살 조물조물 짧게 세탁 하시는 것을 권장드립니다.\n• 세탁 후 편물 사이즈가 줄어들 수 있다는 점 참고 바랍니다.\n• 수건으로 물기를 가볍게 털어낸 후 그늘에서 자연 건조(타월 드라이)를 권장합니다.',
    E'치이카와 앉은누이 인형 전용 뜨개상점입니다. (인형은 판매하지 않습니다.)\n소중한 우리 아이들에게 귀여운 옷을 선물해 주세요!\n한 땀 한 땀 정성을 담아 제작하여 보내드립니다.',
    '@meonjakong',
    '입금 확인 후 약 2~3 영업일 소요(주문량 많을 시 시간소요 개별안내)',
    '롯데택배 / 우체국 / CU 편의점택배'
) ON CONFLICT (id) DO NOTHING;
