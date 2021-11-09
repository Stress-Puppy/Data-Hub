import '@/assets/css/common.less'
import Vue from 'vue'
import Antd from 'ant-design-vue';
import App from './App.vue';
import 'ant-design-vue/dist/antd.css';
import 'xe-utils'
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'
import router from './router'
import moment from 'moment'//导入文件 

Vue.prototype.$moment = moment;//赋值使用

import store from '@/store/index'

Vue.use(VXETable)

Vue.use(Antd);

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
