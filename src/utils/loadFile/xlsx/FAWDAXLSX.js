import xlsx from "xlsx";
import moment from "moment";

const MATERIALNO = extractionStrConfig.FAWDA.MATERIALNO;
const ORDERDATE = extractionStrConfig.FAWDA.ORDERDATE;

const readFile = (file) => {
  return new Promise((resolve) => {
    let reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (ev) => {
      resolve(ev.target.result);
    };
  });
};

export default async function FAWDAXLSX(file) {
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

  let firstMaterialRow;
  let materialCol;
  //   let dateStartCol;
  //   let dataEndCol;
  let dates = [];

  var date = new Date();

  let orderId = "FAWDA" + moment().format("YYYYMMDDHHmmss");
  let orderDate;

  let deliveryDateList = [];
  let count;

  result.forEach((item, row) => {
    item.forEach((it, col) => {
      // 物料号（型号）的列
      if (typeof it == "string" && it.includes(MATERIALNO)) {
        firstMaterialRow = row + 1;
        materialCol = col;
      }
      if (typeof it == "string" && it.includes(ORDERDATE)) {
        orderDate = item[col + 1];
        orderDate = moment(orderDate).add(1, "day").format("YYYY-MM-DD");
      }
      if (typeof it == "string" && it.includes("月订单")) {
        dates.push(it);
      }
    });
  });

  result.forEach((item, row) => {
    if (
      row >= firstMaterialRow &&
      !/^[\u4e00-\u9fa5]+$/.test(item[materialCol]) &&
      item[materialCol]
    ) {
      if (row == firstMaterialRow) {
        let tempMonth = 0;
        let tempYear = date.getFullYear();
        dates.forEach((month) => {
          //   console.log(month);
          let index = month.indexOf("月");
          //   console.log(index);
          month = parseInt(month.substring(0, index));
          //   console.log(month);
          if (tempMonth > month) {
            tempYear = tempYear + 1;
          }
          tempMonth = month;
          //   console.log(month);
          let tempDate = tempYear + "." + tempMonth + ".1";
          tempDate = moment(tempDate).format("YYYY-MM-DD");
          deliveryDateList.push(tempDate);
        });
      }
      //   materialNumber = item[headerMaterial];
      //   var day = moment(item[headerDeliveryDate].substr(0, 10));
      //   deliveryDate = day.format("YYYY-MM-DD");
      //   count = item[headerNumber];

      deliveryDateList.forEach((time, index) => {
        count = item[materialCol + 2 + index];
        if (!count) {
          count = 0;
        }
        targetList.push({
          id: `${item[materialCol]}`,
          materialNo: item[materialCol],
          count,
          deliveryDate: time,
          orderId,
          orderDate,
        });
      });
    }
  });

  return targetList;
}
