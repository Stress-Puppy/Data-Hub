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
        <a-form-model-item label="姓名" prop="userName">
          <a-input v-model="currentData.userName" placeholder="请输入" />
        </a-form-model-item>
        <a-form-model-item label="用户名" prop="account">
          <a-input
            v-model="currentData.account"
            placeholder="请输入"
            :disabled="currentData.id != ''"
          />
        </a-form-model-item>
        <a-form-model-item label="密码" v-if="!currentData.id" prop="password">
          <a-input v-model="currentData.password" placeholder="请输入" />
        </a-form-model-item>
        <a-form-model-item label="初始化密码" v-if="currentData.id">
          <a-button :loading="btnLoading" @click="initPassword"
            >初始化</a-button
          >
        </a-form-model-item>
        <a-form-model-item label="邮箱">
          <a-input v-model="currentData.email" placeholder="请输入" />
        </a-form-model-item>
        <a-form-model-item label="手机号">
          <a-input v-model="currentData.phoneNo" placeholder="请输入" />
        </a-form-model-item>
        <a-form-model-item label="角色" prop="roleIds">
          <a-select
            mode="multiple"
            placeholder="请选择"
            v-model="currentData.roleIds"
          >
            <a-select-option v-for="role in roleList" :key="role.id">
              {{ role.roleName }}
            </a-select-option>
          </a-select>
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
              label="用户名"
              :label-col="{ span: 10 }"
              :wrapper-col="{ span: 14 }"
            >
              <a-input placeholder="请输入" v-model="searchData.account" />
            </a-form-item>
            <a-form-item
              label="姓名"
              :label-col="{ span: 8 }"
              :wrapper-col="{ span: 16 }"
            >
              <a-input placeholder="请输入" v-model="searchData.userName" />
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
        <!-- <vxe-table-column type="seq" title="序号" width="60"></vxe-table-column> -->
        <vxe-table-column field="userName" title="姓名" />
        <vxe-table-column field="account" title="用户名" />
        <vxe-table-column field="email" title="邮箱" />
        <vxe-table-column field="phoneNo" title="手机号" />
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
  getUserList,
  getRoleList,
  removeUser,
  getUserDetail,
  createUser,
  updataUser,
  initPassword,
} from "@/api/user";
import { mapGetters } from "vuex";
export default {
  data() {
    return {
      canWrite: false,
      btnLoading: false,
      loading: false,
      visible: false,
      confirmLoading: false,
      roleList: [],
      tableList: [],
      // 分页信息
      tablePage: {
        total: 0,
        currentPage: 1,
        pageSize: 10,
      },
      searchData: {
        userName: "",
        account: "",
      },
      currentData: {
        id: "",
        userName: "",
        account: "",
        email: "",
        password: "",
        phoneNo: "",
        roleIds: [],
      },
      rules: {
        userName: [
          {
            required: true,
            message: "请输入姓名",
            trigger: "blur",
          },
        ],
        account: [
          {
            required: true,
            message: "用户名",
            trigger: "blur",
          },
        ],
        password: [
          {
            required: true,
            message: "请输入密码",
            trigger: "blur",
          },
        ],
        roleIds: [
          {
            required: true,
            message: "请选择角色",
            trigger: "change",
          },
        ],
      },
    };
  },
  computed: {
    ...mapGetters({ btnList: "getBtnList", viewHeight: "getViewHeight" }),
    contentHeight(){
      return this.viewHeight - 208
    }
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
    // 初始化密码
    initPassword() {
      this.btnLoading = true;
      initPassword({
        id: this.currentData.id,
      })
        .then((res) => {
          this.btnLoading = false;
          if (res.code == 200) {
            this.$message.success("初始化成功！");
          } else {
            this.$message.error(res.message);
          }
        })
        .catch(() => {
          this.btnLoading = false;
        });
    },
    // 查询角色信息
    findRoleList() {
      getRoleList().then((res) => {
        if (res.code == 200) {
          this.roleList = res.data;
        }
      });
    },
    // 查询用户列表
    findList() {
      this.loading = true;
      getUserList({
        pageNum: this.tablePage.currentPage,
        pageSize: this.tablePage.pageSize,
        userName: this.searchData.userName,
        account: this.searchData.account,
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
        userName: "",
        account: "",
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
      removeUser([row.id]).then((res) => {
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
      getUserDetail({
        userId: row.id,
      })
        .then((res) => {
          if (res.code == 200) {
            this.currentData.id = row.id;
            this.currentData.userName = row.userName;
            this.currentData.account = row.account;
            this.currentData.email = row.email;
            this.currentData.phoneNo = row.phoneNo;
            this.currentData.roleIds = res.data.map((item) => item.id);

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
          if (this.currentData.id) {
            updataUser({ ...this.currentData })
              .then((res) => {
                this.confirmLoading = false;
                if (res.code == 200) {
                  this.$message.success("修改成功");
                  this.handleCancel();
                  this.findList();
                }else{
                  this.$message.error(res.message)
                }
              })
              .catch(() => {
                this.confirmLoading = false;
                this.$message.error(res.message);
              });
          } else {
            createUser({ ...this.currentData })
              .then((res) => {
                this.confirmLoading = false;
                if (res.code == 200) {
                  this.$message.success("创建成功");
                  this.handleCancel();
                  this.findList();
                }else{
                  this.$message.error(res.message)
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
        userName: "",
        account: "",
        email: "",
        password: "",
        phoneNo: "",
        roleIds: [],
      };
    },
  },
  mounted() {
    this.findList();
    this.findRoleList();
  },
};
</script>