<template>
  <a-modal
    v-model="afterVisiable"
    title="修改结果记录"
    width="80vw"
    :maskClosable="false"
    :closable="false"
  >
    <template slot="footer">
      <a-button key="back" @click="HandleCancel">取消</a-button>
      <a-button
        key="submit"
        type="primary"
        @click="submitEdite"
        :loading="loading"
        >提交</a-button
      >
    </template>
    <a-row>
      <a-col :span="12">
        <a-card title="修改前" :bordered="false">
          <vxe-table
            show-overflow
            :maxHeight="contentHeight"
            :cell-class-name="originCellClassName"
            ref="xTableTqAfterEdite"
            border
            :data="originDataForCompare"
          >
            <vxe-table-column type="seq" width="60" title="序号" />
            <vxe-table-column
              field="orderId"
              title="客户订单号"
            ></vxe-table-column>
            <vxe-table-column
              field="orderDate"
              title="订单日期"
            ></vxe-table-column>
            <vxe-table-column
              field="materialNo"
              title="物料号"
            ></vxe-table-column>
            <vxe-table-column field="count" title="数量"></vxe-table-column>
            <vxe-table-column
              field="deliveryDate"
              title="交货日期"
            ></vxe-table-column>
          </vxe-table>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="修改后" :bordered="false">
          <vxe-table
            show-overflow
            :maxHeight="contentHeight"
            :cell-class-name="afterCellClassName"
            ref="xTableTqAfterEdite"
            border
            :data="afterEditerTiquData"
          >
            <vxe-table-column type="seq" width="60" title="序号" />
            <vxe-table-column
              field="orderId"
              title="客户订单号"
            ></vxe-table-column>
            <vxe-table-column
              field="orderDate"
              title="订单日期"
            ></vxe-table-column>
            <vxe-table-column
              field="materialNo"
              title="物料号"
            ></vxe-table-column>
            <vxe-table-column field="count" title="数量"></vxe-table-column>
            <vxe-table-column
              field="deliveryDate"
              title="交货日期"
            ></vxe-table-column>
          </vxe-table>
        </a-card>
      </a-col>
    </a-row>
  </a-modal>
</template>
<script>
import { keyAndColumnMap } from "../lib/config";
import { mapGetters } from "vuex";
export default {
  props: {
    loading: Boolean,
    afterVisiable: Boolean,
    afterEditerTiquData: Array,
    originDataForCompare: Array,
  },
  data: function () {
    return {
      // visiable: false,
    };
  },
  name: "AfterEditedModal",
  computed: {
    ...mapGetters({ viewHeight: "getViewHeight" }),
    contentHeight() {
      return this.viewHeight - 168;
    },
  },
  methods: {
    HandleCancel() {
      this.$emit("closeVisible", "afterVisiable");
    },
    submitEdite() {
      this.$emit("saveData");
    },
    originCellClassName({ rowIndex, columnIndex }) {
      const currentKey = keyAndColumnMap.get(columnIndex);
      if (
        this.afterEditerTiquData[rowIndex][currentKey] !==
        this.originDataForCompare[rowIndex][currentKey]
      ) {
        return "col-orange";
      }
    },
    afterCellClassName({ rowIndex, columnIndex }) {
      const currentKey = keyAndColumnMap.get(columnIndex);
      if (
        this.afterEditerTiquData[rowIndex][currentKey] !==
        this.originDataForCompare[rowIndex][currentKey]
      ) {
        return "col-yellow";
      }
    },
  },
};
</script>