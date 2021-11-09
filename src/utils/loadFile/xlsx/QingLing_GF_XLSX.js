import xlsx from "xlsx"
import moment from "moment"

const SEQ = extractionStrConfig.QINGLING_GF.SEQ
const MATERIALNAME = extractionStrConfig.QINGLING_GF.MATERIALNO

const readFile = (file) => {
    return new Promise(resolve => {
        let reader = new FileReader()
        reader.readAsBinaryString(file)
        reader.onload = ev => {
            resolve(ev.target.result)
        }
    })
}

export default async function FAWHQXLSX(file) {
    let dataBinary = await readFile(file)
    let workBook = xlsx.read(dataBinary, { type: 'binary', cellDates: true })
    var result = [];
    const SheetName = workBook.SheetNames[0]
    // workBook.SheetNames.forEach(function (sheetName) {
    var roa = xlsx.utils.sheet_to_json(workBook.Sheets[SheetName], { header: 1 });
    if (roa.length) result = JSON.parse(JSON.stringify(roa));
    // });
    return formatData(result)
}
// 格式化数据
function formatData(result) {
    // 存储最后返回获取的数据
    let targetList = [];

    // 订单号（QL-当天日期）
    let orderId = moment().format("YYYYMMDDHHmmss");

    // 表头列
    let tableHeaderRow;

    // 序号所在列
    let seqCol;

    //订单日期（当前时间）
    let orderDate = moment().format("YYYY-MM-DD");

    let materialNocol; // 物料号（庆铃图号）所在列
    // 订单数量
    let orderList = [];

    // 截取订单主体数组
    let sliceArr = []

    result.forEach((item, index) => {
        item.forEach((it, i) => {

            // 获取序号所在列
            if (it && typeof (it) == "string" && it.includes(SEQ)) {
                seqCol = i
            }

            // 获取物料号所在列
            if (!materialNocol && typeof (it) == "string" && it.includes(MATERIALNAME)) {
                materialNocol = i
                tableHeaderRow = index
            }
            // 获取交货日期
            if (/^\d{4}-\d{1,2}-\d{1,2}/g.test(it)) {
                const dateStr = moment(it).format("YYYY-MM-DD")
                orderList.push({
                    dateStr: dateStr,
                    col: i
                })
            }
        })
        // 判断主体数据结束行，并截取数组
        if (index > tableHeaderRow && !sliceArr.length && typeof (item[seqCol]) == "number" && (!result[index + 1][seqCol] || typeof (result[index + 1][seqCol]) == "string")) {
            sliceArr = result.slice(tableHeaderRow + 1, index + 1)
        }
    });
    sliceArr.forEach((item, index) => {
        orderList.forEach(order => {
            const count = item[order.col] || 0
            const deliveryDate = `${order.dateStr}`
            if (item[materialNocol]) {
                targetList.push({
                    id: `${item[materialNocol]}${order.dateStr}`,
                    materialNo: item[materialNocol],
                    count,
                    deliveryDate,
                    orderId: "QingLing-GF" + orderId,
                    orderDate,
                })
            }

        })
    })
    return targetList
}
