<template>
  <a-config-provider :locale="zh_CN">
    <a-layout id="components-layout-demo-custom-trigger" style="height: 100%">
      <a-layout-sider v-model="collapsed" :trigger="null" collapsible>
        <div class="logo" />
        <a-menu
          theme="dark"
          mode="inline"
          :defaultSelectedKeys="[$route.path]"
          @click="menuClick"
        >
          <a-menu-item v-for="menu in menuList[0].children" :key="menu.path">
            <a-icon :type="menu.icon" />
            <span>{{ menu.title }}</span>
          </a-menu-item>

          <!-- <a-menu-item key="/identify-extraction">
            <a-icon type="upload" />
            <span>识别提取</span>
          </a-menu-item>
          <a-menu-item key="/base-table-config">
            <a-icon type="video-camera" />
            <span>基础表单配置</span>
          </a-menu-item>
          <a-menu-item key="/user">
            <a-icon type="user" />
            <span>用户管理</span>
          </a-menu-item>
          <a-menu-item key="/role">
            <a-icon type="upload" />
            <span>角色管理</span>
          </a-menu-item> -->
        </a-menu>
      </a-layout-sider>
      <a-layout>
        <a-layout-header style="background: #fff; padding: 0">
          <a-row type="flex" justify="space-between">
            <a-col>
              <a-icon
                class="trigger"
                :type="collapsed ? 'menu-unfold' : 'menu-fold'"
                @click="() => (collapsed = !collapsed)"
              />
            </a-col>
            <a-col>
              <header-avatar @editSelf="editSelf" />
            </a-col>
          </a-row>
        </a-layout-header>
        <a-layout-content
          ref="content"
          :style="{ margin: '24px', minHeight: 'auto' }"
        >
          <a-modal
            title="个人信息修改"
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
                  disabled
                />
              </a-form-model-item>

              <a-form-model-item label="邮箱">
                <a-input v-model="currentData.email" placeholder="请输入" />
              </a-form-model-item>
              <a-form-model-item label="手机号">
                <a-input v-model="currentData.phoneNo" placeholder="请输入" />
              </a-form-model-item>
            </a-form-model>
          </a-modal>
          <router-view></router-view>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-config-provider>
</template>
<script>
import HeaderAvatar from "./HeaderAvatar";
import zh_CN from "ant-design-vue/lib/locale-provider/zh_CN";
import { mapGetters,mapMutations } from "vuex";
import Cookies from "js-cookie";
import { getUserDetail, updataUserDetail } from "@/api/Login";

export default {
  components: { HeaderAvatar },
  data() {
    return {
      minHeight: window.innerHeight - 64,
      visible: false,
      confirmLoading: false,
      userId: "",
      zh_CN,
      collapsed: false,
      currentData: {
        userName: "",
        account: "",
        email: "",
        phoneNo: "",
      },
      rules: {
        userName: [
          {
            required: true,
            message: "请输入姓名",
            trigger: "blur",
          },
        ],
      },
    };
  },
  computed: {
    ...mapGetters({ menuList: "getMenuList" }),
  },
  methods: {
    ...mapMutations(["setViewHeight"]),
    menuClick({ key }) {
      this.$router.push({
        path: key,
      });
    },
    editSelf() {
      getUserDetail({
        userId: this.userId,
      }).then((res) => {
        this.visible = true;
        this.currentData = {
          userName: res.data.userName,
          account: res.data.account,
          email: res.data.email,
          phoneNo: res.data.phoneNo,
        };
      });
    },
    handleOk() {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          updataUserDetail({
            id: this.userId,
            ...this.currentData,
          }).then((res) => {
            if (res.code == 200) {
              this.$message.success("个人信息修改成功");
              this.handleCancel();
            } else {
              this.$message.error(res.message);
            }
          });
        }
      });
    },
    handleCancel() {
      this.$refs.ruleForm.resetFields();
      this.visible = false;
      this.currentData = {
        userName: "",
        account: "",
        email: "",
        phoneNo: "",
      };
    },
    
  },
  created(){
    // 减去上下的margin值共48
    this.setViewHeight(this.minHeight - 48)
  },
  mounted() {
    this.userId = Cookies.get("USERID");
  },
};
</script>
<style>
#components-layout-demo-custom-trigger .trigger {
  font-size: 18px;
  line-height: 64px;
  padding: 0 24px;
  cursor: pointer;
  transition: color 0.3s;
}

#components-layout-demo-custom-trigger .trigger:hover {
  color: #1890ff;
}

#components-layout-demo-custom-trigger .logo {
  height: 52px;
  background: url("../../assets/img/BOSCH-logo.png");
  background-size: 80%;
  background-position: center;
  background-repeat: no-repeat;
  margin: 6px;
}
</style>
