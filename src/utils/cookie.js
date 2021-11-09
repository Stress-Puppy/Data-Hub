import Cookies from 'js-cookie'

/**
 * 设置缓存
 * @param name
 * @param value
 * @param time
 */
const setCookies = (name = 'userInfo', { value = {}, time = 7 }) => {
    Cookies.set(name, value, { expires: time, path: '/' })
}

/**
 * 获取缓存
 * @param name
 * @returns {*}
 */
const getCookies = (name = 'userInfo') => {
    if (Cookies.get(name)) {
        return JSON.parse(Cookies.get(name))
    } else {
        return false
    }
}

/**
 * 删除指定缓存
 * @param name
 */
const removeCookies = (name = 'userInfo') => {
    Cookies.remove(name, { path: '/' })
}

export { setCookies, getCookies, removeCookies }
