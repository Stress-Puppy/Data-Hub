<template>
  <div>
    <div class="wrapper" id="pdf-container"></div>
  </div>
</template>
<script>
export default {
  name: "",
  data() {
    return {
      pageRenderNum: 1,
      totalPageNum: 1,
    };
  },
  methods: {
    loadPdf(fileURL) {
      PDFJS.workerSrc = "js/pdf.worker.js";
      PDFJS.getDocument(fileURL).then(function (pdf) {
        //用 promise 获取页面
        var id = "";
        var idTemplate = "cw-pdf-";
        var pageNum = pdf.numPages;
        //根据页码创建画布
        createSeriesCanvas(pageNum, idTemplate);
        totalPageNum = pageNum;
        // 渲染pdf
        renderPDF(pdf, pageRenderNum, "cw-pdf-" + pageRenderNum);
      });
    },
    /**
     * 创建和pdf页码等数的canvas
     */
       createSeriesCanvas(num, template) {
      var id = '';
      for (var j = 1; j <= num; j++) {
          id = template + j;
	        $("#pdf-container").append('<canvas id="' + id + '" class="pdfClass"></canvas>');
      }
    },
         renderPDF(pdf, i, id) {
      pdf.getPage(i).then(function (page) {
          // 识别pdf中文本
          page.getTextContent().then(async function(textContent) {
            var str = ""
            for(let j = 0; j < textContent.items.length; j++) {
              str += textContent.items[j].str
            }
            // console.log("page.. str = " + str)

             let contentItems = []
         
            for(let i = 1;i<= pdf.numPages;i++ ){
              const page = await pdf.getPage(i)
              const content = await page.getTextContent()
              content.items.forEach((it,index)=> {
              
                it.str = it.str.replace(/[ ]/g, '')
                if(!it.str==""){
                  contentItems.push( it)
                }
                // // 添加去重
                // if(contentItems[contentItems.length - 1]) {
                //   if(!it.str.includes(contentItems[contentItems.length - 1].str) && !it.str.includes('-'))contentItems.push(it)
                // } else if(!it.str.includes('-')) {
                //   contentItems.push(it)
                // }
               
              })
            }
            console.log(contentItems);
           
            //      // 获取订单信息
                 const orderItemList = []
            let orderItemStart = false
            let curOrder = null
            contentItems.forEach((it, index)=>{
              // 订单开始
              if(!curOrder &&it.str.includes('P')&&contentItems[index + 1].str=='O'&&contentItems[index + 2].str=='N'){
                alert(1)
                // 获取订单号码
                const orderNo1 = contentItems[index + 8].str
                const orderNo2 = contentItems[index + 9].str
                const orderNo3 = contentItems[index + 10].str
                const orderNo4 = contentItems[index + 11].str
                const orderNo5 = contentItems[index + 12].str
                const orderNo6 = contentItems[index + 13].str
                const orderNo7 = contentItems[index + 14].str
              let orderNo= contentItems.slice(index+8,index+20)
                console.log(orderNo);
                // console.log(orderNo1,orderNo2,orderNo3,orderNo4,orderNo5,orderNo6);

                // curOrder = {orderNo}
               
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

          var scale = 96.0 / 72.0;
          var viewport = page.getViewport(scale);
          //  准备用于渲染的 canvas 元素
          var canvas = document.getElementById(id);
          var context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          // 将 PDF 页面渲染到 canvas 上下文中
          var renderContext = {
              canvasContext: context,
              viewport: viewport
          };
          var renderTask = page.render(renderContext);

          renderTask.promise.then(function() {
              if (pageRenderNum < totalPageNum) {
                pageRenderNum++;
                renderPDF(pdf, pageRenderNum, 'cw-pdf-' + pageRenderNum);
              }
          });
      });
    }

    

  },
};
</script>
<style type="text/css">
body {
  background-color: #ccc;
}
.pdfClass {
  margin-bottom: 10px;
}
#pdf-container {
  width: 820px;
  max-height: 600px;
  overflow: auto;
  margin: 0 auto;
}
</style>