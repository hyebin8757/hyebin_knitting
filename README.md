# Nuxt3 + Typescript 시작하는 방법

* 설치시 에러 관련 :
error lru-cache@8.0.5: The engine "node" is incompatible with this module. Expected version ">=16.14". Got "14.18.0"
error Found incompatible module.
노드 버전 16.14 이상 사용 하세요~!

1. Typescript를 사용할 경우 Nuxt에서 사용하는 Type을 모두 Build 해야한다.
    - 아래 명령어롤 입력해서 사용한다.
   ```shell
    npm run prepare
    ```
    - `<rootDir>/.nuxt` 디렉토리 하위에 타입 설정과 `tsconfig.json`이 생성되면 준비 완료
    - 이 설정을 `<rootDir>/tsconfig.json`의 extends 옵션으로 끌어올려야 함
2. Nuxt를 실행한다
   ```shell
    npm run dev
   ```

---

# Nuxt 3 사용 방법

[Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction)를 참고할 것

## 시작하기

1. Dependency를 설치한다 : yarn 사용

   ```bash
   # yarn
   yarn install
   ```
2. `.nuxt`로 타입이 들어오지 않았다면 먼저 Nuxt의 타입 설정을 설치한다.

   ```bash
   # yarn
   yarn run prepare
   ```

3. 개발 서버

   http://localhost:3000로 개발 서버 시작

   ```bash
   yarn run dev
   ```

# 배포

실제 운영에 배포하는 방법:

1. static 경로를 확인 : default 설정은 `../src/main/resources/static`

> 파일 build 경로는 `nuxt.config.ts` -> nitro 설정으로 사용

   ```bash
   yarn run gen
   ```

[deployment documentation](https://nuxt.com/docs/getting-started/deployment)에서 추가 정보 확인

---

# Typescript 설정 설명

## 1. extends

- 다른 구성 파일에 대한 경로
- 기본 파일이 로드된 후 extends의 상속 파일이 재구성 됨
- glob 패턴으로 사용

## 2. compilerOptions

- 컴파일러 설정
    1. include : 컴파일할 파일 경로 설정
    2. path : 특정한 모듈 이름을 지정했을 때 컴파일러가 어디서 부터 모듈을 탐색해야 할 지를 지정할 수 있는 매퍼
        - Intellij에서 import할 때 `~`,`@` 같은 alias를 사용하기 위해서 설정

---

## FrontEnd

- 현재 type 을 분리하는 것은 vue3 에서 지원하지 않습니다
- https://github.com/vuejs/core/issues/4294
- 추후 지원하게되면 추가하도록하겠습니다

[//]: # (- type 들은 전부 types 로 분리 하도록합니다)

[//]: # (  - types 안 디렉터리 구조는 모듈 디렉터리 구조와 동일하도록 작성합니다)

- props type 들은 suffix 로 반드시 Props 를 작성합니다

````
components/
|
|
|– ui/
|   |
|   |– base/                    # 단독으로 쓰이지 않는 조립형 컴포넌트들
|   |
|   |– block/                   # 조립되어 view 및 site 에서 이용할 수 있는 block 들입니다
|
|
|– site/                        # 해당 site 에 해당하는 component 들이 들어갑니다 
|                               # prefix 로 The 가 붙은 .vue 파일이 하나의 모듈입니다

````

## Storybook

- storybook port 는 앞에 60 포트를 사용합니다