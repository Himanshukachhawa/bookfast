import React, { Component } from "react";
import {
  StyleSheet,
  Image,
  View,
  TouchableOpacity,
  SafeAreaView,
  Text,
  ImageBackground,
} from "react-native";
import * as colors from "../assets/css/Colors";
import {
  api_url,
  check_phone,
  font_title,
  font_description,
  height_40,
  height_35,
  go_icon,
  width_50,
  width_80,
} from "../config/Constants";
import PhoneInput from "react-native-phone-input";
import axios from "axios";
import { connect } from "react-redux";
import {
  checkPhonePending,
  checkPhoneError,
  checkPhoneSuccess,
} from "../actions/CheckPhoneActions";
import {
  createCountryCode,
  createPhoneNumber,
  createPhoneWithCode,
} from "../actions/RegisterActions";
import Loader from "../components/Loader";
import strings from "../languages/strings.js";
import { TextInput } from "react-native-gesture-handler";

class Login extends Component<Props> {
  constructor(props) {
    super(props);
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state = {
      phone_number: "",
      validation: false,
      isLoading: false,
    };
  }

  componentDidMount() {}

  handleBackButtonClick = () => {
    this.props.navigation.goBack(null);
  };

  async check_phone_number() {
    await this.check_validate();
    if (this.state.validation) {
      await this.check_phone(this.state.phone_number);
    }
  }

  async navigate() {
    if (this.props.data.is_available == 1) {
      this.props.navigation.navigate("Password", {
        phone_number: "+91" + this.state.phone_number,
      });
    } else {
      // let phone_number = this.phone.getValue();
      // phone_number = phone_number.replace(
      //   "+" + this.phone.getCountryCode(),
      //   ""
      // );
      // this.props.createCountryCode("+" + this.phone.getCountryCode());
      // this.props.createPhoneNumber(phone_number);
      // this.props.createPhoneWithCode(this.phone.getValue());
      // this.props.navigation.navigate("Otp", {
      //   otp: this.props.data.otp,
      //   id: 0,
      //   from: "login",
      //   phone_with_code: this.phone.getValue(),
      // });
      this.props.navigation.navigate("CreateName", {
        phone_number: "+91" + this.state.phone_number,
      });
    }
  }

  async check_phone(phone_with_code) {
    console.log("phone_with_code", phone_with_code);
    this.setState({ isLoading: true });
    this.props.checkPhonePending();
    await axios({
      method: "post",
      url: api_url + check_phone,
      data: { phone_with_code: phone_with_code, fcm_token: global.fcm_token },
    })
      .then(async (response) => {
        console.log("respponse", response);
        this.setState({ isLoading: false });
        //alert(JSON.stringify(response));
        await this.props.checkPhoneSuccess(response.data);
        await this.navigate();
      })
      .catch((error) => {
        console.log("errrrrr", error?.response);
        this.setState({ isLoading: false });

        this.props.checkPhoneError(error);
      });
  }

  async check_validate() {
    if (this.state.phone_number == "") {
      this.setState({ validation: false });
      this.show_alert(strings.please_enter_valid_phone_number);
    } else {
      this.setState({ validation: true });
    }
  }

  show_alert(message) {
    this.dropDownAlertRef.alertWithType("error", "Error", message);
  }

  render() {
    const { isLoding, error, data, message, status } = this.props;
    return (
      <SafeAreaView
        style={{
          backgroundColor: colors.theme_fg_three,
          height: "100%",
          width: "100%",
        }}
      >
        <Loader visible={this.state.isLoading} />
        <ImageBackground
          source={require("../assets/img/Splash_jpg.jpg")}
          style={{ flex: 1 }}
        >
          <View>
            <View
              style={{ padding: 20, height: height_40, marginTop: height_35 }}
            >
              <Loader visible={isLoding} />
              <Text style={styles.phone_title}>Welcome to Bookfast</Text>
              <Text style={styles.phone_title1}>
                Enter your mobile number to continue
              </Text>

              <View style={styles.margin_20} />
              {/* <PhoneInput
              style={{ borderBottomColor: colors.theme_bg_two }}
              flagStyle={styles.flag_style}
              ref={(ref) => {
                this.phone = ref;
              }}
              initialCountry="in"
              offset={10}
              textStyle={styles.country_text}
              textProps={{
                placeholder: strings.phone_number,
                placeholderTextColor: colors.theme_fg_four,
              }}
              autoFormat={true}
              countries={["in"]}
            /> */}
              <TextInput
                value={this.state.phone_number}
                placeholder={"+91"}
                keyboardType={"number-pad"}
                maxLength={10}
                onChangeText={(text) => {
                  this.setState({ phone_number: text });
                }}
                style={{ borderBottomColor: "#000", borderBottomWidth: 1 }}
              />
              <View style={styles.margin_50} />
              <TouchableOpacity
                onPress={this.check_phone_number.bind(this)}
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
                <Text style={styles.otp_text}>SEND OTP</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }
}

function mapStateToProps(state) {
  return {
    isLoding: state.check_phone.isLoding,
    error: state.check_phone.error,
    data: state.check_phone.data,
    message: state.check_phone.message,
    status: state.check_phone.status,
  };
}

const mapDispatchToProps = (dispatch) => ({
  checkPhonePending: () => dispatch(checkPhonePending()),
  checkPhoneError: (error) => dispatch(checkPhoneError(error)),
  checkPhoneSuccess: (data) => dispatch(checkPhoneSuccess(data)),
  createCountryCode: (data) => dispatch(createCountryCode(data)),
  createPhoneNumber: (data) => dispatch(createPhoneNumber(data)),
  createPhoneWithCode: (data) => dispatch(createPhoneWithCode(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);

const styles = StyleSheet.create({
  otp_text: {
    color: "#fff",
    fontFamily: font_title,
    fontSize: 16,
  },
  phone_title1: {
    alignSelf: "center",
    color: colors.theme_bg_two,
    alignSelf: "flex-start",
    fontSize: 17,
    letterSpacing: 0.5,
    fontFamily: font_title,
  },
  phone_title: {
    alignSelf: "center",
    color: colors.theme_fg_two,
    alignSelf: "flex-start",
    fontSize: 20,
    letterSpacing: 0.5,
    fontFamily: font_title,
  },
  margin_20: {
    margin: 15,
  },
  margin_50: {
    margin: 25,
  },
  flag_style: {
    width: 38,
    height: 24,
  },
  country_text: {
    fontSize: 18,
    borderBottomWidth: 1,
    paddingBottom: 8,
    height: 35,
    fontFamily: font_description,
    color: colors.theme_fg_two,
  },
});
