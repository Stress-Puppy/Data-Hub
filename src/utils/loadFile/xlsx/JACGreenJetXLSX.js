import xlsx from "xlsx"
import moment from "moment"

const SEQ = extractionStrConfig.JACGreenJet.SEQ
const ORDERDELIVERY = extractionStrConfig.JACGreenJet.ORDERDELIVERY
const MATERIALNO = extractionStrConfig.JACGreenJet.MATERIALNO

const readFile = (file) => {
    return new Promise(resolve => {
        let reader = new FileReader()
        reader.readAsBinaryString(file)
        reader.onload = ev => {
            resolve(ev.target.result)
        }
    })
}

export default async function JACGreenJetXLSX(file) {
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
    let orderMonthList = [];// 表格中有多少订单月份，以及它所在的列
    let materialNocol;// 物料号所在列
    let seqRow;//序号行
    let seqCol;//序号列

    let deliveryDay = "";//交货天

    // 此文件的订单号和 订单日期采用文件上传的日期
    let orderId = moment().format("YYYYMMDDHHmmss");
    let orderDate = moment().format("YYYY-MM-DD");

    // 截取订单主体数组
    let sliceArr = []
    result.forEach((item, index) => {
        item.forEach((it, i) => {
            // 减少多余循环，提升性能
            // if (seqRow && index > seqRow + 1) {
            //     return false
            // }

            // 订单上的年份
            if (/^\d+\年\d+\月.*\采购订单$/g.test(it)) {
                orderYear = it.match(/^\d+\年/g)[0].match(/\d+/g)[0]
            }

            // 获取需要取数据的订单月
            if (/\d{1,2}\月订单/g.test(it)) {
                const year = it.match(/\d+/g)[0]
                let month = it.match(/\d+/g)[1]
                month = month < 10 ? `0${month}` : month
                orderMonthList.push({
                    monthStr: `${year}-${month}`,//年月份
                    colIndex: i,//对应的列下标
                })
            }

            // 获取交货日期的天
            if (it && typeof (it) == "string" && it.includes(ORDERDELIVERY)) {
                deliveryDay = it.match(/\d{1,2}/g)[0]
            }

            // 获取物料号所在列
            if (it == MATERIALNO) {
                materialNocol = i
            }

            // 序号列
            if (it == SEQ) {
                seqRow = index + 1
                seqCol = i
            }
        })
        // 判断主体数据结束行，并截取数组
        if (seqRow && index >= seqRow && /\d+/g.test(item[seqCol])) {
            if (!sliceArr.length && result[index + 1].length == 0) {
                sliceArr = result.slice(seqRow, index + 1)
            }
        }
    })
    sliceArr.forEach(row => {
        orderMonthList.forEach((orMon) => {
            targetList.push({
                id: `${row[seqCol]}${orMon.monthStr}`,
                materialNo: row[materialNocol],
                count: row[orMon.colIndex] || 0,
                deliveryDate: `${orMon.monthStr}-${deliveryDay || 15}`,
                orderId,
                orderDate,
            })
        })
    })
    return targetList
}
