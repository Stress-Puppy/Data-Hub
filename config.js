/**
 * 接口地址参数定义
 * @type {{pre: 预生产环境, dev: 开发环境, test: 测试环境, pro: 生产环境}}
 */
 const api_url = {
    dev: '/api',
    test: 'http://49.235.69.79/api',
    pro: 'http://49.235.69.79/api',
    pre: 'http://49.235.69.79/api',
}

/**
 * 文件地址定义参数
 * @type {{pre: 预生产环境, dev: 开发环境, test: 测试环境, pro: 生产环境}}
 */
const file_url = {
    dev: '/fileApi',
    test: 'http://192.168.1.211:9500',
    pro: 'http://192.168.1.211:9500',
    pre: 'http://192.168.1.211:9500',
}

const BaseParam = {
    fetchUrl:
        process.env.vue_app_env == 'development'
            ? api_url.dev
            : process.env.vue_app_env == 'test'
            ? api_url.test
            : process.env.vue_app_env == 'pre'
            ? api_url.pre
            : process.env.vue_app_env == 'pro'
            ? api_url.pro
            : api_url.dev,

    fileUrl:
        process.env.vue_app_env == 'development'
            ? file_url.dev
            : process.env.vue_app_env == 'test'
            ? file_url.test
            : process.env.vue_app_env == 'pre'
            ? file_url.pre
            : process.env.vue_app_env == 'pro'
            ? file_url.pro
            : file_url.dev,
}

export default BaseParam