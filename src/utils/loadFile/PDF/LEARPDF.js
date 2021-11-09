import moment from "moment";

// 对于LEAR PDF文件的解析

export default async function LEARPDF(pdf) {
  // 最终匹配到的数据
  let orderList = [];
  let orderDetail = [];

  // 按页码遍历每一页
  for (let i = 1; i <= pdf.numPages; i++) {
    // 本页获取的订单数据
    let pageOrderList = [];

    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    // console.log(page);
    // console.log(content);

    // 更具此订单格式：
    // 因每一页的都有采购订单号、采购日期、交货日期且在每页的的前面，不在table内
    // 所以可以先获取这些数据

    // orderNO匹配规则：只匹配第一次出现（PO Number的连续字符串）
    let orderId = "";
    let orderDate = "";
    let deliveryDate = "";

    // 找到订单号
    let hasOrderNo = false;
    let hasOrderDate = false;

    // 用于匹配的订单号连续字符串
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
      // console.log(item);
      // 只匹配第一次的orderNo

      {
        if (item.str === "订" && !orderNoContinuityStr && !hasOrderNo) {
          orderNoContinuityStr = "订";
        } else if (
          item.str === "单" &&
          orderNoContinuityStr == "订" &&
          index == previousItem.index + 1 &&
          !hasOrderNo
        ) {
          orderNoContinuityStr = "订单";
        } else if (
          (item.str === "号" &&
            orderNoContinuityStr == "订单 " &&
            index == previousItem.index + 1 &&
            !hasOrderNo) ||
          item.str.trim() == "订单号"
        ) {
          orderNoContinuityStr = "订单号";
          // 保存订单号Y轴的高度，用于判断是否为同一行
          orderNoYaxis = item.transform[5];
        }
        // 更具Y轴的偏移量判断是否为同一行
        else if (
          orderNoContinuityStr == "订单号" &&
          Math.abs(item.transform[5] - orderNoYaxis) < 2 &&
          index == previousItem.index + 1 &&
          !hasOrderNo
        ) {
          hasOrderNo = true;
          orderId += item.str.match(/\w/g);
          // console.log(typeof orderId);
          orderId = orderId.replaceAll(",", "");
        }
        // console.log(orderNoContinuityStr);
        // console.log(Math.abs(item.transform[5] - orderNoYaxis));
        // console.log(index == previousItem.index + 1);

        // console.log(item.str);
      }

      // 匹配Date字段（订单日期）

      {
        if (item.str === "订" && !orderDateContinuityStr && !hasOrderDate) {
          orderDateContinuityStr = "订";
        } else if (
          item.str === "货" &&
          orderDateContinuityStr == "订" &&
          index == previousItem.index + 1 &&
          !hasOrderDate
        ) {
          orderDateContinuityStr = "订货";
        } else if (
          item.str === "日" &&
          orderDateContinuityStr == "订货" &&
          index == previousItem.index + 1 &&
          !hasOrderDate
        ) {
          orderDateContinuityStr = "订货日";
        } else if (
          (item.str === "期" &&
            orderDateContinuityStr == "订货日" &&
            index == previousItem.index + 1 &&
            !hasOrderDate) ||
          item.str.trim() == "订货日期"
        ) {
          orderDateContinuityStr = "订货日期";
          orderDateYaxis = item.transform[5];
        } else if (
          orderDateContinuityStr == "订货日期" &&
          Math.abs(item.transform[5] - orderDateYaxis) < 2 &&
          index == previousItem.index + 1 &&
          !hasOrderDate
        ) {
          hasOrderDate = true;
          orderDate += item.str;
          // 更改时间格式
          orderDate = moment(orderDate, "MM-DD-YYYY").format("YYYY-MM-DD");
          // console.log(orderDate);
        }
      }

      // ##########物料号##################
      // {
      //   // 根据“物料号”来判断数据条数的X轴取值范围，和物料号最小X轴最小
      //   if (
      //     item.str === "物" &&
      //     content.items[index + 1].str === "料" &&
      //     content.items[index + 2].str === "号"
      //   ) {
      //     materialNoXPosition.Xmin = items.transform[4];
      //   } else if (item.str == "物料号") {
      //     materialNoXPosition.Xmin = item.transform[4];
      //   }
      //   // 根据“T”来判断物料号数据的X轴最大取值范围
      //   if (item.str.trim() === "T") {
      //     materialNoXPosition.Xmax = item.transform[4];
      //   }
      //   // console.log(materialNoXPosition.Xmin);
      //   // console.log(materialNoXPosition.Xmax);
      // }

      {
        // if (
        //   item.str ==
        //   "--- ------------------ - -------- ---------- -- ------------ ------------------"
        // ) {
        //   console.log(content.items[index + 1].str);
        // }

        if (
          /^\s+\d+\s/g.test(item.str)

          // &&
          //   index == previousItem.index + 1
        ) {
          // orderId += item.str.match(/\w/g);
          // console.log(
          //   item.str.replace(/\s+/g, " ").replace(/(^\s*)|(\s*$)/g, "")
          // );

          orderDetail = item.str
            .replace(/\s+/g, " ")
            // .replace(/(^\s*)|(\s*$)/g, "")
            .trim()
            .split(" ");

          // orderId = orderId + "-" + orderDetail[0];

          orderList.push({
            id: `${item.str}`,
            materialNo: orderDetail[1],
            count: parseInt(orderDetail[4]),
            orderId: orderId + "-" + orderDetail[0],
            orderDate,
            deliveryDate: moment(orderDetail[3], "MM-DD-YYYY").format("YYYY-MM-DD"),
          });
        }
      }

      {
        // 数量
        // if (item.str === "数" && content.items[index + 1].str === "量") {
        //   countXPosition.Xmin = item.transform[4] - item.width;
        //   countXPosition.Xmax =
        //     content.items[index + 1].transform[4] + item.width * 2;
        // } else if (item.str == "数量") {
        //   countXPosition.Xmin = item.transform[4] - item.width / 2;
        //   countXPosition.Xmax = item.transform[4] + item.width / 2;
        // }
        // console.log(parseInt("12,000.00".replace(/\,/g, "")));
      }
      //       // 更具id的取值范围来添加到数组
      //       if (
      //         idXPosition.Xmin &&
      //         idXPosition.Xmax &&
      //         item.transform[4] > idXPosition.Xmin &&
      //         item.transform[4] < idXPosition.Xmax &&
      //         /\d/g.test(item.str)
      //       ) {
      //         if (!pageOrderList.length) {
      //           pageOrderList.push({
      //             id: `${item.str}`,
      //             materialNo: "",
      //             count: "",
      //             xAxis: item.transform[5],
      //             orderId,
      //             orderDate,
      //             deliveryDate,
      //           });
      //         } else {
      //           let has = false;
      //           pageOrderList.forEach((it, i) => {
      //             // 偏移量小于3，认定为同一行
      //             if (Math.abs(it.xAxis - item.transform[5]) < 3) {
      //               has = true;
      //               pageOrderList[i].id = pageOrderList[i].id + item.str;
      //             }
      //           });
      //           if (!has) {
      //             pageOrderList.push({
      //               id: `${item.str}`,
      //               materialNo: "",
      //               count: "",
      //               xAxis: item.transform[5],
      //               orderId,
      //               orderDate,
      //               deliveryDate,
      //             });
      //           }
      //         }
      //       }

      //       // 更具物料号的X轴范围写入物料号
      //       if (
      //         materialNoXPosition.Xmin &&
      //         materialNoXPosition.Xmax &&
      //         item.transform[4] > materialNoXPosition.Xmin &&
      //         item.transform[4] < materialNoXPosition.Xmax &&
      //         item.str !== " "
      //       ) {
      //         pageOrderList.forEach((it, i) => {
      //           // 偏移量小于3，认定为同一行
      //           if (Math.abs(it.xAxis - item.transform[5]) < 3) {
      //             pageOrderList[i].materialNo =
      //               pageOrderList[i].materialNo + item.str;
      //           }
      //         });
      //       }

      //       // 更具数量的X轴范围写入数量
      //       if (
      //         countXPosition.Xmin &&
      //         countXPosition.Xmax &&
      //         item.transform[4] > countXPosition.Xmin &&
      //         item.transform[4] < countXPosition.Xmax
      //       ) {
      //         pageOrderList.forEach((it, i) => {
      //           // 偏移量小于3，认定为同一行
      //           if (Math.abs(it.xAxis - item.transform[5]) < 3) {
      //             pageOrderList[i].count = pageOrderList[i].count + item.str;
      //           }
      //         });
      //       }

      // 写在循环最后，保存此次循环的数据，用于下次循环的比对
      previousItem.value = item;
      previousItem.index = index;
      //     });
      //     orderList = [...orderList, ...pageOrderList];
      //   }
      //   orderList = orderList.map((item) => ({
      //     ...item,
      //     count: +item.count.replace(/\,/g, ""),
      //     orderDate: item.orderDate.trim(),
      //     deliveryDate: item.deliveryDate.trim(),
    });
  }
  // console.log(orderDetail);
  return orderList;
}
