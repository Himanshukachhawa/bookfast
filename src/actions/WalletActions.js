import * as ActionTypes from './ActionTypes';

export const addWalletPending = () => ({
    type: ActionTypes.ADD_WALLET_PENDING
})

export const addWalletError = (error) => ({
    type: ActionTypes.ADD_WALLET_ERROR,
    error: error
})

export const addWalletSuccess = (data) => ({
    type: ActionTypes.ADD_WALLET_SUCCESS,
    data: data
})

export const walletPending = () => ({
    type: ActionTypes.WALLET_PENDING
})

export const walletError = (error) => ({
    type: ActionTypes.WALLET_ERROR,
    error: error
})

export const walletSuccess = (data) => ({
    type: ActionTypes.WALLET_SUCCESS,
    data: data
})

