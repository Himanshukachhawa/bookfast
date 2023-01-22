import * as Actions from '../actions/ActionTypes'
const ComplaintReducer = (state = { isLoding: false, error: undefined, data:[], message:undefined, status:undefined }, action) => {
    switch (action.type) {
        case Actions.COMPLAINT_LIST_PENDING:
            return Object.assign({}, state, {
               isLoding: true,
               data: [],
            });
        case Actions.COMPLAINT_LIST_ERROR:
            return Object.assign({}, state, {
                isLoding: false,
                error: action.error
            });
        case Actions.COMPLAINT_LIST_SUCCESS:
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

export default ComplaintReducer;
