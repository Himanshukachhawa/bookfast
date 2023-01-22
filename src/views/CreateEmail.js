import React, { Component } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Text,
} from "react-native";
import * as colors from "../assets/css/Colors";
import {
  alert_close_timing,
  font_title,
  font_description,
  height_40,
  go_icon,
  check_email,
  api_url,
} from "../config/Constants";
import DropdownAlert from "react-native-dropdownalert";
import { connect } from "react-redux";
import { createEmailAddress } from "../actions/RegisterActions";
import strings from "../languages/strings.js";
import Loader from "../components/Loader";
import axios from "axios";

class CreateEmail extends Component<Props> {
  constructor(props) {
    super(props);
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state = {
      email: "",
      validation: false,
      isLoading: false,
      phone_number: this.props.route.params.phone_number,
    };
  }

  componentDidMount() {
    setTimeout(() => {
      this.email.focus();
    }, 200);
  }

  handleBackButtonClick = () => {
    this.props.navigation.goBack(null);
  };

  async check_email() {
    await this.check_validate();
    if (this.state.validation) {
      this.setState({ isLoading: true });
      await axios({
        method: "post",
        url: api_url + check_email,
        data: { id: 0, email: this.state.email },
      })
        .then(async (response) => {
          this.setState({ isLoading: false });
          if (response.data.status == 1) {
            await this.props.createEmailAddress(this.state.email);
            await this.props.navigation.navigate("CreatePassword", {
              phone_number: this.state.phone_number,
            });
          } else {
            alert("Email already exist");
          }
        })
        .catch((error) => {
          this.setState({ isLoading: false });
          alert(strings.sorry_something_went_wrong);
        });
    }
  }

  async check_validate() {
    if (this.state.email == "") {
      this.setState({ validation: false });
      this.show_alert(strings.please_enter_email_address);
    } else {
      this.setState({ validation: true });
    }
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
        <Loader visible={this.state.isLoading} />
        <View style={{ backgroundColor: colors.theme_fg_three }}>
          <View style={{ padding: 20, height: height_40 }}>
            <Text style={styles.email_title}>{strings.enter_your_email}</Text>
            <View style={styles.margin_10} />
            <TextInput
              ref={(ref) => (this.email = ref)}
              placeholder={strings.john_gmail_com}
              placeholderTextColor={colors.theme_fg_four}
              keyboardType="email-address"
              style={styles.textinput}
              onChangeText={(TextInputValue) =>
                this.setState({ email: TextInputValue })
              }
            />
            <View style={styles.margin_50} />

            <TouchableOpacity onPress={this.check_email.bind(this)}>
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

const mapDispatchToProps = (dispatch) => ({
  createEmailAddress: (data) => dispatch(createEmailAddress(data)),
});

export default connect(null, mapDispatchToProps)(CreateEmail);

const styles = StyleSheet.create({
  email_title: {
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
    color: colors.theme_fg_four,
    fontFamily: font_description,
    borderBottomColor: colors.theme_fg_two,
    borderBottomWidth: 1,
  },
  margin_50: {
    margin: 50,
  },
});
