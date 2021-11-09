const asyncRouter = {
    path: '',
    name: '',
    filePath: 'Home',
    meta: {
        T: '订单识别提取 首页',
        D: '展示端--首页描述',
        K: '展示端--首页关键字',
        N: '首页',
    },
    children: [
        {
            path: '/changPassword',
            name: 'changPassword',
            component: () => import(/*webpackChunkName:"Login"*/ '@/views/ChangPassword'),
            meta: {
                T: '订单自动识别系统 密码修改',
                D: '展示端--登录页面描述',
                K: '展示端--登录页面关键字',
                N: '密码修改',
            },
        },
        {
            path: '/identify-extraction',
            name: 'identify-extraction',
            filePath: 'identify-extraction.vue',
            meta: {
                T: '订单识别提取',
                D: '展示端--首页描述',
                K: '展示端--首页关键字',
                N: '订单识别提取',
            },
        },
        {
            path: '/base-table-config',
            name: 'base-table-config',
            filePath: 'base-table-config.vue',
            meta: {
                T: '基础表配置',
                D: '展示端--首页描述',
                K: '展示端--首页关键字',
                N: '基础表配置',
            },
        },
        {
            path: '/user',
            name: 'user',
            filePath: 'user.vue',
            meta: {
                T: '用户管理',
                D: '展示端--首页描述',
                K: '展示端--首页关键字',
                N: '用户管理',
            },
        },
        {
            path: '/role',
            name: 'role',
            filePath: 'role.vue',
            meta: {
                T: '角色管理',
                D: '展示端--首页描述',
                K: '展示端--首页关键字',
                N: '角色管理',
            },
        },
        {
            path: '/log',
            name: 'log',
            filePath: 'log.vue',
            meta: {
                T: '操作日志',
                D: '展示端--首页描述',
                K: '展示端--首页关键字',
                N: '操作日志',
            },
        }
    ],
}

export default asyncRouter
