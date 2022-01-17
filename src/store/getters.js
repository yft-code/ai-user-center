const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  res: state => state.user.res,
  userInfo: state => state.user.userInfo
}
export default getters
