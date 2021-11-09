<template>
  <div>
    <a-modal
      v-model="visible"
      title="修改结果记录"
      width="80vw"
      :maskClosable="false"
      :closable="false"
    >
      <template slot="footer">
        <a-button key="back" @click="HandleCancel">取消</a-button>
      </template>
      <a-row>
        <a-col :span="12">
          <a-card title="修改前" :bordered="false">
            <vxe-table
              :cell-class-name="originCellClassName"
              ref="xTableTqAfterEdite"
              border
              :data="beforeList"
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
              :cell-class-name="afterCellClassName"
              ref="xTableTqAfterEdite"
              border
              :data="afterList"
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

    <a-card :bordered="false">
      <a-form layout="inline">
        <a-form-item label="创建人">
          <a-select
            show-search
            :filter-option="filterOption"
            v-model="userId"
            style="width: 200px"
          >
            <a-select-option value="">全部</a-select-option>
            <a-select-option v-for="user in userList" :key="user.id">{{
              user.account
            }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="记录时间">
          <a-range-picker
            show-time
            value-format="YYYY-MM-DD HH:mm:ss"
            v-model="searchDate"
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" icon="search" @click="findList">
            查询
          </a-button>
          <a-divider type="vertical" />
          <a-button icon="rollback" @click="reset"> 重置 </a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <a-card style="margin-top: 24px" :bordered="false">
      <vxe-table
        :height="contentHeight"
        :seq-config="{ startIndex: (tablePage.currentPage - 1) * 10 }"
        border
        show-overflow
        :loading="loading"
        :data="tableList"
      >
        <!-- <vxe-table-column type="seq" title="序号" width="60"></vxe-table-column> -->
        <vxe-table-column
          field="operationModule"
          width="80px"
          title="操作模块"
        />
        <vxe-table-column field="operationContent" title="操作内容" />
        <vxe-table-column field="createDate" width="160px" title="创建时间" />
        <vxe-table-column field="createBy" width="80px" title="创建人" />
        <!-- <vxe-table-column field="updateDate" title="更新时间" />
        <vxe-table-column field="updateBy" title="更新人" /> -->

        <vxe-table-column title="操作" width="80px">
          <template #default="{ row }">
            <a-button
              v-if="row.operationAfter"
              type="primary"
              @click="showModal(row)"
              >对比</a-button
            >
          </template>
        </vxe-table-column>
      </vxe-table>
      <vxe-pager
        perfect
        :current-page.sync="tablePage.currentPage"
        :page-size.sync="tablePage.pageSize"
        :total="tablePage.total"
        @page-change="handlePage"
        :layouts="[
          'PrevJump',
          'PrevPage',
          'Number',
          'NextPage',
          'NextJump',
          'Sizes',
          'Total',
        ]"
      ></vxe-pager>
    </a-card>
  </div>
</template>
<script>
import { keyAndColumnMap } from "../lib/config";
import { mapGetters } from "vuex";
import { getlogList, getUserPageList } from "@/api/log";
export default {
  data() {
    return {
      loading: false,
      visible: false,
      startMonth: this.$moment().startOf("month").format("YYYY-MM-DD HH:mm:ss"),
      endMonth: this.$moment().endOf("month").format("YYYY-MM-DD HH:mm:ss"),
      userList: [],
      tableList: [],

      // 修改前数据
      beforeList: [],
      // 修改后数据
      afterList: [],
      // 分页信息
      tablePage: {
        total: 0,
        currentPage: 1,
        pageSize: 10,
      },
      searchDate: [this.startMonth, this.endMonth],
      userName: "",
      userId: "",
    };
  },
  computed: {
    ...mapGetters({ btnList: "getBtnList", viewHeight: "getViewHeight" }),
    contentHeight() {
      return this.viewHeight - 208;
    },
  },
  methods: {
    // 获取用户列表
    getUserPageList() {
      getUserPageList().then((res) => {
        if (res.code == 200) {
          this.userList = res.data;
        }
      });
    },
    // 查询用户列表
    findList() {
      this.loading = true;
      let findObj;
      if (this.userId) {
        findObj = this.userList.find((item) => item.id == this.userId);
      }
      this.userName = findObj ? findObj.userName : "";
      getlogList({
        pageNum: this.tablePage.currentPage,
        pageSize: this.tablePage.pageSize,
        startTime: this.searchDate[0],
        endTime: this.searchDate[1],
        userName: this.userName,
      })
        .then((res) => {
          this.loading = false;
          if (res.code == 200) {
            this.tableList = res.data.records.map((item) => ({
              ...item,
              operationModule:
                item.operationModule == "1" ? "识别提取" : "客户基础表",
            }));

            this.tablePage.total = res.data.total;
            this.tablePage.currentPage = res.data.current;
            this.tablePage.pageSize = res.data.size;
          }
        })
        .catch(() => {
          this.loading = false;
        });
    },
    // 重置
    reset() {
      this.searchDate = [this.startMonth, this.endMonth];
    },
    //分页方法
    handlePage({ currentPage, pageSize }) {
      this.tablePage.currentPage = currentPage;
      this.tablePage.pageSize = pageSize;
      this.findList();
    },
    // 显示对比
    showModal(row) {
      // 修改前数据
      this.beforeList = JSON.parse(row.operationBefore);
      // 修改后数据
      this.afterList = JSON.parse(row.operationAfter);

      this.visible = true;
    },
    // 取消
    HandleCancel() {
      // 修改前数据
      this.beforeList = [];
      // 修改后数据
      this.afterList = [];
      this.visible = false;
    },
    originCellClassName({ rowIndex, columnIndex }) {
      const currentKey = keyAndColumnMap.get(columnIndex);
      if (
        this.afterList[rowIndex][currentKey] !==
        this.beforeList[rowIndex][currentKey]
      ) {
        return "col-orange";
      }
    },
    afterCellClassName({ rowIndex, columnIndex }) {
      const currentKey = keyAndColumnMap.get(columnIndex);
      if (
        this.afterList[rowIndex][currentKey] !==
        this.beforeList[rowIndex][currentKey]
      ) {
        return "col-yellow";
      }
    },
    // 过滤select
    filterOption(input, option) {
      return (
        option.componentOptions.children[0].text
          .toLowerCase()
          .indexOf(input.toLowerCase()) >= 0
      );
    },
  },
  mounted() {
    this.findList();
    this.getUserPageList();
  },
};
</script>
<style>
.col-orange {
  text-align: center;
  background-color: #f60;
  color: #fff;
}
.col-yellow {
  text-align: center;
  background-color: #ffebcd;
}
</style>