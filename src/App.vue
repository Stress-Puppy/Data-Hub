<template>
    <div id="app">
        <a-config-provider :locale="zh_CN">
            <router-view :key="key" />
        </a-config-provider>
    </div>
</template>

<script>
import zh_CN from 'ant-design-vue/lib/locale-provider/zh_CN'
import moment from 'moment'
import 'moment/locale/zh-cn'

moment.locale('zh-cn')
export default {
    name: 'App',
    computed: {
        key() {
            return this.$route.fullPath
        },
    },
    data() {
        return {
            zh_CN,
        }
    },
}
</script>
