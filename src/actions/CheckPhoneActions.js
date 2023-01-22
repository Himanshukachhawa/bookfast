import * as ActionTypes from './ActionTypes';

export const checkPhonePending = () => ({
    type: ActionTypes.CHECK_PHONE_PENDING
})

export const checkPhoneError = (error) => ({
    type: ActionTypes.CHECK_PHONE_ERROR,
    error: error
})

export const checkPhoneSuccess = (data) => ({
    type: ActionTypes.CHECK_PHONE_SUCCESS,
    data: data
})
