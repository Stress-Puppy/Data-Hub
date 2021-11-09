<template>
  <div class="login-flex">
    <div class="form-user">
      <a-form-model ref="ruleForm" :model="form" :rules="rules">
        <a-form-model-item>
          <h1 class="t-center">密码修改</h1>
        </a-form-model-item>
        <a-form-model-item prop="oldPassword">
          <a-input
            type="password"
            placeholder="请输入旧密码"
            v-model="form.oldPassword"
          >
          </a-input>
        </a-form-model-item>
        <a-form-model-item prop="newPassword">
          <a-input-password
            placeholder="请输入新密码"
            v-model="form.newPassword"
          >
          </a-input-password>
        </a-form-model-item>
        <a-form-model-item prop="againPassword">
          <a-input
            type="password"
            placeholder="请确认新密码"
            v-model="form.againPassword"
          >
          </a-input>
        </a-form-model-item>
        <a-form-model-item>
          <a-button
            block
            type="primary"
            :loading="loading"
            @click="handleSubmit"
          >
            确认
          </a-button>
        </a-form-model-item>
      </a-form-model>
    </div>
  </div>
</template>

<script>
import { changePassword } from "@/api/Login";
import { mapGetters } from "vuex";
export default {
  name: "ChangPassword",
  data() {
    let checkPending;
    let checkAgain = (rule, value, callback) => {
      clearTimeout(checkPending);
      if (!value) {
        return callback(new Error("请再次输入密码"));
      }
      checkPending = setTimeout(() => {
        if (value != this.form.newPassword) {
          callback(new Error("密码不一致"));
        } else {
          callback();
        }
      }, 1000);
    };
    return {
      loading: false,
      form: {
        oldPassword: "",
        newPassword: "",
        againPassword: "",
      },
      rules: {
        oldPassword: [
          {
            required: true,
            message: "请输入旧密码",
            trigger: "blur",
          },
        ],
        newPassword: [
          {
            required: true,
            message: "请输入新密码",
            trigger: "blur",
          },
        ],
        againPassword: [
          // {
          //   required: true,
          //   message: "请再次输入密码",
          //   trigger: "change",
          // },
          { validator: checkAgain, trigger: "change" },
        ],
      },
    };
  },
  computed: {
    ...mapGetters(["getuserName"]),
  },
  methods: {
    handleSubmit() {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          changePassword({
            account: this.getuserName,
            oldPassword: this.form.oldPassword,
            newPassword: this.form.newPassword,
          }).then((res) => {
            if (res.code == 200) {
              this.$message.success("修改成功，请重新登录")
              this.$router.push("/login");
            }else{
              this.$message.error(res.message)
            }
          });
        }
      });
    },
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
