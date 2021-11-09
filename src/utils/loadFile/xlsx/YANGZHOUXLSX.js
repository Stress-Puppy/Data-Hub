import xlsx from "xlsx";
import moment from "moment";

// const SEQ = extractionStrConfig.CHONGQING.SEQ;
// const ORDERID = extractionStrConfig.YANGZHOU.ORDERID;
// const RODERDATE = extractionStrConfig.YANGZHOU.RODERDATE;
const MATERIALNO = extractionStrConfig.YANGZHOU.MATERIALNO;
// let fileName;
// // //订单日期（签约日期）
// let orderDate;

// const COUNT = extractionStrConfig.YANGZHOU.COUNT;
// const DELIVERYDATE = extractionStrConfig.YANGZHOU.DELIVERYDATE;

const readFile = (file) => {
  return new Promise((resolve) => {
    let reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (ev) => {
      resolve(ev.target.result);
    };
  });
};

export default async function YANGZHOUXLSX(file) {
  let dataBinary = await readFile(file);

  let workBook = xlsx.read(dataBinary, { type: "binary", cellDates: true });

  // fileName = file.name;
  // orderDate = fileName.match(/[0-9]+/)[0];
  // // console.log(orderDate);

  var result = [];
  workBook.SheetNames.forEach(function (sheetName) {
    var roa = xlsx.utils.sheet_to_json(workBook.Sheets[sheetName], {
      header: 1,
    });
    if (roa.length) {
      const originData = JSON.parse(JSON.stringify(roa));
      const targetData = formatData(originData);
      // console.log(originData);
      result = [...result, ...targetData];
    }
  });

  return result;
}

// 格式化数据
// function formatData(result) {
//   // 存储最后返回获取的数据
//   let targetList = [];
//   let dataList = [];

//   let firstMaterialRow;

//   // // let firstMaterialCol;

//   // 订单号（合同编号）
//   let orderId = moment().format("YYYYMMDDHHmmss");

//   // var str = "abc123def";
//   // var patt1 = ;
//   // document.write(str.match(patt1));;

//   // 序号、物料号（型号）、数量、交货期所在列
//   let headerPos;
//   let headerMaterial;
//   let headerNumber;
//   let headerDeliveryDate;

//   // 物料号（型号）
//   let materialNumber;

//   // 交货日期
//   let deliveryDate;
//   let deliveryDateStartRow;
//   let deliveryDateStartCol;

//   // 订单数量
//   let count;

//   result.forEach((item, row) => {
//     console.log(item);
//     item.forEach((it, col) => {
//       // 物料号（型号）的列
//       if (typeof it == "string" && it.includes(MATERIALNO)) {
//         firstMaterialRow = row + 1;
//         headerMaterial = col;
//         deliveryDateStartRow = row;
//         deliveryDateStartCol = col + 2;
//         dataList = item.slice(deliveryDateStartCol);
//         // console.log(dataList);
//       }
//     });
//   });
//   // result.forEach((item, row) => {
//   //   console.log(item);
//   //   if (row >= firstMaterialRow) {
//   //     item.forEach((it, col) => {
//   //       if (col == headerMaterial) {
//   //         materialNumber = it;
//   //       }
//   //       if (col >= deliveryDateStartCol && item[headerMaterial]) {
//   //         materialNumber = item[headerMaterial];

//   //         var day = moment(orderDate);
//   //         orderDate = day.format("YYYY-MM-DD");

//   //         deliveryDate = result[deliveryDateStartRow][col].slice(0, 8);
//   //         deliveryDate = moment(deliveryDate).format("YYYY-MM-DD");

//   //         if (!item[col]) {
//   //           targetList.push({
//   //             id: `${item[headerMaterial]}${result[deliveryDateStartRow][col]}`,
//   //             materialNo: materialNumber,
//   //             count: 0,
//   //             deliveryDate,
//   //             orderId: "LearYZ" + orderId,
//   //             orderDate,
//   //           });
//   //         } else {
//   //           count = it;
//   //           targetList.push({
//   //             id: `${item[headerMaterial]}${result[deliveryDateStartRow][col]}`,
//   //             materialNo: materialNumber,
//   //             count,
//   //             deliveryDate,
//   //             orderId: "LearYZ" + orderId,
//   //             orderDate,
//   //           });
//   //         }
//   //       }
//   //     });
//   //   }
//   // });

//   return targetList;
// }

// 格式化数据
function formatData(result) {
  // 存储最后返回获取的数据
  let targetList = [];
  let orderId = "LearYZ" + moment().format("YYYYMMDDHHmmss");
  // 初始行
  let firstRow;
  // 物料号所在列
  let materialCol;
  // 交货日期时间及所在列
  let deliveryDateList = [];
  result.forEach((item, row) => {
    // console.log(item);
    item.forEach((it, col) => {
      if (typeof it == "string" && it.includes("Item Number")) {
        materialCol = col;
        firstRow = row;
      }
      if (row == firstRow && col > materialCol + 1) {
        let firstDate = it.split("-")[0];
        let deliveryDate = moment(firstDate, "MM/DD/YY").format("YYYY-MM-DD");
        deliveryDateList.push({
          deliveryDate,
          col,
        });
      }
    });
  });
  console.log(deliveryDateList);
  result.forEach((item, row) => {
    if (row > firstRow) {
      deliveryDateList.forEach((it, i) => {
        const count = item[it.col] ? item[it.col] : 0;
        const deliveryDate = it.deliveryDate;
        targetList.push({
          id: `${it.deliveryDate}${item[0]}`,
          materialNo: item[materialCol],
          count,
          deliveryDate,
          orderId,
          orderDate: moment().format("YYYY-MM-DD"),
        });
      });
    }
  });

  return targetList;
}
