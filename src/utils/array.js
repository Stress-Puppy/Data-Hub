export default {
    /**
     * 判断一个元素是否在数组中
     * @param arr
     * @param val
     * @returns {boolean}
     */
    contains(arr, val) {
        return arr.indexOf(val) != -1 ? true : false
    },

    /**
     * @param  {arr} 数组
     * @param  {fn} 回调函数
     * @return {Array}
     */
    each(arr, fn) {
        fn = fn || Function
        let a = []
        let args = Array.prototype.slice.call(arguments, 1)
        for (let i = 0; i < arr.length; i++) {
            let res = fn.apply(arr, [arr[i], i].concat(args))
            if (res != null) a.push(res)
        }
        return a
    },

    /**
     * @param  {arr} 数组
     * @param  {fn} 回调函数
     * @param  {thisObj} this指向
     * @return {Array}
     */
    map(arr, fn, thisObj) {
        let scope = thisObj || window
        let a = []
        for (let i = 0, j = arr.length; i < j; ++i) {
            let res = fn.call(scope, arr[i], i, this)
            if (res != null) a.push(res)
        }
        return a
    },

    /**
     * @param  {arr} 数组
     * @param  {type} 1：从小到大   2：从大到小   3：随机
     * @return {Array}
     */
    sort(arr, type = 1) {
        return arr.sort((a, b) => {
            switch (type) {
                case 1:
                    return a - b
                case 2:
                    return b - a
                case 3:
                    return Math.random() - 0.5
                default:
                    return arr
            }
        })
    },

    /**
     * 数组去重
     * arr 必须是数组
     * @param arr
     * @returns {unknown[]}
     * @constructor
     */
    ArrRemoval(arr = []) {
        // let arr = [1,1,1,2,3,4,5,6,6,6,6,7,7,8,9,...]
        return [...new Set(arr)]
    },

    /**
     * 引用类型数组去重
     * @param arrObj
     * @returns {[]}
     * @constructor
     */
    ArrObjArrRemoval(arrObj) {
        // let arrObj = [
        //     {name: "何方"},
        //     {name: "王二"},
        //     {name: "何方"},
        //     {name: "何方"},
        //     {name: "何方"},
        //     {name: "何方"},
        //     {name: "王二"},
        //     {name: "王二"},
        //     {name: "王二"},
        //     {name: "王二"},
        //     ...
        // ];
        let arrObj2 = []
        arrObj.forEach((item) => {
            arrObj2.find((find) => find.name === item.name) || arrObj2.push(item)
        })
        return arrObj2
    },

    /**
     * 求两个集合的并集
     * @param a
     * @param b
     * @returns {*}
     */
    union(a, b) {
        let newArr = a.concat(b)
        return this.unique(newArr)
    },

    /**
     * 求两个集合的交集
     * @param a
     * @param b
     * @returns {Array}
     */
    intersect(a, b) {
        let _this = this
        a = this.unique(a)
        return this.map(a, function (o) {
            return _this.contains(b, o) ? o : null
        })
    },

    /**
     * 删除其中一个元素
     * @param arr
     * @param ele
     * @returns {*}
     */
    remove(arr, ele) {
        let index = arr.indexOf(ele)
        if (index > -1) {
            arr.splice(index, 1)
        }
        return arr
    },

    /**
     * 将类数组转换为数组的方法
     * @param ary
     * @returns {*}
     */
    formArray(ary) {
        let arr = []
        if (Array.isArray(ary)) {
            arr = ary
        } else {
            arr = Array.prototype.slice.call(ary)
        }
        return arr
    },

    /**
     * 最大值
     * @param arr
     * @returns {number}
     */
    max(arr) {
        return Math.max.apply(null, arr)
    },

    /**
     * 最小值
     * @param arr
     * @returns {number}
     */
    min(arr) {
        return Math.min.apply(null, arr)
    },

    /**
     * 求和
     * @param arr
     * @returns {*}
     */
    sum(arr) {
        return arr.reduce((pre, cur) => {
            return pre + cur
        })
    },

    /**
     * 平均值
     * @param arr
     * @returns {number}
     */
    average(arr) {
        return this.sum(arr) / arr.length
    },
}
