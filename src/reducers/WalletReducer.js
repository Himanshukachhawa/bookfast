import * as Actions from '../actions/ActionTypes';

const WalletReducer = (state = { isLoding: false, error: undefined, data:undefined, message:undefined, status:undefined }, action) => {
    switch (action.type) {
        case Actions.ADD_WALLET_PENDING:
            return Object.assign({}, state, {
               isLoding: true,
               data:undefined
            });
        case Actions.ADD_WALLET_ERROR:
            return Object.assign({}, state, {
                isLoding: false,
                error: action.error
            });
        case Actions.ADD_WALLET_SUCCESS:
          return Object.assign({}, state, {
            isLoding: false,
            status: action.data.status,
            message: action.data.message,
          });
           case Actions.WALLET_PENDING:
            return Object.assign({}, state, {
               isLoding: true,
               data:undefined
            });
        case Actions.WALLET_ERROR:
            return Object.assign({}, state, {
                isLoding: false,
                error: action.error
            });
        case Actions.WALLET_SUCCESS:
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

export default WalletReducer;