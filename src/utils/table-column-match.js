// 特殊列specialCols变量名需要固定
export const manageUser = {
  specialCols: [
    {
      prop: 'selection',
      label: '',
      width: '',
      align: 'center'
    }
  ],
  userAccount: {
    label: '账号'
  },
  name: {
    label: '姓名'
  },
  phone: {
    label: '手机号'
  },
  userType: {
    label: '用户类型',
    slot: true
  },
  organizations: {
    label: '所属机构',
    slot: true
  },
  email: {
    label: '邮箱'
  },
  status: {
    label: '状态',
    slot: true
  }
}
// 任务查看
export const taskCol = {
  // specialCols: [
  //   {
  //   }
  // ],
  account: {
    label: '任务编码'
  },
  name: {
    label: '文件名'
  },
  status: {
    label: '任务状态'
  },
  total: {
    label: '总条数'
  },
  sucessAccount: {
    label: '成功条数'
  },
  failAccount: {
    label: '失败条数'
  },
  userName: {
    label: '操作人'
  },
  start: {
    label: '开始日期'
  },
  end: {
    label: '结束日期'
  }
}
// 组织机构
export const orgCol = {
  specialCols: [
    {
      prop: 'selection',
      label: '',
      width: '',
      align: 'center'
    }
  ],
  userAccount: {
    label: '账号'
  },
  name: {
    label: '姓名'
  },
  phone: {
    label: '手机号'
  },
  email: {
    label: '邮箱'
  },
  status: {
    label: '状态',
    slot: true
  }
}
// 角色管理
export const roleCol = {
  roleName: {
    label: '角色名称',
    width: '100',
    align: 'center'
  },
  organizationList: {
    label: '所属机构',
    slot: true
  },
  platformList: {
    label: '所属平台',
    slot: true
  },
  roleDescription: {
    label: '角色描述',
    slot: true
  },
  createdTime: {
    label: '创建时间'
  }
}
// 岗位管理
export const postCol = {
  positionCode: {
    label: '岗位编码',
    width: '100',
    align: 'center'
  },
  positionName: {
    label: '岗位名称'
  },
  orgName: {
    label: '所属公司'
  },
  remarks: {
    label: '岗位备注',
    slot: true
  },
  createdTime: {
    label: '创建时间'
  }
}

