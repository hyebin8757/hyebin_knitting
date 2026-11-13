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

-- 8. 사용자 팝업 모달 안내 설정 테이블 (knitting_popup_notice)
CREATE TABLE IF NOT EXISTS public.knitting_popup_notice (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'main_popup',
    is_active BOOLEAN DEFAULT TRUE,
    type VARCHAR(50) DEFAULT 'product',
    target_product_id VARCHAR(100) DEFAULT 'apple',
    badge_text VARCHAR(100) DEFAULT 'NEW 신상품 출시 안내',
    title VARCHAR(200) DEFAULT '2026 앉은누이 귀여운 신상 컬렉션 오픈!',
    content TEXT,
    image_url TEXT DEFAULT '/images/products/apple.jpg',
    is_always BOOLEAN DEFAULT TRUE,
    start_date VARCHAR(50) DEFAULT '2026-11-01T00:00',
    end_date VARCHAR(50) DEFAULT '2026-12-31T23:59',
    action_button_text VARCHAR(100) DEFAULT '신상품 바로 보러가기',
    show_action_button BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 🔒 RLS (Row Level Security) 설정 및 공개 권한 부여 정책
-- ==============================================================================
ALTER TABLE public.knitting_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knitting_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knitting_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knitting_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knitting_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knitting_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knitting_site_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knitting_popup_notice ENABLE ROW LEVEL SECURITY;

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

    DROP POLICY IF EXISTS "Public full access knitting_popup_notice" ON public.knitting_popup_notice;
    CREATE POLICY "Public full access knitting_popup_notice" ON public.knitting_popup_notice FOR ALL TO public USING (true) WITH CHECK (true);
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
-- 🌱 초기 기본 데이터 시드 (Initial Seed Data)
-- ==============================================================================

-- 1. 9종 기본 뜨개옷 상품 등록
INSERT INTO public.knitting_products (id, name, price, image, images, tag, badge_color, description, details, is_popular, order_num)
VALUES
(
    'apple',
    '사과',
    14000,
    '/images/products/apple.jpg',
    '["/images/products/apple.jpg", "/images/products/apple_devil.jpg"]'::jsonb,
    'BEST',
    '#ff4d6d',
    '새빨간 사과에 앙증맞은 꼭지와 초록 잎사귀가 포인트인 시그니처 뜨개 모자',
    '부드러운 면혼방사로 제작되어 인형 털 손상 없이 쏙 씌워집니다.',
    true,
    1
),
(
    'apple_devil',
    '사과 데빌 ver.',
    14000,
    '/images/products/apple_devil.jpg',
    '["/images/products/apple_devil.jpg", "/images/products/apple.jpg"]'::jsonb,
    'HOT',
    '#c9184a',
    '장난꾸러기 악마 뿔과 디테일 날개가 돋보이는 사과 데빌 에디션',
    '사과 모자에 깜찍한 뿔이 달려있어 할로윈이나 포인트 연출에 최고예요.',
    true,
    2
),
(
    'peach',
    '복숭아',
    14000,
    '/images/products/peach.jpg',
    '["/images/products/peach.jpg", "/images/products/peach_sailor.jpg"]'::jsonb,
    '인기',
    '#ff758f',
    '은은한 베이비 핑크빛 복숭아 모양 보닛과 앙증맞은 잎사귀 장식',
    '동글동글한 복숭아 라인이 얼굴을 더욱 사랑스럽고 화사하게 만들어줍니다.',
    true,
    3
),
(
    'peach_sailor',
    '복숭아 세라(파랑, 분홍) ver.',
    15000,
    '/images/products/peach_sailor.jpg',
    '["/images/products/peach_sailor.jpg", "/images/products/peach.jpg"]'::jsonb,
    '추천',
    '#59a5d8',
    '복숭아 모자에 청량한 세라복 카라가 함께 구성된 투피스 느낌의 세라 세트',
    '파랑 세라 / 분홍 세라 2가지 옵션으로 친구 인형과 트윈룩으로 입히기 좋아요.',
    true,
    4
),
(
    'lemon',
    '레몬',
    14000,
    '/images/products/lemon.jpg',
    '["/images/products/lemon.jpg"]'::jsonb,
    '상큼',
    '#ffb703',
    '보기만 해도 상큼해지는 레몬 옐로우 컬러와 싱그러운 나뭇잎 포인트',
    '화사하고 쨍한 색감이라 야외 출사 사진 찍을 때 특히 예쁘게 나옵니다.',
    false,
    5
),
(
    'strawberry',
    '딸기',
    14000,
    '/images/products/strawberry.jpg',
    '["/images/products/strawberry.jpg"]'::jsonb,
    'BEST',
    '#e63946',
    '달콤한 생크림 보닛 위에 콕 얹어진 탐스러운 빨간 딸기 모자',
    '새하얀 베이스와 선명한 딸기 오브제가 어우러져 어디서나 시선 집중!',
    true,
    6
),
(
    'rose_santa',
    '장미 산타 ver.',
    15000,
    '/images/products/rose_santa.jpg',
    '["/images/products/rose_santa.jpg", "/images/products/rose_bonnet.jpg"]'::jsonb,
    '시즌한정',
    '#a4161a',
    '고급스러운 딥와인 레드 컬러에 하얀 퐁퐁 방울이 달린 장미 산타 에디션',
    '겨울 시즌 감성을 가득 담아 연말 선물용으로 가장 사랑받는 디자인입니다.',
    false,
    7
),
(
    'rose_bonnet',
    '장미 기본/보닛 ver.',
    15000,
    '/images/products/rose_bonnet.jpg',
    '["/images/products/rose_bonnet.jpg", "/images/products/rose_santa.jpg"]'::jsonb,
    '우아',
    '#9d0208',
    '물결치는 프릴 디테일이 인형 얼굴을 폭 감싸주는 우아한 장미 보닛',
    '목 부분 리본을 살짝 묶어 사랑스럽게 착용하는 고풍스러운 보닛 스타일입니다.',
    false,
    8
),
(
    'acorn',
    '도토리 모자 세트',
    15000,
    '/images/products/acorn.jpg',
    '["/images/products/acorn.jpg"]'::jsonb,
    '세트할인',
    '#8b5a2b',
    '올망졸망 도토리 꼭지 베레모와 미니 도토리 크로스백 소품 세트',
    '모자뿐만 아니라 작은 손가방까지 한 세트로 제공되어 완성도 높은 코디 가능!',
    true,
    9
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    images = EXCLUDED.images,
    tag = EXCLUDED.tag,
    badge_color = EXCLUDED.badge_color,
    description = EXCLUDED.description,
    details = EXCLUDED.details,
    is_popular = EXCLUDED.is_popular,
    order_num = EXCLUDED.order_num;

-- 2. 상점 및 카카오톡 알림 초기 설정
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
    '카카오뱅크',
    '3333-12-8924018',
    '전혜빈'
) ON CONFLICT (id) DO NOTHING;

-- 3. 홈페이지 공지 & 주문안내 초기 문구
INSERT INTO public.knitting_site_notices (
    id, notice_content, shipping_content, caution_content, washing_content,
    shop_intro, instagram_id, making_period, courier_info
) VALUES (
    'main_notices',
    E'• 핸드메이드 특성상 개체마다 약간의 실밥이나 비대칭이 발생할 수 있습니다.\n• 주문 및 입금 확인 후 제작까지 약 3~7일 소요됩니다. (주문량 폭주 시 다소 지연될 수 있습니다.)\n• 주문 제작 특성상 제작 착수 후 단순 변심으로 인한 교환/환불은 불가합니다.',
    E'• 일반 택배 (CJ대한통운/한진택배): 4,000원 (제주 및 도서산간 5,000원)\n• GS25 반택 / CU 알뜰택배: 2,000원 (반드시 수령하실 편의점 지점명을 주소란에 기재해 주세요!)\n• 안전하고 꼼꼼하게 에어캡 포장하여 소중히 배송해 드립니다.',
    E'• 입금자와 주문자명이 다를 경우 메모란에 꼭 남겨주세요.\n• 주문서 작성 후 24시간 이내 미입금 시 주문이 자동 취소될 수 있습니다.\n• 맞춤 제작 문의나 긴급 요청사항은 인스타그램 DM(@hyebin_knit)으로 연락 부탁드립니다.',
    E'• 뜨개실은 물에 닿거나 비틀어 짜면 수축/늘어짐 현상이 발생할 수 있으니 세탁기 사용은 자제해 주세요.\n• 미온수에 중성세제(울샴푸)를 풀어 가볍게 조물조물 손세탁해 주세요.\n• 수건으로 물기를 가볍게 털어낸 후 그늘에서 자연 건조(타월 드라이)를 권장합니다.',
    '동글동글 귀여운 인형 친구들을 위한 사랑스러운 맞춤 뜨개옷 & 소품 공방입니다. 한 땀 한 땀 정성을 담아 제작하여 보내드립니다.',
    '@hyebin_knit',
    '입금 확인 후 약 3~7 영업일 소요',
    'CJ대한통운 / 우체국 / GS25·CU 편의점 택배'
) ON CONFLICT (id) DO NOTHING;

-- 4. 사용자 팝업 안내 초기 설정
INSERT INTO public.knitting_popup_notice (
    id, is_active, type, target_product_id, badge_text, title, content,
    image_url, is_always, start_date, end_date, action_button_text, show_action_button
) VALUES (
    'main_popup',
    true,
    'product',
    'apple',
    'NEW 신상품 출시 안내',
    '2026 앉은누이 귀여운 신상 컬렉션 오픈!',
    E'동글동글 귀여운 인형 친구들을 위한 맞춤 사과 뜨개옷이 새롭게 출시되었습니다!\n100% 핸드메이드 정성으로 한 땀 한 땀 제작되는 맞춤 뜨개옷을 지금 바로 주문서에서 만나보세요 ✨',
    '/images/products/apple.jpg',
    true,
    '2026-11-01T00:00',
    '2026-12-31T23:59',
    '신상품 바로 보러가기',
    true
) ON CONFLICT (id) DO NOTHING;
