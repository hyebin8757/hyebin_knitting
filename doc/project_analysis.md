# 프로젝트 분석 문서: 민우주 포트폴리오 (min_portfolio)

## 1. 프로젝트 개요
**min_portfolio**는 Nuxt 3와 Vue 3를 기반으로 구축된 프론트엔드 포트폴리오 웹 애플리케이션입니다. 사용자 인터페이스 구성을 위해 TailwindCSS와 Vuetify를 혼합하여 사용하고 있으며, 상태 관리를 위해 Pinia를 채택한 현대적인 기술 스택의 프로젝트입니다. 데스크톱 앱 빌드를 위한 Electron 환경도 함께 구성되어 있는 것이 특징입니다.

---

## 2. 소프트웨어 설계 패턴 및 아키텍처

이 프로젝트는 단순히 라이브러리의 모음이 아니라, 프론트엔드 생태계에서 널리 쓰이는 강력한 설계 패턴들이 유기적으로 적용되어 있습니다.

### 2.1 아토믹 디자인 (Atomic Design) 기반의 컴포넌트 모듈화
UI를 원자(Atom) 단위부터 복합체 단위로 확장해 나가는 아토믹 디자인 철학을 프로젝트 맞춤형으로 변형하여 적용했습니다.
*   **Atoms (`components/base/`)**: 버튼(`btn`), 알럿(`alert`), 다이얼로그(`dialog`), 슬라이더(`swiper`) 등 단독으로 쓰이지 않는 가장 기초적인 조립형 컴포넌트들을 분리했습니다.
*   **Molecules & Organisms (`components/` 하위 폴더들)**: `buttonGroup`, `header`, `sidebar`, `portfolioMenuItem` 등 base 컴포넌트들을 조합하여 만든 복합 블록(Block) 컴포넌트들입니다.
*   **명명 규칙 (Naming Convention)**:
    *   **`The` 접두사**: `TheHeader`, `TheSidebar`처럼 페이지 내에서 단 한 번만 사용되는 싱글턴(Singleton) 성격의 모듈에 사용합니다.
    *   **`View` 접두사**: 조립하여 사용할 수 있는 뷰 컴포넌트에 사용합니다.
    *   **`~Props` 접미사**: 컴포넌트의 Props 타입 정의 시 반드시 `Props`라는 접미사를 붙이도록 강제하여 타입 구조를 명확히 합니다.

### 2.2 파일 기반 라우팅 아키텍처 (File-based Routing)
Nuxt 3의 핵심 아키텍처를 활용하여 라우팅 보일러플레이트 코드를 제거했습니다.
*   `pages/` 디렉터리 하위에 `about`, `contact`, `login`, `project` 등의 폴더를 배치하여, 디렉터리 구조 자체가 웹사이트의 URL 주소가 되도록 직관적으로 설계되었습니다.

### 2.3 유틸리티 퍼스트 (Utility-First) & 네임스페이스 패턴
스타일 충돌을 막고 퍼블리싱 속도를 극대화하기 위한 패턴입니다.
*   **네임스페이스 패턴 (Namespace)**: TailwindCSS를 사용하되, 다른 UI 프레임워크(Vuetify)와의 클래스명 간섭을 원천 차단하기 위해 모든 유틸리티 클래스에 `tw-` 접두사(Prefix)를 강제했습니다.
*   **디자인 토큰화 (Tokenization)**: `tailwind.config.js`에서 `1rem = 10px`로 기준 단위를 재정의하여, 디자이너의 시안 수치를 퍼블리셔가 계산 없이 직관적으로 입력할 수 있도록 토큰화 기법이 적용되어 있습니다.

### 2.4 Flux 아키텍처 기반 상태 관리
단방향 데이터 흐름(One-way Data Flow)을 강제하여 상태 변화를 예측 가능하게 합니다.
*   **중앙 집중식 저장소**: 컴포넌트 간 복잡한 Props/Emit 전달을 피하고, Pinia를 통해 `stores/` 폴더에서 전역 상태를 관리합니다.
*   **영속성 (Persistence) 패턴**: `@pinia-plugin-persistedstate/nuxt` 플러그인을 결합하여, 스토어의 데이터가 브라우저 스토리지(LocalStorage 등)와 자동 동기화되도록 설계되었습니다.

---

## 3. 주요 기술 스택 (Tech Stack)

### 3.1 코어 프레임워크 및 언어
*   **Nuxt 3 (3.1.2)**: `ssr: false`로 설정되어 클라이언트 사이드 렌더링 기반 SPA/정적 사이트 형태로 구성.
*   **Vue 3 (3.2.47)**: Composition API 기반의 메인 프레임워크.
*   **TypeScript (4.9.4)**: 정적 타입 시스템 도입.

### 3.2 스타일링 및 UI
*   **TailwindCSS (3.4.3)**: `tw-` 접두사와 커스텀 단위가 적용된 유틸리티 CSS.
*   **Vuetify (3.1.0)**: 머티리얼 디자인 기반 컴포넌트 프레임워크.
*   **Emotion**: CSS-in-JS 라이브러리 (`@emotion/*`, `vue-emotion` 포함).
*   **Swiper (11.1.8)**: 슬라이더/캐러셀 UI 구현.

### 3.3 기타 도구 및 빌드 환경
*   **상태 관리 및 유틸리티**: Pinia, VueUse(`@vueuse/core`), Lodash.
*   **데이터 제어**: Crypto-JS (암호화/해싱), JS-Cookie (쿠키 제어).
*   **데스크톱 패키징 (Electron)**: `nuxt-electron`, `electron-builder`를 통해 웹을 데스크톱 앱(.exe, .dmg)으로 빌드할 수 있는 환경 구성.
*   **테스트 및 린팅**: Jest (`vue3-jest`, `ts-jest`), ESLint, Prettier.
