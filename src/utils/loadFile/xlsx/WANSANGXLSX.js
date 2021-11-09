import xlsx from "xlsx";
import moment from "moment";

const ORDERID = extractionStrConfig.WANSANG.ORDERID;
const ORDERDATE = extractionStrConfig.WANSANG.ORDERDATE;
const MATERIALNO = extractionStrConfig.WANSANG.MATERIALNO;
const COUNT = extractionStrConfig.WANSANG.COUNT;
const DELIVERYDATE = extractionStrConfig.WANSANG.DELIVERYDATE;

// console.log(ORDERID);
// console.log(ORDERDATE);
// console.log(MATERIALNO);
// console.log(COUNT);
// console.log(DELIVERYDATE);

const readFile = (file) => {
  return new Promise((resolve) => {
    let reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (ev) => {
      resolve(ev.target.result);
    };
  });
};

export default async function WANSANGXLSX(file) {
  let dataBinary = await readFile(file);
  let workBook = xlsx.read(dataBinary, { type: "binary", cellDates: true });
  var result = [];
  const SheetName = workBook.SheetNames[0];
  // workBook.SheetNames.forEach(function (sheetName) {
  var roa = xlsx.utils.sheet_to_json(workBook.Sheets[SheetName], { header: 1 });
  if (roa.length) result = JSON.parse(JSON.stringify(roa));
  // });
  //   console.log(result);
  return formatData(result);
}
// 格式化数据
function formatData(result) {
  // 存储最后返回获取的数据

  let targetList = [];
  let itemList = [];

  let orderId;
  let orderDate;

  let materialCol;
  let materialNoStartRow;

  let countCol;

  let deliveryDayCol;
  let deliveryDate;

  result.forEach((item, row) => {
    item.forEach((it, col) => {
      // order no
      if (typeof it == "string" && it.includes(ORDERID)) {
        orderId = it.substring([it.indexOf(":") + 1]);
      }
      if (typeof it == "string" && it.includes(ORDERDATE)) {
        orderDate = it.substring([it.indexOf(":") + 1]);
        orderDate = moment(orderDate).format("YYYY-MM-DD");
        // console.log(orderDate);
      }
      if (
        typeof it == "string" &&
        it.replace(/\s*/g, "").includes(MATERIALNO)
      ) {
        materialCol = col;
        materialNoStartRow = row + 1;
        // console.log(materialNoStartRow);
        // console.log(materialCol);
      }
      if (typeof it == "string" && it.includes(COUNT)) {
        countCol = col;
      }
      if (typeof it == "string" && it.includes(DELIVERYDATE)) {
        deliveryDayCol = col;
      }
    });
  });

  //   console.log(materialNoStartRow);
  result.forEach((item, row) => {
    if (
      row >= materialNoStartRow &&
      item[materialCol] &&
      !/[\u4e00-\u9fa5]+$/.test(item[materialCol])
      // !isNaN(item[countCol])
    ) {
      if (moment(item[deliveryDayCol]).isValid()) {
        deliveryDate = moment(item[deliveryDayCol]).format("YYYY-MM-DD");
      } else {
        deliveryDate = item[deliveryDayCol];
      }
      itemList.push(item);
      targetList.push({
        id: `${item[materialCol]}${item[countCol]}`,
        materialNo: item[materialCol],
        count: item[countCol],
        deliveryDate,
        orderId,
        orderDate,
      });
    }
  });
  return targetList;
}
