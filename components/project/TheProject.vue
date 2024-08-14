<script setup lang="ts">
import {onMounted, reactive, ref} from "vue";
import { cx } from "@emotion/css";
import { useUtil } from "~/utils/useUtil";
import { SwiperSlide } from 'swiper/vue';
import ProjectCard from "~/components/project/card/ProjectCard.vue";
import { ProjectList } from "~/types/site/components/project";
import { TabMenuList } from "~/types/site/components/tabMenuList";
import { ProjectStyle } from "~/components/project/style/ProjectStyle";

const { useImage } = useUtil.AssetResolverUtil;
const { isEmpty } = useUtil.typeValidation;


/************************************************************
 * Props
 ************************************************************/

/************************************************************
 * Emit
 ************************************************************/

/************************************************************
 * Data ( ref, reactive, computed... )
 ************************************************************/
const projectData = reactive<{
  tabList : TabMenuList[],
  mainProjectList : ProjectList[];
  newCreationProjectList : ProjectList[];
  renewalProjectList : ProjectList[];
}>({
  tabList : [
    {
      title : "MainProject.ts",
      imgSrc : "/assets/images/icon/icon_ts.svg",
      value : "one",
    },
    {
      title : "NewProject.json",
      imgSrc : "/assets/images/icon/icon_json.svg",
      value : "two",
    },
    {
      title : "RenewalProject.lock",
      imgSrc : "/assets/images/icon/icon_lock.svg",
      value : "three",
    },
  ],

  mainProjectList : [
    {
      title : `리마커블소프트 UI 프레임워크`,
      content : "프레임 워크 제작",
      path : "",
      imgSrc : "/assets/images/project/main/main_ui.png",
      localImg : true,
      isSecurity : true,
      tag : "#Vue3, #Nuxt3, #TypeScript, #EmotionCss, #Tailwindcss, #Vuetify",
      workList :`
        <li>- Vuetify 를 이용한 컴포넌트 제작 ( base, block, view 등 )</li>
        <li>- EmotionCss 및 Tailwindcss 이용한 재사용 가능한 스타일 및 UI Util 생성</li>
        <li>- 프로젝트 생성 및 개발 작업 생산성 향상</li>
      `
    },
    {
      title : "단축 URL",
      content : "긴 인터넷 주소를 짧게 줄인 단축 URL 또는 QR코드 전달 시스템",
      path : "",
      imgSrc : "https://www.remarkablesoft.com/_nuxt/bg_shorturl.0faabc5a.png",
      tag : "#Vue3, #Nuxt3, #TypeScript, #EmotionCss, #Vuetify",
      workList :`
        <li>- SFC 프로젝트 구조 설계 및 프론트엔드 개발 설계</li>
        <li>- 자체 제작한 UI 프레임워크 와 TypeScript 를 이용한 컴포넌트 생성</li>
        <li>- EmotionCss 이용한 UI Util 개발 생성 및 적용</li>
        <li>- 동적 UI 개발 ( Dom 조작 및 Scroll 등 )</li>
      `
    },
    {
      title : "리마커블소프트 홈페이지",
      content : "회사 소개 시스템",
      path : "",
      imgSrc : "/assets/images/project/main/main_home.png",
      localImg : true,
      tag : "#Vue3, #Nuxt3, #TypeScript, #Scss, #Storybook, #Vuetify",
      workList :`
        <li>- 첫 Vue3 Setup 이용한 SFC 프로젝트 구조 설계 및 프론트엔드 개발 설계</li>
        <li>- StoryBook 을 이용한 컴포넌트 사용 방법 설정 및 확인</li>
        <li>- 반응형 사용자 웹 /앱 화면 및 관리자 화면 퍼블리싱</li>
      `
    },
    {
      title : "GW 노트+",
      content : "에디터 시스템",
      path : "",
      imgSrc : "https://www.remarkablesoft.com/_nuxt/bg_vacancy.da56c3a3.png",
      tag : "#Vue2, #Nuxt2, #Vue3, #Nuxt3, #Javascript, #TypeScript, #Scss, #Vuetify",
      workList :`
        <li>- JavaScript와 CSS를 이용한 텍스트 에디터 색상 커스터마이징 기능 개발</li>
        <li>- Vue2에서 Vue3를 이용한 SPA 구조 마이그레이션 설계 및 퍼블리싱</li>
        <li>- 반응형 웹 / 앱 화면 다크모드 인터페이스 퍼블리싱</li>
      `
    },
    {
      title : `강원특별자치도교육청교육과학정보원`,
      content : "강원특별자치도교육청 홈페이지 통합관리 시스템",
      path : "",
      imgSrc : "/assets/images/project/main/main_integration.png",
      localImg : true,
      tag : "#Vue2, #Nuxt2, #Scss, #Element-Ui",
      workList :`
        <li>- Css 에서 Scss 를 이용한 스타일 마이그레이션 설계 및 기준 생성</li>
        <li>- CMS 구조 설계 및 퍼블리싱</li>
        <li>- 반응형 사용자 웹 / 앱 화면 및 관리자 화면 퍼블리싱</li>
        <li>- 지속적인 유지 보수</li>
      `
    },
  ],

  newCreationProjectList : [
    {
      title : "차놀자 파트너스",
      content : "렌트가 CMS",
      path : "",
      imgSrc : "/assets/images/project/new/new_car.png",
      localImg : true,
      isSecurity : true,
      tag : "#Vue2, #Nuxt2, #Javascript, #Scss, #Vuetify",
    },
    {
      title : `Kcc Glass VMS 방문자<br>출입시스템`,
      content : "방문자 출입 관리 CMS",
      path : "",
      imgSrc : "/assets/images/project/new/new_kcc.png",
      localImg : true,
      isSecurity : true,
      tag : "#Vue2, #Nuxt2, #Scss, #Element-Ui",
    },
    {
      title : "온라인 참가 신청",
      content : "행사 / 모임 참가 신청 관리 및 참가자 데이터 수집 및 분석 시스템",
      path : "",
      imgSrc : "https://www.remarkablesoft.com/_nuxt/online_request_manager_01.00d8df9e.png",
      tag : "#Vue2, #Nuxt2, #Javascript, #Scss, #Vuetify",
    },
    {
      title : "온라인 심사 시스템",
      content : "대회, 선발 등 공정한 심사를 위한 온라인 심사 시스템",
      path : "",
      imgSrc : "https://www.remarkablesoft.com/_nuxt/online_contest_manager_01.ce4ffb64.png",
      tag : "#Vue2, #Nuxt2, #Javascript, #Scss, #Vuetify",
    },
    {
      title : "IDX 협업 지원 센터",
      content : "회사소개 시스템",
      path : "",
      imgSrc : "/assets/images/project/new/new_idx.png",
      localImg : true,
      tag : "#Html, #Css, #Jquery",
    },
    {
      title : `강원 보결전담강사 예약<br>시스템`,
      content : "검증된 대체 강사의 예약을 위한 예약 시스템",
      path : "",
      imgSrc : "https://www.remarkablesoft.com/_nuxt/bg_vacancy.da56c3a3.png",
      tag : "#Vue2, #Nuxt2, #Scss, #Element-Ui",
    },
    {
      title : `강원유아교육진흥원<br>( 모바일 앱 )`,
      content : "유아들의 체험활동 관리 CMS",
      path : "",
      imgSrc : "/assets/images/project/new/new_playnote.png",
      localImg : true,
      isSecurity : true,
      tag : "#Vue2, #Nuxt2, #Scss, #Element-Ui",
    },
  ],

  renewalProjectList: [
    {
      title : "원격 교육 연수원",
      content : "교육의 질적 향상과 발전을 위한 교직원 연수 시스템",
      path : "",
      imgSrc : "https://www.remarkablesoft.com/_nuxt/lms_user_01.fc18ae22.png",
    },
    {
      title : "블렌디드 러닝 연수<br>시스템",
      content : "교육의 질적 향상과 발전을 위한 교직원 연수 시스템",
      path : "",
      imgSrc : "/assets/images/project/renewal/renewal_blended.png",
      localImg : true,
    },
    {
      title : "전자책 출판 시스템",
      content : "다양한 문서를 전자책으로 변환할 수 있는 전자책 시스템",
      path : "",
      imgSrc : "https://www.remarkablesoft.com/_nuxt/bg_ebook.23d1bcb3.png",
    },
    {
      title : "수리과학 정보 체험 센터",
      content : "교육 예약 및 수강 관리를 위한 온라인 예약 관리 시스템",
      path : "",
      imgSrc : "https://www.remarkablesoft.com/_nuxt/mathsciences_user_01.1cd1c916.png",
    },
    {
      title : "설문",
      content : "설문지 작성 및 결과 분석 가능한 설문조사 통합 관리 시스템",
      path : "",
      imgSrc : "https://www.remarkablesoft.com/_nuxt/bg_survey.2842ad93.png",
    },
  ],
});

const projectBooleanData = reactive( {
  isAlert : false
} );

const tab = ref( "one" );
const detailProjectItem = ref<ProjectList | {}>({});

/************************************************************
 * Function
 ************************************************************/
const setDetailProjectItem = ( item : ProjectList ) => {
  if ( isEmpty( item ) ) {
    return;
  }

  detailProjectItem.value = item;
}

const movePage = ( path: string, security? : boolean ) => {
  if ( security ) {
    projectBooleanData.isAlert = security

    return;
  }

  // window.open( path );
}

const onAlertToggle = ( value : boolean ) => {
  projectBooleanData.isAlert = value;
}


/************************************************************
 * Watch & Mounted
 ************************************************************/
onMounted(() => {
  detailProjectItem.value = projectData.mainProjectList[0];
});

</script>
<template>
  <div :class="cx( ProjectStyle.Default )">

    <v-tabs :class="cx( ProjectStyle.Tab )" v-model="tab">
      <v-tab
          v-for="( item, index ) in projectData.tabList"
          :key="index"
          :value="item.value"
      >
        <img :src="useImage( item.imgSrc )" alt="icon">
        <span v-text="item.title"></span>
        <span class="material-icons">close</span>
      </v-tab>
    </v-tabs>

    <v-card-text :class="cx( ProjectStyle.CardTextBox )">
      <v-tabs-window v-model="tab">
        <v-tabs-window-item value="one">
          <div :class="cx( 'project-item', ProjectStyle.ProjectItem )">
            <div :class="cx( ProjectStyle.ProjectTitle )">
              <h2>Main Project 😄</h2>
            </div>
            <div :class="cx( ProjectStyle.CardWrapper )">
              <div ref="centralContainer" :class="cx('central-container', 'central-1', ProjectStyle.CentralContainer )"></div>

              <div :class="cx( ProjectStyle.CardList )">
                <ProjectCard
                    v-for="( item, index ) in projectData.mainProjectList"
                    :key="index"
                    :title="item.title"
                    :content="item.content"
                    :img-src="item.imgSrc"
                    :tag="item.tag"
                    :work-list="item.workList"
                    :path="item.path"
                    :local-img="item.localImg"
                    :is-security="item.isSecurity"
                    :is-work-btn="true"
                    @on-click="moveCard( index )"
                />
              </div>
            </div>
          </div>
        </v-tabs-window-item>

        <v-tabs-window-item value="two">
          <div :class="cx( 'project-item', ProjectStyle.ProjectItem )">
            <div :class="cx( ProjectStyle.ProjectTitle )">
              <h2>New Project 🤩 {{tab}}</h2>
            </div>
            <div :class="cx( ProjectStyle.CardWrapper )">
              <BaseSwiper>
                <template #slide>
                  <swiper-slide
                      v-for="( item, index ) in projectData.newCreationProjectList"
                      :key="index"
                  >
                    <ProjectCard
                        :title="item.title"
                        :content="item.content"
                        :img-src="item.imgSrc"
                        :tag="item.tag"
                        :path="item.path"
                        :local-img="item.localImg"
                        :is-security="item.isSecurity"
                    />
                  </swiper-slide>
                </template>
              </BaseSwiper>
            </div>
          </div>
        </v-tabs-window-item>

        <v-tabs-window-item value="three">
          <div :class="cx( 'project-item', ProjectStyle.ProjectItem )">
            <div :class="cx( ProjectStyle.ProjectTitle )">
              <h2>Renewal Project 🤔</h2>
            </div>
            <div :class="cx( ProjectStyle.CardWrapper )">
              <BaseSwiper>
                <template #slide>
                  <swiper-slide
                      v-for="( item, index ) in projectData.renewalProjectList"
                      :key="index"
                  >
                    <ProjectCard
                        :title="item.title"
                        :content="item.content"
                        :img-src="item.imgSrc"
                        :path="item.path"
                        :local-img="item.localImg"
                        :is-security="item.isSecurity"
                    />
                  </swiper-slide>
                </template>
              </BaseSwiper>
            </div>
          </div>
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card-text>

    <BaseAlert
        v-if="detailProjectItem.isSecurity && projectBooleanData.isAlert"
        title="안내"
        text="보안상 이유로 이동되지 않습니다."
        :is-footer="false"
        @on-alert="onAlertToggle"
    />
  </div>
</template>

<style lang="scss"></style>