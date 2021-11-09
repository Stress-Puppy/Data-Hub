import xlsx from "xlsx";
import moment from "moment";

const ORDERID = extractionStrConfig.YUEJIN.ORDERID;
const MATERIALNO = extractionStrConfig.YUEJIN.MATERIALNO;
const DELIVERYDATE = extractionStrConfig.YUEJIN.DELIVERYDATE;
const COUNTNEED = extractionStrConfig.YUEJIN.COUNTNEED;
const COUNTGET = extractionStrConfig.YUEJIN.COUNTGET;

const readFile = (file) => {
  return new Promise((resolve) => {
    let reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (ev) => {
      resolve(ev.target.result);
    };
  });
};

export default async function YUEJINXLSX(file) {
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
  //   let itemList = [];

  let orderIdCol;
  let orderDate = moment().format("YYYY-MM-DD");

  let materialCol;
  let materialNoStartRow;

  let count;
  let countNeedCol;
  let countGetCol;

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
      if (typeof it == "string" && it === COUNTNEED) {
        countNeedCol = col;
      }
      if (typeof it == "string" && it === COUNTGET) {
        countGetCol = col;
      }
      if (typeof it == "string" && it === DELIVERYDATE) {
        deliveryDayCol = col;
      }
    });
  });
  result.forEach((item, row) => {
    if (row >= materialNoStartRow && item[materialCol]) {
      if (moment(item[deliveryDayCol]).isValid()) {
        var day = moment(item[deliveryDayCol]);
        deliveryDate = day.format("YYYY-MM-DD");
      } else {
        deliveryDate = item[deliveryDayCol];
      }
      //   itemList.push(item);
      if (
        /.*[\u4e00-\u9fa5]+.*$/.test(item[countNeedCol]) ||
        /.*[\u4e00-\u9fa5]+.*$/.test(item[countGetCol])
      ) {
        console.log(item[countNeedCol]);
        count = item[countNeedCol] + "-" + item[countGetCol];
      } else {
        count = item[countNeedCol] - item[countGetCol];
      }

      targetList.push({
        id: `${item[materialCol]}${item[orderIdCol]}`,
        materialNo: item[materialCol],
        count,
        deliveryDate,
        orderId: item[orderIdCol],
        orderDate,
      });
    }
  });
  return targetList;
}
