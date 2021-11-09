<template>
    <a-modal v-model="visiable" title="修改结果记录" width="700px" on-ok="handleOk">
        <template slot="footer">
            <a-button key="back" @click="handleCancel">取消</a-button>
            <a-button key="submit" type="primary" @click="SaveTable">保存</a-button>
        </template>
    </a-modal>
</template>
<script>
export default {
    name: 'AddBaseTableConfigModal'
}
</script>