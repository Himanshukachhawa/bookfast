import * as Actions from '../actions/ActionTypes'
const RegisterReducer = (state = { isLoding: false, error: undefined, first_name:undefined, last_name:undefined, email:undefined, password:undefined, country_code:undefined, phone_number:undefined, phone_with_code:undefined, data:undefined, message:undefined, status:undefined }, action) => {
    switch (action.type) {
        case Actions.REGISTER_PENDING:
            return Object.assign({}, state, {
               isLoding: true,
               data:undefined
            });
        case Actions.REGISTER_ERROR:
            return Object.assign({}, state, {
                isLoding: false,
                error: action.error
            });
        case Actions.REGISTER_SUCCESS:
          return Object.assign({}, state, {
            isLoding: false,
            status: action.data.status,
            message: action.data.message,
            data: action.data.result
          });
        case Actions.CREATE_COUNTRY_CODE:
          return Object.assign({}, state, {
            country_code:action.data
          });
        case Actions.CREATE_PHONE_NUMBER:
          return Object.assign({}, state, {
            phone_number:action.data
          });
        case Actions.CREATE_PHONE_WITH_CODE:
          return Object.assign({}, state, {
            phone_with_code:action.data
          });
        case Actions.CREATE_FIRST_NAME:
          return Object.assign({}, state, {
            first_name:action.data
          });
        case Actions.CREATE_LAST_NAME:
          return Object.assign({}, state, {
            last_name:action.data
          });
        case Actions.CREATE_EMAIL_ADDRESS:
          return Object.assign({}, state, {
            email:action.data
          });
        case Actions.CREATE_LOGIN_PASSWORD:
          return Object.assign({}, state, {
            password:action.data
          });
        default:
            return state;
    }
}

export default RegisterReducer;