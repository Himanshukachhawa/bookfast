import * as ActionTypes from './ActionTypes';

export const registerPending = () => ({
    type: ActionTypes.REGISTER_PENDING
})

export const registerError = (error) => ({
    type: ActionTypes.REGISTER_ERROR,
    error: error
})

export const registerSuccess = (data) => ({
    type: ActionTypes.REGISTER_SUCCESS,
    data: data
})

export const createCountryCode = (data) => ({
    type: ActionTypes.CREATE_COUNTRY_CODE,
    data: data
})

export const createPhoneNumber = (data) => ({
    type: ActionTypes.CREATE_PHONE_NUMBER,
    data: data
})
 
export const createPhoneWithCode = (data) => ({
    type: ActionTypes.CREATE_PHONE_WITH_CODE,
    data: data
})

export const createFirstName = (data) => ({
    type: ActionTypes.CREATE_FIRST_NAME,
    data: data
})

export const createLastName = (data) => ({
    type: ActionTypes.CREATE_LAST_NAME,
    data: data
})

export const createEmailAddress = (data) => ({
    type: ActionTypes.CREATE_EMAIL_ADDRESS,
    data: data
})

export const createLoginPassword = (data) => ({
    type: ActionTypes.CREATE_LOGIN_PASSWORD,
    data: data
})
