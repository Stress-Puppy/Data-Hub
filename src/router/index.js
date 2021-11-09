/* eslint-disable no-extra-boolean-cast */
import base from '@/utils/base'
import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '../store'

const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
    return originalPush.call(this, location).catch((err) => err)
}

Vue.use(VueRouter)

const routers = [
    { path: '/', redirect: '/login' },
    {
        path: '/login',
        name: 'login',
        component: () => import(/*webpackChunkName:"Login"*/ '@/views/Login'),
        meta: {
            T: '订单自动识别系统 登录',
            D: '展示端--登录页面描述',
            K: '展示端--登录页面关键字',
            N: '登录',
        },
    },
    {
        path: '/ChangPassword',
        name: 'ChangPassword',
        component: () => import('@/views/ChangPassword'),
        meta: {
            T: '订单自动识别系统 修改密码',
            D: '展示端--登录页面描述',
            K: '展示端--登录页面关键字',
            N: '修改密码',
        },
    },
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: routers,
})

let addRouters = []
dyRouters()
function dyRouters() {
    let dynamicRouter = store.state.asyncRouter
    if (!!dynamicRouter) {
        dynamicRouter.map((e, i) => {
            addRouters.push({
                path: `/${e.name}`,
                name: e.name,
                component: () => import(/*webpackChunkName:"[request]"*/ `@/views/${e.filePath}`),
                meta: {
                    T: e.meta.T,
                    D: e.meta.D,
                    K: e.meta.K,
                    N: e.meta.N,
                },
                children: [],
            })

            if (!!e.children) childMap(e.children, i)
        })
        router.addRoutes(addRouters)
    }
}
// 遍历二级节点
function childMap(children, index) {
    if (!!children) {
        children.map((e, i) => {
            addRouters[index].children.push({
                path: `/${e.name}`,
                name: e.name,
                component: () => import(/*webpackChunkName:"[request]"*/ `@/views/${e.filePath}`),
                meta: {
                    T: e.meta.T,
                    D: e.meta.D,
                    K: e.meta.K,
                    N: e.meta.N,
                },
            })
        })
    }
}

router.beforeEach(async (to, from, next) => {
    // if(to.name !== 'login' && true) {
    //     next({name: '/identify-extraction'})
    // } else {
    //     next()
    // }
    base.TDK(to.meta.T, to.meta.D, to.meta.K)
    next()
})


export default router
