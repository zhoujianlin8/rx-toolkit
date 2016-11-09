import {GET_DATA, UPDATE_DATA} from '../../actions/<%=router%>';

//对页面prop 数据进行管理
const initialState = {
  isLoading: true,
  data: {}
}
export default function index(state = initialState, action) {
  switch (action.type) {
    case GET_DATA:
      return Object.assign({},state,{
         isLoading: false,
         data: action.data
      })
    case UPDATE_DATA:
      return Object.assign({},state,{
        data:action.data
      })

    default:
      return state
  }
}
