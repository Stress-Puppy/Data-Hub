import BaseParam from '@/config'
import { getCookies } from '@/utils/cookie'
import { message } from 'ant-design-vue'
import axios from 'axios'
const instance = axios.create({
    timeout: 30000,
    baseURL: BaseParam.fetchUrl,
})

instance.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8'
instance.defaults.headers['Cache-Control'] = 'no-cache'

// 设置http状态码
let httpCode = {
    301: '资源(网页等)被永久转移到其它URL',
    400: '请求参数错误',
    401: '权限不足, 请重新登录',
    403: '服务器拒绝本次访问',
    404: '请求资源未找到',
    500: '内部服务器错误',
    501: '服务器不支持该请求中使用的方法',
    502: '网关错误',
    504: '网关超时',
}

/** 添加请求拦截器 **/
instance.interceptors.request.use(
    (config) => {
        const user = getCookies('userInfo')
        if (user != false) {
            config.headers['Authorization'] = 'Bearer ' + user.token
        }
        return config
    },
    (error) => {
        // 请求错误调用reject返回错误信息
        return Promise.reject(error)
    },
)

/** 添加响应拦截器  **/
instance.interceptors.response.use(
    (response) => {
        // if (
        //     response.data.code === "repeatLogin" ||
        //     response.data.code === "notLogin"
        // ) {
        //     // 异地登录或者未登录或者登录超时
        //     message.error(
        //         response.data.code === "repeatLogin"
        //             ? "您的帐号在其它地点登录，请重新登录或联系平台管理员"
        //             : "未登录或登录超时，请重新登录"
        //     );
        //     rLogin();
        // }else if(response.data.code === 'notNotify') {
        //     rLogin();
        // }
        return Promise.resolve(response.data)
    },
    (error) => {
        if (error.response) {
            // 根据请求失败的http状态码去给用户相应的提示
            // let tips = error.response.status in httpCode ? httpCode[error.response.status] : error.response.data.msg
            // if (error.response.status === 401) {
            //     // token或者登录失效情况下跳转到登录页面，根据实际情况，在这里可以根据不同的响应错误结果，做对应的事。这里我以401判断为例
            //     router.push({
            //         path: `/`
            //     });
            // }

            if (error.response.status in httpCode) {
                message.error(httpCode[error.response.status])
            }

            return Promise.reject(error)
        } else {
            message.error("请求超时, 请重试")
            return Promise.reject(new Error('请求超时, 请重试'))
        }
    },
)

/* 统一封装get请求 */
export const BZ_Get = (url, params) => {
    return new Promise((resolve, reject) => {
        instance({
            method: 'get',
            url,
            params,
        })
            .then((response) => {
                resolve(response)
            })
            .catch((error) => {
                reject(error)
            })
    })
}

/* 统一封装post请求  */
export const BZ_Post = (url, data, type) => {
    return new Promise((resolve, reject) => {
        instance({
            method: 'post',
            url,
            data,
            responseType: type,
        })
            .then((response) => {
                resolve(response)
            })
            .catch((error) => {
                reject(error)
            })
    })
}
