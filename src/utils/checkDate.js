//验证正确的日期格式
function Common_ChkDate(datestr) {
    // 正規表現 判断日期格式是否是"yyyy/MM/dd"
    if (!datestr.match(/^\d{4}\-\d{1,2}\-\d{1,2}$/)) {
        return false;
    }

    //判断月和日是否是两位，如果是1位，就在前面加“0”
    if (datestr.length < 10) {
        var l_splitDate = datestr.trim().split('/')
        for (i = 0; i < l_splitDate.length; i++) {
            if (l_splitDate[i].length == 1) {
                l_splitDate[i] = "0" + l_splitDate[i]
            }
        }
        l_splitDate = l_splitDate[0] + '/' + l_splitDate[1] + '/' + l_splitDate[2]
        datestr = l_splitDate
    }

    // 将日期转换为数值类型
    var iYear = datestr.substr(0, 4) - 0;
    var iMonth = datestr.substr(5, 2) - 0;
    var iDay = datestr.substr(8, 2) - 0;

    //有効年范围1753～9999
    if ((Number(iYear) > 9999) || (Number(iYear) < 1753)) {
        return false;
    }

    // 月份正常时31天
    if ((iMonth >= 1) && (iMonth <= 12)) {
        var iMaxDay = 31;

        // 判断哪几个月份是30天
        switch (iMonth) {
            case 4:
            case 6:
            case 9:
            case 11:
                iMaxDay = 30;
                break;
            case 2:

                // 能被4整除的闰年
                if ((iYear % 4) == 0) {
                    // 也能被 100 整除是闰年
                    if ((iYear % 100) == 0) {
                        // 也能被 400 整除 是闰年
                        if ((iYear % 400) == 0) {
                            iMaxDay = 29;
                        } else {
                            iMaxDay = 28;
                        }
                    } else {
                        // 能被4 整除 不能被 100 整除闰年
                        iMaxDay = 29;
                    }
                } else {
                    // 不能被 4 整除的是
                    iMaxDay = 28;
                }
                break;
            default:
                break;
        }

        //天的取值范围
        if ((iDay >= 1) && (iDay <= iMaxDay)) {
            return true;
        }
    }
    return false;
}

export {Common_ChkDate}