import xlsx from "xlsx";
import moment from "moment";

const SEQ = extractionStrConfig.TIANRONG.SEQ;
const ORDERID = extractionStrConfig.TIANRONG.ORDERID;
const RODERDATE = extractionStrConfig.TIANRONG.RODERDATE;
const MATERIALNO = extractionStrConfig.TIANRONG.MATERIALNO;
const COUNT = extractionStrConfig.TIANRONG.COUNT;
const DELIVERYDATE = extractionStrConfig.TIANRONG.DELIVERYDATE;

const readFile = (file) => {
  return new Promise((resolve) => {
    let reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (ev) => {
      resolve(ev.target.result);
    };
  });
};

export default async function TIANRONGXLSX(file) {
  let dataBinary = await readFile(file);
  let workBook = xlsx.read(dataBinary, { type: "binary", cellDates: true });
  var result = [];
  workBook.SheetNames.forEach(function (sheetName) {
    var roa = xlsx.utils.sheet_to_json(workBook.Sheets[sheetName], {
      header: 1,
    });
    if (roa.length) {
      const originData = JSON.parse(JSON.stringify(roa));
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

  let firstMaterialRow;
  // // let firstMaterialCol;

  // 订单号（合同编号）
  let orderId;

  // //订单日期（签约日期）
  let orderDate;

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
      if (typeof it == "string" && it.includes(ORDERID)) {
        orderId = item[col + 1];
      }

      // orderDate
      if (typeof it == "string" && it.includes(RODERDATE)) {
        orderDate = item[col + 1];
        orderDate = moment(orderDate).add(1, "day").format("YYYY-MM-DD");
      }

      // 序号的列
      if (typeof it == "string" && it.includes(SEQ)) {
        headerPos = col;
      }

      // 物料号（型号）的列
      if (typeof it == "string" && it.includes(MATERIALNO)) {
        firstMaterialRow = row + 2;
        headerMaterial = col;
      }

      // 数量的列
      if (typeof it == "string" && it.match(COUNT)) {
        headerNumber = col;
      }

      // 交货期的列
      if (typeof it == "string" && it.includes(DELIVERYDATE)) {
        headerDeliveryDate = col;
      }
    });
  });
  result.forEach((item, row) => {
    if (row >= firstMaterialRow && item[headerPos] && !isNaN(item[headerPos])) {
      materialNumber = item[headerMaterial];
      var day = moment(item[headerDeliveryDate].substr(0, 10));
      deliveryDate = day.add(1, "day").format("YYYY-MM-DD");
      count = item[headerNumber];
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
