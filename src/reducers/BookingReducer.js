import * as Actions from '../actions/ActionTypes'
const BookingReducer = (state = { trip_sub_type:0, stops:[], package_id:0, active_vehicle_details:undefined, active_vehicle:0, km:0, promo:0, pickup_address:undefined, pickup_lat:undefined, pickup_lng:undefined, drop_address:undefined, drop_lat:undefined, drop_lng:undefined, initial_lat:undefined, initial_lng:undefined, initial_region:undefined, set_sub_id:0, current_sub_id:0, sub_expire_date:null, sub_rides:0 }, action) => {
    switch (action.type) {
        case Actions.PICKUP_ADDRESS:

            return Object.assign({}, state, {
               pickup_address: action.data
            });
        case Actions.PICKUP_LAT:
            return Object.assign({}, state, {
               pickup_lat: action.data
            });
        case Actions.PICKUP_LNG:
            return Object.assign({}, state, {
               pickup_lng: action.data
            });
        case Actions.DROP_ADDRESS:
            return Object.assign({}, state, {
               drop_address: action.data
            });
        case Actions.DROP_LAT:
            return Object.assign({}, state, {
               drop_lat: action.data
            });
        case Actions.DROP_LNG:
            return Object.assign({}, state, {
               drop_lng: action.data
            });
        case Actions.KM:
            return Object.assign({}, state, {
               km: action.data
            });
        case Actions.PROMO:
            return Object.assign({}, state, {
               promo: action.data
            });
        case Actions.ACTIVE_VEHICLE:
            return Object.assign({}, state, {
               active_vehicle: action.data
            });
        case Actions.PACKAGE_ID:
            return Object.assign({}, state, {
               package_id: action.data
            });
        case Actions.ACTIVE_VEHICLE_DETAILS:
            return Object.assign({}, state, {
               active_vehicle_details: action.data
            });
        case Actions.TRIP_SUB_TYPE:
            return Object.assign({}, state, {
               trip_sub_type: action.data
            });
        case Actions.STOPS:
            return Object.assign({}, state, {
               stops: action.data
            });

        case Actions.INITIAL_LAT:
            return Object.assign({}, state, {
               initial_lat: action.data
            });
        case Actions.INITIAL_LNG:
            return Object.assign({}, state, {
               initial_lng: action.data
            });
        case Actions.INITIAL_REGION:
            return Object.assign({}, state, {
               initial_region: action.data
            });
            
        case Actions.CURRENT_SUB_ID:
            return Object.assign({}, state, {
                current_sub_id: action.data
            });

        case Actions.SUB_RIDES:
            return Object.assign({}, state, {
                sub_rides: action.data
            });

        case Actions.SUB_EXPIRE_DATE:
            return Object.assign({}, state, {
                sub_expire_date: action.data
            });

        case Actions.RESET:
            return Object.assign({}, state, {
               km: 0,
               promo: 0,
               pickup_address: undefined,
               pickup_lat: undefined,
               pickup_lng: undefined,
               drop_address: undefined,
               drop_lat: undefined,
               drop_lng: undefined,
               stops:[]
            });
        default:
            return state;
    }
}

export default BookingReducer;