import xlsx from "xlsx";
import moment from "moment";

// const ORDERID = extractionStrConfig.BYDCHANGSHA.ORDERID;
const ORDERDATE = extractionStrConfig.BYDCHANGSHA.ORDERDATE;
const MATERIALNO = extractionStrConfig.BYDCHANGSHA.MATERIALNO;
const COUNT = extractionStrConfig.BYDCHANGSHA.COUNT;
// const TYPE = extractionStrConfig.BYDCHANGSHA.TYPE;
// const CLOSEDSTATUS = extractionStrConfig.BYDCHANGSHA.CLOSEDSTATUS;
// const FINISHSTATUS = extractionStrConfig.BYDCHANGSHA.FINISHSTATUS;
// const DELIVERYDATE = extractionStrConfig.BYDCHANGSHA.DELIVERYDATE;
// const NAME = extractionStrConfig.BYDCHANGSHA.NAME;

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

export default async function BYDCHANGSHAXLSX(file) {
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
  let dates = [];
  let countList = [];

  let orderId = "BYD-Changsha" + moment().format("YYYYMMDDHHmmss");
  let orderDate;

  let materialCol;
  let materialNoStartRow;

  let countCol;
  let count;

  let deliveryDate;

  result.forEach((item, row) => {
    item.forEach((it, col) => {
      //   if (typeof it == "string" && it === TYPE) {
      //     nameCol = col;
      //   }
      // order no
      //   if (typeof it == "string" && it === ORDERID) {
      //     orderIdCol = col;
      //   }
      if (typeof it == "string" && it.includes(MATERIALNO)) {
        materialCol = col;
        materialNoStartRow = row + 1;
      }
      if (typeof it == "string" && it.includes(ORDERDATE)) {
        orderDate = result[row + 1][col];
        if (moment(orderDate.slice(0, 10)).isValid()) {
          orderDate = moment(orderDate.slice(0, 10)).format("YYYY-MM-DD");
        } else {
          orderDate = orderDate;
        }
      }
      if (typeof it == "string" && it.includes(COUNT)) {
        countCol = col;
      }

      // if (typeof it == "string" && it === DELIVERYDATE) {
      //   deliveryDayCol = col;
      // }
    });
  });

  var date = new Date();
  let tempYear = date.getFullYear();
  let month = 0;

  let timeStartCol;
  result[materialNoStartRow - 2].forEach((it, col) => {
    if (typeof it == "string" && it.includes("WK")) {
      if (!timeStartCol) {
        timeStartCol = col;
      }
      let tempDate = result[materialNoStartRow - 1][col];
      let tempIndex = tempDate.indexOf("~");
      if (tempIndex == -1) {
        tempDate = tempDate;
      } else {
        tempDate = tempDate.slice(0, tempIndex);
      }

      deliveryDate = tempDate;

      //   console.log(tempDate);

      tempIndex = tempDate.indexOf(".");
      let tempMonth = tempDate.slice(0, tempIndex);
      //   console.log(tempDate);
      tempDate = tempDate.slice(1 + tempIndex);
      if (month > tempMonth) {
        tempYear = tempYear + 1;
      }
      month = tempMonth;

      tempDate = tempYear + "." + tempMonth + "." + tempDate;

      if (moment(tempDate).isValid()) {
        deliveryDate = moment(tempDate).format("YYYY-MM-DD");
      }
      dates.push(deliveryDate);
    }
  });

  //   console.log(result[materialNoStartRow - 1]);
  //   console.log(timeStartCol);

  result.forEach((item, row) => {
    if (row >= materialNoStartRow && item[materialCol]) {
      //   if (moment(item[deliveryDayCol].substr(0, 10)).isValid()) {
      //     var day = moment(item[deliveryDayCol].substr(0, 10));
      //     deliveryDate = day.format("YYYY-MM-DD");
      //   } else {
      //     deliveryDate = item[deliveryDayCol];
      //   }
      let week = -1;
      //   let totalCount = 0;
      let tempObj;
      item.forEach((it, col) => {
        if (col >= timeStartCol) {
          let tempDate = result[materialNoStartRow - 2][col];
          //   let start = false;

          //   如果有新周
          if (tempDate) {
            // tempObj = 1;
            // if (tempObj) {
            //   console.log("youzhi");
            // } else {
            //   console.log("meiyouzhi");
            // }
            if (tempObj) {
              if (
                tempObj.count != 0 &&
                !/.*[\u4e00-\u9fa5]+.*$/.test(tempObj.count)
              ) {
                tempObj.count =
                  Math.ceil(tempObj.count / item[countCol]) *
                  parseInt(item[countCol]);
              }
              targetList.push(tempObj);
            }
            // console.log("tempDate有值" + tempDate);
            week = week + 1;
            // 如果总数量不为0

            if (!/.*[\u4e00-\u9fa5]+.*$/.test(it)) {
              count = parseInt(it);
            } else {
              count = it;
            }
            tempObj = {
              id: `${item[materialCol]}${dates[week]}`,
              materialNo: item[materialCol],
              count,
              deliveryDate: dates[week],
              orderId,
              orderDate,
            };
            // if (totalCount != 0) {
            // //   console.log(totalCount);
            // //   console.log("totalCount != 0");
            //   targetList.push({
            //     id: `${item[materialCol]}${dates[week]}`,
            //     materialNo: item[materialCol],
            //     count: totalCount,
            //     deliveryDate: dates[week],
            //     orderId,
            //     orderDate,
            //   });
            //   totalCount = 0;
            // } else {
            //   totalCount = totalCount + parseInt(it);
            // }
            // start = false;
          }

          //   如果不是新周但是有值
          else if (!tempDate && it) {
            // if (/.*[\u4e00-\u9fa5]+.*$/.test(it) || !isNaN(tempObj.count)) {
            //   tempObj.count = tempObj.count + "+" + it;
            // } else {

            // it为数字
            if (!/.*[\u4e00-\u9fa5]+.*$/.test(it)) {
              if (!/.*[\u4e00-\u9fa5]+.*$/.test(tempObj.count)) {
                tempObj.count = tempObj.count + parseInt(it);
              }
            }

            // it为中文
            else {
              if (!/.*[\u4e00-\u9fa5]+.*$/.test(tempObj.count)) {
                tempObj.count = it;
              } else {
                tempObj.count = tempObj.count + "、" + it;
              }
              // tempObj.count = tempObj.count + parseInt(it);
            }

            // }
          }

          //   if (it > item[countCol]) {
          //   }
          //   targetList.push({
          //     id: `${item[materialCol]}${item[countCol]}`,
          //     materialNo: item[materialCol],
          //     count: item[countCol],
          //     deliveryDate: 1,
          //     orderId,
          //     orderDate,
          //   });
        }
      });
      targetList.push(tempObj);
    }
  });

  return targetList;
}
