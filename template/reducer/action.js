// constants 与 actions 在一起
import {Ajax,NameSpace} from '../util/index';

let ns = NameSpace('<%=classname.toUpperCase()%>');
export const GET_DATA = ns('ADD_DATA');
export const UPDATE_DATA = ns('UPDATE_INFO');

export function getAsyncData(data){
	return (dispatch) => {
		Ajax({api: 'index',data: data || {}},function(json){
			dispatch({
                type : GET_DATA,
                data : json
            })
		})
	}
}


