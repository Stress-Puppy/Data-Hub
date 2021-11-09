// 对于CAMC PDF文件的解析
// import { getDocument, GlobalWorkerOptions, PDFWorker } from "pdfjs-dist";
// GlobalWorkerOptions.workerPort = new PDFWorker()
// import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
// GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.4.456/build/pdf.worker.min.js'

export default async function CAMCPDF(pdf) {
  // 最终匹配到的数据
  let orderList = [];

  // 按页码遍历每一页
  for (let i = 1; i <= pdf.numPages; i++) {
    // 本页获取的订单数据
    let pageOrderList = [];
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    // 更具此订单格式：
    // 因每一页的都有采购订单号、采购日期、交货日期且在每页的的前面，不在table内
    // 所以可以先获取这些数据

    // orderNO匹配规则：只匹配第一次出现（PO Number的连续字符串）
    let orderId = "";
    let orderDate = "";
    let deliveryDate = "";

    // 只匹第一个PO Number连续字段的锁
    let hasOrderNo = false;

    // 用于匹配的orderNo连续字符串
    let orderNoContinuityStr = "";
    let orderNoYaxis = null;

    // 用于匹配的orderNo连续字符串
    let orderDateContinuityStr = "";
    let orderDateYaxis = null;

    // 用于匹配的orderNo连续字符串
    let deliveryDateContinuityStr = "";
    let deliveryDateYaxis = null;

    // 保存上一次循环的数据，用于判断连续字符串
    let previousItem = {
      value: null,
      index: null,
    };

    // 保存的行项目ID的X轴取值范围
    let idXPosition = {
      Xmin: null,
      Xmax: null,
    };

    // 保存的物料号X轴取值范围
    // 例：目-------版
    let materialNoXPosition = {
      Xmin: null,
      Xmax: null,
    };

    // 保存数量X轴取值范围
    // （由于数量二字的宽度可能小于真正数量的宽度，
    // 所以需要增加两边的偏移量，
    // 偏移量从数字的宽度）
    let countXPosition = {
      Xmin: null,
      Xmax: null,
    };

    // 遍历本页的数据
    content.items.forEach((item, index) => {
      // 只匹配第一次的orderNo
      if (item.str === "P" && !orderNoContinuityStr && !hasOrderNo) {
        orderNoContinuityStr = "P";
      } else if (
        item.str === "O" &&
        orderNoContinuityStr == "P" &&
        index == previousItem.index + 1
      ) {
        orderNoContinuityStr = "PO";
      } else if (
        item.str === " " &&
        orderNoContinuityStr == "PO" &&
        index == previousItem.index + 1
      ) {
        orderNoContinuityStr = "PO ";
      } else if (
        item.str === "N" &&
        orderNoContinuityStr == "PO " &&
        index == previousItem.index + 1
      ) {
        orderNoContinuityStr = "PO N";
      } else if (
        item.str === "u" &&
        orderNoContinuityStr == "PO N" &&
        index == previousItem.index + 1
      ) {
        orderNoContinuityStr = "PO Nu";
      } else if (
        item.str === "m" &&
        orderNoContinuityStr == "PO Nu" &&
        index == previousItem.index + 1
      ) {
        orderNoContinuityStr = "PO Num";
      } else if (
        item.str === "b" &&
        orderNoContinuityStr == "PO Num" &&
        index == previousItem.index + 1
      ) {
        orderNoContinuityStr = "PO Numb";
      } else if (
        item.str === "e" &&
        orderNoContinuityStr == "PO Numb" &&
        index == previousItem.index + 1
      ) {
        orderNoContinuityStr = "PO Numbe";
      } else if (
        (item.str === "r" &&
          orderNoContinuityStr == "PO Numbe" &&
          index == previousItem.index + 1) || item.str.replace(/\s*/g,"") == "PONumber"
      ) {
        orderNoContinuityStr = "PO Number";
        // 保存订单号Y轴的高度，用于判断是否为同一行
        orderNoYaxis = item.transform[5];
      }
      // 更具Y轴的偏移量判断是否为同一行
      else if (
        orderNoContinuityStr == "PO Number" &&
        Math.abs(item.transform[5] - orderNoYaxis) < 2 &&
        index == previousItem.index + 1
      ) {
        orderId += item.str;
      }

      // 匹配Date字段（订单日期）
      if (item.str === "D" && !orderDateContinuityStr) {
        orderDateContinuityStr = "D";
      } else if (
        item.str === "a" &&
        orderDateContinuityStr == "D" &&
        index == previousItem.index + 1
      ) {
        orderDateContinuityStr = "Da";
      } else if (
        item.str === "t" &&
        orderDateContinuityStr == "Da" &&
        index == previousItem.index + 1
      ) {
        orderDateContinuityStr = "Dat";
      } else if (
        (item.str === "e" &&
          orderDateContinuityStr == "Dat" &&
          index == previousItem.index + 1) || item.str.trim() == "Date"
      ) {
        orderDateContinuityStr = "Date";
        orderDateYaxis = item.transform[5];
      } else if (
        orderDateContinuityStr == "Date" &&
        Math.abs(item.transform[5] - orderDateYaxis) < 2 &&
        index == previousItem.index + 1
      ) {
        orderDate += item.str;
        // 更改时间格式
        orderDate = orderDate.replace(/\//g, "-");
      }

      // 匹配Delivery Date字段（交货日期）
      if (item.str === "D" && !deliveryDateContinuityStr) {
        deliveryDateContinuityStr = "D";
      } else if (
        item.str === "e" &&
        deliveryDateContinuityStr == "D" &&
        index == previousItem.index + 1
      ) {
        deliveryDateContinuityStr = "De";
      } else if (
        item.str === "l" &&
        deliveryDateContinuityStr == "De" &&
        index == previousItem.index + 1
      ) {
        deliveryDateContinuityStr = "Del";
      } else if (
        item.str === "i" &&
        deliveryDateContinuityStr == "Del" &&
        index == previousItem.index + 1
      ) {
        deliveryDateContinuityStr = "Deli";
      } else if (
        item.str === "v" &&
        deliveryDateContinuityStr == "Deli" &&
        index == previousItem.index + 1
      ) {
        deliveryDateContinuityStr = "Deliv";
      } else if (
        item.str === "e" &&
        deliveryDateContinuityStr == "Deliv" &&
        index == previousItem.index + 1
      ) {
        deliveryDateContinuityStr = "Delive";
      } else if (
        item.str === "r" &&
        deliveryDateContinuityStr == "Delive" &&
        index == previousItem.index + 1
      ) {
        deliveryDateContinuityStr = "Deliver";
      } else if (
        item.str === "y" &&
        deliveryDateContinuityStr == "Deliver" &&
        index == previousItem.index + 1
      ) {
        deliveryDateContinuityStr = "Delivery";
      } else if (
        item.str === " " &&
        deliveryDateContinuityStr == "Delivery" &&
        index == previousItem.index + 1
      ) {
        deliveryDateContinuityStr = "Delivery ";
      } else if (
        item.str === "D" &&
        deliveryDateContinuityStr == "Delivery " &&
        index == previousItem.index + 1
      ) {
        deliveryDateContinuityStr = "Delivery D";
      } else if (
        item.str === "a" &&
        deliveryDateContinuityStr == "Delivery D" &&
        index == previousItem.index + 1
      ) {
        deliveryDateContinuityStr = "Delivery Da";
      } else if (
        item.str === "t" &&
        deliveryDateContinuityStr == "Delivery Da" &&
        index == previousItem.index + 1
      ) {
        deliveryDateContinuityStr = "Delivery Dat";
      } else if (
        (item.str === "e" &&
          deliveryDateContinuityStr == "Delivery Dat" &&
          index == previousItem.index + 1) || item.str.replace(/\s/g,'') == "DeliveryDate"
      ) {
        deliveryDateContinuityStr = "Delivery Date";
        deliveryDateYaxis = item.transform[5];
      } else if (
        deliveryDateContinuityStr == "Delivery Date" &&
        Math.abs(item.transform[5] - deliveryDateYaxis) < 2 &&
        index == previousItem.index + 1
      ) {
        deliveryDate += item.str;
        // 更改时间格式
        deliveryDate = deliveryDate.replace(/\//g, "-");
      }

      // 更具“行项目”来判断数据条数的X轴取值范围，和物料号最小X轴最小
      if (
        item.str === "行" &&
        content.items[index + 1].str === "项" &&
        content.items[index + 2].str === "目"
      ) {
        idXPosition.Xmin = item.transform[4];
        idXPosition.Xmax =
          content.items[index + 2].transform[4] +
          content.items[index + 2].width;

        materialNoXPosition.Xmin =
          content.items[index + 2].transform[4] +
          content.items[index + 2].width;
      } else if (item.str == "行项目") {
        idXPosition.Xmin = item.transform[4];
        idXPosition.Xmax = item.transform[4] + item.width;
        materialNoXPosition.Xmin = item.transform[4] + item.width;
      }

      // 更具“版本号”来判断物料号数据的X轴最大取值范围
      if (
        item.str === "版" &&
        content.items[index + 1].str === "本" &&
        content.items[index + 2].str === "号"
      ) {
        materialNoXPosition.Xmax = item.transform[4];
      } else if (item.str == "版本号") {
        materialNoXPosition.Xmax = item.transform[4];
      }

      // 更具“数量”来判断数据条数的X轴取值范围，左右增加两个数字字符偏移量
      if (
        item.str === "数" &&
        content.items[index + 1].str === "量"
      ) {
        countXPosition.Xmin = item.transform[4] - item.width;
        countXPosition.Xmax =
          content.items[index + 1].transform[4] + item.width * 2;
      } else if (item.str == "数量") {
        countXPosition.Xmin = item.transform[4] - item.width / 2
        countXPosition.Xmax = item.transform[4] + item.width / 2
      }

      // 更具id的取值范围来添加到数组
      if (
        idXPosition.Xmin &&
        idXPosition.Xmax &&
        item.transform[4] > idXPosition.Xmin &&
        item.transform[4] < idXPosition.Xmax &&
        /\d/g.test(item.str)
      ) {
        if (!pageOrderList.length) {
          pageOrderList.push({
            id: `${item.str}`,
            materialNo: "",
            count: "",
            xAxis: item.transform[5],
            orderId,
            orderDate,
            deliveryDate,
          });
        } else {
          let has = false;
          pageOrderList.forEach((it, i) => {
            // 偏移量小于3，认定为同一行
            if (Math.abs(it.xAxis - item.transform[5]) < 3) {
              has = true;
              pageOrderList[i].id = pageOrderList[i].id + item.str;
            }
          });
          if (!has) {
            pageOrderList.push({
              id: `${item.str}`,
              materialNo: "",
              count: "",
              xAxis: item.transform[5],
              orderId,
              orderDate,
              deliveryDate,
            });
          }
        }
      }

      // 更具物料号的X轴范围写入物料号
      if (
        materialNoXPosition.Xmin &&
        materialNoXPosition.Xmax &&
        item.transform[4] > materialNoXPosition.Xmin &&
        item.transform[4] < materialNoXPosition.Xmax &&
        item.str !== " "
      ) {
        pageOrderList.forEach((it, i) => {
          // 偏移量小于3，认定为同一行
          if (Math.abs(it.xAxis - item.transform[5]) < 3) {
            pageOrderList[i].materialNo =
              pageOrderList[i].materialNo + item.str;
          }
        });
      }

      // 更具数量的X轴范围写入数量
      if (
        countXPosition.Xmin &&
        countXPosition.Xmax &&
        item.transform[4] > countXPosition.Xmin &&
        item.transform[4] < countXPosition.Xmax
      ) {
        pageOrderList.forEach((it, i) => {
          // 偏移量小于3，认定为同一行
          if (Math.abs(it.xAxis - item.transform[5]) < 3) {
            pageOrderList[i].count =
              pageOrderList[i].count + item.str;
          }
        });
      }

      // 写在循环最后，保存此次循环的数据，用于下次循环的比对
      previousItem.value = item;
      previousItem.index = index;
    });
    orderList = [...orderList, ...pageOrderList];
  }
  orderList = orderList.map((item) => ({
    ...item,
    count: +item.count.replace(/\,/g, ""),
    orderDate: item.orderDate.trim(),
    deliveryDate: item.deliveryDate.trim(),
  }));
  return orderList;
}