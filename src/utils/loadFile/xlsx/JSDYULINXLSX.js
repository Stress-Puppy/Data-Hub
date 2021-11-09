import xlsx from "xlsx";
import moment from "moment";

const SEQ = extractionStrConfig.JSDYULIN.SEQ;
const ORDERID = extractionStrConfig.JSDYULIN.ORDERID;
const ORDERDATE = extractionStrConfig.JSDYULIN.ORDERDATE;
const MATERIALNO = extractionStrConfig.JSDYULIN.MATERIALNO;
const COUNT = extractionStrConfig.JSDYULIN.COUNT;
const DELIVERYDATE = extractionStrConfig.JSDYULIN.DELIVERYDATE;
// console.log(extractionStrConfig.JSDYULIN.ORDERID);

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

export default async function JSDYULINXLSX(file) {
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
  // let itemList = [];

  let seqCol;
  let orderId;
  let orderDate;

  let materialCol;
  let materialNoStartRow;

  let countCol;

  let deliveryDayCol;

  let count;
  let deliveryDate;

  //   console.log(result[1][0]);
  //   console.log(typeof result[1][0] == "string");
  //   console.log(ORDERID);
  //   console.log(typeof ORDERID);
  //   console.log(result[1][0].includes(ORDERID));

  result.forEach((item, row) => {
    // console.log(item);
    item.forEach((it, col) => {
      // order no
      //   console.log(it);

      if (typeof it == "string" && it === SEQ) {
        seqCol = col;
        console.log(seqCol + "seqCol");
      }

      if (typeof it == "string" && it.includes(ORDERID)) {
        orderId = item[col + 1];
        // console.log(item);
      }
      if (typeof it == "string" && it.includes(ORDERDATE)) {
        orderDate = item[col + 1];
        orderDate = moment(orderDate).format("YYYY-MM-DD");
        // console.log(orderDate);
      }
      if (typeof it == "string" && it === MATERIALNO) {
        materialCol = col;
        materialNoStartRow = row + 1;
        // console.log(materialCol);
      }
      if (typeof it == "string" && it === COUNT) {
        countCol = col;
        // console.log(countCol);
      }
      if (typeof it == "string" && it === DELIVERYDATE) {
        deliveryDayCol = col;
        // console.log(deliveryDayCol);
      }
    });
  });

  // result.forEach((item, row) => {
  //   item.forEach((it, col) => {
  //     if (
  //       row >= materialNoStartRow &&
  //       item[seqCol] &&
  //       !/[\u4e00-\u9fa5]+$/.test(item[seqCol])
  //     ) {

  //     }
  //   });
  // });

  result.forEach((item, row) => {
    if (
      row >= materialNoStartRow &&
      !isNaN(item[seqCol]) &&
      //   !/.*[\u4e00-\u9fa5]+.*$/.test(item[materialCol]) &&
      item[seqCol]
      //    &&
      // item[countCol] &&
      // !isNaN(item[countCol]) &&
      //   item[deliveryDayCol]
    ) {
      if (item[deliveryDayCol] && moment(item[deliveryDayCol]).isValid()) {
        deliveryDate = moment(item[deliveryDayCol]).format("YYYY-MM-DD");
      } else {
        deliveryDate = item[deliveryDayCol];
      }

      if (!item[countCol]) {
        count = 0;
      } else {
        count = item[countCol];
      }
      // itemList.push(item);

      //   console.log({
      //     id: `${item[materialCol]}${item[countCol]}`,
      //     materialNo: item[materialCol],
      //     count: item[countCol],
      //     deliveryDate,
      //     orderId: item[orderIdCol],
      //     orderDate,
      //   });
      targetList.push({
        id: `${item[materialCol]}${item[countCol]}`,
        materialNo: item[materialCol],
        count,
        deliveryDate,
        orderId,
        orderDate,
      });
    }
  });
  return targetList;
}
