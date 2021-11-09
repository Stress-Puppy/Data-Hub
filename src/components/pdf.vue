<template>
  <div>
  <q-file outlined v-model="file">
    <template v-slot:prepend>
      <q-icon name="cloud_upload" @click.stop />
    </template>
    <template v-slot:append>
      <q-icon name="close" @click.stop="model = null" class="cursor-pointer" />
    </template>

    <template v-slot:hint> 上传文件 </template>
  </q-file>
  <div v-for="order in orders" v-bind:key="order.no">
    <div>订单号码 :{{ order.orderNo }}</div>
    <div>订单日期 :{{ order.orderDate }}</div>
    <q-markup-table :separator="separator" flat bordered>
      <thead>
        <tr>
          <th class="text-left">物料号</th>
          <th class="text-right">数量</th>
          <th class="text-right">交货日期</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="it in order.items" v-bind:key="it.no">
          <td class="text-left">{{ it.productNo }}</td>
          <td class="text-right">{{ it.quantity }}</td>
          <td class="text-right">{{ it.shipDate }}</td>
        </tr>
      </tbody>
    </q-markup-table>
  </div>
</div>

</template>
<script>


 
import { getDocument,GlobalWorkerOptions }  from 'pdfjs-dist';
// let  pdfJS= require("pdfjs-dist") ;
      GlobalWorkerOptions.workerSrc  = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.8.335/build/pdf.worker.min.js'

export default {
  
    name: '',
   
    data: function(){

        return {
            file:null,
            orders:[]
        }
    },
  
    methods: {
    },
    watch:{
        file:function(newValue){
              if(newValue) {
        const fileReader = new FileReader();
        fileReader.onload = (e) => {
          const typedarray = new Uint8Array(e.target.result);
          const loadingTask = getDocument({data:typedarray});
          loadingTask.promise.then(async (pdf) => {

            // 获取 PDF 全部数据
            let contentItems = []
            for(let i = 1;i<= pdf.numPages;i++ ){
              const page = await pdf.getPage(i)
              const content = await page.getTextContent()
              //
              content.items.forEach((it)=> {
                it.str = it.str.replace(/[ ]/g, '')
                // 添加去重
                if(contentItems[contentItems.length - 1]) {
                  if(!it.str.includes(contentItems[contentItems.length - 1].str) && !it.str.includes('-'))contentItems.push(it)
                } else if(!it.str.includes('-')) {
                  contentItems.push(it)
                }
              })
            }
            // 获取订单信息
            const orderItemList = []
            console.log(contentItems)
            let orderItemStart = false
            let curOrder = null
            contentItems.forEach((it, index)=>{
              // 订单开始
              if(!curOrder &&it.str.includes('订单号码')){
                // 获取订单号码
                const orderNo = contentItems[index + 1].str
                curOrder = {orderNo}
              }

              if(curOrder && it.str.includes('订单日期')){
                curOrder.orderDate = contentItems[index + 1].str
              }

              // 订单结束
              if(orderItemStart && (it.str.includes('企业法人营业执照号码') ||  it.str.includes('合计不含税金额'))) orderItemStart = false

              if(orderItemStart){
                orderItemList.push(it)
              }
              if(curOrder && it.str.includes('小计')){
                orderItemStart = true
              }

            })
            const curOrderList = []
            curOrder.items = []
            if(orderItemList.length % 10 !== 0){

            }else {
              orderItemList.forEach((it,index)=>{
                if(index % 10 === 0){
                  console.log(it)
                  curOrder.items.push({
                    productNo:it.str,
                    quantity :orderItemList[index + 1].str,
                    shipDate: orderItemList[index + 7].str,
                  })
                }
              })
            }

            curOrderList.push(curOrder)
            orders.value = curOrderList
          });
        };
        //Step 3:Read the file as ArrayBuffer
        fileReader.readAsArrayBuffer(newValue);
      }
        }
    },
    mounted () {
     
    }
}
</script>