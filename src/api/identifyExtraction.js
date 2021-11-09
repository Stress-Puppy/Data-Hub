import { BZ_Post, BZ_Get } from '../utils/request'

// 识别前验证文件名是否重复
export const checkFileName = (param = {}) => BZ_Get(`/identifyInfo/getIdentifyInfoByFileName`, param)

// 批量校验物料号
export const checkMaterialList = (param = {}) => BZ_Post(`/common/verifyMaterialsNo`, param)

// 获取上传的数据的列表
export const getIdentifyList = (param = {}) => BZ_Post(`/identifyInfo/list`, param)

// 上传数据
export const saveIdentify = (param = {}) => BZ_Post(`/identifyInfo/save`, param)

// 获取客户列表（不带分页）
export const getCustomerList = (param = {}) => BZ_Post(`/customerInfo/getList`, param)

// 下载原始文件
export const downloadOriginFile = (param = {}) => BZ_Post(`/identifyInfo/downloadSourceFile`, param, "blob")

// 下载Delins Format文件
export const downloadDelinsFile = (param = {}) => BZ_Post(`/identifyInfo/downloadDelins`, param, "blob")

// 下载For AWT LL Format文件
export const downloadAWTFile = (param = {}) => BZ_Post(`/identifyInfo/downloadForAWTLL`, param, "blob")

// 下载LOP2对账 Format文件
export const downloadLOPFile = (param = {}) => BZ_Post(`/identifyInfo/downloadLop2`, param, "blob")
