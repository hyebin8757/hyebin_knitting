<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { cx } from "@emotion/css";
import { definePageMeta } from "~/.nuxt/imports";

/************************************************************
 * Components
 ************************************************************/
import { SwiperSlide } from "swiper/vue";
import ProjectCard from "~/components/project/card/ProjectCard.vue";

/************************************************************
 * Style
 ************************************************************/
import { ProjectStyle } from "~/assets/style/pages/ProjectStyle";

/************************************************************
 * Util, Constants...
 ************************************************************/
import { useUtil } from "~/utils/useUtil";

/************************************************************
 * Types, Interface
 ************************************************************/
import { ProjectList } from "~/types/site/components/project";
import { TabMenuList } from "~/types/site/components/tabMenuList";

/************************************************************
 * External Dependencies ( 외부 종속성 )
 ************************************************************/
const { isEmpty } = useUtil.typeValidation;
const { useImage } = useUtil.AssetResolverUtil;

/************************************************************
 * Props
 ************************************************************/

/************************************************************
 * Emit
 ************************************************************/

/************************************************************
 * Raw Data ( 원시 데이터 )
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
      service : "프레임 워크 제작",
      path : "",
      imgSrc : "/assets/images/project/main/main_ui.png",
      localImg : true,
      isBest : true,
      isSecurity : true,
      tagList : [
        {
          name : "Vue3",
        },
        {
          name : "Nuxt3",
        },
        {
          name : "TypeScript",
        },
        {
          name : "EmotionCss",
        },
        {
          name : "Tailwindcss",
        },
        {
          name : "Vuetify",
        },
      ] ,
      workList : [
        {
          text : "Vuetify 를 이용한 컴포넌트 제작 ( base, block, view 등 )"
        },
        {
          text : "EmotionCss 및 Tailwindcss 이용한 재사용 가능한 스타일 및 UI Util 생성"
        },
        {
          text : "프로젝트 스타일 작업 기준 적용 및 프로젝트 생성 개발 시간 단축 업무 생산성 향상"
        },
      ],
    },
    {
      title : "단축 URL",
      service : `긴 인터넷 주소를 짧게 줄인 단축 URL 또는 <br> QR코드 전달 시스템`,
      path : "",
      imgSrc : "/assets/images/project/main/main_url.png",
      isBest : true,
      tagList : [
        {
          name : "Vue3",
        },
        {
          name : "Nuxt3",
        },
        {
          name : "TypeScript",
        },
        {
          name : "EmotionCss",
        },
        {
          name : "Vuetify",
        },
      ] ,
      workList : [
        {
          text : "SFC 프로젝트 구조 설계 및 프론트엔드 개발 설계",
        },
        {
          text : "자체 제작한 UI 프레임워크 와 TypeScript 를 이용한 컴포넌트 생성",
        },
        {
          text : "Tree 구조 Sidebar 컴포넌트 공통화 생성 및 개발",
        },
        {
          text : "EmotionCss 이용한 UI Util 개발 생성 및 적용",
        },
        {
          text : "JavaScript 와 TypeScript 을 활용한 동적 UI 개발 ( Dom 조작 및 Scroll 등 )",
        },
      ],
    },
    {
      title : 'KCC 글라스 자동 배포 시스템',
      service : "KCC 글라스 자사 프로젝트 자동배포 관리 시스템",
      path : "",
      imgSrc : "/assets/images/project/main/main_auto.png",
      isBest : true,
      localImg : true,
      tagList : [
        {
          name : "Vue3",
        },
        {
          name : "Nuxt3",
        },
        {
          name : "TypeScript",
        },
        {
          name : "Scss",
        },
        {
          name : "Vuetify",
        },
      ] ,
      workList : [
        {
          text : "Vue3 Setup 이용한 SFC 프로젝트 구조 설계 및 프론트엔드 개발 설계 고도화",
        },
        {
          text : "사용자 친화적 UI / UX 기획",
        },
        {
          text : "CMS 구조 고도화",
        },
        {
          text : "JavaScript 와 TypeScript 을 활용한 동적 UI 개발",
        },
      ],
    },
    {
      title : "리마커블소프트 홈페이지",
      service : "회사 소개 시스템",
      path : "",
      imgSrc : "/assets/images/project/main/main_home.png",
      localImg : true,
      tagList : [
        {
          name : "Vue3",
        },
        {
          name : "Nuxt3",
        },
        {
          name : "TypeScript",
        },
        {
          name : "Scss",
        },
        {
          name : "Storybook",
        },
        {
          name : "Vuetify",
        },
      ] ,
      workList : [
        {
          text : "첫 Vue3 Setup 이용한 SFC 프로젝트 구조 설계 및 프론트엔드 개발 설계",
        },
        {
          text : "StoryBook 을 이용한 컴포넌트 사용 방법 설정 및 확인",
        },
        {
          text : "반응형 사용자 웹 / 앱 화면 및 관리자 화면 퍼블리싱",
        },
      ],
    },
    {
      title : "GW 노트+",
      service : "에디터 시스템",
      path : "",
      imgSrc : "/assets/images/project/main/main_note.png",
      tagList : [
        {
          name : "Vue2",
        },
        {
          name : "Vue3",
        },
        {
          name : "Nuxt2",
        },
        {
          name : "Nuxt3",
        },
        {
          name : "Javascript",
        },
        {
          name : "TypeScript",
        },
        {
          name : "Scss",
        },
        {
          name : "Vuetify",
        },
      ] ,
      workList : [
        {
          text : "JavaScript 와 CSS 를 이용한 텍스트 에디터 색상 커스터마이징 기능 개발",
        },
        {
          text : "Vue2에서 Vue3를 이용한 SPA 구조 마이그레이션 설계 및 퍼블리싱",
        },
        {
          text : "반응형 웹 / 앱 화면 다크모드 인터페이스 퍼블리싱",
        },
      ],
    },
    {
      title : `강원특별자치도교육청교육과학정보원`,
      service : "강원특별자치도교육청 홈페이지 통합관리 시스템",
      path : "",
      imgSrc : "/assets/images/project/main/main_integration.png",
      localImg : true,
      tagList : [
        {
          name : "Vue2",
        },
        {
          name : "Nuxt2",
        },
        {
          name : "Scss",
        },
        {
          name : "Element-Ui",
        },
      ] ,
      workList : [
        {
          text : "Css 에서 Scss 를 이용한 스타일 마이그레이션 설계 및 기준 생성",
        },
        {
          text : "CMS 구조 설계 및 퍼블리싱",
        },
        {
          text : "반응형 사용자 웹 / 앱 화면 및 관리자 화면 퍼블리싱",
        },
        {
          text : "지속적인 유지 보수",
        },
      ],
    },
    {
      title : 'G.I.J.O Technology ( IT 보안 전문 기업 )',
      service : "보안 기술 판매 시스템",
      path : "",
      imgSrc : "/assets/images/project/main/main_gijo.png",
      localImg : true,
      tagList : [
        {
          name : "Vue3",
        },
        {
          name : "Nuxt3",
        },
        {
          name : "TypeScript",
        },
        {
          name : "Scss",
        },
        {
          name : "Vuetify",
        },
      ] ,
      workList : [
        {
          text : "Swiper 를 활용한 컴포넌트 생성",
        },
        {
          text : "애니메이션을 활용한 UI 개발",
        },
        {
          text : "동적 Grid 개발에 참여",
        },
      ],
    },
  ],

  newCreationProjectList : [
    {
      title : "차놀자 파트너스",
      service : "렌트가 CMS",
      path : "",
      imgSrc : "/assets/images/project/new/new_car.png",
      localImg : true,
      isSecurity : true,
      tagList : [
        {
          name : "Vue2",
        },
        {
          name : "Nuxt2",
        },
        {
          name : "Javascript",
        },
        {
          name : "Scss",
        },
        {
          name : "Vuetify",
        },
      ] ,
    },
    {
      title : `Kcc Glass VMS 방문자<br>출입시스템`,
      service : "방문자 출입 관리 CMS",
      path : "",
      imgSrc : "/assets/images/project/new/new_coming_and_going.png",
      localImg : true,
      isSecurity : true,
      tagList : [
        {
          name : "Vue2",
        },
        {
          name : "Nuxt2",
        },
        {
          name : "Scss",
        },
        {
          name : "Element-Ui",
        },
      ] ,
    },
    {
      title : "온라인 참가 신청",
      service : `행사 / 모임 참가 신청 관리 및 <br> 참가자 데이터 수집 및 분석 시스템`,
      path : "",
      imgSrc : "/assets/images/project/new/new_application.png",
      tagList : [
        {
          name : "Vue2",
        },
        {
          name : "Nuxt2",
        },
        {
          name : "Javascript",
        },
        {
          name : "Scss",
        },
        {
          name : "Vuetify",
        },
      ] ,
    },
    {
      title : "온라인 심사 시스템",
      service : "대회, 선발 등 공정한 심사를 위한 온라인 심사 시스템",
      path : "",
      imgSrc : "/assets/images/project/new/new_audit.png",
      tagList : [
        {
          name : "Vue2",
        },
        {
          name : "Nuxt2",
        },
        {
          name : "Javascript",
        },
        {
          name : "Scss",
        },
        {
          name : "Vuetify",
        },
      ] ,
    },
    {
      title : "IDX 협업 지원 센터",
      service : "회사소개 시스템",
      path : "",
      imgSrc : "/assets/images/project/new/new_idx.png",
      localImg : true,
      tagList : [
        {
          name : "Html",
        },
        {
          name : "Css",
        },
        {
          name : "Jquery",
        },
      ] ,
    },
    {
      title : `강원 보결전담강사 예약<br>시스템`,
      service : "검증된 대체 강사의 예약을 위한 예약 시스템",
      path : "",
      imgSrc : "/assets/images/project/new/new_instructor.png",
      tagList : [
        {
          name : "Vue2",
        },
        {
          name : "Nuxt2",
        },
        {
          name : "Scss",
        },
        {
          name : "Element-Ui",
        },
      ] ,
    },
    {
      title : `강원유아교육진흥원<br>( 모바일 앱 )`,
      service : "유아들의 체험활동 관리 CMS",
      path : "",
      imgSrc : "/assets/images/project/new/new_playnote.png",
      localImg : true,
      isSecurity : true,
      tagList : [
        {
          name : "Vue2",
        },
        {
          name : "Nuxt2",
        },
        {
          name : "Scss",
        },
        {
          name : "Element-Ui",
        },
      ] ,
    },
  ],

  renewalProjectList: [
    {
      title : "원격 교육 연수원",
      service : "교육의 질적 향상과 발전을 위한 교직원 연수 시스템",
      path : "",
      imgSrc : "/assets/images/project/renewal/renewal_lms.png",
      tagList : [
        {
          name : "Vue2",
        },
        {
          name : "Nuxt2",
        },
        {
          name : "Javascript",
        },
        {
          name : "Css",
        },
        {
          name : "ElElement",
        },
      ] ,
    },
    {
      title : "블렌디드 러닝 연수시스템",
      service : "교육의 질적 향상과 발전을 위한 교직원 연수 시스템",
      path : "",
      imgSrc : "/assets/images/project/renewal/renewal_blended.png",
      localImg : true,
      tagList : [
        {
          name : "Vue2",
        },
        {
          name : "Nuxt2",
        },
        {
          name : "Javascript",
        },
        {
          name : "Css",
        },
        {
          name : "ElElement",
        },
      ] ,
    },
    {
      title : "전자책 출판 시스템",
      service : "다양한 문서를 전자책으로 변환할 수 있는 전자책 시스템",
      path : "",
      imgSrc : "/assets/images/project/renewal/renewal_ebook.png",
      tagList : [
        {
          name : "Vue2",
        },
        {
          name : "Nuxt2",
        },
        {
          name : "Javascript",
        },
        {
          name : "Css",
        },
        {
          name : "ElElement",
        },
      ] ,
    },
    {
      title : "수리과학 정보 체험 센터",
      service : "교육 예약 및 수강 관리를 위한 온라인 예약 관리 시스템",
      path : "",
      imgSrc : "/assets/images/project/renewal/renewal_math.png",
      tagList : [
        {
          name : "Vue2",
        },
        {
          name : "Nuxt2",
        },
        {
          name : "Javascript",
        },
        {
          name : "Scss",
        },
        {
          name : "ElElement",
        },
      ] ,
    },
    {
      title : "설문",
      service : "설문지 작성 및 결과 분석 가능한 설문조사 통합 관리 시스템",
      path : "",
      imgSrc : "/assets/images/project/renewal/renewal_survey.png",
      tagList : [
        {
          name : "Vue2",
        },
        {
          name : "Nuxt2",
        },
        {
          name : "Javascript",
        },
        {
          name : "Scss",
        },
        {
          name : "ElElement",
        },
      ] ,
    },
  ],
});


/************************************************************
 * Dynamic Data ( 동적 데이터 )
 ************************************************************/
const projectBooleanData = reactive( {
  isAlert : false
} );

const tab = ref( "one" );

const detailProjectItem = ref<ProjectList | {}>({});

/************************************************************
 * Provide / inject Data
 ************************************************************/

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
 * Watch
 ************************************************************/

/************************************************************
 * Mounted
 ************************************************************/
onMounted(() => {
  detailProjectItem.value = projectData.mainProjectList[0];
});

/************************************************************
 * Layout
 ************************************************************/
definePageMeta( {
  layout: "layout",
} );

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
              <ProjectCard
                v-for="( item, index ) in projectData.mainProjectList"
                :key="index"
                :title="item.title"
                :service="item.service"
                :is-best="item.isBest"
                :img-src="item.imgSrc"
                :tag-list="item.tagList"
                :work-list="item.workList"
                :path="item.path"
                :local-img="item.localImg"
                :is-security="item.isSecurity"
                :is-work-btn="true"
                @on-click="moveCard( index )"
              />
            </div>
          </div>
        </v-tabs-window-item>

        <v-tabs-window-item value="two">
          <div :class="cx( 'project-item', ProjectStyle.ProjectItem )">
            <div :class="cx( ProjectStyle.ProjectTitle )">
              <h2>New Project 🤩</h2>
            </div>
            <div :class="cx( ProjectStyle.CardWrapper )">
              <ProjectCard
                v-for="( item, index ) in projectData.newCreationProjectList"
                :key="index"
                :title="item.title"
                :service="item.service"
                :img-src="item.imgSrc"
                :tag-list="item.tagList"
                :work-list="item.workList"
                :path="item.path"
                :local-img="item.localImg"
                :is-security="item.isSecurity"
                :is-work-btn="true"
                @on-click="moveCard( index )"
              />
            </div>
          </div>
        </v-tabs-window-item>

        <v-tabs-window-item value="three">
          <div :class="cx( 'project-item', ProjectStyle.ProjectItem )">
            <div :class="cx( ProjectStyle.ProjectTitle )">
              <h2>Renewal Project 🤔</h2>
            </div>
            <div :class="cx( ProjectStyle.CardWrapper )">
              <ProjectCard
                v-for="( item, index ) in projectData.renewalProjectList"
                :key="index"
                :title="item.title"
                :service="item.service"
                :img-src="item.imgSrc"
                :tag-list="item.tagList"
                :work-list="item.workList"
                :path="item.path"
                :local-img="item.localImg"
                :is-security="item.isSecurity"
                :is-work-btn="true"
                @on-click="moveCard( index )"
              />
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
