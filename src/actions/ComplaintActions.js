import * as ActionTypes from './ActionTypes';

export const serviceActionPending = () => ({
    type: ActionTypes.COMPLAINT_LIST_PENDING
})

export const serviceActionError = (error) => ({
    type: ActionTypes.COMPLAINT_LIST_ERROR,
    error: error
})

export const serviceActionSuccess = (data) => ({
    type: ActionTypes.COMPLAINT_LIST_SUCCESS,
    data: data
})
