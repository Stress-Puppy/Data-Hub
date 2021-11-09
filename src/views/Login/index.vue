<template>
  <div class="login-flex">
    <div class="form-user">
      <a-form-model ref="form" :model="form" :rules="rules">
        <a-form-model-item>
          <h1 class="t-center">订单自动识别系统</h1>
        </a-form-model-item>
        <a-form-model-item prop="username">
          <a-input
            ref="username"
            placeholder="请输入用户名"
            v-model="form.username"
          >
            <a-icon
              slot="prefix"
              type="user"
              style="color: rgba(0, 0, 0, 0.25)"
            />
          </a-input>
        </a-form-model-item>
        <a-form-model-item prop="password" style="margin: 0">
          <a-input-password
            placeholder="请输入密码"
            ref="password"
            v-model="form.password"
            @keydown.enter="handleSubmit"
          >
            <a-icon
              slot="prefix"
              type="lock"
              style="color: rgba(0, 0, 0, 0.25)"
            />
          </a-input-password>
          <a-checkbox
            :checked="remember"
            @change="
              (e) => {
                remember = e.target.checked;
              }
            "
          >
            记住密码
          </a-checkbox>
        </a-form-model-item>
        <a-form-model-item>
          <a-button
            block
            type="primary"
            :loading="loading"
            @click="handleSubmit"
          >
            登录
          </a-button>
        </a-form-model-item>
      </a-form-model>
    </div>
  </div>
</template>

<script>
import asyncRouter from "@/router/asyncRouter";
import { setCookies, getCookies } from "@/utils/cookie";
import { UserLogin } from "@/api/Login";
export default {
  name: "Login",
  data() {
    return {
      loading: false,
      remember: true,
      form: {
        username: "",
        password: "",
      },
      rules: {
        username: [
          {
            required: true,
            message: "请输入用户名",
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
      },
    };
  },
  methods: {
    handleSubmit(e) {
      e.preventDefault();
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.remember) {
            setCookies("UPM", {
              value: {
                username: this.form.username,
                password: this.form.password,
              },
              time: 90,
            });
          } else {
            setCookies("UPM", {
              value: {
                username: "",
                password: "",
              },
            });
          }
          this.userLogin({
            username: this.form.username,
            password: this.form.password,
          });
        }
      });
    },

    async userLogin(params) {
      this.loading = true;
      const res = await UserLogin(params);
      if (res.code == "200") {
        // 设置用户存储
        setCookies("userInfo", {
          value: {
            token: res.data.token,
            username: res.data.username,
          },
        });
        setCookies("USERID", {
          value: res.data.userId,
        });
        this.$store.commit("setuserName", res.data.username);

        let newDynamicRouter = asyncRouter;
        let meunList = res.data.authorityInfo;
        let btnList = [];
        for (let i in res.data.btnPermissionList) {
          btnList.push({
            title: res.data.btnPermissionList[i].title,
            path: res.data.btnPermissionList[i].path,
            name: res.data.btnPermissionList[i].name,
          });
        }
        newDynamicRouter["path"] = meunList[0].children[0].path;
        newDynamicRouter["name"] = meunList[0].children[0].name;
        this.$store.commit("saveMenuList", {
          menuList: meunList,
          asyncRouter: [newDynamicRouter],
          btnList: btnList,
        });
        this.$message.success("登录成功！");
      } else {
        this.$message.error("登录失败！");
      }
      this.loading = false;
    },
  },
  mounted() {
    const cookieLoignData = getCookies("UPM");
    if (cookieLoignData) {
      this.form.username = cookieLoignData.username;
      this.form.password = cookieLoignData.password;
      this.$refs.password.focus();
    } else {
      this.$refs.username.focus();
    }
  },
};
</script>

<style lang="less" scoped>
.login-flex {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: url("../../assets/img/login-bg.svg") no-repeat;

  .form-user {
    width: 300px;
    height: 400px;

    .t-center {
      text-align: center;
    }
  }
}
</style>
