import * as ActionTypes from './ActionTypes';

export const pickupAddress = (data) => ({
    type: ActionTypes.PICKUP_ADDRESS,
    data: data
})

export const pickupLat = (data) => ({
    type: ActionTypes.PICKUP_LAT,
    data: data
})

export const pickupLng = (data) => ({
    type: ActionTypes.PICKUP_LNG,
    data: data
})

export const dropAddress = (data) => ({
    type: ActionTypes.DROP_ADDRESS,
    data: data
})

export const dropLat = (data) => ({
    type: ActionTypes.DROP_LAT,
    data: data
})

export const dropLng = (data) => ({
    type: ActionTypes.DROP_LNG,
    data: data
})

export const km = (data) => ({
    type: ActionTypes.KM,
    data: data
})

export const trip_sub_type = (data) => ({
    type: ActionTypes.TRIP_SUB_TYPE,
    data: data
})

export const update_promo = (data) => ({
    type: ActionTypes.PROMO,
    data: data
})

export const change_active_vehicle = (data) => ({
    type: ActionTypes.ACTIVE_VEHICLE,
    data: data
})

export const change_active_vehicle_details = (data) => ({
    type: ActionTypes.ACTIVE_VEHICLE_DETAILS,
    data: data
})

export const package_id = (data) => ({
    type: ActionTypes.PACKAGE_ID,
    data: data
})

export const setStops = (data) => ({
    type: ActionTypes.STOPS,
    data: data
})

export const initialLat = (data) => ({
    type: ActionTypes.INITIAL_LAT,
    data: data
})

export const initialLng = (data) => ({
    type: ActionTypes.INITIAL_LNG,
    data: data
})

export const initialRegion = (data) => ({
    type: ActionTypes.INITIAL_REGION,
    data: data
})

export const currentSubId = (data) => ({
    type: ActionTypes.CURRENT_SUB_ID,
    data: data
})

export const subRides = (data) => ({
    type: ActionTypes.SUB_RIDES,
    data: data
})

export const subExpireDate = (data) => ({
    type: ActionTypes.SUB_EXPIRE_DATE,
    data: data
})

export const reset = () => ({
    type: ActionTypes.RESET,
})

