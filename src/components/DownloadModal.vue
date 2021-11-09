<template>
  <a-modal
    title="选择下载类别"
    :visible="downloadVisible"
    :confirmLoading="confirmLoading"
    @cancel="colseModal"
    @ok="submit"
  >
    <div>
      <a-checkbox
        :indeterminate="indeterminate"
        :checked="checkAll"
        @change="onCheckAllChange"
      >
        全部
      </a-checkbox>
    </div>

    <a-divider />

    <a-checkbox-group
      v-model="checkedList"
      :options="plainOptions"
      @change="checkChange"
    />
  </a-modal>
</template>
<script>
export default {
  name: "DownloadEditeModal",
  props: {
    downloadVisible: Boolean,
    confirmLoading: Boolean,
  },
  data() {
    return {
      // confirmLoading: false,
      checkedList: [],
      indeterminate: false,
      checkAll: false,
      plainOptions: ["Delins Format", "For AWT LL Format", "LOP2对账 Format"],
    };
  },
  methods: {
    onCheckAllChange(e) {
      Object.assign(this, {
        checkedList: e.target.checked ? this.plainOptions : [],
        indeterminate: false,
        checkAll: e.target.checked,
      });
    },
    checkChange(checkedList) {
      this.indeterminate =
        !!checkedList.length && checkedList.length < this.plainOptions.length;
      this.checkAll = checkedList.length === this.plainOptions.length;
    },
    colseModal() {
      this.checkedList = [];
      this.indeterminate = false;
      this.checkAll = false;
      this.$emit("closeVisible", "downloadVisible");
    },
    submit() {
      if (!this.checkedList.length) {
        return this.$message.warning("未选择类别");
      }
      this.$emit("downloadInit",this.checkedList);
    },
  },
};
</script>