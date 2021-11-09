import xlsx from "xlsx";
import moment from "moment";

const SEQ = extractionStrConfig.CHONGQING.SEQ;
const ORDERID = extractionStrConfig.CHONGQING.ORDERID;
const RODERDATE = extractionStrConfig.CHONGQING.RODERDATE;
const MATERIALNO = extractionStrConfig.CHONGQING.MATERIALNO;
const COUNT = extractionStrConfig.CHONGQING.COUNT;
const DELIVERYDATE = extractionStrConfig.CHONGQING.DELIVERYDATE;

const readFile = (file) => {
  return new Promise((resolve) => {
    let reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (ev) => {
      resolve(ev.target.result);
    };
  });
};

export default async function CHONGQINGXLSX(file) {
  let dataBinary = await readFile(file);
  let workBook = xlsx.read(dataBinary, { type: "binary", cellDates: true });
  var result = [];
  workBook.SheetNames.forEach(function (sheetName) {
    var roa = xlsx.utils.sheet_to_json(workBook.Sheets[sheetName], {
      header: 1,
    });
    if (roa.length) {
      const originData = JSON.parse(JSON.stringify(roa));
      console.log(originData);
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
  // // let firstMaterialCol;

  // 订单号（合同编号）
  let orderId;
  let findOrderId = false;
  let orderIdRow;
  let orderIdColStart;
  let ifOrderID = false;

  // //订单日期（签约日期）
  let orderDate;
  let findOrderDate = false;
  let orderDateRow;
  let orderDateColStart;
  let ifOrderDate = false;

  // 序号、物料号（型号）、数量、交货期所在列
  let headerPos;
  let headerMaterial;
  let headerNumber;
  let headerDeliveryDate;

  // 物料号（型号）
  let materialNumber;

  // 交货日期
  let deliveryDate;

  // 订单数量
  let count;

  result.forEach((item, row) => {
    item.forEach((it, col) => {
      // order no
      if (typeof it == "string" && it.includes(ORDERID) && !findOrderId) {
        orderIdRow = row + 1;
        orderIdColStart = col;
        findOrderId = true;
        // console.log(col);
      }

      // orderDate
      if (typeof it == "string" && it.includes(RODERDATE) && !findOrderDate) {
        orderDateRow = row + 1;
        orderDateColStart = col;
        findOrderDate = true;
        // console.log(orderDate);
        // orderDate = moment(orderDate).add(1, "day").format("YYYY-MM-DD");
      }

      // 行的列
      if (typeof it == "string" && it.includes(SEQ)) {
        headerPos = col;
      }

      // 物料号（型号）的列
      if (typeof it == "string" && it.includes(MATERIALNO)) {
        firstMaterialRow = row + 1;
        headerMaterial = col - 1;
      }

      // 数量的列
      if (typeof it == "string" && it.match(COUNT)) {
        headerNumber = col - 1;
      }

      // 交货期的列
      if (typeof it == "string" && it.includes(DELIVERYDATE)) {
        headerDeliveryDate = col;
      }
    });
  });

  result.forEach((item, row) => {
    if (row == orderIdRow) {
      // console.log(orderIdColStart);
      let temp = item.slice(orderIdColStart);
      // console.log(temp);
      temp.forEach((it) => {
        if (it != null && ifOrderID == false) {
          ifOrderID = true;
          orderId = it;
          console.log(orderId);
        }
      });
    }
    if (row == orderDateRow) {
      // console.log(orderIdColStart);
      let temp = item.slice(orderDateColStart);
      // console.log(temp);
      temp.forEach((it) => {
        if (it != null && ifOrderDate == false) {
          ifOrderDate = true;
          orderDate = moment(it).format("YYYY-MM-DD");
          // console.log(it);
          console.log(orderDate);
        }
      });
    }
    if (row >= firstMaterialRow && item[headerPos] && !isNaN(item[headerPos])) {
      materialNumber = item[headerMaterial];
      if (moment(item[headerDeliveryDate].substr(0, 10)).isValid()) {
        var day = moment(item[headerDeliveryDate].substr(0, 10));
        deliveryDate = day.format("YYYY-MM-DD");
      } else {
        deliveryDate = item[headerDeliveryDate];
      }
      count = item[headerNumber];
      if (!count) {
        count = 0;
      }
      targetList.push({
        id: `${item[headerPos]}${item[headerMaterial]}`,
        materialNo: materialNumber,
        count,
        deliveryDate,
        orderId,
        orderDate,
      });
    }
  });

  return targetList;
}
