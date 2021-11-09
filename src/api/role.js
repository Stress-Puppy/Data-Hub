import { BZ_Post,BZ_Get } from '../utils/request'

// 查询角色列表
export const getRoleList = (param = {}) => BZ_Post(`/sys/role/getPageList`, param)

// 查询单个角色菜单详情
export const getRoleDetail = (param = {}) => BZ_Get(`/sys/menu/getMenusByRoleId`, param)

// 查询菜单列表
export const getMenuList = (param = {}) => BZ_Post(`/sys/menu/getMenuList`, param)

// 删除角色
export const removeRole = (param = {}) => BZ_Post(`/sys/role/delete`, param)

// 修改角色
export const updataRole = (param = {}) => BZ_Post(`/sys/role/updateSysRole`, param)

// 新增角色
export const createRole = (param = {}) => BZ_Post(`/sys/role/saveSysRole`, param)
