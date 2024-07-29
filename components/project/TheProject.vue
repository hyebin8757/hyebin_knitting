<script setup lang="ts">
import {reactive} from "vue";
import { cx } from "@emotion/css";
import {ProjectList} from "~/types/site/components/project";
import {useUtil} from "~/utils/useUtil";
import {ProjectStyle} from "~/components/project/style/ProjectStyle";
import ProjectCard from "~/components/project/card/ProjectCard.vue";

const { useImage } = useUtil.AssetResolverUtil;

/**********************************/**************************
 * Props
 ************************************************************/

/************************************************************
 * Emit
 ************************************************************/

/************************************************************
 * Data ( ref, reactive, computed... )
 ************************************************************/
const projectData = reactive<{
  mainProjectList : ProjectList[];
  newCreationProjectList : ProjectList[];
  renewalProjectList : ProjectList[];
}>({
  mainProjectList : [
    {
      title : "리마커블소프트 UI 프레임워크",
      content : "프레임 워크 제작",
      path : "",
      imgSrc : "",
    },
    {
      title : "단축 URL",
      content : "긴 인터넷 주소를 짧게 줄인 단축 URL 또는 QR코드 전달 시스템",
      path : "",
      imgSrc : "",
    },
    {
      title : "리마커블소프트 홈페이지",
      content : "회사 소개 시스템",
      path : "",
      imgSrc : "",
    },
    {
      title : "GW 노트+",
      content : "에디터 시스템",
      path : "",
      imgSrc : "",
    },
    {
      title : "강원특별자치도교육청 교육과학 정보원",
      content : "강원특별자치도교육청 홈페이지 통합관리 시스템",
      path : "",
      imgSrc : "",
    },
  ],

  newCreationProjectList : [
    {
      title : "차놀자 파트너스",
      content : "렌트가 CMS",
      path : "",
      imgSrc : "",
    },
    {
      title : "Kcc Glass VMS 방문자 출입시스템",
      content : "방문자 출입 관리 CMS",
      path : "",
      imgSrc : "",
    },
    {
      title : "온라인 참가 신청",
      content : "행사 / 모임 참가 신청 관리 및 참가자 데이터 수집 및 분석 시스템",
      path : "",
      imgSrc : "",
    },
    {
      title : "온라인 심사 시스템",
      content : "대회, 선발 등 공정한 심사를 위한 온라인 심사 시스템",
      path : "",
      imgSrc : "",
    },
    {
      title : "IDX 협업 지원 센터",
      content : "회사소개 시스템",
      path : "",
      imgSrc : "",
    },
    {
      title : "강원 보결전담강사 예약시스템",
      content : "검증된 대체 강사의 예약을 위한 예약 시스템",
      path : "",
      imgSrc : "",
    },
    {
      title : "강원유아교육진흥원( 모바일 앱 )",
      content : "유아들의 체험활동 관리 CMS",
      path : "",
      imgSrc : "",
    },
  ],

  renewalProjectList: [
    {
      title : "원격 교육 연수원",
      content : "교육의 질적 향상과 발전을 위한 교직원 연수 시스템",
      path : "",
      imgSrc : "",
    },
    {
      title : "블렌디드 러닝 연수 시스템",
      content : "교육의 질적 향상과 발전을 위한 교직원 연수 시스템",
      path : "",
      imgSrc : "",
    },
    {
      title : "전자책 출판 시스템",
      content : "다양한 문서를 전자책으로 변환할 수 있는 전자책 시스템",
      path : "",
      imgSrc : "",
    },
    {
      title : "수리과학 정보 체험 센터",
      content : "교육 예약 및 수강 관리를 위한 온라인 예약 관리 시스템",
      path : "",
      imgSrc : "",
    },
    {
      title : "설문",
      content : "설문지 작성 및 결과 분석 가능한 설문조사 통합 관리 시스템",
      path : "",
      imgSrc : "",
    },
  ],
});

/************************************************************
 * Function
 ************************************************************/


/************************************************************
 * Watch & Mounted
 ************************************************************/


</script>
<template>
  <div :class="cx( ProjectStyle.Default )">
    <div :class="cx( ProjectStyle.ProjectItem )">
      <div :class="cx( ProjectStyle.ProjectTitle )">
        <span>주요 프로젝트</span>
      </div>
      <div :class="cx( ProjectStyle.CardWrapper )">
        <ProjectCard
            :card-list="projectData.mainProjectList"
        />
      </div>
    </div>
    <div :class="cx( ProjectStyle.ProjectItem )">
      <div :class="cx( ProjectStyle.ProjectTitle )">
        <span>신규 생성 프로젝트</span>
      </div>
      <div :class="cx( ProjectStyle.CardWrapper )">
        <ProjectCard
            :card-list="projectData.newCreationProjectList"
        />
      </div>
    </div>
    <div :class="cx( ProjectStyle.ProjectItem )">
      <div :class="cx( ProjectStyle.ProjectTitle )">
        <span>리뉴얼 / 유지보수</span>
      </div>
      <div :class="cx( ProjectStyle.CardWrapper )">
        <ProjectCard
            :card-list="projectData.renewalProjectList"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss"></style>