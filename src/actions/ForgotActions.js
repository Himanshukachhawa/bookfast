import * as ActionTypes from './ActionTypes';

export const createForgotPhoneWithCode = (data) => ({
    type: ActionTypes.CREATE_FORGOT_PHONE_WITH_CODE,
    data: data
})
