import xlsx from "xlsx"
import moment from "moment"

const MULTIPLIER = extractionStrConfig.SDEC.MULTIPLIER
const ADDEND = extractionStrConfig.SDEC.ADDEND

const readFile = (file) => {
    return new Promise(resolve => {
        let reader = new FileReader()
        reader.readAsBinaryString(file)
        reader.onload = ev => {
            resolve(ev.target.result)
        }
    })
}

export default async function SDECXLSX(file) {
    let dataBinary = await readFile(file)
    let workBook = xlsx.read(dataBinary, { type: 'binary', cellDates: true })
    var result = [];
    workBook.SheetNames.forEach(function (sheetName) {
        var roa = xlsx.utils.sheet_to_json(workBook.Sheets[sheetName], { header: 1 });
        if (roa.length) result = JSON.parse(JSON.stringify(roa));
    });
    // formatData(result)
    return formatData(result)
}
// 格式化数据
function formatData(result) {
    // 存储最后返回获取的数据
    let targetList = [];

    // 此文件的订单号和 订单日期采用文件上传的日期
    let orderId = moment().format("YYYYMMDDHHmmss");

    //订单日期
    let orderDate = "";

    // 交货日期由赋表格中月份的第一天

    let materialNocol; // 物料号所在列
    let multiplierCol; // 乘数所在列
    let sliceStartRow; // 需要截取表格主体的开始行
    let orderMonthList = [];// 表格中有多少订单月份，以及它需要相加数据的列

    // 截取订单主体数组
    let sliceArr = []

    result.forEach((item, index) => {
        item.forEach((it, i) => {

            // 获取订单日期和物料号所在列
            if (!orderDate && it && /[评审日期]/mg.test(it)) {
                const filtNumb = it.match(/\d+/g)[0];
                if (filtNumb.length == 8) {
                    orderDate = moment(filtNumb).format("YYYY-MM-DD")
                } else if (filtNumb.length == 4) {
                    orderDate = `${moment().format("YYYY")}-${filtNumb.slice(0, 2)}-${filtNumb.slice(2)}`
                }else{
                    orderDate = filtNumb
                }
                sliceStartRow = index + 1;
                materialNocol = i
            }

            // 获取乘数所在列
            if (!multiplierCol && it.includes(MULTIPLIER)) {
                multiplierCol = i
            }

            // 获取订单月
            if (/^\d{1,2}\月/g.test(it) && sliceStartRow - 1 == index) {
                const monthStr = it.match(/\d+/g)[0]
                const month = monthStr < 10 ? `0${+monthStr}` : monthStr
                // 获取单月搜寻字段的取值范围
                const startMonCol = i;//起始列 
                const endMonCol = i + 3//结束列，因i也算一列所以+3表示开始列后三列共4列
                // 在下一行搜寻关键字，记录它们的列
                const sumCol = [];
                result[index + 1].map((el, j) => {
                    if (el) {
                        if (j >= startMonCol && j <= endMonCol && el.includes(ADDEND)) {
                            sumCol.push(j)
                        }
                    }
                })
                orderMonthList.push(
                    {
                        month,
                        sumCol
                    }
                )
            }

        })
        // 判断主体数据结束行，并截取数组
        var reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
        if (sliceStartRow && index >= sliceStartRow && typeof (item[materialNocol]) == "string" && reg.test(item[materialNocol])) {
            if (!sliceArr.length) {
                sliceArr = result.slice(sliceStartRow + 1, index)
            }
        }
    })
    sliceArr.forEach(row => {
        // 物料号
        const materialNo = row[materialNocol]
        // 乘数
        const multiplier = row[multiplierCol]
        // 锚点年
        let deliveryYear = orderDate.slice(0, 4)
        orderMonthList.forEach((orMon, index) => {
            if (orMon.sumCol.length) {
                // 判断月份跨年，确保能取到下一个用来比对
                if(index){
                    if(+orMon.month == 1 &&  orderMonthList[index - 1].month == 12){
                        deliveryYear = +deliveryYear + 1
                    }
                }

                let deliveryDate = `${deliveryYear}-${orMon.month}-01`
                let count = multiplier * colSum(row, orMon.sumCol)
                targetList.push({
                    id: `${materialNo}${orMon.month}`,
                    materialNo,
                    count,
                    deliveryDate,
                    orderId:"SDEC" + orderId,
                    orderDate,
                })
            }
        })
    })
    return targetList
}

function colSum(targetArr, colList) {
    let sum = 0;
    colList.forEach(item => {
        if (targetArr[item]) {
            sum = sum + targetArr[item]
        }
    })
    return sum
}
