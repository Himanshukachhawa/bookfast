import * as ActionTypes from './ActionTypes';

export const serviceActionPending = () => ({
    type: ActionTypes.RIDE_LIST_PENDING
})

export const serviceActionError = (error) => ({
    type: ActionTypes.RIDE_LIST_ERROR,
    error: error
})

export const serviceActionSuccess = (data) => ({
    type: ActionTypes.RIDE_LIST_SUCCESS,
    data: data
})
