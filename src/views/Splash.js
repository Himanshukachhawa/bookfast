import React, { Component } from "react";
import {
  View,
  StyleSheet,
  Image,
  I18nManager,
  Platform,
  PermissionsAndroid,
} from "react-native";
import {
  logo,
  api_url,
  settings,
  LATITUDE_DELTA,
  LONGITUDE_DELTA,
} from "../config/Constants";
import * as colors from "../assets/css/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";
import axios from "axios";
import { connect } from "react-redux";
import { StatusBar } from "../components/GeneralComponents";
import strings from "../languages/strings.js";
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import PushNotification, { Importance } from "react-native-push-notification";
import { reset } from "../actions/BookingActions";
import RNAndroidLocationEnabler from "react-native-android-location-enabler";
import Geolocation from "@react-native-community/geolocation";
import {
  initialLat,
  initialLng,
  initialRegion,
} from "../actions/BookingActions";

class Splash extends Component<Props> {
  async componentDidMount() {
    if (Platform.OS == "android") {
      await this.props.reset();
      this.configure();
      this.channel_create();
      await this.settings();
    } else {
      global.fcm_token = "123456";
      await this.settings();
    }
    this.state = {
      redirection_mode: 0,
    };
  }

  channel_create = () => {
    PushNotification.createChannel(
      {
        channelId: "taxi_booking", // (required)
        channelName: "Booking", // (required)
        channelDescription: "Taxi Booking Solution", // (optional) default: undefined.
        playSound: true, // (optional) default: true
        soundName: "uber.mp3", // (optional) See `soundName` parameter of `localNotification` function
        importance: Importance.HIGH, // (optional) default: Importance.HIGH. Int value of the Android notification importance
        vibrate: true, // (optional) default: true. Creates the default vibration pattern if true.
      },
      (created) => console.log(`createChannel returned '${created}'`) // (optional) callback returns whether the channel was created, false means it already existed.
    );
  };

  configure = () => {
    PushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister: function (token) {
        console.log("TOKEN:", token.token);
        global.fcm_token = token.token;
      },

      // (required) Called when a remote is received or opened, or local notification is opened
      onNotification: function (notification) {
        console.log("NOTIFICATION:", notification);

        // process the notification

        // (required) Called when a remote is received or opened, or local notification is opened
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },

      // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
      onAction: function (notification) {
        console.log("ACTION:", notification.action);
        console.log("NOTIFICATION:", notification);

        // process the action
      },

      // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
      onRegistrationError: function (err) {
        console.error(err.message, err);
      },

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      // Should the initial notification be popped automatically
      // default: true
      popInitialNotification: true,

      /**
       * (optional) default: true
       * - Specified if permissions (ios) and token (android and ios) will requested or not,
       * - if not, you must call PushNotificationsHandler.requestPermissions() later
       * - if you are not using remote notification or do not have Firebase installed, use this:
       *     requestPermissions: Platform.OS === 'ios'
       */
      requestPermissions: true,
    });
  };

  settings = async () => {
    await axios({
      method: "get",
      url: api_url + settings,
    })
      .then(async (response) => {
        console.log(response.data.result);
        this.home(response.data.result);
      })
      .catch((error) => {
        alert(strings.sorry_something_went_wrong);
      });
  };

  home = async (data) => {
    const id = await AsyncStorage.getItem("id");
    const first_name = await AsyncStorage.getItem("first_name");
    const profile_picture = await AsyncStorage.getItem("profile_picture");
    const phone_with_code = await AsyncStorage.getItem("phone_with_code");
    const email = await AsyncStorage.getItem("email");
    const country_id = await AsyncStorage.getItem("country_id");
    const currency = await AsyncStorage.getItem("currency");
    const wallet = await AsyncStorage.getItem("wallet");
    const lang = await AsyncStorage.getItem("lang");
    const currency_short_code = await AsyncStorage.getItem(
      "currency_short_code"
    );
    const email_verification_status = await AsyncStorage.getItem(
      "email_verification_status"
    );

    global.stripe_key = await data.stripe_key;
    global.razorpay_key = await data.razorpay_key;
    global.paystack_public_key = await data.paystack_public_key;
    global.paystack_secret_key = await data.paystack_secret_key;
    global.flutterwave_public_key = await data.flutterwave_public_key;
    global.app_name = await data.app_name;
    global.language_status = await data.language_status;
    global.default_language = await data.default_language;
    global.polyline_status = await data.polyline_status;
    global.paypal_id = await data.paypal_client_id;
    global.app_type = await data.app_type;
    global.mode = data.mode;

    if (global.language_status == 1) {
      global.lang = await global.default_language;
    }

    if (lang) {
      strings.setLanguage(lang);
      global.lang = lang;
    } else {
      strings.setLanguage("en");
      global.lang = "en";
    }

    if (global.lang == "en" && I18nManager.isRTL) {
      I18nManager.forceRTL(false);
      await RNRestart.Restart();
    }

    if (global.lang == "ar" && !I18nManager.isRTL) {
      I18nManager.forceRTL(true);
      await RNRestart.Restart();
    }

    if (id !== null) {
      global.id = id;
      global.first_name = first_name;
      global.profile_picture = profile_picture;
      global.phone_with_code = phone_with_code;
      global.email = email;
      global.country_id = country_id;
      global.currency = currency;
      global.currency_short_code = currency_short_code;
      global.wallet = wallet;
      global.email_verification_status = email_verification_status;
      this.setState({ redirection_mode: 1 });
      this.check_location();
    } else {
      global.id = "";
      this.setState({ redirection_mode: 2 });
      this.check_location();
    }
  };

  check_location = async () => {
    if (Platform.OS === "android") {
      RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
        interval: 10000,
        fastInterval: 5000,
      })
        .then(async (data) => {
          try {
            const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
              {
                title: "Location Access Required",
                message:
                  app_name +
                  " needs to Access your location for show nearest taxi",
              }
            );

            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
              await this.getInitialLocation();
            } else {
              alert("Sorry unable to fetch your location");
            }
          } catch (err) {
            this.props.navigation.navigate("LocationEnable");
          }
        })
        .catch((err) => {
          this.props.navigation.navigate("LocationEnable");
        });
    } else {
      await this.getInitialLocation();
    }
  };

  getInitialLocation = async () => {
    Geolocation.getCurrentPosition(
      async (position) => {
        let location = position.coords;
        let region = {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        };
        await this.props.initialRegion(region);
        await this.props.initialLat(location.latitude);
        await this.props.initialLng(location.longitude);
        if (this.state.redirection_mode == 1) {
          this.navigate_home();
        } else {
          this.navigate_login();
        }
      },
      (error) => this.props.navigation.navigate("LocationEnable"),
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  navigate_home = async () => {
    this.props.navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Home" }],
      })
    );
  };

  navigate_login = async () => {
    this.props.navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Login" }],
      })
    );
  };

  render() {
    return (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          backgroundColor: colors.theme_bg_three,
          paddingHorizontal: 20,
        }}
      >
        <StatusBar />
        <Image style={styles.image} source={logo} resizeMode={"contain"} />
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    initial_lat: state.booking.initial_lat,
    initial_lng: state.booking.initial_lng,
    initial_region: state.booking.initial_region,
  };
}

const mapDispatchToProps = (dispatch) => ({
  reset: () => dispatch(reset()),
  initialLat: (data) => dispatch(initialLat(data)),
  initialLng: (data) => dispatch(initialLng(data)),
  initialRegion: (data) => dispatch(initialRegion(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Splash);

const styles = StyleSheet.create({
  image: {
    height: "50%",
    width: "96%",
  },
});
