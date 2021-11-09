import xlsx from "xlsx";
import moment from "moment";

const ORDERID = extractionStrConfig.ENDA.ORDERID;
const MATERIALNO = extractionStrConfig.ENDA.MATERIALNO;
const COUNT = extractionStrConfig.ENDA.COUNT;

const readFile = (file) => {
  return new Promise((resolve) => {
    let reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (ev) => {
      resolve(ev.target.result);
    };
  });
};

export default async function ENDAXLSX(file) {
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
  return result;
}
// 格式化数据
function formatData(result) {
  // 存储最后返回获取的数据

  let targetList = [];
  let orderId;
  //   let orderDate = moment().format("YYYY-MM-DD");

  let firstMaterialRow = 0;
  let materialCol;

  let countCol;

  result.forEach((item, row) => {
    item.forEach((it, col) => {
      if (typeof it == "string" && it.includes(ORDERID)) {
        orderId = it.substring(it.indexOf(":") + 1);
        // console.log(orderId);
      }

      // 物料号（型号）的列
      if (typeof it == "string" && it.includes(MATERIALNO)) {
        firstMaterialRow = row + 1;
        materialCol = col;
        // console.log(it);
      }

      // 数量的列
      if (typeof it == "string" && it.match(COUNT)) {
        countCol = col;
        // console.log(it);
      }
    });
  });

  result.forEach((item, row) => {
    if (
      row >= firstMaterialRow &&
      item[materialCol] &&
      // !isNaN(item[materialCol]) &&
      !/[\u4e00-\u9fa5]+$/.test(item[materialCol]) &&
      !/[\u4e00-\u9fa5]+$/.test(item[countCol]) &&
      item[countCol]
    ) {
      let orderDate = moment().format("YYYY-MM-DD");
      let deliveryDate = moment(orderDate).add(90, "day").format("YYYY-MM-DD");
      //   console.log(orderDate);
      //   console.log(deliveryDate);
      targetList.push({
        id: `${item[countCol]}${item[materialCol]}`,
        materialNo: item[materialCol],
        count: item[countCol],
        deliveryDate,
        orderId,
        orderDate,
      });
    }
  });

  return targetList;
}
