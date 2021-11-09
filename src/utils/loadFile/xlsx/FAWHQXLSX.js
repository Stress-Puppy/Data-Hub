import xlsx from "xlsx"
import moment from "moment"

const SEQ = extractionStrConfig.FAWHQ.SEQ
const PARTNO = extractionStrConfig.FAWHQ.PARTNO
const ORDERNO = extractionStrConfig.FAWHQ.ORDERNO
const MINUEND = extractionStrConfig.FAWHQ.MINUEND
const SUBTRACTION = extractionStrConfig.FAWHQ.SUBTRACTION
const ORDERDATE = extractionStrConfig.FAWHQ.ORDERDATE
const DELIVERYDATE = extractionStrConfig.FAWHQ.DELIVERYDATE

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
    // 表头所在行
    let tableHeaderRow = null;

    let orderNoCol; // 订单号所在列
    let orderDateCol;// 订单日期所在列
    let materialNoCol;// 物料号所在列
    let deliveryDateCol;// 交货日期所在列

    let minuendCol; // 被减数所在列
    let SubtractionCol; // 减数所在列


    // 找到表头行，并找到对应字段列数据
    result.forEach((item, index) => {
        if (item.includes(SEQ) && item.includes(PARTNO) && item.includes(ORDERNO)) {
            tableHeaderRow = index;
            item.forEach((it, i) => {
                if (it.includes(PARTNO) && !materialNoCol) {
                    materialNoCol = i
                }
                else if (it.includes(MINUEND) && !minuendCol) {
                    minuendCol = i
                }
                else if (it.includes(SUBTRACTION) && !SubtractionCol) {
                    SubtractionCol = i
                }
                else if (it.includes(ORDERNO) && !orderNoCol) {
                    orderNoCol = i
                }
                else if (it.includes(ORDERDATE) && !orderDateCol) {
                    orderDateCol = i
                }
                else if (it.includes(DELIVERYDATE) && !deliveryDateCol) {
                    deliveryDateCol = i
                }
            })
        }
    })
    if (tableHeaderRow || tableHeaderRow == 0) {
        result.forEach((rowData, row) => {
            if (row > tableHeaderRow) {
                const materialNo = rowData[materialNoCol]
                const count = rowData[minuendCol] - rowData[SubtractionCol]
                const deliveryDate = rowData[deliveryDateCol]
                const orderId = rowData[orderNoCol]
                const orderDate = rowData[orderDateCol]

                targetList.push({
                    id: row,
                    materialNo,
                    count,
                    deliveryDate: formatDate(deliveryDate),
                    orderId,
                    orderDate: formatDate(orderDate),
                })
            }
        })
    }
    return targetList
}

function formatDate(dateStr) {
    // const YMD = dateStr.split(" ")[0]
    // const date = YMD.split("/")
    return moment(dateStr).format("YYYY-MM-DD")
}
