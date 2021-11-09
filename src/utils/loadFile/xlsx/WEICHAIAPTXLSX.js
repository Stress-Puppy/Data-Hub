import xlsx from "xlsx";
import moment from "moment";

const ORDERDATE = extractionStrConfig.WEICHAIAPT.ORDERDATE;
const MATERIALNO = extractionStrConfig.WEICHAIAPT.MATERIALNO;

const readFile = (file) => {
  return new Promise((resolve) => {
    let reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (ev) => {
      resolve(ev.target.result);
    };
  });
};

export default async function WEICHAIAPTXLSX(file) {
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
  let dates = [];

  //   let orderDateCol;
  //   let orderDateRow;
  let orderDate;

  let materialCol;
  let materialNoStartRow;
  let materialNoRow;

  let countCol;

  let statusCol;

  let deliveryDayCol;
  let deliveryDate;

  result.forEach((item, row) => {
    item.forEach((it, col) => {
      // order no
      if (typeof it == "string" && it === ORDERDATE) {
        orderDate = moment(item[col + 1])
          .add(1, "day")
          .format("YYYY-MM-DD");
      }
      if (typeof it == "string" && it === MATERIALNO) {
        materialCol = col;
        materialNoRow = row;
        materialNoStartRow = row + 1;
      }
    });
  });

  result.forEach((item, row) => {
    let countIndex = 0;
    console.log(countIndex);
    if (row >= materialNoRow && item[materialCol]) {
      console.log(item[materialCol]);
      if (row == materialNoRow) {
        item.forEach((it, col) => {
          if (it.includes("年") && it.includes("月")) {
            // let indexYear = it.indexOf("年");
            // let indexMonth = it.indexOf("月");
            // let tempMonth = it.substr(indexYear + 1, indexMonth);
            // let tempYear = it.substr(0, indexYear);
            // let tempDate = tempYear + "." + tempMonth + "." + "1";
            // tempDate = moment(tempDate).format("YYYY-MM-DD");
            dates.push(col);
            //
          }
        });
      }
      if (row > materialNoRow && !/[\u4e00-\u9fa5]+$/.test(item[materialCol])) {
        //   console.log((row > materialNoRow);
        //     deliveryDate = moment(item[deliveryDayCol].substr(0, 10));
        //   deliveryDate = deliveryDate.format("YYYY-MM-DD");
        dates.forEach((it, col) => {
          let temp = result[materialNoRow][it];
          //   console.log(temp);
          let indexYear = temp.indexOf("年");
          let indexMonth = temp.indexOf("月");
          let tempMonth = temp.slice(indexYear + 1, indexMonth);
          //   console.log(tempMonth);
          let tempYear = temp.substr(0, indexYear);
          let tempDate = tempYear + "." + tempMonth + "." + "1";
          //   console.log(tempDate);
          tempDate = moment(tempDate).format("YYYY-MM-DD");

          //   console.log(tempDate);

          targetList.push({
            id: `${item[materialCol]}${item[countCol]}`,
            materialNo: item[materialCol],
            count: item[it],
            deliveryDate: tempDate,
            orderId: "WeichaiAPT" + moment().format("YYYYMMDDHHmmss"),
            orderDate,
          });

          countIndex++;
        });
      }
    }
    // });
  });
  return targetList;
}
