import * as Actions from '../actions/ActionTypes'
const PrivacyReducer = (state = { isLoding: false, error: undefined, data:[], message:undefined, status:undefined }, action) => {
    switch (action.type) {
        case Actions.PRIVACY_SERVICE_PENDING:
            return Object.assign({}, state, {
               isLoding: true,
               data:[]
            });
        case Actions.PRIVACY_SERVICE_ERROR:
            return Object.assign({}, state, {
                isLoding: false,
                error: action.error
            });
        case Actions.PRIVACY_SERVICE_SUCCESS:
          return Object.assign({}, state, {
            isLoding: false,
            status: action.data.status,
            message: action.data.message,
            data: action.data.result,
          });
        default:
            return state;
    }
}

export default PrivacyReducer;
