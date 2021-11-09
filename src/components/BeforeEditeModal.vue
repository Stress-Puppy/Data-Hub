<template>
  <a-modal
    v-model="beforeVisiable"
    title="提取结果"
    width="800px"
    :maskClosable="false"
    :closable="false"
  >
    <template slot="footer">
      <a-button key="back" @click="handleCancel">取消</a-button>
      <a-button
        key="submit"
        type="primary"
        :loading="loading"
        @click="SaveTable"
        :disabled="canSubmit"
        >保存</a-button
      >
    </template>
    <a-spin :spinning="spinning" tip="物料验证中...">
      <vxe-table
        ref="xTable"
        border
        show-overflow
        :maxHeight="contentHeight"
        keep-source
        :cell-class-name="cellClassName"
        :edit-rules="validRules"
        :edit-config="{
          trigger: 'dblclick',
          mode: 'cell',
          showStatus: true,
          activeMethod: activeCellMethod,
        }"
        @keydown="clearActived"
        :data="tableData"
        @edit-closed="editClosedEvent"
      >
        <vxe-table-column type="seq" width="60" title="序号" />

        <vxe-table-column
          :edit-render="{
            name: '$input',
            props: { key: 'orderId' },
            attrs: { type: 'text' },
          }"
          field="orderId"
          title="客户订单号"
          :header-class-name="orderClass ? 'successHeader' : ''"
        />

        <vxe-table-column
          :edit-render="{
            name: '$input',
            props: { key: 'orderDate' },
            props: { type: 'text' },
          }"
          field="orderDate"
          title="订单日期"
          :header-class-name="orderDateClass ? 'successHeader' : ''"
        />
        <vxe-table-column
          :edit-render="{
            name: '$input',
            props: { key: 'materialNo' },
            attrs: { type: 'text' },
          }"
          field="materialNo"
          title="物料号"
          :header-class-name="materialNoClass ? 'successHeader' : ''"
        />
        <vxe-table-column
          :edit-render="{
            name: '$input',
            props: { key: 'count' },
            attrs: { type: 'Number' },
          }"
          field="count"
          title="数量"
          :header-class-name="countClass ? 'successHeader' : ''"
        />
        <vxe-table-column
          :edit-render="{
            name: '$input',
            props: { key: 'deliveryDate' },
            props: { type: 'text' },
          }"
          field="deliveryDate"
          title="交货日期"
          :header-class-name="deliveryDateClass ? 'successHeader' : ''"
        />
      </vxe-table>
    </a-spin>
  </a-modal>
</template>
<script>
// 批量验证物料号接口
import { checkMaterialList } from "@/api/identifyExtraction";
import { fullValidEvent } from "../lib/validate";
import {
  validRules,
  initFailMaterial,
  updataFailMaterial,
} from "../lib/config";
import { mapGetters } from "vuex";
export default {
  name: "BeforeEditeModal",
  props: {
    shipto: String,
    loading: Boolean,
    beforeVisiable: Boolean,
    errMap: Map,
    tiquData: Array,
  },
  data: function () {
    return {
      validRules,
      tableData: JSON.parse(JSON.stringify(this.tiquData)),
      spinning: false,
      orderClass: true,
      orderDateClass: true,
      materialNoClass: true,
      countClass: true,
      deliveryDateClass: true,
      canSubmit: true,
    };
  },
  computed: {
    ...mapGetters({ viewHeight: "getViewHeight" }),
    contentHeight() {
      return this.viewHeight - 168;
    },
  },
  methods: {
    handleCancel() {
      this.$emit("closeVisible", "beforeVisiable");
    },
    // 去除编辑状态
    clearActived({ $event }) {
      if ($event.key == "Enter") {
        const $table = this.$refs.xTable;
        $table.clearActived()
      }
    },
    //此单元格是否可以编辑
    activeCellMethod(param) {
      let Modifiable = false;
      if (param.cell.className.indexOf("col-orange") > 0) {
        Modifiable = true;
      } else if (param.cell.className.indexOf("col--dirty") > 0) {
        Modifiable = true;
      }
      return Modifiable;
    },

    SaveTable() {
      const $table = this.$refs.xTable;
      const updateRecords = $table.getUpdateRecords();
      // 如果没有修改项，并且也没有错误的话直接提交数据
      if (!updateRecords.length && !this.errMap.size) {
        this.$emit("submit", this.tableData);
      } else {
        this.$emit("getOriginDataForCompare", updateRecords);
        this.$emit("setAfterEditerTiquData", updateRecords);
        this.$emit("setSubmitData", this.tableData);
      }
    },
    cellClassName({ columnIndex, rowIndex }) {
      const errArr = this.errMap.get(rowIndex);
      if (errArr && errArr.includes(columnIndex)) {
        return "col-orange";
      }
    },
    async editClosedEvent() {
      this.errMap.clear()
      initFailMaterial();
      const materialSet = new Set();
      this.tableData.forEach((item) => {
        if (item.materialNo) {
          materialSet.add(item.materialNo);
        }
      });
      checkMaterialList({
        materialsNos: [...materialSet],
        shipTo: this.shipto,
      }).then(async (res) => {
        if (res.code == 200) {
          updataFailMaterial(res.data);
          const can = await fullValidEvent(this.$refs.xTable, this.errMap);
          this.orderClass = true;
          this.orderDateClass = true;
          this.materialNoClass = true;
          this.countClass = true;
          this.deliveryDateClass = true;

          for (const item of this.errMap) {
            if (item[1].includes(1)) {
              this.orderClass = false;
            }
            if (item[1].includes(2)) {
              this.orderDateClass = false;
            }
            if (item[1].includes(3)) {
              this.materialNoClass = false;
            }
            if (item[1].includes(4)) {
              this.countClass = false;
            }
            if (item[1].includes(5)) {
              this.deliveryDateClass = false;
            }
          }
          this.canSubmit = !can;
        }
      });
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.editClosedEvent();
    });
  },
};
</script>
<style>
.successHeader {
  background-color: #00b300;
  color: #fff;
}
.col--dirty {
  background-color: #ffebcd;
}
</style>