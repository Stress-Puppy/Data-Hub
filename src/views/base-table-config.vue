<template>
  <div>
    <a-modal
      :title="currentData.id ? '编辑' : '新增'"
      :visible="visible"
      :confirm-loading="confirmLoading"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <a-form-model
        ref="ruleForm"
        :model="currentData"
        :rules="rules"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 14 }"
      >
        <a-form-model-item label="Product" prop="product">
          <a-input v-model="currentData.product" />
        </a-form-model-item>

        <a-form-model-item label="Customer" prop="customer">
          <a-input v-model="currentData.customer" />
        </a-form-model-item>

        <a-form-model-item label="Customer Plant" prop="customerPlant">
          <a-input v-model="currentData.customerPlant" />
        </a-form-model-item>

        <a-form-model-item label="Planner">
          <a-input v-model="currentData.planner" />
        </a-form-model-item>

        <a-form-model-item label="Sold-to No" prop="soldToNo">
          <a-input v-model="currentData.soldToNo" />
        </a-form-model-item>

        <a-form-model-item label="Ship-to No" prop="shipToNo">
          <a-input v-model="currentData.shipToNo" />
        </a-form-model-item>

        <a-form-model-item label="TT (days)" prop="ttDays">
          <a-input-number
            style="width: 100%"
            :precision="0"
            v-model="currentData.ttDays"
          />
        </a-form-model-item>

        <a-form-model-item label="Upload logic">
          <a-input v-model="currentData.uploadLogic" />
        </a-form-model-item>

        <a-form-model-item label="MRP-Contr">
          <a-input v-model="currentData.mrpContr" />
        </a-form-model-item>

        <a-form-model-item label="Plant">
          <a-input v-model="currentData.plant" />
        </a-form-model-item>
      </a-form-model>
    </a-modal>
    <a-card :bordered="false">
      <a-row type="flex" justify="space-between" align="middle">
        <a-col>
          <a-button type="primary" @click="visible = true" v-if="canWrite"
            >新建</a-button
          >
        </a-col>
        <a-col>
          <a-form layout="inline">
            <a-form-item
              label="Customer Plant"
              :label-col="{ span: 10 }"
              :wrapper-col="{ span: 14 }"
            >
              <a-select
                placeholder="请选择"
                show-search
                v-model="customerId"
                :filter-option="filterOption"
                style="width: 140px"
                @change="customerHandleChange"
              >
                <a-select-option
                  v-for="customerPlant in customerPlantList"
                  :customerPlant="customerPlant.customerPlant"
                  :shipToNo="customerPlant.shipToNo"
                  :key="customerPlant.id"
                >
                  {{ customerPlant.customerPlant }}
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item
              label="Ship To"
              :label-col="{ span: 8 }"
              :wrapper-col="{ span: 16 }"
            >
              <a-select
                placeholder="请选择"
                show-search
                v-model="customerId"
                :filter-option="filterOption"
                style="width: 140px"
                @change="customerHandleChange"
              >
                <a-select-option
                  v-for="customerPlant in customerPlantList"
                  :customerPlant="customerPlant.customerPlant"
                  :shipToNo="customerPlant.shipToNo"
                  :key="customerPlant.id"
                >
                  {{ customerPlant.shipToNo }}
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item>
              <a-button type="primary" icon="search" @click="findList">
                查询
              </a-button>
              <a-divider type="vertical" />
              <a-button icon="rollback" @click="reset"> 重置 </a-button>
            </a-form-item>
          </a-form>
        </a-col>
      </a-row>
    </a-card>

    <a-card style="margin-top: 24px" :bordered="false">
      <vxe-table
        :height="contentHeight"
        :seq-config="{ startIndex: (tablePage.currentPage - 1) * 10 }"
        show-overflow
        :loading="loading"
        :data="tableData"
      >
        <vxe-table-column type="seq" title="序号" width="60"></vxe-table-column>
        <vxe-table-column field="product" title="Product"></vxe-table-column>
        <vxe-table-column field="customer" title="Customer"></vxe-table-column>
        <vxe-table-column
          field="customerPlant"
          title="Customer Plant"
        ></vxe-table-column>
        <vxe-table-column field="planner" title="Planner"></vxe-table-column>

        <vxe-table-column
          field="soldToNo"
          title="Sold-to No"
        ></vxe-table-column>
        <vxe-table-column
          field="shipToNo"
          title="Ship-to No"
        ></vxe-table-column>
        <vxe-table-column field="ttDays" title="TT (days)"></vxe-table-column>
        <vxe-table-column
          field="uploadLogic"
          title="Upload logic"
        ></vxe-table-column>
        <vxe-table-column field="mrpContr" title="MRP-Contr"></vxe-table-column>
        <vxe-table-column field="plant" title="Plant"></vxe-table-column>
        <vxe-table-column title="操作" width="180px" v-if="canWrite">
          <template #default="{ row }">
            <a-button type="primary" @click="showModal(row)">编辑</a-button>
            <a-divider type="vertical" />

            <a-popconfirm
              title="确定要删除此条数据？"
              ok-text="是"
              cancel-text="否"
              @confirm="confirm(row)"
            >
              <a-button type="danger">删除</a-button>
            </a-popconfirm>
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
import {
  getCustomerPageList,
  updataCustomer,
  createCustomer,
  deleteCustomer,
  ruleShipTo,
  ruleCustomerPlant,
} from "@/api/baseTable";
import { getCustomerList } from "@/api/identifyExtraction";
import { mapGetters } from "vuex";

export default {
  name: "baseTableConfig",
  data() {
    let checkPending1;
    let checkPending2;
    let checkShipToNo = (rule, value, callback) => {
      clearTimeout(checkPending1);
      if (value && !this.currentData.id) {
        checkPending1 = setTimeout(() => {
          ruleShipTo({ shipToNo: value }).then((res) => {
            if (res.data) {
              callback(new Error("该Ship-To已存在！"));
            } else {
              callback();
            }
          });
        }, 300);
      } else {
        callback();
      }
    };

    let checkCustomerPlant = (rule, value, callback) => {
      clearTimeout(checkPending2);
      if (value && !this.currentData.id) {
        checkPending2 = setTimeout(() => {
          ruleCustomerPlant({ customerPlant: value }).then((res) => {
            if (res.data) {
              callback(new Error("该CustomerPlant已存在！"));
            } else {
              callback();
            }
          });
        }, 300);
      } else {
        callback();
      }
    };
    return {
      canWrite: false,
      confirmLoading: false,
      visible: false,
      loading: false,
      customerPlantList: [],
      customerId: undefined,
      // 搜索数据
      searchData: {
        plant: "",
        shipTo: "",
      },
      // 分页信息
      tablePage: {
        total: 0,
        currentPage: 1,
        pageSize: 10,
      },
      // 表格数据
      tableData: [],
      currentData: {
        id: "",
        product: "",
        customer: "",
        customerPlant: "",
        planner: "",
        soldToNo: "",
        shipToNo: "",
        ttDays: "",
        uploadLogic: "",
        mrpContr: "",
        plant: "",
      },
      rules: {
        product: [
          {
            required: true,
            message: "请输入",
            trigger: "blur",
          },
        ],
        customer: [
          {
            required: true,
            message: "请输入",
            trigger: "blur",
          },
        ],
        customerPlant: [
          {
            required: true,
            message: "请输入",
            trigger: "blur",
          },
          { required: true, validator: checkCustomerPlant, trigger: "change" },
        ],
        soldToNo: [
          {
            required: true,
            message: "请输入",
            trigger: "blur",
          },
        ],
        shipToNo: [
          {
            required: true,
            message: "请输入",
            trigger: "blur",
          },
          { required: true, validator: checkShipToNo, trigger: "change" },
        ],
        ttDays: [
          {
            required: true,
            message: "请输入",
            trigger: "blur",
          },
        ],
      },
    };
  },
  computed: {
    ...mapGetters({ btnList: "getBtnList", viewHeight: "getViewHeight" }),
    contentHeight() {
      return this.viewHeight - 208;
    },
  },
  watch: {
    btnList: {
      handler() {
        const findPath = this.btnList.find(
          (item) => item.path == this.$route.path
        );
        if (findPath) {
          this.canWrite = true;
        } else {
          this.canWrite = false;
        }
      },
      immediate: true,
    },
  },
  methods: {
    // 获取列表数据
    findList() {
      this.loading = true;
      getCustomerPageList({
        plant: this.searchData.plant,
        shipTo: this.searchData.shipTo,
        pageNum: this.tablePage.currentPage,
        pageSize: this.tablePage.pageSize,
      })
        .then((res) => {
          if (res.code == 200) {
            this.tablePage.total = res.data.total;
            this.tablePage.currentPage = res.data.current;
            this.tablePage.pageSize = res.data.size;

            this.tableData = res.data.records;
          }
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },
    //分页方法
    handlePage({ currentPage, pageSize }) {
      this.tablePage.currentPage = currentPage;
      this.tablePage.pageSize = pageSize;
      this.findList();
    },
    // 重置查询条件
    reset() {
      this.customerId = undefined;
      this.searchData = {
        plant: "",
        shipTo: "",
      };
    },
    // 编辑单条数据
    showModal(row) {
      if (row) {
        this.currentData = row;
      } else {
      }
      this.visible = true;
    },
    // 模态框点击确定
    handleOk() {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          this.confirmLoading = true;
          if (this.currentData.id) {
            updataCustomer({ ...this.currentData })
              .then((res) => {
                if (res.code == 200) {
                  this.handleCancel();
                  this.confirmLoading = false;
                  this.findList();
                }
              })
              .catch(() => {
                this.confirmLoading = false;
              });
          } else {
            createCustomer({ ...this.currentData })
              .then((res) => {
                if (res.code == 200) {
                  this.handleCancel();
                  this.confirmLoading = false;
                  this.findList();
                }
              })
              .catch(() => {
                this.confirmLoading = false;
              });
          }
        }
      });
    },
    // 模态框点击取消
    handleCancel() {
      this.$refs.ruleForm.resetFields();
      this.visible = false;
      this.currentData = {
        id: "",
        product: "",
        customer: "",
        customerPlant: "",
        planner: "",
        soldToNo: "",
        shipToNo: "",
        ttDays: "",
        uploadLogic: "",
        mrpContr: "",
        plant: "",
      };
    },
    // 删除单条数据
    confirm(row) {
      if (row.id) {
        deleteCustomer({
          id: row.id,
        }).then((res) => {
          if (res.code == 200) {
            this.findList();
          }
        });
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
    // 获取客户列表
    findCustomerList(param) {
      getCustomerList(param).then((res) => {
        // 表示列表获取成功
        if (res.code == 200) {
          this.customerPlantList = res.data;
        }
      });
    },
    // 客户名称或shipTo改变
    customerHandleChange(value, option) {
      this.searchData.plant = option.data.attrs.customerPlant;
      this.searchData.shipTo = option.data.attrs.shipToNo;
    },
  },
  mounted() {
    this.findList();
    this.findCustomerList();
  },
};
</script>