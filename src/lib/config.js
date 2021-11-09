import { Common_ChkDate } from "@/utils/checkDate"; // 日期验证函数
const keyAndColumnMap = new Map();
keyAndColumnMap.set(0, "id");
keyAndColumnMap.set(1, "orderId");
keyAndColumnMap.set(2, "orderDate");
keyAndColumnMap.set(3, "materialNo");
keyAndColumnMap.set(4, "count");
keyAndColumnMap.set(5, "deliveryDate");

// 需要验证不通过的物料号数组
let failMaterialArr = [];

// 更新验证不通过的物料号数组
function updataFailMaterial(arr) {
  failMaterialArr = arr;
}

// 初始化验证不通过的物料号数组
function initFailMaterial() {
  failMaterialArr = [];
}

const validRules = {
  orderId: [
    { required: true, message: "数据不能为空" },
    { pattern: /[^\u4e00-\u9fa5]+/, message: "不可包含中文字符" },
  ],
  count: [
    { required: true, trigger: "change", message: "数据不能为空" },
    { validator: verificationCunt },
  ],
  materialNo: [
    { required: true, trigger: "change", message: "数据不能为空" },
    { validator: verificationMaterial },
  ],
  orderDate: [
    { required: true, message: "日期为空" },
    { validator: verificationDate },
  ],
  deliveryDate: [
    { required: true, message: "日期为空" },
    { validator: verificationDate },
  ],
};
// 时间格式验证
function verificationDate({ cellValue }) {
  return new Promise((resolve, reject) => {
    if (Common_ChkDate(cellValue)) {
      resolve();
    } else {
      reject(new Error("日期格式有误"));
    }
  });
}

// 数量验证
function verificationCunt({ cellValue }) {
  if (/[\u4e00-\u9fa5]+/.test(cellValue)) {
    return new Error("不可包含中文字符");
  } else if (`${+cellValue}` == "NaN") {
    return new Error("含有非法字符");
  } else if (+cellValue < 0) {
    return new Error("数量小于0");
  } else if (parseInt(cellValue) !== parseFloat(cellValue)) {
    return new Error("数量包含小数");
  }
}

// 物料号验证
function verificationMaterial({ cellValue }) {
  if (!cellValue) {
    return new Error("物料号不可为空");
  } else if (/[\u4e00-\u9fa5]+/.test(`${cellValue}`)) {
    return new Error("不可包含中文字符");
  } else if (failMaterialArr.includes(`${cellValue}`)) {
    return new Error("不存在该物料号");
  }
}

// const config = {
//     orderId: {
//         rule: {
//             type: Rules.EQUAlANDOFFSET,
//             text: '订单号码:',
//             offset: 1
//         },
//         des: '订单号码:'
//     },
//     orderDate: {
//         rule: {
//             type: Rules.EQUAlANDOFFSET,
//             text: '订单日期:',
//             offset: 1
//         },
//         des: '订单日期:'
//     },
//     project: {
//         rule: {
//             type: Rules.CONTACTANDOFFSET,
//             text: 'EA'
//         },
//         list: [
//             {
//                 des: '物料',
//                 offset: -1
//             },
//             {
//                 des: '数量',
//                 offset: 0,
//                 handler: function (text) {
//                     return text.replace('EA', '').replace(/\s+/g, "");
//                 }
//             },
//             {
//                 des: '日期',
//                 offset: 6
//             }
//         ]
//     }

// }

export { keyAndColumnMap, validRules, initFailMaterial, updataFailMaterial };
