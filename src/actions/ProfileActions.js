import * as ActionTypes from './ActionTypes';

export const profilePending = () => ({
    type: ActionTypes.PROFILE_PENDING
})

export const profileError = (error) => ({
    type: ActionTypes.PROFILE_ERROR,
    error: error
})

export const profileSuccess = (data) => ({
    type: ActionTypes.PROFILE_SUCCESS,
    data: data
})

export const updateProfilePicture = (data) => ({
    type: ActionTypes.UPDATE_PROFILE_PICTURE,
    data: data
})
