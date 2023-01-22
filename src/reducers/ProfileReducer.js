import * as Actions from '../actions/ActionTypes';
import { img_url } from '../config/Constants';

const ProfileReducer = (state = { isLoding: false, error: undefined, data:undefined, profile_picture:undefined, message:undefined, status:undefined }, action) => {
    switch (action.type) {
        case Actions.PROFILE_PENDING:
            return Object.assign({}, state, {
               isLoding: true,
               data:undefined
            });
        case Actions.PROFILE_ERROR:
            return Object.assign({}, state, {
                isLoding: false,
                error: action.error
            });
        case Actions.PROFILE_SUCCESS:
        let data = action.data.result;
           let profile_picture = { uri: img_url + 'images/avatar.png' }
           if(data.profile_picture){
                profile_picture = { uri: img_url + data.profile_picture }
           }
          return Object.assign({}, state, {
            isLoding: false,
            status: action.data.status,
            message: action.data.message,
            data: data,
            profile_picture:profile_picture
          });
          case Actions.UPDATE_PROFILE_PICTURE:
           return Object.assign({}, state, {
             profile_picture : action.data
           });
        default:
            return state;
    }
}

export default ProfileReducer;