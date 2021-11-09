import { BZ_Post,BZ_Get } from '../utils/request'

// 查询用户列表
export const getUserList = (param = {}) => BZ_Post(`/sys/sysUser/getPageList`, param)

// 查询单个用户详情
export const getUserDetail = (param = {}) => BZ_Get(`/sys/role/getRolesByUserId`, param)

// 查询角色列表
export const getRoleList = (param = {}) => BZ_Post(`/sys/role/getList`, param)

// 删除用户
export const removeUser = (param = {}) => BZ_Post(`/sys/sysUser/delete`, param)

// 修改用户
export const updataUser = (param = {}) => BZ_Post(`/sys/sysUser/updateSysUser`, param)

// 新增用户
export const createUser = (param = {}) => BZ_Post(`/sys/sysUser/saveSysUser`, param)

// 初始化密码
export const initPassword = (param = {}) => BZ_Post(`/sys/sysUser/initPassword`, param)
