import * as Actions from '../actions/ActionTypes'
const ForgotReducer = (state = { isLoding: false, error: undefined, data:undefined, message:undefined, status:undefined }, action) => {
    switch (action.type) {
        case Actions.CREATE_PHONE_WITH_CODE:
          return Object.assign({}, state, {
            phone_with_code:action.data
          });
        default:
            return state;
    }
}

export default ForgotReducer;