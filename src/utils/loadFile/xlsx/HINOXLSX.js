import xlsx from "xlsx";
import moment from "moment";

const ORDERID = extractionStrConfig.HINO.ORDERID;
const ORDERDATE = extractionStrConfig.HINO.ORDERDATE;
const MATERIALNO = extractionStrConfig.HINO.MATERIALNO;

const readFile = (file) => {
  return new Promise((resolve) => {
    let reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (ev) => {
      resolve(ev.target.result);
    };
  });
};

export default async function HINOXLSX(file) {
  let dataBinary = await readFile(file);
  let workBook = xlsx.read(dataBinary, { type: "binary", cellDates: true });
  var result = [];
  const SheetName = workBook.SheetNames[0];
  // workBook.SheetNames.forEach(function (sheetName) {
  var roa = xlsx.utils.sheet_to_json(workBook.Sheets[SheetName], { header: 1 });
  if (roa.length) result = JSON.parse(JSON.stringify(roa));
  // });
  console.log(result);
  return formatData(result);
}
// 格式化数据
function formatData(result) {
  // 存储最后返回获取的数据

  let targetList = [];
  let orderIdList = [];

  // let firstMonth = false;
  let monthList = [];
  let orderId;
  let orderIdRow;
  let orderIdCol;
  let orderDate;

  let materialCol;
  let materialRow;
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
        orderIdList = item.slice(col + 1);
        orderIdRow = row;
        orderIdCol = col;
        // console.log(orderIdList);
        // console.log(result[30][11] == null);
      }
      if (typeof it == "string" && it === ORDERDATE) {
        orderDate = item
          .slice(col + 1)
          .join()
          .replace(/,/g, "");
        if (moment(orderDate).isValid()) {
          orderDate = moment(orderDate).add(1, "day").format("YYYY-MM-DD");
        }

        // orderDate = moment(item[col + 1]).format("YYYY-MM-DD");
        // console.log(orderDate);
        // console.log(item[col + 1]);
        // console.log(
        //   item
        //     .slice(col + 1)
        //     .join()
        //     .replace(/,/g, "")
        // );
      }
      if (typeof it == "string" && it === MATERIALNO) {
        materialCol = col;
        materialRow = row;
        materialNoStartRow = row + 1;
      }
    });
  });
  monthList = result[materialRow].slice(orderIdCol + 1);
  // console.log(orderIdRow);

  var date = new Date();

  result.forEach((item, row) => {
    if (row >= materialNoStartRow && item[materialCol]) {
      let tempMonth = 0;
      let tempYear = date.getFullYear();
      monthList.forEach((it, col) => {
        if (result[orderIdRow][orderIdCol + 1 + col]) {
          orderId = result[orderIdRow][orderIdCol + 1 + col];
        } else {
          orderId = "HINO" + moment().format("YYYYMMDDHHmmss");
        }

        if (!item[orderIdCol + 1 + col]) {
          count = 0;
        } else {
          count = item[orderIdCol + 1 + col];
        }

        let month = it.substr(0, [it.indexOf("月")]);
        // console.log(month);
        if (parseInt(tempMonth) > parseInt(month)) {
          // console.log(typeof tempMonth);
          // console.log(typeof month);
          // console.log(tempMonth > month);
          tempYear = tempYear + 1;
        }
        tempMonth = month;
        //   console.log(month);
        let tempDate = tempYear + "." + tempMonth + ".15";
        // console.log(tempDate);
        tempDate = moment(tempDate).format("YYYY-MM-DD");

        orderId;
        targetList.push({
          id: `${item[materialCol]}${item[orderIdCol]}`,
          materialNo: item[materialCol],
          count,
          deliveryDate: tempDate,
          orderId,
          orderDate,
        });
      });
      // if (moment(item[deliveryDayCol]).isValid()) {
      //   var day = moment(item[deliveryDayCol]);
      //   deliveryDate = day.format("YYYY-MM-DD");
      // } else {
      //   deliveryDate = item[deliveryDayCol];
      // }
      //   itemList.push(item);
      // if (
      //   /.*[\u4e00-\u9fa5]+.*$/.test(item[countNeedCol]) ||
      //   /.*[\u4e00-\u9fa5]+.*$/.test(item[countGetCol])
      // ) {
      //   console.log(item[countNeedCol]);
      //   count = item[countNeedCol] + "-" + item[countGetCol];
      // } else {
      //   count = item[countNeedCol] - item[countGetCol];
      // }
    }
  });
  return targetList;
}
