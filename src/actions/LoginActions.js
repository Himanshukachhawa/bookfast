import * as ActionTypes from './ActionTypes';

export const loginPending = () => ({
    type: ActionTypes.LOGIN_PENDING
})

export const loginError = (error) => ({
    type: ActionTypes.LOGIN_ERROR,
    error: error
})

export const loginSuccess = (data) => ({
    type: ActionTypes.LOGIN_SUCCESS,
    data: data
})
