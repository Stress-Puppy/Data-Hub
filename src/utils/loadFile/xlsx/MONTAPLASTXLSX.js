import xlsx from "xlsx";
import moment from "moment";

const ORDERID = extractionStrConfig.MONTAPLAST.ORDERID;
const COUNT = extractionStrConfig.MONTAPLAST.COUNT;
const DELIVERYDATE = extractionStrConfig.MONTAPLAST.DELIVERYDATE;

const readFile = (file) => {
  return new Promise((resolve) => {
    let reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (ev) => {
      resolve(ev.target.result);
    };
  });
};

export default async function MONTAPLASTXLSX(file) {
  let dataBinary = await readFile(file);
  let workBook = xlsx.read(dataBinary, { type: "binary", cellDates: true });
  var result = [];
  const SheetName = workBook.SheetNames[0];
  var roa = xlsx.utils.sheet_to_json(workBook.Sheets[SheetName], {
    header: 1,
  });
  if (roa.length) result = JSON.parse(JSON.stringify(roa));
  return formatData(result);
}
// 格式化数据
function formatData(result) {
  // console.log("input" + result);
  // 存储最后返回获取的数据
  let targetList = [];

  let firstMaterialRow;
  // // let firstMaterialCol;

  // 订单号（合同编号）
  let orderId;

  // //订单日期（签约日期）
  let orderDate = moment().format("YYYY-MM-DD");

  // 物料号（型号）
  let materialNumber = result[0][1];

  let materialCol;

  // 交货日期
  let deliveryDate;
  let deliveryDateCol;

  // 订单数量
  // let count;
  let numberCol;

  let tempMaterialNumber;

  result.forEach((item, row) => {
    item.forEach((it, col) => {
      // console.log(it);

      // order id - 纳入单号
      if (typeof it == "string" && it.includes(ORDERID)) {
        materialCol = col;
        firstMaterialRow = row + 1;
        // console.log(firstMaterialRow);
        tempMaterialNumber = result[firstMaterialRow][materialCol];
        // throw new Error("不要管，跳循环");
      }

      if (typeof it == "string" && it === DELIVERYDATE) {
        deliveryDateCol = col;
        // console.log(deliveryDateCol);
        // orderDate = moment(orderDate).add(1, "day").format("YYYY-MM-DD");
      }

      // 数量的列
      if (typeof it == "string" && it === COUNT) {
        numberCol = col;
        // console.log(numberCol);
      }
    });
  });

  result.forEach((item, row) => {
    if (row >= firstMaterialRow) {
      if (item[materialCol] && item[materialCol] != "-") {
        tempMaterialNumber = item[materialCol];
      } else {
        item[materialCol] = tempMaterialNumber;
      }
    }
  });

  result.forEach((item, row) => {
    if (
      row >= firstMaterialRow &&
      // item[materialCol] &&
      item[numberCol] != 0 &&
      item[numberCol] &&
      // !isNaN(item[numberCol]) &&
      item[0] != "closed"
    ) {
      if (moment(item[deliveryDateCol]).isValid()) {
        deliveryDate = moment(item[deliveryDateCol]).format("YYYY-MM-DD");
      } else {
        deliveryDate = item[deliveryDateCol];
      }

      targetList.push({
        id: `${item[materialCol]}${item[numberCol]}`,
        materialNo: materialNumber,
        count: item[numberCol],
        deliveryDate,
        orderId: item[materialCol],
        orderDate,
      });
    }
  });

  return targetList;
}
