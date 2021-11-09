import { BZ_Post, BZ_Get } from '../utils/request'

// 获取客户列表（带分页）
export const getCustomerPageList = (param = {}) => BZ_Post(`/customerInfo/getPageListPage`, param)

// 修改用户基础信息
export const updataCustomer = (param = {}) => BZ_Post(`/customerInfo/update`, param)

// 创建用户基础信息
export const createCustomer = (param = {}) => BZ_Post(`/customerInfo/save`, param)

// 删除用户基础信息
export const deleteCustomer = (param = {}) => BZ_Post(`/customerInfo/delete`, param)

// 验证shipto是否重复
export const ruleShipTo = (param = {}) => BZ_Get(`/customerInfo/getCustomerByShipTo`, param)

// 验证customerPlant是否重复
export const ruleCustomerPlant = (param = {}) => BZ_Get(`/customerInfo/getCustomerByCustomerPlant`, param)
