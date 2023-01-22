import { combineReducers } from 'redux';

import FaqReducer from './FaqReducer.js';
import PrivacyReducer from './PrivacyReducer.js';
import CheckPhoneReducer from './CheckPhoneReducer.js';
import LoginReducer from './LoginReducer.js';
import RegisterReducer from './RegisterReducer.js';
import ForgotReducer from './ForgotReducer.js';
import ProfileReducer from './ProfileReducer.js';
import WalletReducer from './WalletReducer.js';
import ComplaintReducer from './ComplaintReducer.js';
import NotificationReducer from './NotificationReducer.js';
import RideReducer from './RideReducer.js';
import BookingReducer from './BookingReducer.js';
import SplashReducer from './SplashReducer.js';

const allReducers = combineReducers({
  faq:FaqReducer,
  privacy:PrivacyReducer,
  check_phone:CheckPhoneReducer,
  register:RegisterReducer,
  login:LoginReducer,
  forgot:ForgotReducer,
  profile:ProfileReducer,
  wallet:WalletReducer,
  complaint:ComplaintReducer,
  notification:NotificationReducer,
  ride:RideReducer,
  booking:BookingReducer,
  splash: SplashReducer,
});

export default allReducers;