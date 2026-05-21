<script setup lang="ts">
import { reactive, watch, ref, computed, onMounted, onBeforeUnmount } from "vue";
import { cx } from "@emotion/css";

/************************************************************
 * Components
 ************************************************************/
import BaseBtn from "~/components/base/btn/BaseBtn.vue";
import BaseDialog from "~/components/base/dialog/BaseDialog.vue";

/************************************************************
 * Style
 ************************************************************/
import { FindDialogStyle } from "~/components/dialog/find/style/FindDialogStyle";

/************************************************************
 * Utils, Constants...
 ************************************************************/

/************************************************************
 * Types, Interface
 ************************************************************/

/************************************************************
 * External Dependencies ( 외부 종속성 )
 ************************************************************/

/************************************************************
 * Props
 ************************************************************/
const props = withDefaults( defineProps<{
  title : string,
}>(), {
  title : "아이디 찾기",
});

/************************************************************
 * Emit
 ************************************************************/
const emit = defineEmits<{
  /**
   * dialog 이벤트
   */
  ( eventName: "update:modelValue", value: boolean ): void,
}>();

const updateModelValue = ( value : boolean ) => {
  emit("update:modelValue", value );
}

/************************************************************
 * Raw Data ( 원시 데이터 )
 ************************************************************/
const findData = reactive({
  title : props.title,
  idTab : "name",
  idRadio1: "one",
  idRadio2: "one",
  findGuide : "회원가입 시 입력된 개인정보로 아이디를 찾으실 수 있습니다.",
  name : "",
  birthDate : "",
  idDate : "",
})

/************************************************************
 * Dynamic Data ( 동적 데이터 )
 ************************************************************/
const findBooleanData = reactive({
  dialog : false,
  isAlert : false,
  isChangeText : false,
  isPassword : false,
})

const windowWidth = ref( 0 );

const isMobile = computed( () => {
  return 1024 >= windowWidth.value;
})

/************************************************************
 * Provide / inject Data
 ************************************************************/

/************************************************************
 * Function
 ************************************************************/
const onCheck = () => {
  findBooleanData.isAlert = true;

  setTimeout( () => {
    findBooleanData.isAlert = false;
  }, 800);
}

const changeData = ( title : string ) => {
  findData.title = title;

  switch ( title ) {
    case "아이디 찾기" :
      findData.findGuide = "회원가입 시 입력된 개인정보로 아이디를 찾으실 수 있습니다.";
      findBooleanData.isPassword = false;
      break;
    case "비밀번호 찾기" :
      findData.findGuide = "개인정보 입력을 통해 비밀번호를 찾으실 수 있습니다.";
      findBooleanData.isPassword = true;
      break;
  }
}

const setWindowWidth = ( data : any ) => {
  windowWidth.value = data.target.innerWidth;
}

/************************************************************
 * Watch
 ************************************************************/
watch( () => props.title, ( newValue : string ) => {
  changeData( newValue );

  findData.idTab = "name";
  findData.idRadio1 = "one";
  findData.idRadio2 = "one";
});


/************************************************************
 * Mounted
 ************************************************************/
onMounted( () => {
  windowWidth.value = window.innerWidth;
  window.addEventListener( "resize", setWindowWidth );
})

onBeforeUnmount( () => {
  window.removeEventListener( "resize", setWindowWidth );
});

/************************************************************
 * Layout
 ************************************************************/

</script>

<template>
  <BaseDialog
    :class="cx( FindDialogStyle.Default )"
    :is-check="true"
    max-width="800"
    @on-check="onCheck"
    @update:model-value="updateModelValue"
  >
    <template #title>
      <span v-text="findData.title"></span>
    </template>
    <div :class="cx( FindDialogStyle.FindGuide )">
      <span v-text="'*' + findData.findGuide"></span>
    </div>
    <div v-if="!findBooleanData.isPassword" :class="cx( FindDialogStyle.IdFrom )">
      <v-tabs
        v-model="findData.idTab"
        color="primary"
        :direction="isMobile ? 'horizontal' : 'vertical'"
      >
        <v-tab text="이름/생년월일" value="name" :ripple="false"></v-tab>
        <v-tab text="휴대폰 인증" value="phone" :ripple="false"></v-tab>
        <v-tab text="아이피(I-PIN)인증" value="i-pin" :ripple="false"></v-tab>
      </v-tabs>

      <v-tabs-window v-model="findData.idTab">
        <v-tabs-window-item value="name">
          <v-card flat class="tab-content">
            <v-card-text>
              <div class="tab-item">
                <div class="title">
                  <span>이름</span>
                </div>
                <v-text-field
                  v-model="findData.name"
                  variant="solo"
                  placeholder="이름을 입력해주세요."
                />
              </div>
              <div class="tab-item">
                <div class="title">
                  <span>생년월일</span>
                </div>
                <v-text-field
                  v-model="findData.birthDate"
                  variant="solo"
                  placeholder="생년월일 8자리를 입력해주세요. Ex)19990101"
                />
              </div>
              <div class="tab-item__guide">
                <span>- [휴대폰(SMS)], [휴대폰 본인인증], [I-PIN 본인인증]은 전체 아이디 확인이 가능합니다</span>
              </div>
            </v-card-text>
          </v-card>
        </v-tabs-window-item>

        <v-tabs-window-item value="phone">
          <v-card flat class="tab-content">
            <v-card-text>
              <div class="tab-item">
                <span class="tab-item__sub-guide">휴대폰 인증으로 비밀번호를 재설정 할 수 있습니다.</span>
                <v-radio-group v-model="findData.idRadio1">
                  <v-radio label="본인 인증으로 가입" value="one"></v-radio>
                  <v-radio label="법정대리인 동의로 가입" value="two"></v-radio>
                </v-radio-group>
              </div>
              <div class="tab-item__guide">
                <span>- 회원가입 또는 회원정보 수정을 통해 본인인증을 받은 회원만 이용 가능합니다.</span>
              </div>
            </v-card-text>
          </v-card>
        </v-tabs-window-item>

        <v-tabs-window-item value="i-pin">
          <v-card flat class="tab-content">
            <v-card-text>
              <div class="tab-item">
                <span class="tab-item__sub-guide">아이핀 인증으로 비밀번호를 재설정 할 수 있습니다.</span>
                <v-radio-group v-model="findData.idRadio2">
                  <v-radio label="본인 인증으로 가입" value="one"></v-radio>
                  <v-radio label="법정대리인 동의로 가입" value="two"></v-radio>
                </v-radio-group>
              </div>
              <div class="tab-item__guide">
                <span>- 회원가입 또는 회원정보 수정을 통해 본인인증을 받은 회원만 이용 가능합니다.</span>
              </div>
            </v-card-text>
          </v-card>
        </v-tabs-window-item>
      </v-tabs-window>
    </div>
    <div v-if="findBooleanData.isPassword" :class="cx( FindDialogStyle.PasswordFrom )">
      <div class="password-item">
        <div class="title">
          <span>이름</span>
        </div>
        <v-text-field
          v-model="findData.name"
          variant="solo"
          placeholder="이름을 입력해주세요."
        />
      </div>
      <div class="password-item">
        <div class="title">
          <span>아이디</span>
        </div>
        <v-text-field
          v-model="findData.idDate"
          variant="solo"
          placeholder="아이디를 입력해 주세요."
        />
      </div>
      <div class="password-guide">
        <span>아이디가 기억나지 않는다면? <em @click="changeData('아이디 찾기', true )">아이디 찾기 바로가기</em></span>
      </div>
    </div>

    <template #footer>
      <BaseBtn
        :hover="false"
        variant="flat"
        @on-click="updateModelValue( false )"
      >
        <span>닫기</span>
      </BaseBtn>
      <BaseBtn
        :hover="false"
        variant="flat"
        @on-click="onCheck"
      >
        <span v-text="findData.title"></span>
      </BaseBtn>
    </template>

    <BaseAlert
      v-if="findBooleanData.isAlert"
      title="안내"
      text="미개발 상태 입니다."
      :is-footer="false"
    />
  </BaseDialog>
</template>

<style lang="scss"></style>
