import asyncRouter from '@/router/asyncRouter'
import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import router from '../router/index'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        collapsed: false,
        menuList: [],
        btnList: [],
        asyncRouter: [asyncRouter],
        // 用户名称
        userName: null,
        viewHeight:null,
    },
    mutations: {
        toggleCollapsed: (state, param) => {
            state.collapsed = param.collapsed
        },
        saveMenuList: (state, param) => {
            state.menuList = param.menuList
            state.asyncRouter = param.asyncRouter
            state.btnList = param.btnList
            router.push({
                name: param.menuList[0].children[0].name,
            })
        },

        // 设置用户名称
        setuserName(status, data) {
            status.userName = data;
        },
        // 设置视口高度
        setViewHeight(status, data) {
            status.viewHeight = data;
        },
    },
    getters: {
        //获取用户名称
        getuserName: state => {
            return state.userName
        },
        //获取当前操作的数据
        getMenuList: state => {
            return state.menuList
        },
        //获取当前操作的数据
        getBtnList: state => {
            return state.btnList
        },
        //获取视口高度
        getViewHeight: state => {
            return state.viewHeight
        }
    },
    modules: {},
    plugins: [
        createPersistedState({
            storage: window.sessionStorage,
        }),
    ],
})
