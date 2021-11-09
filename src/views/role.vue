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
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 14 }"
      >
        <a-form-model-item label="角色名" prop="roleName">
          <a-input v-model="currentData.roleName" />
        </a-form-model-item>
        <a-form-model-item label="描述">
          <a-input v-model="currentData.description" />
        </a-form-model-item>

        <a-form-model-item label="权限" prop="menuIds">
          <a-tree
            v-model="currentData.menuIds"
            style="width: 100%"
            blockNode
            checkable
            checkStrictly
            :defaultExpandAll="true"
            :tree-data="menuList"
            @check="treeCheck"
          />
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
              label="角色名"
              :label-col="{ span: 10 }"
              :wrapper-col="{ span: 14 }"
            >
              <a-input placeholder="请输入" v-model="searchData.roleName" />
            </a-form-item>
            <a-form-item
              label="描述"
              :label-col="{ span: 8 }"
              :wrapper-col="{ span: 16 }"
            >
              <a-input placeholder="请输入" v-model="searchData.description" />
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
        border
        show-overflow
        :loading="loading"
        :data="tableList"
      >
        <vxe-table-column field="roleName" title="角色" />
        <vxe-table-column field="description" title="角色描述" />
        <vxe-table-column field="createDate" title="创建时间" />
        <vxe-table-column field="createBy" title="创建人" />
        <vxe-table-column field="updateDate" title="更新时间" />
        <vxe-table-column field="updateBy" title="更新人" />

        <vxe-table-column title="操作" width="180px" v-if="canWrite">
          <template #default="{ row }">
            <a-button type="primary" @click="editUser(row)">编辑</a-button>
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
  getRoleList,
  getMenuList,
  removeRole,
  getRoleDetail,
  createRole,
  updataRole,
} from "@/api/role";
import { mapGetters } from "vuex";
export default {
  data() {
    return {
      canWrite: false,
      loading: false,
      visible: false,
      confirmLoading: false,
      menuList: [], //树形菜单多选框
      tableList: [],
      // 分页信息
      tablePage: {
        total: 0,
        currentPage: 1,
        pageSize: 10,
      },
      searchData: {
        roleName: "",
        description: "",
      },
      currentData: {
        id: "",
        roleName: "",
        description: "",
        menuIds: {
          checked: [],
          halfChecked: [],
        },
      },
      rules: {
        roleName: [
          {
            required: true,
            message: "请输入角色名",
            trigger: "blur",
          },
        ],
        menuIds: [
          {
            required: true,
            message: "请选择权限",
            trigger: "change",
          },
        ],
      },
      list: [],
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
    treeCheck(keys, eventObj) {
      const currentId = eventObj.node.eventKey;
      const isChecked = eventObj.checked;
      const findObj = this.list.find((item) => item.id == currentId);
      // 选择为添加页面的写入，带上页面的读权限
      if (findObj.name.includes("write") && isChecked) {
        if (!this.currentData.menuIds.checked.includes(findObj.pid)) {
          this.currentData.menuIds.checked.push(findObj.pid);
        }
      }
      // 不是页面的写入就是页面的读取，取消时同时取消写入权限
      else if (!findObj.name.includes("write") && !isChecked) {
        const removeArr = this.list.filter((item) => item.pid == currentId);
        removeArr.forEach((item) => {
          var index = this.currentData.menuIds.checked.indexOf(item.id);
          if (index > -1) {
            this.currentData.menuIds.checked.splice(index, 1);
          }
        });
      }
    },

    // 查询菜单信息列表
    findMenuList() {
      getMenuList().then((res) => {
        if (res.code == 200) {
          const data = res.data;
          this.list = data;
          let targetArr = [];
          let originFirstObj = data.find((item) => item.levels == "1");
          if (originFirstObj) {
            let first = {
              title: originFirstObj.menuName,
              value: originFirstObj.id,
              key: originFirstObj.id,
              children: [],
            };
            this.rootId = first.value;
            // targetArr.push(first);
            // 添加页面权限
            for (const item of data) {
              if (item.pid == first.value) {
                targetArr.push({
                  title: item.menuName,
                  value: item.id,
                  key: item.id,
                  children: [],
                });
              }
            }
            // 添加按钮
            targetArr.forEach((item) => {
              data.forEach((el) => {
                if (item.value == el.pid) {
                  item.children.push({
                    title: el.menuName,
                    value: el.id,
                    key: el.id,
                  });
                }
              });
            });
          }
          this.menuList = targetArr;
        }
      });
    },
    // 查询角色列表
    findList() {
      this.loading = true;
      getRoleList({
        pageNum: this.tablePage.currentPage,
        pageSize: this.tablePage.pageSize,
        roleName: this.searchData.roleName,
        description: this.searchData.description,
      })
        .then((res) => {
          this.loading = false;
          if (res.code == 200) {
            this.tableList = res.data.records;
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
      searchData = {
        roleName: "",
        description: "",
      };
    },
    //分页方法
    handlePage({ currentPage, pageSize }) {
      this.tablePage.currentPage = currentPage;
      this.tablePage.pageSize = pageSize;
      this.findList();
    },
    // 删除单个用户
    confirm(row) {
      removeRole([row.id]).then((res) => {
        if (res.code == 200) {
          this.$message.success("删除成功！");
          this.findList();
        } else {
          this.$message.error(res.message);
        }
      });
    },
    // 修改
    editUser(row) {
      getRoleDetail({
        roleId: row.id,
      })
        .then((res) => {
          if (res.code == 200) {
            const removeLevel1Arr = res.data.filter(
              (item) => item.levels != "1"
            );
            const menuIds = removeLevel1Arr.map((item) => item.id);
            this.currentData.id = row.id;
            this.currentData.roleName = row.roleName;
            this.currentData.description = row.description;
            this.currentData.menuIds.checked = menuIds;
            this.visible = true;
          } else {
            this.$message.error(res.message);
          }
        })
        .catch(() => {
          this.$message.error("获取角色信息失败");
        });
    },
    // 提交数据
    handleOk() {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          this.confirmLoading = true;
          // 修改
          if (this.currentData.id) {
            const selectedId = [
              ...this.currentData.menuIds.checked,
              ...this.currentData.menuIds.halfChecked,
            ];
            const menuIds = [this.rootId, ...selectedId];
            updataRole({
              ...this.currentData,
              menuIds,
            })
              .then((res) => {
                this.confirmLoading = false;
                if (res.code == 200) {
                  this.$message.success("修改成功");
                  this.handleCancel();
                  this.findList();
                } else {
                  this.$message.error(res.message);
                }
              })
              .catch(() => {
                this.confirmLoading = false;
                this.$message.error(res.message);
              });
          }
          // 创建
          else {
            const selectedId = [
              ...this.currentData.menuIds.checked,
              ...this.currentData.menuIds.halfChecked,
            ];

            const menuIds = [this.rootId, ...selectedId];
            createRole({
              ...this.currentData,
              menuIds,
            })
              .then((res) => {
                this.confirmLoading = false;
                if (res.code == 200) {
                  this.$message.success("创建成功");
                  this.handleCancel();
                  this.findList();
                }
              })
              .catch(() => {
                this.confirmLoading = false;
                this.$message.error(res.message);
              });
          }
        }
      });
    },
    // 取消
    handleCancel() {
      this.$refs.ruleForm.resetFields();
      this.visible = false;
      this.currentData = {
        id: "",
        roleName: "",
        description: "",
        menuIds: {
          checked: [],
          halfChecked: [],
        },
      };
    },
  },
  mounted() {
    this.findList();
    this.findMenuList();
  },
};
</script>