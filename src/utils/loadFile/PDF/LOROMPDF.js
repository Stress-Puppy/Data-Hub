import moment from "moment";

export default async function LOROMPDF(pdf) {
  // 最终匹配到的数据
  let orderList = [];
  let orderDetail = [];

  // 按页码遍历每一页
  for (let i = 1; i <= pdf.numPages; i++) {
    // 本页获取的订单数据
    let pageOrderList = [];

    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    console.log(page);
    console.log(content);

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

    // 保存上一次循环的数据，用于判断连续字符串
    let previousItem = {
      value: null,
      index: null,
    };

    // 遍历本页的数据
    content.items.forEach((item, index) => {
      // console.log(item);
      // 只匹配第一次的orderNo

      {
        //  采購訂單編號
        if (item.str === "采" && !orderNoContinuityStr && !hasOrderNo) {
          orderNoContinuityStr = "采";
        } else if (
          item.str === "購" &&
          orderNoContinuityStr == "采" &&
          index == previousItem.index + 1 &&
          !hasOrderNo
        ) {
          orderNoContinuityStr = "采購";
        } else if (
          (item.str === "訂" &&
            orderNoContinuityStr == "采購 " &&
            index == previousItem.index + 1 &&
            !hasOrderNo) ||
          item.str.trim() == "采購訂單編號"
        ) {
          orderNoContinuityStr = "采購訂單編號";
          // 保存订单号Y轴的高度，用于判断是否为同一行
          orderNoYaxis = item.transform[5];
        }
        // 更具Y轴的偏移量判断是否为同一行
        else if (
          orderNoContinuityStr == "采購訂單編號" &&
          Math.abs(item.transform[5] - orderNoYaxis) < 2 &&
          index == previousItem.index + 1 &&
          !hasOrderNo
        ) {
          hasOrderNo = true;
          orderId += item.str.match(/\w/g);
          // console.log(typeof orderId);
          orderId = orderId.replaceAll(",", "");
        }
      }

      {
        if (item.str === "訂" && !orderDateContinuityStr && !hasOrderDate) {
          orderDateContinuityStr = "訂";
        } else if (
          item.str === "單" &&
          orderDateContinuityStr == "訂" &&
          index == previousItem.index + 1 &&
          !hasOrderDate
        ) {
          orderDateContinuityStr = "訂單";
        } else if (
          item.str === "日" &&
          orderDateContinuityStr == "訂單" &&
          index == previousItem.index + 1 &&
          !hasOrderDate
        ) {
          orderDateContinuityStr = "訂單日";
        } else if (
          (item.str === "期" &&
            orderDateContinuityStr == "訂單日" &&
            index == previousItem.index + 1 &&
            !hasOrderDate) ||
          item.str.trim() == "訂單日期"
        ) {
          orderDateContinuityStr = "訂單日期";
          orderDateYaxis = item.transform[5];
        } else if (
          orderDateContinuityStr == "訂單日期" &&
          Math.abs(item.transform[5] - orderDateYaxis) < 2 &&
          index == previousItem.index + 1 &&
          !hasOrderDate
        ) {
          hasOrderDate = true;
          orderDate += item.str;
          // 更改时间格式
          orderDate = moment(orderDate, "MM-DD-YYYY").format("YYYY-MM-DD");
          console.log(orderDate);
        }
      }

      {
        if (/^\s+\d+\s/g.test(item.str)) {
          orderDetail = item.str.replace(/\s+/g, " ").trim().split(" ");
          orderList.push({
            id: `${item.str}`,
            materialNo: orderDetail[1],
            count: parseInt(orderDetail[4]),
            orderId: orderId + "-" + orderDetail[0],
            orderDate,
            deliveryDate: moment(orderDetail[3], "MM-DD-YYYY").format(
              "YYYY-MM-DD"
            ),
          });
        }
      }

      previousItem.value = item;
      previousItem.index = index;
    });
  }

  return orderList;
}
