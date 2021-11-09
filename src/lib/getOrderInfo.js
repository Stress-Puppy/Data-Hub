import config from './config'
import Rules from './rules'

export class Adapter{
    constructor(GetPDFInfoInstance){
        this.config = config
        this.GetPDFInfoInstance = GetPDFInfoInstance
    }
    run(){
        let finalData = Object.create(null)
        for(let key in this.config) {
            const value = this.config[key]
            let info, indexs, all;
            switch(value.rule.type){
                case Rules.EQUAlANDOFFSET:
                    info =  this.GetPDFInfoInstance.getInfoByRuleEq(value.rule)
                    finalData[key] = info
                    break;
                case Rules.CONTACTANDOFFSET:
                    indexs = this.GetPDFInfoInstance.getBaseIndexs(value.rule.text)
                    all = indexs.map((key) => {
                        const finalArr = value.list.map((item) => {
                            const index = Number(key)+Number(item.offset)
                            return this.GetPDFInfoInstance.getInfoByIndexOffset(index, item.handler)
                        })
                        return finalArr
                    })
                    finalData[key] = all
                    break;
            }
        }
        console.log('finalData', finalData)
    }
}



export class GetPDFInfo {
    constructor(pageContentArray){
        this.pageContentArray = pageContentArray
    }

    getIndexByText(t){
        return this.pageContentArray.indexOf(t)
    }

    getInfoByIndexOffset(index, handler){
        const info = this.pageContentArray[index]
        return handler ? handler(info) : info
    }

    getInfoByRuleEq(rule){
        const index = this.getIndexByText(rule.text)
        const info = this.pageContentArray[index+rule.offset]
        return rule.handler ? rule.handler(info) : info
    }

    getBaseIndexs(str) {
        const indexs = []
        for (let key in this.pageContentArray) {
            if (this.pageContentArray[key].includes(str)) {
                indexs.push(key)
            }
        }
        return indexs
    }
}
