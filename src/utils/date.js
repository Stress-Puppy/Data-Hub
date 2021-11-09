/* eslint-disable no-prototype-builtins */
/* eslint-disable no-redeclare */
export default {
    /**
     * 格式化时间
     *
     * @param  {time} 时间
     * @param  {cFormat} 格式
     * @return {String} 字符串
     *
     * @example formatTime('2018-1-29', '{y}/{m}/{d} {h}:{i}:{s}') // -> 2018/01/29 00:00:00
     */
    formatTime(time, cFormat) {
        if (arguments.length === 0) return null
        if ((time + '').length === 10) {
            time = +time * 1000
        }

        var format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}',
            date
        if (typeof time === 'object') {
            date = time
        } else {
            date = new Date(time)
        }

        var formatObj = {
            y: date.getFullYear(),
            m: date.getMonth() + 1,
            d: date.getDate(),
            h: date.getHours(),
            i: date.getMinutes(),
            s: date.getSeconds(),
            a: date.getDay(),
        }
        var time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
            var value = formatObj[key]
            if (key === 'a') return ['一', '二', '三', '四', '五', '六', '日'][value - 1]
            if (result.length > 0 && value < 10) {
                value = '0' + value
            }
            return value || 0
        })
        return time_str
    },

    /**
     * 返回指定长度的月份集合
     *
     * @param  {time} 时间
     * @param  {len} 长度
     * @param  {direction} 方向：  1: 前几个月;  2: 后几个月;  3:前后几个月  默认 3
     * @return {Array} 数组
     *
     * @example   getMonths('2018-1-29', 6, 1)  // ->  ["2018-1", "2017-12", "2017-11", "2017-10", "2017-9", "2017-8", "2017-7"]
     */
    getMonths(time, len, direction) {
        var mm = new Date(time).getMonth(),
            yy = new Date(time).getFullYear(),
            direction = isNaN(direction) ? 3 : direction,
            index = mm
        var cutMonth = function (index) {
            if (index <= len && index >= -len) {
                return direction === 1
                    ? formatPre(index).concat(cutMonth(++index))
                    : direction === 2
                    ? formatNext(index).concat(cutMonth(++index))
                    : formatCurr(index).concat(cutMonth(++index))
            }
            return []
        }
        var formatNext = function (i) {
            var y = Math.floor(i / 12),
                m = i % 12
            return [yy + y + '-' + (m + 1)]
        }
        var formatPre = function (i) {
            var y = Math.ceil(i / 12),
                m = i % 12
            m = m === 0 ? 12 : m
            return [yy - y + '-' + (13 - m)]
        }
        var formatCurr = function (i) {
            var y = Math.floor(i / 12),
                yNext = Math.ceil(i / 12),
                m = i % 12,
                mNext = m === 0 ? 12 : m
            return [yy - yNext + '-' + (13 - mNext), yy + y + '-' + (m + 1)]
        }
        // 数组去重
        var unique = function (arr) {
            if (Array.hasOwnProperty('from')) {
                return Array.from(new Set(arr))
            } else {
                var n = {},
                    r = []
                for (var i = 0; i < arr.length; i++) {
                    if (!n[arr[i]]) {
                        n[arr[i]] = true
                        r.push(arr[i])
                    }
                }
                return r
            }
        }
        return direction !== 3
            ? cutMonth(index)
            : unique(
                  cutMonth(index).sort(function (t1, t2) {
                      return new Date(t1).getTime() - new Date(t2).getTime()
                  }),
              )
    },

    /**
     * 返回指定长度的天数集合
     *
     * @param  {time} 时间
     * @param  {len} 长度
     * @param  {direction} 方向： 1: 前几天;  2: 后几天;  3:前后几天  默认 3
     * @return {Array} 数组
     *
     * @example date.getDays('2018-1-29', 6) // -> ["2018-1-26", "2018-1-27", "2018-1-28", "2018-1-29", "2018-1-30", "2018-1-31", "2018-2-1"]
     */
    getDays(time, len, diretion) {
        var tt = new Date(time)
        var getDay = function (day) {
            var t = new Date(time)
            t.setDate(t.getDate() + day)
            var m = t.getMonth() + 1
            return t.getFullYear() + '-' + m + '-' + t.getDate()
        }
        var arr = []
        if (diretion === 1) {
            for (var i = 1; i <= len; i++) {
                arr.unshift(getDay(-i))
            }
        } else if (diretion === 2) {
            for (var i = 1; i <= len; i++) {
                arr.push(getDay(i))
            }
        } else {
            for (var i = 1; i <= len; i++) {
                arr.unshift(getDay(-i))
            }
            arr.push(tt.getFullYear() + '-' + (tt.getMonth() + 1) + '-' + tt.getDate())
            for (var i = 1; i <= len; i++) {
                arr.push(getDay(i))
            }
        }
        return diretion === 1
            ? arr.concat([tt.getFullYear() + '-' + (tt.getMonth() + 1) + '-' + tt.getDate()])
            : diretion === 2
            ? [tt.getFullYear() + '-' + (tt.getMonth() + 1) + '-' + tt.getDate()].concat(arr)
            : arr
    },

    /**
     * @param  {s} 秒数
     * @return {String} 字符串
     * @example formatHMS(3610) // -> 1h0m10s
     */
    formatHMS(s) {
        var str = ''
        if (s > 3600) {
            str = Math.floor(s / 3600) + 'h' + Math.floor((s % 3600) / 60) + 'm' + (s % 60) + 's'
        } else if (s > 60) {
            str = Math.floor(s / 60) + 'm' + (s % 60) + 's'
        } else {
            str = (s % 60) + 's'
        }
        return str
    },

    /**
     * 获取某月有多少天
     * @param time
     * @returns {number}
     */
    getMonthOfDay(time) {
        var date = new Date(time)
        var year = date.getFullYear()
        var mouth = date.getMonth() + 1
        var days

        //当月份为二月时，根据闰年还是非闰年判断天数
        if (mouth == 2) {
            days =
                (year % 4 == 0 && year % 100 == 0 && year % 400 == 0) ||
                (year % 4 == 0 && year % 100 != 0)
                    ? 28
                    : 29
        } else if (
            mouth == 1 ||
            mouth == 3 ||
            mouth == 5 ||
            mouth == 7 ||
            mouth == 8 ||
            mouth == 10 ||
            mouth == 12
        ) {
            //月份为：1,3,5,7,8,10,12 时，为大月.则天数为31；
            days = 31
        } else {
            //其他月份，天数为：30.
            days = 30
        }
        return days
    },

    /**
     * 获取某年有多少天
     * @param time
     * @returns {number}
     */
    getYearOfDay(time) {
        var firstDayYear = this.getFirstDayOfYear(time)
        var lastDayYear = this.getLastDayOfYear(time)
        var numSecond = (new Date(lastDayYear).getTime() - new Date(firstDayYear).getTime()) / 1000
        return Math.ceil(numSecond / (24 * 3600))
    },

    /**
     * 获取某年的第一天
     * @param time
     * @returns {string}
     */
    getFirstDayOfYear(time) {
        var year = new Date(time).getFullYear()
        return year + '-01-01 00:00:00'
    },

    /**
     * 获取某年最后一天
     * @param time
     * @returns {string}
     */
    getLastDayOfYear(time) {
        var year = new Date(time).getFullYear()
        var dateString = year + '-12-01 00:00:00'
        var endDay = this.getMonthOfDay(dateString)
        return year + '-12-' + endDay + ' 23:59:59'
    },

    /**
     * 获取某个日期是当年中的第几天
     * @param time
     * @returns {number}
     */
    getDayOfYear(time) {
        var firstDayYear = this.getFirstDayOfYear(time)
        var numSecond = (new Date(time).getTime() - new Date(firstDayYear).getTime()) / 1000
        return Math.ceil(numSecond / (24 * 3600))
    },

    /**
     * 获取某个日期在这一年的第几周
     * @param time
     * @returns {number}
     */
    getDayOfYearWeek(time) {
        var numdays = this.getDayOfYear(time)
        return Math.ceil(numdays / 7)
    },

    /**
     * 时间戳显示为多少分钟前，多少天前的处理
     * console.log(dateDiff(1411111111111));  // 2014年09月19日
     * console.log(dateDiff(1481111111111));  // 9月前
     * console.log(dateDiff(1499911111111));  // 2月前
     * console.log(dateDiff(1503211111111));  // 3周前
     * console.log(dateDiff(1505283100802));  // 1分钟前
     * @param timestamp
     * @returns {string}
     */
    dateDiff(timestamp) {
        // 补全为13位
        var arrTimestamp = (timestamp + '').split('')
        for (var start = 0; start < 13; start++) {
            if (!arrTimestamp[start]) {
                arrTimestamp[start] = '0'
            }
        }
        timestamp = arrTimestamp.join('') * 1

        var minute = 1000 * 60
        var hour = minute * 60
        var day = hour * 24
        var halfamonth = day * 15
        var month = day * 30
        var now = new Date().getTime()
        var diffValue = now - timestamp

        // 如果本地时间反而小于变量时间
        if (diffValue < 0) {
            return '不久前'
        }

        // 计算差异时间的量级
        var monthC = diffValue / month
        var weekC = diffValue / (7 * day)
        var dayC = diffValue / day
        var hourC = diffValue / hour
        var minC = diffValue / minute

        // 数值补0方法
        var zero = function (value) {
            if (value < 10) {
                return '0' + value
            }
            return value
        }

        // 使用
        if (monthC > 12) {
            // 超过1年，直接显示年月日
            return (function () {
                var date = new Date(timestamp)
                return (
                    date.getFullYear() +
                    '年' +
                    zero(date.getMonth() + 1) +
                    '月' +
                    zero(date.getDate()) +
                    '日'
                )
            })()
        } else if (monthC >= 1) {
            return parseInt(monthC) + '月前'
        } else if (weekC >= 1) {
            return parseInt(weekC) + '周前'
        } else if (dayC >= 1) {
            return parseInt(dayC) + '天前'
        } else if (hourC >= 1) {
            return parseInt(hourC) + '小时前'
        } else if (minC >= 1) {
            return parseInt(minC) + '分钟前'
        }
        return '刚刚'
    },

    /**
     * 获取年月日 周几
     * @returns {string}
     */
    getNowDay() {
        let date = new Date()

        // 获取日期：年月日
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const day = date.getDate()

        // 获取星期几
        const weeks = new Array(
            '星期日',
            '星期一',
            '星期二',
            '星期三',
            '星期四',
            '星期五',
            '星期六',
        )

        return year + '年' + month + '月' + day + '日  ' + weeks[new Date().getDay()]
    },
}
