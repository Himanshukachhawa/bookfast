import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  Image,
  View,
  TextInput,
  TouchableOpacity,
  Platform,
  ImageBackground,
} from "react-native";
import * as colors from "../assets/css/Colors";
import {
  alert_close_timing,
  font_title,
  font_description,
  api_url,
  login,
  go_icon,
  check_phone,
  height_30,
  width_80,
} from "../config/Constants";
import Loader from "../components/Loader";
import { connect } from "react-redux";
import DropdownAlert from "react-native-dropdownalert";
import { CommonActions } from "@react-navigation/native";
import {
  loginPending,
  loginError,
  loginSuccess,
} from "../actions/LoginActions";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import strings from "../languages/strings.js";
import RNAndroidLocationEnabler from "react-native-android-location-enabler";

class Password extends Component<Props> {
  constructor(props) {
    super(props);
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state = {
      phone_number: this.props.route.params.phone_number,
      password: "",
      validation: false,
      isLoading: false,
      timer: 30,
    };
  }

  componentDidMount() {
    setTimeout(() => {
      this.password.focus();
    }, 200);
    if (global.mode == "DEMO") {
      setTimeout(() => {
        this.login(this.state.password);
      }, 1000);
    } else {
      this.start_timer();
    }
  }
  decrementClock = () => {
    if (this.state.timer < 1) {
      clearInterval(this.clockCall);
    } else {
      this.setState((prevstate) => ({ timer: prevstate.timer - 1 }));
    }
  };
  start_timer() {
    this.clockCall = setInterval(() => {
      this.decrementClock();
    }, 1000);
  }
  handleBackButtonClick = () => {
    this.props.navigation.goBack(null);
  };
  call_resend(phone_with_code) {
    this.check_phone_register(phone_with_code);
  }
  async forgot() {
    this.props.navigation.navigate("Forgot");
  }
  async check_phone_register(phone_with_code) {
    this.setState({ isLoading: true });
    await axios({
      method: "post",
      url: api_url + check_phone,
      data: { phone_with_code: phone_with_code },
    })
      .then(async (response) => {
        this.setState({ isLoading: false });
        if (response.data.status == 1) {
          this.setState({ otp: response.data.result.otp, timer: 30 });
          this.start_timer();
        }
      })
      .catch((error) => {
        this.setState({ isLoading: false });
        alert(strings.sorry_something_went_wrong);
      });
  }
  async login() {
    await this.check_validate();
    if (this.state.validation) {
      this.setState({ isLoading: true });
      this.props.loginPending();
      await axios({
        method: "post",
        url: api_url + login,
        data: {
          phone_with_code: this.state.phone_number.slice(3),
          password: this.state.password,
          fcm_token: global.fcm_token,
        },
      })
        .then(async (response) => {
          console.log(
            "otp uscc",
            this.state.phone_number.slice(3),
            response.data
          );
          this.setState({ isLoading: false });
          await this.props.loginSuccess(response.data);
          await this.saveData();
        })
        .catch((error) => {
          this.setState({ isLoading: false });
          this.props.loginError(error);
        });
    }
  }

  saveData = async () => {
    console.log("ssss", this.props?.data);
    if (this.props.status == 1) {
      try {
        await AsyncStorage.setItem("id", this.props.data.id.toString());
        await AsyncStorage.setItem(
          "first_name",
          this.props.data.first_name.toString()
        );
        await AsyncStorage.setItem(
          "profile_picture",
          this.props.data.profile_picture.toString()
        );
        await AsyncStorage.setItem(
          "phone_with_code",
          this.props.data.phone_with_code.toString()
        );
        await AsyncStorage.setItem("email", this.props.data.email.toString());
        await AsyncStorage.setItem(
          "country_id",
          this.props.data.country_id.toString()
        );
        await AsyncStorage.setItem(
          "currency",
          this.props.data.currency.toString()
        );
        await AsyncStorage.setItem("wallet", this.props.data.wallet.toString());
        await AsyncStorage.setItem(
          "currency_short_code",
          this.props.data.currency_short_code.toString()
        );
        // await AsyncStorage.setItem(
        //   "email_verification_status",
        //   this.props.data.email_verification_status.toString()
        // );

        global.id = await this.props.data.id;
        global.first_name = await this.props.data.first_name;
        global.profile_picture = await this.props.data.profile_picture;
        global.phone_with_code = await this.props.data.phone_with_code;
        global.email = await this.props.data.email;
        global.country_id = await this.props.data.country_id;
        global.currency = await this.props.data.currency;
        global.wallet = await this.props.data.wallet;
        global.currency_short_code = await this.props.data.currency_short_code;

        this.home();
      } catch (e) {
        console.log("ee", e);
      }
    } else {
      this.dropDownAlertRef.alertWithType("error", "Error", this.props.message);
    }
  };

  async check_validate() {
    if (this.state.password == "") {
      this.setState({ validation: false });
      this.show_alert(strings.please_enter_password);
    } else {
      this.setState({ validation: true });
    }
  }

  home = () => {
    console.log("in home");
    if (Platform.OS == "android") {
      RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
        interval: 10000,
        fastInterval: 5000,
      })
        .then((data) => {
          this.props.navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "Home" }],
            })
          );
        })
        .catch((err) => {
          this.props.navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "LocationEnable" }],
            })
          );
        });
    } else {
      this.props.navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Home" }],
        })
      );
    }
  };

  show_alert(message) {
    this.dropDownAlertRef.alertWithType("error", "Error", message);
  }

  render() {
    const { isLoding, error, data, message, status } = this.props;
    return (
      <ImageBackground
        source={require("../assets/img/Splash_jpg.jpg")}
        style={{
          height: "100%",
          width: "100%",
          flex: 1,
        }}
      >
        <View
          style={{
            flex: 1,
          }}
        >
          <View style={{ marginTop: height_30 }}>
            <Loader visible={this.state.isLoading} />
            <View style={styles.padding_20}>
              <Text style={styles.password_title}>
                {strings.enter_your_password}
              </Text>
              <View style={styles.margin_10} />
              <TextInput
                ref={(ref) => (this.password = ref)}
                secureTextEntry={true}
                keyboardType={"number-pad"}
                placeholderTextColor={colors.theme_fg_two}
                placeholder="******"
                style={styles.textinput}
                onChangeText={(TextInputValue) =>
                  this.setState({ password: TextInputValue })
                }
              />
              <View style={styles.margin_10} />
              <Text style={styles.description}>
                {
                  strings.enter_the_code_you_have_received_by_SMS_in_order_to_verify_account
                }
              </Text>
              <View style={{ margin: 10 }} />
              {this.state.timer == 0 ? (
                <Text
                  onPress={this.call_resend.bind(
                    this,
                    this.state.phone_number.slice(3)
                  )}
                  style={{
                    fontSize: 15,
                    fontFamily: font_title,
                    color: colors.theme_fg_two,
                    alignSelf: "center",
                    textDecorationLine: "underline",
                  }}
                >
                  {strings.resend_otp}
                </Text>
              ) : (
                <Text
                  style={{
                    fontSize: 15,
                    fontFamily: font_title,
                    color: colors.theme_fg_four,
                    alignSelf: "center",
                  }}
                >
                  {strings.resend_code_in}
                  {this.state.timer}
                </Text>
              )}
              {/* <View>
              <View style={styles.margin_10} />
              <Text onPress={this.forgot.bind(this)} style={styles.forgot_text}>
                {strings.forgot_your_password}
              </Text>
            </View> */}
              <View style={styles.margin_10} />

              {/* <TouchableOpacity onPress={this.login.bind(this)}>
                <Image
                  style={{
                    alignSelf: "flex-end",
                    height: 65,
                    width: 65,
                    tintColor: colors.theme_bg,
                  }}
                  source={go_icon}
                />
              </TouchableOpacity> */}
              <TouchableOpacity
                onPress={this.login.bind(this)}
                style={{
                  backgroundColor: colors.theme_bg,
                  width: width_80,
                  alignSelf: "center",
                  alignItems: "center",
                  paddingVertical: 14,
                  borderRadius: 20,
                }}
              >
                {/* <Image
                  style={{
                    alignSelf: "flex-end",
                    height: 65,
                    width: 65,
                    tintColor: colors.theme_bg,
                  }}
                  source={go_icon}
                /> */}
                <Text style={styles.otp_text}>CONTINUE</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ margin: 20 }} />
          <DropdownAlert
            ref={(ref) => (this.dropDownAlertRef = ref)}
            closeInterval={alert_close_timing}
          />
        </View>
      </ImageBackground>
    );
  }
}

function mapStateToProps(state) {
  return {
    isLoding: state.login.isLoding,
    error: state.login.error,
    data: state.login.data,
    message: state.login.message,
    status: state.login.status,
  };
}

const mapDispatchToProps = (dispatch) => ({
  loginPending: () => dispatch(loginPending()),
  loginError: (error) => dispatch(loginError(error)),
  loginSuccess: (data) => dispatch(loginSuccess(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Password);

const styles = StyleSheet.create({
  password_title: {
    alignSelf: "center",
    color: colors.theme_fg_two,
    alignSelf: "flex-start",
    fontSize: 20,
    letterSpacing: 0.5,
    fontFamily: font_title,
  },
  margin_10: {
    margin: 10,
  },
  textinput: {
    borderBottomWidth: 1,
    fontSize: 18,
    color: colors.theme_fg_two,
    fontFamily: font_title,
  },
  padding_20: {
    padding: 20,
  },
  otp_text: {
    color: "#fff",
    fontFamily: font_title,
    fontSize: 16,
  },
  forgot_text: {
    color: colors.theme_fg_two,
    fontSize: 14,
    fontFamily: font_description,
  },
});
