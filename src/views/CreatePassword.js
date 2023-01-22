import React, { Component } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Text,
  Platform,
} from "react-native";
import * as colors from "../assets/css/Colors";
import {
  alert_close_timing,
  api_url,
  register,
  font_title,
  font_description,
  height_40,
  go_icon,
} from "../config/Constants";
import DropdownAlert from "react-native-dropdownalert";
import axios from "axios";
import { connect } from "react-redux";
import {
  createLoginPassword,
  registerPending,
  registerError,
  registerSuccess,
} from "../actions/RegisterActions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";
import strings from "../languages/strings.js";
import RNAndroidLocationEnabler from "react-native-android-location-enabler";
import Loader from "../components/Loader";

class CreatePassword extends Component<Props> {
  constructor(props) {
    super(props);
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state = {
      password: "",
      referral_code: "",
      validation: false,
      isLoading: false,
      phone_number: this.props.route.params.phone_number,
    };
  }

  componentDidMount() {}

  handleBackButtonClick = () => {
    this.props.navigation.goBack(null);
  };

  async check_password() {
    await this.check_validate();
    if (this.state.validation) {
      this.props.createLoginPassword(this.state.password);
      this.register();
    }
  }

  async register() {
    console.log({
      country_code: "91",
      phone_number: this.state.phone_number.slice(3),
      phone_with_code: "91",
      first_name: this.props.first_name,
      last_name: this.props.last_name,
      email: this.props.email,
      password: this.props.password,
      fcm_token: global.fcm_token,
      referral_code: this.state.referral_code,
    });
    this.setState({ isLoading: true });
    this.props.registerPending();
    await axios({
      method: "post",
      url: api_url + register,
      data: {
        first_name: this.props.first_name,
        last_name: this.props.last_name,
        phone_with_code: this.state.phone_number.slice(3),
        password: "1234",
        fcm_token: global.fcm_token,
        email: this.props.email,
        otp: "",
        phone_number: this.state.phone_number.slice(3),

        referral_code: this.state.referral_code,
      },
    })
      .then(async (response) => {
        this.setState({ isLoading: false });
        await this.props.registerSuccess(response.data);
        await this.saveData();
      })
      .catch((error) => {
        this.setState({ isLoading: false });
        alert(error);
        this.props.registerError(error);
      });
  }

  saveData = async () => {
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
        // await AsyncStorage.setItem(
        //   "currency_short_code",
        //   this.props.data.currency_short_code.toString()
        // );

        global.id = await this.props.data.id;
        global.first_name = await this.props.data.first_name;
        global.profile_picture = await this.props.data.profile_picture;
        global.phone_with_code = await this.props.data.phone_with_code;
        global.email = await this.props.data.email;
        global.country_id = await this.props.data.country_id;
        global.currency = await this.props.data.currency;
        global.currency_short_code = await this.props.data.currency_short_code;

        this.home();
      } catch (e) {
        alert(e);
      }
    } else {
      this.dropDownAlertRef.alertWithType("error", "Error", this.props.message);
    }
  };

  home = () => {
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

  async check_validate() {
    this.setState({ validation: true });
  }

  show_alert(message) {
    this.dropDownAlertRef.alertWithType("error", "Error", message);
  }

  render() {
    return (
      <View
        style={{
          backgroundColor: colors.theme_fg_three,
          height: "100%",
          width: "100%",
        }}
      >
        <View style={{ backgroundColor: colors.theme_fg_three }}>
          <Loader visible={this.state.isLoading} />
          <View style={{ padding: 20, height: height_40 }}>
            {/* <Text style={styles.password_title}>
              {strings.enter_your_password}
            </Text>

            <TextInput
              ref={(ref) => (this.password = ref)}
              secureTextEntry={true}
              placeholderTextColor={colors.theme_fg_four}
              placeholder="******"
              style={styles.textinput}
              onChangeText={(TextInputValue) =>
                this.setState({ password: TextInputValue })
              }
            />
            <View style={{ margin: 10 }} /> */}
            <Text style={styles.password_title}>
              {strings.enter_refferal_code}
            </Text>
            <TextInput
              ref={(ref) => (this.referral_code = ref)}
              placeholderTextColor={colors.theme_fg_four}
              placeholder={strings.refferal_code}
              style={styles.textinput}
              onChangeText={(TextInputValue) =>
                this.setState({ referral_code: TextInputValue })
              }
            />
            <View style={styles.margin_10} />
            <TouchableOpacity onPress={this.check_password.bind(this)}>
              <Image
                style={{
                  alignSelf: "flex-end",
                  height: 65,
                  width: 65,
                  tintColor: colors.theme_bg,
                }}
                source={go_icon}
              />
            </TouchableOpacity>
          </View>
        </View>
        <DropdownAlert
          ref={(ref) => (this.dropDownAlertRef = ref)}
          closeInterval={alert_close_timing}
        />
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    first_name: state.register.first_name,
    last_name: state.register.last_name,
    email: state.register.email,
    password: state.register.password,
    country_code: state.register.country_code,
    phone_number: state.register.phone_number,
    phone_with_code: state.register.phone_with_code,
    isLoding: state.register.isLoding,
    error: state.register.error,
    data: state.register.data,
    message: state.register.message,
    status: state.register.status,
  };
}

const mapDispatchToProps = (dispatch) => ({
  registerPending: () => dispatch(registerPending()),
  registerError: (error) => dispatch(registerError(error)),
  registerSuccess: (data) => dispatch(registerSuccess(data)),
  createLoginPassword: (data) => dispatch(createLoginPassword(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CreatePassword);

const styles = StyleSheet.create({
  password_title: {
    alignSelf: "center",
    color: colors.theme_fg_two,
    alignSelf: "flex-start",
    fontSize: 20,
    letterSpacing: 0.5,
    fontFamily: font_title,
  },
  textinput: {
    borderBottomWidth: 1,
    fontSize: 18,
    color: colors.theme_fg_four,
    fontFamily: font_description,
    borderBottomColor: colors.theme_fg_two,
    borderBottomWidth: 1,
  },
  margin_10: {
    margin: 15,
  },
});
