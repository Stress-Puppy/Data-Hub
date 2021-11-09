import xlsx from "xlsx"
import moment from "moment"

const SEQ = extractionStrConfig.JAC.SEQ
const ORDERDATE = extractionStrConfig.JAC.ORDERDATE
const MATERIALNAME = extractionStrConfig.JAC.MATERIALNAME
const COUNT = extractionStrConfig.JAC.COUNT

const readFile = (file) => {
    return new Promise(resolve => {
        let reader = new FileReader()
        reader.readAsBinaryString(file)
        reader.onload = ev => {
            resolve(ev.target.result)
        }
    })
}

export default async function JACXLSX(file) {
    let dataBinary = await readFile(file)
    let workBook = xlsx.read(dataBinary, { type: 'binary', cellDates: true })
    var result = [];
    workBook.SheetNames.forEach(function (sheetName) {
        var roa = xlsx.utils.sheet_to_json(workBook.Sheets[sheetName], { header: 1 });
        if (roa.length) result = JSON.parse(JSON.stringify(roa));
    });

    return formatData(result)
}
// 格式化数据
function formatData(result) {
    // 存储最后返回获取的数据
    let targetList = [];

    let orderYear = ""; //订单中的年
    let orderMonth = ""; //订单中的月
    let orderMonthList = [];// 表格中有多少订单月份，以及它所在的列
    let materialNocol;// 物料号所在列
    let seqRow;//序号行
    let seqCol;//序号列

    let orderId = moment().format("YYYYMMDDHHmmss")
    let orderDate = "";

    // 截取订单主体数组
    let sliceArr = []
    try {
        result.forEach((item, index) => {
            item.forEach((it, i) => {
                // 减少多余循环，提升性能
                if (seqRow && index > seqRow + 1) {
                    return false
                }

                if (/^\d+\年\d+\月/g.test(it)) {
                    orderYear = it.match(/^\d+\年/g)[0].match(/\d+/g)[0]
                    orderMonth = it.match(/\年\d+\月/g)[0].match(/\d+/g)[0]
                }

                if (it == ORDERDATE) {
                    const dateStr = result[index + 1][i]
                    let dateArr = dateStr.match(/\d+/g)
                    dateArr = dateArr.map(el =>
                        el < 10 ? `0${el}` : el
                    )
                    orderDate = `${orderYear}-${dateArr.join("-")}`
                }

                // 获取需要取数据的订单月
                if (/\d{1,2}\月订单/g.test(it)) {
                    if (result[index + 1][i + 1] == COUNT) {
                        orderMonthList.push({
                            monthStr: it.match(/\d+/g)[0],//月份
                            colIndex: i + 1,//对应的列下标
                        })
                    }
                }
                // 获取物料号所在列
                if (it == MATERIALNAME) {
                    materialNocol = i
                }
                // 序号列
                if (it == SEQ) {
                    seqRow = index + 1
                    seqCol = i
                }
            })
            // 判断主体数据结束行，并截取数组
            if (seqRow && index > seqRow && /\d+/g.test(item[seqCol]) && /\D/g.test(result[index + 1][seqCol])) {
                sliceArr = result.slice(seqRow + 1, index + 1)
            }
        })
        sliceArr.forEach(row => {
            let useYear = orderYear
            orderMonthList.forEach((orMon, index) => {
                const month = +orMon.monthStr < 10 ? `0${orMon.monthStr}` : orMon.monthStr
                // 判断是否跨年，如果跨年就加一年
                if (orderMonthList[index - 1] && Math.abs((+orMon.monthStr) - (orderMonthList[index - 1].monthStr)) != 1) {
                    useYear = +orderYear + 1
                }
                targetList.push({
                    id: `${row[seqCol]}${month}`,
                    materialNo: row[materialNocol],
                    count: row[orMon.colIndex] || 0,
                    deliveryDate: `${useYear}-${month}-01`,
                    orderId:"JAC"+orderId,
                    orderDate,
                })
            })
        })
    }
    catch { }

    return targetList
}
