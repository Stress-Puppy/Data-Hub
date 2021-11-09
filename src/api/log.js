import { BZ_Post } from '../utils/request'

// 获取日志分页列表
export const getlogList = (param = {}) => BZ_Post(`/sys/log/getPageList`, param)

// 获取用户列表（不分页）
export const getUserPageList = (param = {}) => BZ_Post(`/sys/sysUser/getList`, param)
