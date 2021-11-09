/* eslint-disable no-useless-escape */
export default {
    /**
     * 去除空格
     * @param  {str}
     * @param  {type}
     *       type:  1-所有空格  2-前后空格  3-前空格 4-后空格
     * @return {String}
     */
    trim(str, type) {
        type = type || 1
        switch (type) {
            case 1:
                return str.replace(/\s+/g, '')
            case 2:
                return str.replace(/(^\s*)|(\s*$)/g, '')
            case 3:
                return str.replace(/(^\s*)/g, '')
            case 4:
                return str.replace(/(\s*$)/g, '')
            default:
                return str
        }
    },

    /**
     * @param  {str}
     * @param  {type}
     *       type:  1:首字母大写  2：首页母小写  3：大小写转换  4：全部大写  5：全部小写
     * @return {String}
     */
    changeCase(str, type) {
        type = type || 4
        switch (type) {
            case 1:
                return str.replace(/\b\w+\b/g, function (word) {
                    return word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase()
                })
            case 2:
                return str.replace(/\b\w+\b/g, function (word) {
                    return word.substring(0, 1).toLowerCase() + word.substring(1).toUpperCase()
                })
            case 3:
                return str
                    .split('')
                    .map(function (word) {
                        if (/[a-z]/.test(word)) {
                            return word.toUpperCase()
                        } else {
                            return word.toLowerCase()
                        }
                    })
                    .join('')
            case 4:
                return str.toUpperCase()
            case 5:
                return str.toLowerCase()
            default:
                return str
        }
    },

    /**
     * 检测密码强度
     * @param str
     * @returns {number}
     */
    checkPwd(str) {
        var Lv = 0
        if (str.length < 6) {
            return Lv
        }
        if (/[0-9]/.test(str)) {
            Lv++
        }
        if (/[a-z]/.test(str)) {
            Lv++
        }
        if (/[A-Z]/.test(str)) {
            Lv++
        }
        if (/[\.|-|_]/.test(str)) {
            Lv++
        }
        return Lv
    },

    /**
     * 过滤html代码(把<>转换)
     * @param str
     * @returns {string}
     */
    filterTag(str) {
        str = str.replace(/&/gi, '&amp;')
        str = str.replace(/</gi, '&lt;')
        str = str.replace(/>/gi, '&gt;')
        str = str.replace(' ', '&nbsp;')
        return str
    },

    /**
     * 删除文本标签
     * @param str
     * @returns {void | string | *}
     */
    delTag(str) {
        if (str)
            return str
                .replace(/<\/?.+?>/g, '')
                .replace(/ /g, '')
                .replace(/&nbsp;/gi, '')
        else return ''
    },
    /**
     * 去除html中注释
     * 去除所有标签  只保留img标签
     * @param str
     * @returns {string}
     */
    editHtml(str) {
        if (str) return str.replace(/<!--[\w\W\r\n]*?-->/g, '').replace(/<(?!img).*?>/g, '')
        else return ''
    },
    /**
     * 时间分割
     * 2020-02-02 12:12:12
     * @param time
     * @param type
     * @returns {string|*}
     */
    strSplit(time, type) {
        // 获取年月日 2020-02-02
        if (type == 0) return time.split(' ')[0]
        // 获取时间 12:12:12
        if (type == 1) return time.split(' ')[1]
        // 获取日
        if (type == 2) return time.split(' ')[0].split('-')[2]
        // 获取年月
        if (type == 3)
            return time.split(' ')[0].split('-')[0] + '-' + time.split(' ')[0].split('-')[1]
        // 获取月日
        if (type == 4)
            return time.split(' ')[0].split('-')[1] + '-' + time.split(' ')[0].split('-')[2]
        // 获取年
        if (type == 5) return time.split(' ')[0].split('-')[0]
        // 获取月
        if (type == 6) return time.split(' ')[0].split('-')[1]
    },
}
