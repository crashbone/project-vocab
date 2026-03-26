<template>
    <div class="app-frame page dashboard landing">
        <div class="background-overlay">
            <div class="background-overlay-inner-container">
                <div class="bg-image-container" :style="randomBGImgStyle"></div>
            <div class="bg-gradient-container"></div>
            <div class="word-page-buttons-container">
                <template v-for="(index) in 4" :key="index">
                    <ButtonX class="size80px" :class="`wordMode${1}`" :index="index">
                        <div class="button-content2" ref="wordRefs">
                            <div class="text">My Flashcard {{ index }}</div>
                            <div class="bullets">
                                <div class="bullet" v-for="i in 3" :key="i"
                                     :class="{ active: 1 === i - 1 }"></div>
                            </div>
                        </div>
                    </ButtonX>
                </template>
            </div>
            </div>
        </div>
       
        <div class="page-content-container-1">
            
            <!-- <div class="header1 top">
                PROJECT VOCAB
            </div> -->
            <div class="landing-icon"></div>
            <div class="header1">
                WELCOME!
            </div>
            <div class="text">
                Turn study time into results<br>
                Login and create your own flashcards
            </div>
            <div class="button" @click="onLogin">Google Login</div>
        </div>
    </div>


</template>
<script setup lang="ts">
import { publish } from '@/junk/EventBus';
import { GoogleLoginHelper, LoginType } from '@/junk/google-login/GoogleLoginHelper';
import { randomInt } from '@/junk/util/utils';

const getBgImageContainerStyle = () => {
    const imgName = `url('main/src/frontend/assets/img/${randomInt(1, 4)}.jpg')`;
    return {
        backgroundImage: imgName
    }
}
const randomBGImgStyle = getBgImageContainerStyle();


const onLogin = async () => {
    const loginType = LoginType.RedirectLogin;
    await GoogleLoginHelper.instance.signIn(loginType, () => onLoggedIn())
};

const onLoggedIn = () => {
    publish('userLoggedIn', {});
}
</script>
<style src="./PageLanding.scss" lang="scss"></style>