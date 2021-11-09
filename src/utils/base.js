/* eslint-disable no-useless-escape */
/* eslint-disable no-redeclare */
export default {
    /**
     * 设置TDK
     * @param title
     * @param keywords
     * @param description
     * @constructor
     */
    TDK(title, keywords, description) {
        document.title = title
        let meta = document.getElementsByTagName('meta')
        meta['keywords'].setAttribute('content', keywords)
        meta['description'].setAttribute('content', description)
    },

    /**
     * 生成UUID
     * @returns {string}
     * @constructor
     */
    UUID() {
        let s = []
        let hexDigits = '0123456789abcdef'
        for (let i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
        }
        s[14] = '4'
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1)
        s[8] = s[13] = s[18] = s[23] = '-'

        let uuid = s.join('')
        return uuid
    },

    /**
     * [deepClone 深度克隆]
     * @param  {[type]} obj [克隆对象]
     * @return {[type]}     [返回深度克隆后的对象]
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj
        var isType = function (obj, type) {
            var flag,
                typeString = Object.prototype.toString.call(obj)
            switch (type) {
                case 'Array':
                    flag = typeString === '[object Array]'
                    break
                case 'Date':
                    flag = typeString === '[object Date]'
                    break
                case 'RegExp':
                    flag = typeString === '[object RegExp]'
                    break
                default:
                    flag = false
            }
            return flag
        }
        var getRegExp = function (re) {
            var flags = ''
            if (re.global) flags += 'g'
            if (re.ignoreCase) flags += 'i'
            if (re.multiline) flags += 'm'
            return flags
        }

        var _clone = function (parent) {
            var child,
                proto,
                parents = [],
                children = []
            if (isType(parent, 'Array')) {
                // 对数组做特殊处理
                child = []
            } else if (isType(parent, 'RegExp')) {
                // 对正则做特殊处理
                child = new RegExp(parent.source, getRegExp(parent))
                if (parent.lastIndex) child.lastIndex = parent.lastIndex
            } else if (isType(parent, 'Date')) {
                // 对Date做特殊处理
                child = new Date(parent.getTime())
            } else {
                // 处理对象原型
                proto = Object.getPrototypeOf(parent)
                // 利用Object.create切断原型链
                child = Object.create(proto)
            }
            // 处理循环引用
            var index = parents.indexOf(parent)

            if (index != -1) {
                // 如果父数组存在本对象,说明之前已经被引用过,直接返回此对象
                return children[index]
            }
            parents.push(parent)
            children.push(child)

            for (var i in parent) {
                child[i] = _clone(parent[i])
            }

            return child
        }
        return _clone(obj)
    },

    /*获取网址参数*/
    getUrlParams(name) {
        var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
        var r = decodeURI(window.location.search).substr(1).match(reg)
        if (r != null) return r[2]
        return null
    },

    /*获取全部url参数,并转换成json对象*/
    getUrlAllParams(url) {
        var url = url ? url : window.location.href
        var _pa = url.substring(url.indexOf('?') + 1),
            _arrS = _pa.split('&'),
            _rs = {}
        for (var i = 0, _len = _arrS.length; i < _len; i++) {
            var pos = _arrS[i].indexOf('=')
            if (pos == -1) {
                continue
            }
            var name = _arrS[i].substring(0, pos),
                value = window.decodeURIComponent(_arrS[i].substring(pos + 1))
            _rs[name] = value
        }
        return _rs
    },

    /*删除url指定参数，返回url*/
    delParamsUrl(url, name) {
        var baseUrl = url.split('?')[0] + '?'
        var query = url.split('?')[1]
        if (query.indexOf(name) > -1) {
            var obj = {}
            var arr = query.split('&')
            for (var i = 0; i < arr.length; i++) {
                arr[i] = arr[i].split('=')
                obj[arr[i][0]] = arr[i][1]
            }
            delete obj[name]
            var url =
                baseUrl +
                JSON.stringify(obj)
                    .replace(/[\"\{\}]/g, '')
                    .replace(/\:/g, '=')
                    .replace(/\,/g, '&')
            return url
        } else {
            return url
        }
    },

    /*获取十六进制随机颜色*/
    getRandomColor() {
        return (
            '#' +
            (function (h) {
                return new Array(7 - h.length).join('0') + h
            })(((Math.random() * 0x1000000) << 0).toString(16))
        )
    },

    /*图片加载*/
    imgLoadAll(arr, callback) {
        var arrImg = []
        for (var i = 0; i < arr.length; i++) {
            var img = new Image()
            img.src = arr[i]
            img.onload = function () {
                arrImg.push(this)
                if (arrImg.length == arr.length) {
                    callback && callback()
                }
            }
        }
    },

    /*音频加载*/
    loadAudio(src, callback) {
        var audio = new Audio(src)
        audio.onloadedmetadata = callback
        audio.src = src
    },

    /*DOM转字符串*/
    domToStirng(htmlDOM) {
        var div = document.createElement('div')
        div.appendChild(htmlDOM)
        return div.innerHTML
    },

    /*字符串转DOM*/
    stringToDom(htmlString) {
        var div = document.createElement('div')
        div.innerHTML = htmlString
        return div.children[0]
    },
    /**
     * 分享QQ好友
     * @param  {[type]} title [分享标题]
     * @param  {[type]} url   [分享url链接，默认当前页面链接]
     * @param  {[type]} pic   [分享图片]
     * @return {[type]}       [description]
     */
    shareQQ: function (url, title, pic) {
        var param = {
            url: url || window.location.href,
            desc: '' /*分享理由*/,
            title: title || '' /*分享标题(可选)*/,
            summary: '' /*分享描述(可选)*/,
            pics: pic || '' /*分享图片(可选)*/,
            flash: '' /*视频地址(可选)*/,
            site: '' /*分享来源 (可选) */,
        }
        var s = []
        for (var i in param) {
            s.push(i + '=' + encodeURIComponent(param[i] || ''))
        }
        var targetUrl = 'https://connect.qq.com/widget/shareqq/index.html?' + s.join('&')
        window.open(targetUrl, 'qq', 'height=520, width=720')
    },

    /**
     * 分享新浪微博
     * @param  {[type]} title [分享标题]
     * @param  {[type]} url   [分享url链接，默认当前页面]
     * @param  {[type]} pic   [分享图片]
     * @return {[type]}       [description]
     */
    sinaWeiBo: function (title, url, pic) {
        var param = {
            url: url || window.location.href,
            type: '3',
            count: '1' /** 是否显示分享数，1显示(可选)*/,
            appkey: '2177126925' /** 您申请的应用appkey,显示分享来源(可选)*/,
            title: '' /** 分享的文字内容(可选，默认为所在页面的title)*/,
            pic: pic || '' /**分享图片的路径(可选)*/,
            ralateUid: '' /**关联用户的UID，分享微博会@该用户(可选)*/,
            rnd: new Date().valueOf(),
        }
        var temp = []
        for (var p in param) {
            temp.push(p + '=' + encodeURIComponent(param[p] || ''))
        }
        var targetUrl = 'http://service.weibo.com/share/share.php?' + temp.join('&')
        window.open(targetUrl, 'sinaweibo', 'height=430, width=400')
    },

    /**
     * 判断是否是PC客户端
     * @returns {boolean}
     * @constructor
     */
    IsPC() {
        //平台、设备和操作系统
        let system = {
            win: false,
            mac: false,
            xll: false,
        }
        //检测平台
        let p = navigator.platform
        system.win = p.indexOf('Win') == 0
        system.mac = p.indexOf('Mac') == 0
        system.x11 = p == 'X11' || p.indexOf('Linux') == 0

        if (system.win || system.mac || system.xll) {
            //PC端
            return true
        } else {
            //移动端跳转的链接
            return false
        }
    },

    /**
     * 判断是否是微信
     * @returns {boolean}
     */
    isWeixin() {
        var ua = navigator.userAgent.toLowerCase()
        return ua.match(/MicroMessenger/i) == 'micromessenger'
    },
}
