const fullValidEvent =  async function ($table, formatErrorMap) {
    const errMap = await $table.fullValidate(true).catch(errMap => errMap)
    if (errMap) {
      Object.values(errMap).forEach(errList => {
        errList.forEach(params => {
          const { rowIndex, columnIndex} = params
          let rowI = formatErrorMap.get(rowIndex) || []
          formatErrorMap.set(rowIndex, [...rowI,columnIndex])
        })
      })

      $table.clearValidate()
      return false
    } else {
      $table.clearValidate()
      return true
    }
    
}
export {fullValidEvent}

