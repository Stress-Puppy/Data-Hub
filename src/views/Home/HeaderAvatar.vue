<template>
  <a-dropdown>
    <div class="header-avatar" style="cursor: pointer">
      <!-- <a-avatar class="avatar" size="small" shape="circle" :src="user.avatar"/> -->
      <span class="name">{{ realName }}</span>
    </div>
    <a-menu :class="['avatar-menu']" slot="overlay">
      <a-menu-item @click="editSelf">
        <a-icon type="user" />
        <span>修改信息</span>
      </a-menu-item>
      <a-menu-item @click="changePassword">
        <a-icon type="setting" />
        <span>修改密码</span>
      </a-menu-item>
      <a-menu-divider />
      <a-menu-item @click="logout">
        <a-icon style="margin-right: 8px" type="poweroff" />
        <span>退出登录</span>
      </a-menu-item>
    </a-menu>
  </a-dropdown>
</template>

<script>
import { mapGetters } from "vuex";
import { UserLogout } from "@/api/Login";

export default {
  name: "HeaderAvatar",
  computed: {
    ...mapGetters(["getuserName"]),
    realName() {
      return this.getuserName;
    },
  },
  methods: {
    editSelf(){
      this.$emit("editSelf")
    },
    logout() {
      UserLogout();
      this.$router.push("/login");
    },
    changePassword(){
      this.$router.push("/ChangPassword");
    }
  },
};
</script>

<style lang="less">
.header-avatar {
  display: inline-flex;
  padding: 0 24px;
  .avatar,
  .name {
    align-self: center;
  }
  .avatar {
    margin-right: 8px;
  }
  .name {
    font-weight: 500;
  }
}
.avatar-menu {
  width: 150px;
}
</style>
