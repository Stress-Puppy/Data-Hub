import xlsx from "xlsx"
import moment from "moment"

const SEQ = extractionStrConfig.FENGZE.SEQ
const ORDERNO = extractionStrConfig.FENGZE.ORDERNO
const ORDERDATE = extractionStrConfig.FENGZE.ORDERDATE
const MATERIALNO = extractionStrConfig.FENGZE.MATERIALNO
const COUNT = extractionStrConfig.FENGZE.COUNT
const DELIVERYDATE = extractionStrConfig.FENGZE.DELIVERYDATE


const readFile = (file) => {
    return new Promise(resolve => {
        let reader = new FileReader()
        reader.readAsBinaryString(file)
        reader.onload = ev => {
            resolve(ev.target.result)
        }
    })
}

export default async function FENGZEXLSX(file) {
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

    let firstTableRow;
    // let firstMaterialCol;

    // 订单号（）
    let orderId;

    //订单日期（客户号后最后一个）
    let orderDate;

    // 序号、物料号（博世编号）、数量、交货期所在列
    let headerPos;
    let headerMaterial;
    let headerNumber;
    let headerDeliveryDate;

    // 物料号（博世编号）
    let materialNumber;

    // 交货日期
    let deliveryDate;

    // 订单数量
    let count;

    result.forEach((item, row) => {
        item.forEach((it, col) => {
            // order no
            if (typeof (it) == "string" && it.includes(ORDERNO)) {
                orderId = item[col + 1]
            }

            // orderDate
            if (typeof (it) == "string" && it.includes(ORDERDATE)) {
                orderDate = item[item.length - 1];
                orderDate = moment(orderDate).format("YYYY-MM-DD");
            }

            // 序号的列 
            if (typeof (it) == "string" && it.includes(SEQ)) {
                headerPos = col;
            }

            // 物料号（博世编号）的列 
            if (typeof (it) == "string" && it.includes(MATERIALNO)) {
                firstTableRow = row + 1;
                headerMaterial = col;
            }

            // 数量的列
            if (typeof (it) == "string" && it.match(COUNT)) {
                headerNumber = col;
            }

            // 交货期的列 
            if (typeof (it) == "string" && it.includes(DELIVERYDATE)) {
                headerDeliveryDate = col;
            }
        })
    });
    result.forEach((item, row) => {
        if (row >= firstTableRow && item[headerPos] && !isNaN(item[headerPos])) {
            var day = moment(item[headerDeliveryDate].substr(0, 10));
            deliveryDate = day.add(1, "day").format("YYYY-MM-DD");
            materialNumber = item[headerMaterial];
            count = item[headerNumber];
            targetList.push({
                id: `${item[headerPos]}${item[headerMaterial]}`,
                materialNo: materialNumber,
                count,
                deliveryDate,
                orderId,
                orderDate,
            })
        }

    })
    return targetList
}
