const extractionStrConfig = {
  JAC: {
    SEQ: "序号",
    ORDERDATE: "订单下达时间",
    MATERIALNAME: "物料名称",
    COUNT: "合计数量",
  },
  JACGreenJet: {
    SEQ: "序号",
    ORDERDELIVERY: "订单交付",
    MATERIALNO: "产品图号",
  },
  SDEC: {
    MULTIPLIER: "单台用量", //乘数所在列
    ADDEND: "订单", //加数
  },
  FAWHQ: {
    SEQ: "行号",
    PARTNO: "零件号",
    ORDERNO: "订货看板编号",
    MINUEND: "需求数", //被减数
    SUBTRACTION: "收货数量", //减数
    ORDERDATE: "创建时间",
    DELIVERYDATE: "交货时间",
  },
  GWM: {
    MATERIALNO: "物料编号",
  },
  QINGLING_GF: {
    SEQ: "序",
    MATERIALNO: "庆铃图号",
  },
  FENGZE: {
    ORDERNO: "Order No",
    ORDERDATE: "Customer ID", //表格此行的最后一个单元格为订单日期
    SEQ: "Pos.",
    MATERIALNO: "BOSCH P/N",
    COUNT: "Qty.",
    DELIVERYDATE: "Delivery Date",
  },
  TIANRONG: {
    SEQ: "序号",
    ORDERID: "合同编号",
    RODERDATE: "签约日期",
    MATERIALNO: "型号",
    COUNT: "订货数量",
    DELIVERYDATE: "要求交期",
  },
  CHONGQING: {
    SEQ: "行",
    ORDERID: "采购订单",
    RODERDATE: "订货日期",
    MATERIALNO: "物料号",
    COUNT: "数量",
    DELIVERYDATE: "截止日期",
  },
  YANGZHOU: {
    // SEQ: "采购订单",
    // ORDERID: "采购订单",
    // RODERDATE: "订货日期",
    MATERIALNO: "Item Number",
    // COUNT: "数量",
    // DELIVERYDATE: "截止日期",
  },
  CHANGCHAI: {
    MATERIALNO: "规格型号",
    DELIVERYDATE: "要求到货时间",
    COUNT: "常柴总需求",
  },
  SANYKUNSHAN: {
    MATERIALNO: "组件号",
  },
  SANYCHANGSHA: {
    MATERIALNO: "组件号",
  },
  ENDA: {
    ORDERID: "订购单编号:",
    MATERIALNO: "博世料号",
    COUNT: "定购（只）",
  },
  MONTAPLAST: {
    ORDERID: "纳入单号",
    COUNT: "数量",
    DELIVERYDATE: "纳入日期",
  },
  DFCVSHIYAN: {
    ORDERID: "订单号",
    MATERIALNO: "零件号",
    DELIVERYDATE: "要求到货时间",
    COUNT: "订货数量",
    STATUS: "订单状态",
  },
  JSDYULIN: {
    SEQ: "行",
    ORDERID: "订单编号",
    ORDERDATE: "订货日期",
    MATERIALNO: "物料编码",
    DELIVERYDATE: "截止日期",
    COUNT: "数量",
  },
  WANSANG: {
    ORDERID: "NO.:",
    ORDERDATE: "DATE:",
    MATERIALNO: "型号",
    DELIVERYDATE: "交货日期",
    COUNT: "数量(pcs)",
  },
  FAWDE: {
    ORDERID: "订单号",
    ORDERDATE: "发布日期",
    MATERIALNO: "物料号",
    DELIVERYDATE: "需求日期",
    COUNT: "需求数量",
    CLOSEDSTATUS: "关闭状态",
    FINISHSTATUS: "完成状态",
    NAME: "一汽解放汽车有限公司无锡柴油机厂",
  },
  FAWDA: {
    ORDERDATE: "发布日期",
    MATERIALNO: "物料号",
  },
  WEICHAIAPT: {
    ORDERDATE: "发布日期",
    MATERIALNO: "名称",
  },
  BYDXIAN: {
    // ORDERID: "订单号",
    ORDERDATE: "客户更新时间",
    MATERIALNO: "物料编码",
    // DELIVERYDATE: "需求日期",
    COUNT: "最小包装数量",
    // TYPE: "类别",
  },
  BYDCHANGSHA: {
    // ORDERID: "订单号",
    ORDERDATE: "客户更新时间",
    MATERIALNO: "物料编码",
    // DELIVERYDATE: "需求日期",
    COUNT: "最小包装数量",
    // TYPE: "类别",
  },
  YUEJIN: {
    ORDERID: "单号",
    MATERIALNO: "零件号",
    DELIVERYDATE: "要货时间",
    COUNTNEED: "需求数",
    COUNTGET: "已收数量",
  },
  HINO: {
    ORDERID: "订单号",
    ORDERDATE: "订单日期",
    MATERIALNO: "件号",
  },
};
