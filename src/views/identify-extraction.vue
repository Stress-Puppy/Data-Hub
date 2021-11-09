<template>
  <div class="order-page">
    <div class="mark" v-if="ideLoading || confirmLoading">
      <div class="loadingArea">
        <a-spin size="large" tip="Loading..." />
      </div>
    </div>
    <a-card :bordered="false">
      <a-row type="flex" :gutter="16">
        <a-col flex="auto">
          <a-row :gutter="16">
            <a-col :span="8">
              <a-select
                placeholder="客户名称"
                show-search
                v-model="customerId"
                :filter-option="filterOption"
                style="width: 100%"
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
            </a-col>
            <a-col :span="8">
              <a-select
                placeholder="Ship To"
                show-search
                v-model="customerId"
                :filter-option="filterOption"
                style="width: 100%"
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
            </a-col>
            <a-col :span="8">
              <a-range-picker
                style="width: 100%"
                value-format="YYYY-MM-DD"
                v-model="searchData.date"
              />
            </a-col>
          </a-row>
        </a-col>
        <a-col>
          <a-button type="primary" icon="search" @click="findList"> 查询 </a-button>
          <a-divider type="vertical" />
          <a-button icon="rollback" @click="reset"> 重置 </a-button>
        </a-col>
      </a-row>
    </a-card>

    <a-card style="margin-top: 24px" :bordered="false">
      <a-col style="margin-bottom: 24px" v-if="canWrite">
        <a-select
          v-model="shipto"
          style="min-width: 120px"
          show-search
          :filter-option="filterOption"
        >
          <a-select-option value=""> 客户名称 </a-select-option>
          <a-select-option v-for="ship in shipToList" :key="ship.shipto">{{
            ship.customerPlant
          }}</a-select-option>
        </a-select>

        <a-divider type="vertical" />

        <a-select
          v-model="shipto"
          style="min-width: 120px"
          show-search
          :filter-option="filterOption"
        >
          <a-select-option value=""> Ship To </a-select-option>
          <a-select-option v-for="ship in shipToList" :key="ship.shipto">{{
            ship.shipto
          }}</a-select-option>
        </a-select>

        <a-divider type="vertical" />
        <a-upload
          :disabled="!shipto"
          class="avatar-uploader"
          :show-upload-list="false"
          :before-upload="beforeUpload"
        >
          <a-button
            type="primary"
            icon="file-search"
            :disabled="!shipto"
            :loading="ideLoading"
          >
            识别文件
          </a-button>
        </a-upload>

        <a-divider type="vertical" />
        <a-button
          :disabled="!selecedCol.length"
          @click="
            () => {
              downloadVisible = true;
            }
          "
        >
          <a-icon type="download" /> 归类下载
        </a-button>
      </a-col>
      <vxe-table
        border
        auto-resize
        :height="contentHeight"
        :seq-config="{ startIndex: (tablePage.currentPage - 1) * 10 }"
        :loading="tableLoading"
        ref="xTable"
        :data="tableData"
        @checkbox-change="checkboxChangeEvent"
        @checkbox-all="checkboxChangeEvent"
      >
        <vxe-table-column type="checkbox" width="60" />
        <vxe-table-column type="seq" width="60" title="序号" />
        <vxe-table-column field="customer" title="客户名称" show-overflow />
        <vxe-table-column field="shipTo" title="Ship to" />
        <vxe-table-column field="source" title="源文件">
          <template #default="{ row }">
            <a @click="downloadOriginFile(row.sourceUrl, row.fileName)">{{
              row.fileName
            }}</a>
          </template>
        </vxe-table-column>
        <vxe-table-column field="createDate" title="文档生成时间" />
        <vxe-table-column field="createBy" title="创建人" />
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

    <before-edite-modal
      v-if="beforeVisiable"
      :shipto="shipto"
      :tiquData="originData"
      :errMap="errMap"
      :beforeVisiable="beforeVisiable"
      :loading="beforeLoading"
      @closeVisible="closeModel"
      @setSubmitData="setSubmitData"
      @submit="submit"
      @setAfterEditerTiquData="setAfterEditerTiquData"
      @getOriginDataForCompare="getOriginDataForCompare"
    />

    <after-edited-modal
      ref="afterEditedModal"
      v-if="afterVisiable"
      :afterVisiable="afterVisiable"
      :originDataForCompare="originDataForCompare"
      :afterEditerTiquData="afterEditerTiquData"
      :loading="afterLoading"
      @closeVisible="closeModel"
      @saveData="saveData"
    />

    <download-edite-modal
      :downloadVisible="downloadVisible"
      :confirmLoading="confirmLoading"
      @closeVisible="closeModel"
      @downloadInit="downloadInit"
    />
  </div>
</template>
<script>
import pdfJS from "pdfjs-dist";
pdfJS.GlobalWorkerOptions.workerSrc = require("pdfjs-dist/build/pdf.worker.entry");

import { setCookies, getCookies, removeCookies } from "@/utils/cookie";
import Cookies from "js-cookie";
import { saveAs } from "file-saver";
//文件处理函数
import loadPDFData from "@/utils/loadFile/PDF";
import loadXLSXData from "@/utils/loadFile/xlsx";
import DownloadEditeModal from "@/components/DownloadModal";
import {
  checkFileName,
  getIdentifyList,
  saveIdentify,
  getCustomerList,
  downloadOriginFile,
  downloadDelinsFile,
  downloadAWTFile,
  downloadLOPFile,
} from "@/api/identifyExtraction";

import { mapGetters } from "vuex";
import moment from "moment";
const startMonth = moment().startOf("month").format("YYYY-MM-DD");
const endMonth = moment().endOf("month").format("YYYY-MM-DD");
export default {
  name: "OrderPage",
  components: {
    BeforeEditeModal: () => import("@/components/BeforeEditeModal"),
    AfterEditedModal: () => import("@/components/AfterEditedModal"),
    DownloadEditeModal,
  },
  data() {
    return {
      canWrite: false,
      // 识别时的lodaing
      ideLoading: false,
      //before model 按钮loading状态
      beforeLoading: false,
      //after model 按钮loading状态
      afterLoading: false,
      // table的loading状态
      tableLoading: false,
      // 分页信息
      tablePage: {
        total: 0,
        currentPage: 1,
        pageSize: 10,
      },
      // 搜索列表条件
      searchData: {
        customerName: "",
        shipTo: "",
        date: [startMonth, endMonth],
      },

      downloadVisible: false,
      beforeVisiable: false,
      afterVisiable: false,

      errMap: new Map(),
      currentColumnIndex: null,
      afterEditerTiquData: null,
      originDataForCompare: null,
      currentSeletedRowid: new Set(),

      //文件提取出的数据，原始数据（用于比对的数据）
      originData: null,

      tiquDataMap: new Map(),
      tableData: [],
      customerId: undefined, //后端绑定的shipTo的ID
      customerPlantList: [],
      shipto: "",
      //选中的列
      selecedCol: [],
      //当前操作的file文件
      currentFile: null,
      userName: "",
      // 修改后提交的数据
      submitData: [],

      delinsDownLoading: false,
      AWTDownLoading: false,
      LOPDownLoading: false,

      // 识别文件shipTo列表
      shipToList: [
        {
          customerPlant: "CAMC",
          shipto: "1000005247",
        },
        {
          customerPlant: "JAC",
          shipto: "1000005146",
        },
        {
          customerPlant: "JAC Green Jet",
          shipto: "1000030959",
        },
        {
          customerPlant: "SDEC",
          shipto: "1000013960",
        },
        {
          customerPlant: "48V_FAW-HQ",
          shipto: "1000917865",
        },
        {
          customerPlant: "48V_GWM",
          shipto: "1000155552",
        },
        {
          customerPlant: "QingLing(股份)",
          shipto: "1000005259",
        },
        {
          customerPlant: "Fengze",
          shipto: "1000160265",
        },
        {
          customerPlant: "Tianrong",
          shipto: "1000026976",
        },
        {
          customerPlant: "Lear Stec",
          shipto: "1000030157",
        },
        {
          customerPlant: "LearChongqing",
          shipto: "1000028469",
        },
        {
          customerPlant: "LearYangzhou",
          shipto: "1000027939",
        },
        {
          customerPlant: "Changchai",
          shipto: "1000005256",
        },
        {
          customerPlant: "Sany-Kunshan",
          shipto: "1000014218",
        },
        {
          customerPlant: "Sany-Changsha",
          shipto: "1000159507",
        },
        {
          customerPlant: "Enda",
          shipto: "1000031020",
        },
        {
          customerPlant: "Montaplast",
          shipto: "1000009506",
        },
        {
          customerPlant: "DFCV十堰动力",
          shipto: "1000005102",
        },
        {
          customerPlant: "DFCV十堰商用",
          shipto: "1000158160",
        },
        {
          customerPlant: "JSD-Yulin",
          shipto: "1000027938",
        },
        {
          customerPlant: "Lorom",
          shipto: "1000028775",
        },
        {
          customerPlant: "Wansang",
          shipto: "1000026939",
        },
        {
          customerPlant: "Weichai-APT",
          shipto: "1000018125",
        },
        {
          customerPlant: "FAWDA",
          shipto: "1000005134",
        },
        {
          customerPlant: "FAWDE-NG",
          shipto: "1000024275",
        },
        {
          customerPlant: "FAWDE-Sensor",
          shipto: "1000005181",
        },
        {
          customerPlant: "BYD-Xian",
          shipto: "1000027378",
        },
        {
          customerPlant: "BYD-Changsha",
          shipto: "1000027380",
        },
        {
          customerPlant: "Yuejin",
          shipto: "1000036821",
        },
        {
          customerPlant: "HINO",
          shipto: "1000005260",
        },
      ],
    };
  },
  computed: {
    ...mapGetters({ btnList: "getBtnList", viewHeight: "getViewHeight" }),
    contentHeight() {
      return this.viewHeight - 256;
    },
    //下载按钮loading状态
    confirmLoading() {
      if (!this.delinsDownLoading && !this.AWTDownLoading && !this.LOPDownLoading) {
        return false;
      } else {
        return true;
      }
    },
  },
  watch: {
    btnList: {
      handler() {
        const findPath = this.btnList.find((item) => item.path == this.$route.path);
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
    // 获取客户列表
    findCustomerList(param) {
      getCustomerList(param)
        .then((res) => {
          // 表示列表获取成功
          if (res.code == 200) {
            this.customerPlantList = res.data;
            const selectedShipTo = Cookies.get("selectedShipTo");
            if (selectedShipTo) {
              this.customerId = selectedShipTo;
            }
            this.findList();
          }
        })
        .catch(() => {
          this.findList();
        });
    },
    //获取列表
    findList() {
      this.tableLoading = true;
      getIdentifyList({
        customerName: this.searchData.customerName,
        shipTo: this.searchData.shipTo,
        startDate: this.searchData.date[0],
        endDate: this.searchData.date[1],
        pageNum: this.tablePage.currentPage,
        pageSize: this.tablePage.pageSize,
      })
        .then((res) => {
          if (res.code == 200) {
            this.tableData = res.data.records;
            this.tablePage.total = res.data.total;
            this.tablePage.currentPage = res.data.current;
            this.tablePage.pageSize = res.data.size;
          }
          this.tableLoading = false;
        })
        .catch(() => {
          this.tableLoading = false;
        });
    },
    // 重置搜索条件
    reset() {
      removeCookies("selectedShipTo");
      this.customerId = undefined;
      this.searchData = {
        customerName: "",
        shipTo: "",
        date: [startMonth, endMonth],
      };
    },
    setSubmitData(data) {
      this.submitData = data;
    },
    // 提交数据到后端
    saveData() {
      this.afterLoading = true;
      let formData = new FormData();
      const orderList = this.formatData(this.submitData);
      formData.append("file", this.currentFile);
      formData.append("fileName", this.currentFile.name);
      formData.append("shipTo", this.shipto);
      formData.append("userName", this.userName);
      formData.append("orderList", JSON.stringify({ orderList }));

      formData.append("logContent", `上传源文件:${this.currentFile.name},有修改`);
      formData.append("logBefore", JSON.stringify(this.originDataForCompare));
      formData.append("logAfter", JSON.stringify(this.afterEditerTiquData));
      saveIdentify(formData)
        .then((res) => {
          this.afterLoading = false;
          if (res.code == 200) {
            this.$message.success("提交成功！");
            this.beforeVisiable = false;
            this.afterVisiable = false;
            this.findList();
          } else {
            this.$message.error(res.message);
          }
        })
        .catch(() => {
          this.afterLoading = false;
        });
    },
    // 格式化数据,将解析出来的数据转换成后端需要的数据格式
    formatData(data) {
      let orderList = [];
      // 原始数据循环第一次循环添加只订单号
      data.forEach((item) => {
        let has = orderList.find((order) => order.orderNo == item.orderId);
        if (!has) {
          orderList.push({
            orderNo: item.orderId,
            materielList: [],
          });
        }
      });
      // 原始数据第二次循环更具订单号匹配添加其他数据
      data.forEach((item) => {
        orderList.forEach((targetItem) => {
          if (targetItem.orderNo == item.orderId) {
            targetItem.materielList.push({
              materialsNo: item.materialNo,
              orderDate: this.$moment(item.orderDate).format("DD/MM/YYYY"),
              num: item.count,
              deliveryDate: this.$moment(item.deliveryDate).format("DD/MM/YYYY"),
            });
          }
        });
      });
      return orderList;
    },

    // 设置用户修改后的数据
    setAfterEditerTiquData(value) {
      this.afterEditerTiquData = value;
      this.afterVisiable = true;
    },
    //获取原始数据中被改变的row
    getOriginDataForCompare(updateRecords) {
      const data = [];
      updateRecords.forEach((item) => {
        this.originData.forEach((it) => {
          if (item.id == it.id) {
            data.push(it);
          }
        });
      });
      this.originDataForCompare = data;
    },

    // 没有错误直接提交
    submit(data) {
      this.beforeLoading = true;
      let formData = new FormData();
      const orderList = this.formatData(data);
      formData.append("file", this.currentFile);
      formData.append("fileName", this.currentFile.name);
      formData.append("shipTo", this.shipto);
      formData.append("userName", this.userName);
      formData.append("orderList", JSON.stringify({ orderList }));
      formData.append("logContent", `上传源文件:${this.currentFile.name},无修改`);
      saveIdentify(formData)
        .then((res) => {
          this.beforeLoading = false;
          if (res.code == 200) {
            this.$message.success("提交成功！");
            this.beforeVisiable = false;
            this.afterVisiable = false;
            this.findList();
          } else {
            this.$message.error(res.message);
          }
        })
        .catch(() => {
          this.beforeLoading = false;
        });
    },

    //更具参数关闭模态框
    closeModel(name) {
      this[name] = false;
    },

    // 多选框的chang事件
    checkboxChangeEvent(obj) {
      this.selecedCol = obj.records;
    },

    // 客户名称或shipTo改变
    customerHandleChange(value, option) {
      // 保存历史查询条件
      setCookies("selectedShipTo", {
        value: value,
        time: 90,
      });
      this.searchData.customerName = option.data.attrs.customerPlant;
      this.searchData.shipTo = option.data.attrs.shipToNo;
    },

    // 解析文件数据入库
    beforeUpload(file) {
      this.currentFile = file;
      checkFileName({
        fileName: file.name,
      }).then((res) => {
        if (res.code == 200) {
          if (res.data.length) {
            this.$message.warning("该文件已上传");
          } else {
            this.ideLoading = true;
            switch (file.type) {
              case "application/pdf":
                this.savePDF(file);
                break;
              case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                this.saveXLSX(file);
                break;
              case "application/vnd.ms-excel":
                this.saveXLSX(file);
                break;
              default:
                this.$message.warning("暂时不支持解析此格式的文件");
            }
          }
        }
      });

      return false;
    },
    // 解析PDF文件
    savePDF(file) {
      // ***********************解析开始
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        const typedarray = new Uint8Array(e.target.result);
        const loadingTask = pdfJS.getDocument({ data: typedarray });

        // 获取 PDF 全部数据
        loadingTask.promise
          .then(async (pdf) => {
            return loadPDFData(pdf, this.shipto, this.$message);
          })
          .then((res) => {
            this.checkMaterialList(res);
            // if (res && res.length) {
            //   this.originData = res;
            //   this.beforeVisiable = true;
            // } else {
            //   this.$message.error("文件识别失败");
            // }
            // this.ideLoading = false;
          });
      };
      fileReader.readAsArrayBuffer(file);
      // ***********************解析结束
    },
    // 解析xlsx文件
    saveXLSX(file) {
      loadXLSXData(file, this.shipto, this.$message).then((res) => {
        this.checkMaterialList(res);
        // console.log(res);
      });
    },

    // 验证物料号,并动态添加物料号验证列表后进行验证，展示模态框
    checkMaterialList(data) {
      if (data && data.length) {
        // 去除数据中的空格
        const toStrOrderList = JSON.stringify(data);
        const orderListNoSpace = toStrOrderList.replace(/\s+/g, "");
        const orderListArr = JSON.parse(orderListNoSpace);

        // let materialNoSet = new Set();
        // orderListArr.forEach((item) => {
        //   materialNoSet.add(item.materialNo);
        // });
        // console.log(materialNoSet);
        // checkMaterialList({
        //   materialsNos: [...materialNoSet],
        //   shipTo: this.shipto,
        // }).then((res) => {
        //   console.log(res);
        // });

        this.originData = orderListArr;
        this.beforeVisiable = true;
      } else {
        this.$message.error("文件识别失败");
      }
      this.ideLoading = false;
    },

    //分页方法
    handlePage({ currentPage, pageSize }) {
      this.tablePage.currentPage = currentPage;
      this.tablePage.pageSize = pageSize;
      this.findList();
    },
    // 下载源文件
    downloadOriginFile(path, fileName) {
      downloadOriginFile({ path }).then((res) => {
        if (res) {
          let blob = new Blob([res], {
            type: "application/vnd.ms-excel;charset=utf-8",
          });
          saveAs(blob, fileName);
        }
      });
    },
    // 下载文件的分类
    downloadInit(arrNeedDownloadFile) {
      const ids = this.selecedCol.map((item) => item.id);
      arrNeedDownloadFile.includes("Delins Format") && this.downloadDelinsFile(ids);
      arrNeedDownloadFile.includes("For AWT LL Format") && this.downloadAWTFile(ids);
      arrNeedDownloadFile.includes("LOP2对账 Format") && this.downloadLOPFile(ids);
    },
    // 下载Delins Format文件
    downloadDelinsFile(ids) {
      this.delinsDownLoading = true;
      downloadDelinsFile({ ids })
        .then((res) => {
          this.delinsDownLoading = false;
          if (res) {
            const fileName = `Delins Format${this.$moment().format("YYYY-MM-DD")}.xlsx`;
            let blob = new Blob([res], {
              type: "application/vnd.ms-excel;charset=utf-8",
            });
            saveAs(blob, fileName);
          } else {
            this.$message.error(res.message);
          }
        })
        .catch(() => {
          this.delinsDownLoading = false;
          this.$message.error("下载Delins Format文件失败");
        });
    },
    // 下载For AWT LL Format文件
    downloadAWTFile(ids) {
      this.AWTDownLoading = true;
      downloadAWTFile({ ids })
        .then((res) => {
          this.AWTDownLoading = false;
          if (res) {
            const fileName = `For AWT LL Format${this.$moment().format(
              "YYYY-MM-DD"
            )}.xlsx`;
            let blob = new Blob([res], {
              type: "application/vnd.ms-excel;charset=utf-8",
            });
            saveAs(blob, fileName);
          } else {
            this.$message.error(res.message);
          }
        })
        .catch(() => {
          this.AWTDownLoading = false;
          this.$message.error("下载For AWT LL Format文件失败");
        });
    },
    // 下载LOP2对账 Format文件
    downloadLOPFile(ids) {
      this.LOPDownLoading = true;
      downloadLOPFile({ ids })
        .then((res) => {
          this.LOPDownLoading = false;
          if (res) {
            const fileName = `LOP2对账 Format${this.$moment().format("YYYY-MM-DD")}.xlsx`;
            let blob = new Blob([res], {
              type: "application/vnd.ms-excel;charset=utf-8",
            });
            saveAs(blob, fileName);
          } else {
            this.$message.error(res.message);
          }
        })
        .catch(() => {
          this.LOPDownLoading = false;
          this.$message.error("下载LOP2对账 Format文件失败");
        });
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
    // this.findList();
    const userInfo = getCookies("userInfo");
    this.userName = userInfo.username;
    this.findCustomerList();
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
.mark {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 999999;
  background-color: rgba(0, 0, 0, 0.1);
}
.loadingArea {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
