import xlsx from "xlsx";
import moment from "moment";

const MATERIALNO = extractionStrConfig.SANYCHANGSHA.MATERIALNO;

const readFile = (file) => {
  return new Promise((resolve) => {
    let reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (ev) => {
      resolve(ev.target.result);
    };
  });
};

export default async function SANYCHANGSHAXLSX(file) {
  let dataBinary = await readFile(file);
  let workBook = xlsx.read(dataBinary, { type: "binary", cellDates: true });
  var result = [];
  workBook.SheetNames.forEach(function (sheetName) {
    var roa = xlsx.utils.sheet_to_json(workBook.Sheets[sheetName], {
      header: 1,
    });
    if (roa.length) {
      const originData = JSON.parse(JSON.stringify(roa));
      // console.log(originData);
      const targetData = formatData(originData);
      result = [...result, ...targetData];
    }
  });
  // console.log(result);
  return result;
}
// 格式化数据
function formatData(result) {
  // 存储最后返回获取的数据
  let targetList = [];

  let firstMaterialRow;
  let materialCol;
  //   let dateStartCol;
  //   let dataEndCol;
  let dates;

  var date = new Date();

  let orderId = "Sany-Changsha" + moment().format("YYYYMMDDHHmmss");
  let orderDate = moment().format("YYYY-MM-DD");

  let deliveryDateList = [];
  let deliveryDate;

  let count;

  result.forEach((item, row) => {
    item.forEach((it, col) => {
      // 物料号（型号）的列
      if (typeof it == "string" && it.includes(MATERIALNO)) {
        firstMaterialRow = row + 1;
        materialCol = col;
        // console.log(item);
        dates = item.slice(col + 3);
      }

      //   // 数量的列
      //   if (typeof it == "string" && it.match(COUNT)) {
      //     headerNumber = col - 1;
      //   }

      //   // 交货期的列
      //   if (typeof it == "string" && it.includes(DELIVERYDATE)) {
      //     headerDeliveryDate = col;
      //   }
    });
  });

  result.forEach((item, row) => {
    if (
      row >= firstMaterialRow &&
      item[materialCol] &&
      !/[\u4e00-\u9fa5]+$/.test(item[materialCol])
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
        count = item[materialCol + 3 + index];
        console.log(count);
        if (!count) {
          console.log(count);
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
