import { BZ_Post, BZ_Get } from '../utils/request'

export const UserLogin = (param = {}) => BZ_Post(`/sys/login?username=${param.username}&password=${param.password}`)

export const UserLogout = (param = {}) => BZ_Post(`/logout`)

export const uploadPlanList = (param = {}) => BZ_Post(`/logout?username=${param.username}`)

export const getUserDetail = (param = {}) => BZ_Get(`/sys/sysUser/details`,param)

export const updataUserDetail = (param = {}) => BZ_Post(`/sys/sysUser/updatePersonalInformation`, param)

// 个人修改密码
export const changePassword = (param = {}) => BZ_Post(`/sys/sysUser/changeUserPassword`, param)
