import xlsx from "xlsx";
import moment from "moment";

const ORDERID = extractionStrConfig.FAWDE.ORDERID;
const ORDERDATE = extractionStrConfig.FAWDE.ORDERDATE;
const MATERIALNO = extractionStrConfig.FAWDE.MATERIALNO;
const COUNT = extractionStrConfig.FAWDE.COUNT;
const CLOSEDSTATUS = extractionStrConfig.FAWDE.CLOSEDSTATUS;
const FINISHSTATUS = extractionStrConfig.FAWDE.FINISHSTATUS;
const DELIVERYDATE = extractionStrConfig.FAWDE.DELIVERYDATE;
const NAME = extractionStrConfig.FAWDE.NAME;

// ORDERID: "订单号",
//     ORDERDATE: "发布日期",
//     MATERIALNO: "物料号",
//     DELIVERYDATE: "需求日期",
//     COUNT: "需求数量",
//     CLOSEDSTATUS: "关闭状态",
//     FINISHSTATUS: "完成状态",

const readFile = (file) => {
  return new Promise((resolve) => {
    let reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (ev) => {
      resolve(ev.target.result);
    };
  });
};

export default async function FAWDEXLSX(file) {
  let dataBinary = await readFile(file);
  let workBook = xlsx.read(dataBinary, { type: "binary", cellDates: true });
  var result = [];
  const SheetName = workBook.SheetNames[0];
  // workBook.SheetNames.forEach(function (sheetName) {
  var roa = xlsx.utils.sheet_to_json(workBook.Sheets[SheetName], { header: 1 });
  if (roa.length) result = JSON.parse(JSON.stringify(roa));
  // });
  // console.log(result);
  return formatData(result);
}
// 格式化数据
function formatData(result) {
  // 存储最后返回获取的数据

  let targetList = [];

  let nameCol;

  let orderIdCol;
  let orderDateCol;
  let orderDate;

  let materialCol;
  let materialNoStartRow;

  let countCol;

  let finishStatusCol;
  let closedStatusCol;

  let deliveryDayCol;
  let deliveryDate;

  result.forEach((item, row) => {
    item.forEach((it, col) => {
      if (typeof it == "string" && it === NAME) {
        nameCol = col;
      }
      // order no
      if (typeof it == "string" && it === ORDERID) {
        orderIdCol = col;
      }
      if (typeof it == "string" && it === MATERIALNO) {
        materialCol = col;
        materialNoStartRow = row + 1;
      }
      if (typeof it == "string" && it === ORDERDATE) {
        orderDateCol = col;
      }
      if (typeof it == "string" && it === CLOSEDSTATUS) {
        closedStatusCol = col;
      }
      if (typeof it == "string" && it === FINISHSTATUS) {
        finishStatusCol = col;
      }
      if (typeof it == "string" && it === COUNT) {
        countCol = col;
      }
      if (typeof it == "string" && it === DELIVERYDATE) {
        deliveryDayCol = col;
      }
    });
  });
  result.forEach((item, row) => {
    if (
      row >= materialNoStartRow &&
      item[nameCol] === NAME &&
      item[closedStatusCol].includes("未关闭") &&
      item[finishStatusCol].includes("未完成")
    ) {
      if (moment(item[deliveryDayCol].substr(0, 10)).isValid()) {
        var day = moment(item[deliveryDayCol].substr(0, 10));
        deliveryDate = day.format("YYYY-MM-DD");
      } else {
        deliveryDate = item[deliveryDayCol];
      }
      if (moment(item[orderDateCol]).isValid()) {
        orderDate = moment(item[orderDateCol]).format("YYYY-MM-DD");
      } else {
        orderDate = item[orderDateCol];
      }

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
