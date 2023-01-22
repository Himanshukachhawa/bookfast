import * as ActionTypes from './ActionTypes';

export const serviceActionPending = () => ({
    type: ActionTypes.NOTIFICATION_LIST_PENDING
})

export const serviceActionError = (error) => ({
    type: ActionTypes.NOTIFICATION_LIST_ERROR,
    error: error
})

export const serviceActionSuccess = (data) => ({
    type: ActionTypes.NOTIFICATION_LIST_SUCCESS,
    data: data
})
