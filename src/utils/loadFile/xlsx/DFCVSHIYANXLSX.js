import xlsx from "xlsx";
import moment from "moment";

const ORDERID = extractionStrConfig.DFCVSHIYAN.ORDERID;
const MATERIALNO = extractionStrConfig.DFCVSHIYAN.MATERIALNO;
const COUNT = extractionStrConfig.DFCVSHIYAN.COUNT;
const STATUS = extractionStrConfig.DFCVSHIYAN.STATUS;
const DELIVERYDATE = extractionStrConfig.DFCVSHIYAN.DELIVERYDATE;

const readFile = (file) => {
  return new Promise((resolve) => {
    let reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (ev) => {
      resolve(ev.target.result);
    };
  });
};

export default async function DFCVSHIYANXLSX(file) {
  let dataBinary = await readFile(file);
  let workBook = xlsx.read(dataBinary, { type: "binary", cellDates: true });
  var result = [];
  const SheetName = workBook.SheetNames[0];
  // workBook.SheetNames.forEach(function (sheetName) {
  var roa = xlsx.utils.sheet_to_json(workBook.Sheets[SheetName], { header: 1 });
  if (roa.length) result = JSON.parse(JSON.stringify(roa));
  // });
  return formatData(result);
}
// 格式化数据
function formatData(result) {
  // 存储最后返回获取的数据

  let targetList = [];
  let itemList = [];

  let orderIdCol;
  let orderDate = moment().format("YYYY-MM-DD");

  let materialCol;
  let materialNoStartRow;

  let countCol;

  let statusCol;

  let deliveryDayCol;
  let deliveryDate;

  result.forEach((item, row) => {
    item.forEach((it, col) => {
      // order no
      if (typeof it == "string" && it === ORDERID) {
        orderIdCol = col;
      }
      if (typeof it == "string" && it === MATERIALNO) {
        materialCol = col;
        materialNoStartRow = row + 1;
      }
      if (typeof it == "string" && it === COUNT) {
        countCol = col;
      }
      if (typeof it == "string" && it === STATUS) {
        statusCol = col;
      }
      if (typeof it == "string" && it === DELIVERYDATE) {
        deliveryDayCol = col;
      }
    });
  });
  result.forEach((item, row) => {
    if (
      row >= materialNoStartRow &&
      !itemList.includes(item) &&
      !item[statusCol].includes("关闭")
    ) {
      if (moment(item[deliveryDayCol].substr(0, 10)).isValid()) {
        var day = moment(item[deliveryDayCol].substr(0, 10));
        deliveryDate = day.format("YYYY-MM-DD");
      } else {
        deliveryDate = item[deliveryDayCol];
      }
      itemList.push(item);
      targetList.push({
        id: `${item[materialCol]}${item[countCol]}`,
        materialNo: item[materialCol],
        count: item[countCol],
        deliveryDate,
        orderId: item[orderIdCol],
        orderDate,
      });
    }
  });
  return targetList;
}
