import xlsx from "xlsx";
import moment from "moment";

const MATERIALNO = extractionStrConfig.CHANGCHAI.MATERIALNO;
const DELIVERYDATE = extractionStrConfig.CHANGCHAI.DELIVERYDATE;
const COUNT = extractionStrConfig.CHANGCHAI.COUNT;

const readFile = (file) => {
  return new Promise((resolve) => {
    let reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (ev) => {
      resolve(ev.target.result);
    };
  });
};

export default async function CHANGCHAIXLSX(file) {
  let dataBinary = await readFile(file);
  let workBook = xlsx.read(dataBinary, { type: "binary", cellDates: true });
  var result = [];
  workBook.SheetNames.forEach(function (sheetName) {
    var roa = xlsx.utils.sheet_to_json(workBook.Sheets[sheetName], {
      header: 1,
    });
    if (roa.length) {
      const originData = JSON.parse(JSON.stringify(roa));
      //   console.log(originData);
      const targetData = formatData(originData);
      result = [...result, ...targetData];
    }
  });
  return result;
}
// 格式化数据
function formatData(result) {
  // 存储最后返回获取的数据

  let targetList = [];
  let orderId = "Changchai" + moment().format("YYYYMMDDHHmmss");
  let orderDate;

  let firstDeliveryDateRow;
  let deliveryDateCol;
  let deliveryDate;

  let firstMaterialRow;
  let materialCol;

  let count;
  let countCol;

  result.forEach((item, row) => {
    item.forEach((it, col) => {
      if (typeof it == "string" && it.includes(DELIVERYDATE)) {
        firstDeliveryDateRow = row + 1;
        deliveryDateCol = col;
      }

      // 物料号（型号）的列
      if (typeof it == "string" && it.includes(MATERIALNO)) {
        firstMaterialRow = row + 1;
        materialCol = col;
      }

      // 数量的列
      if (typeof it == "string" && it.match(COUNT)) {
        countCol = col;
      }
      orderDate = it;
    });
  });

  // let stop = false;
  let start = false;

  result.forEach((item, row) => {
    if (
      row >= firstMaterialRow &&
      item[materialCol] &&
      !/[\u4e00-\u9fa5]+$/.test(item[materialCol])
      // !stop
    ) {
      orderDate = moment(orderDate).format("YYYY-MM-DD");

      if (item[deliveryDateCol].indexOf("交") == -1) {
        targetList.push({
          id: `${item[deliveryDateCol]}${item[materialCol]}`,
          materialNo: item[materialCol],
          count: item[countCol],
          deliveryDate: item[deliveryDateCol],
          orderId,
          orderDate,
        });
      } else if (
        item[deliveryDateCol].indexOf(";") != -1 ||
        item[deliveryDateCol].indexOf("；") != -1
      ) {
        item[deliveryDateCol] = item[deliveryDateCol].replace(/；/g, ";");
        console.log(item[deliveryDateCol]);
        let datas = item[deliveryDateCol].split(";");
        // .trim()
        console.log(datas);
        datas.forEach((it) => {
          it = it.trim();
          console.log(it);
          if (it) {
            let ind = it.indexOf("交");
            count = it.substring(ind + 1);
            //
            if (moment(it.substring(0, ind) + ".1").isValid()) {
              deliveryDate = it.substring(0, ind) + ".1";
              deliveryDate = moment(deliveryDate).format("YYYY-MM-DD");
            } else {
              deliveryDate = it.substring(0, ind);
            }

            targetList.push({
              id: `${item[deliveryDateCol]}${item[materialCol]}`,
              materialNo: item[materialCol],
              count,
              deliveryDate,
              orderId,
              orderDate,
            });
          }
        });
      } else {
        // console.log(item[deliveryDateCol]);
        count = item[countCol];
        let ind = item[deliveryDateCol].indexOf("交");
        if (moment(item[deliveryDateCol].substring(0, ind) + ".1").isValid()) {
          deliveryDate = item[deliveryDateCol].substring(0, ind) + ".1";
          deliveryDate = moment(deliveryDate).format("YYYY-MM-DD");
        } else {
          deliveryDate = item[deliveryDateCol].substring(0, ind);
        }
        // deliveryDate = item[deliveryDateCol].substring(0, ind) + ".1";
        // deliveryDate = moment(deliveryDate).format("YYYY-MM-DD");
        targetList.push({
          id: `${item[deliveryDateCol]}${item[materialCol]}`,
          materialNo: item[materialCol],
          count: item[countCol],
          deliveryDate,
          orderId,
          orderDate,
        });
      }
    }
    // } else if (
    //   row >= firstMaterialRow &&
    //   (!item[materialCol] || /^[\u4e00-\u9fa5]+$/.test(item[materialCol])) &&
    //   !stop
    // ) {
    //   stop = true;
    // }
  });

  return targetList;
}

// const dealWithFackComma = function (string) {
//   if (string.indexOf("；") != -1) {
//     //   let datas = string.split("；");
//     return string.split("；");
//   } else if (string.indexOf(";") != -1) {
//     let datas = string.split(";");
//     datas.forEach((it) => {
//       it = it.trim();
//     });
//     return datas;
//   } else {
//     return -1;
//   }
// };

// import xlsx from "xlsx";
// import moment from "moment";

// const MATERIALNO = extractionStrConfig.CHANGCHAI.MATERIALNO;
// const DELIVERYDATE = extractionStrConfig.CHANGCHAI.DELIVERYDATE;
// const COUNT = extractionStrConfig.CHANGCHAI.COUNT;

// const readFile = (file) => {
//   return new Promise((resolve) => {
//     let reader = new FileReader();
//     reader.readAsBinaryString(file);
//     reader.onload = (ev) => {
//       resolve(ev.target.result);
//     };
//   });
// };

// export default async function CHANGCHAIXLSX(file) {
//   let dataBinary = await readFile(file);
//   let workBook = xlsx.read(dataBinary, { type: "binary", cellDates: true });
//   var result = [];
//   workBook.SheetNames.forEach(function (sheetName) {
//     var roa = xlsx.utils.sheet_to_json(workBook.Sheets[sheetName], {
//       header: 1,
//     });
//     if (roa.length) {
//       const originData = JSON.parse(JSON.stringify(roa));
//       //   console.log(originData);
//       const targetData = formatData(originData);
//       result = [...result, ...targetData];
//     }
//   });
//   return result;
// }
// // 格式化数据
// function formatData(result) {
//   // 存储最后返回获取的数据

//   let targetList = [];
//   let orderId = "Changchai" + moment().format("YYYYMMDD");
//   let orderDate;

//   let firstDeliveryDateRow;
//   let deliveryDateCol;
//   let deliveryDate;

//   let firstMaterialRow;
//   let materialCol;

//   let count;
//   let countCol;

//   result.forEach((item, row) => {
//     item.forEach((it, col) => {
//       if (typeof it == "string" && it.includes(DELIVERYDATE)) {
//         firstDeliveryDateRow = row + 1;
//         deliveryDateCol = col;
//       }

//       // 物料号（型号）的列
//       if (typeof it == "string" && it.includes(MATERIALNO)) {
//         firstMaterialRow = row + 1;
//         materialCol = col;
//       }

//       // 数量的列
//       if (typeof it == "string" && it.match(COUNT)) {
//         countCol = col;
//       }
//       orderDate = it;
//     });
//   });

//   result.forEach((item, row) => {
//     if (row >= firstMaterialRow && item[deliveryDateCol] && item[materialCol]) {
//       orderDate = moment(orderDate).format("YYYY-MM-DD");
//       if (
//         item[deliveryDateCol].indexOf(";") != -1 ||
//         item[deliveryDateCol].indexOf("；") != -1
//       ) {
//         item[deliveryDateCol] = item[deliveryDateCol].replace("；", ";");
//         let datas = item[deliveryDateCol].split(";");
//         // .trim()
//         // console.log(datas);
//         datas.forEach((it) => {
//           it = it.trim();
//           //   console.log(it);
//           let ind = it.indexOf("交");
//           count = it.substring(ind + 1);
//           deliveryDate = it.substring(0, ind) + ".1";
//           deliveryDate = moment(deliveryDate).format("YYYY-MM-DD");
//           targetList.push({
//             id: `${item[deliveryDateCol]}${item[materialCol]}`,
//             materialNo: item[materialCol],
//             count,
//             deliveryDate,
//             orderId,
//             orderDate,
//           });
//         });
//       } else {
//         // console.log(item[deliveryDateCol]);
//         count = item[countCol];
//         let ind = item[deliveryDateCol].indexOf("交");
//         deliveryDate = item[deliveryDateCol].substring(0, ind) + ".1";
//         deliveryDate = moment(deliveryDate).format("YYYY-MM-DD");
//         targetList.push({
//           id: `${item[deliveryDateCol]}${item[materialCol]}`,
//           materialNo: item[materialCol],
//           count: item[countCol],
//           deliveryDate,
//           orderId,
//           orderDate,
//         });
//       }
//     }
//   });

//   return targetList;
// }

// // const dealWithFackComma = function (string) {
// //   if (string.indexOf("；") != -1) {
// //     //   let datas = string.split("；");
// //     return string.split("；");
// //   } else if (string.indexOf(";") != -1) {
// //     let datas = string.split(";");
// //     datas.forEach((it) => {
// //       it = it.trim();
// //     });
// //     return datas;
// //   } else {
// //     return -1;
// //   }
// // };
