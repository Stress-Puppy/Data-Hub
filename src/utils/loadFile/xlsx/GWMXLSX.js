import xlsx from "xlsx"
import moment from "moment"

const MATERIALNO = extractionStrConfig.GWM.MATERIALNO

const readFile = (file) => {
    return new Promise(resolve => {
        let reader = new FileReader()
        reader.readAsBinaryString(file)
        reader.onload = ev => {
            resolve(ev.target.result)
        }
    })
}

export default async function GWMXLSX(file) {
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

    // 此文件的订单号和 订单日期采用文件上传的日期
    let orderId = moment().format("YYYYMMDDHHmmss");

    // 表头列
    let tableHeaderRow;

    //订单日期
    let orderDate = moment().format("YYYY-MM-DD");

    // 交货日期 每月25号

    let materialNocol; // 物料号所在列
    let orderMonthList = [];// 表格中有多少订单月份，以及它需要相加数据的列

    result.forEach((item, index) => {
        item.forEach((it, i) => {

            // 物料号所在列
            if (!materialNocol && typeof (it) == "string" && it.includes(MATERIALNO)) {
                materialNocol = i
                tableHeaderRow = index
            }

            // 获取订单月
            if (/^\d{1,2}\月/g.test(it)) {
                const monthStr = it.match(/\d+/g)[0]
                const month = monthStr < 10 ? `0${monthStr}` : monthStr
                orderMonthList.push({
                    monthStr: month,
                    col: i
                })
            }

        })
    });
    result.forEach((item, index) => {
        if (index > tableHeaderRow) {
            const year = orderId.slice(0, 4)
            orderMonthList.forEach(orMon => {
                const count = item[orMon.col] || 0

                const deliveryDate = `${year}-${orMon.monthStr}-25`
                targetList.push({
                    id: `${item[materialNocol]}${orMon.monthStr}`,
                    materialNo: item[materialNocol],
                    count,
                    deliveryDate,
                    orderId: "48V-GWM" + orderId,
                    orderDate,
                })
            })
        }
    })
    return targetList
}
