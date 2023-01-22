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
} from "../config/Constants";
import DropdownAlert from "react-native-dropdownalert";
import { connect } from "react-redux";
import { createFirstName, createLastName } from "../actions/RegisterActions";
import strings from "../languages/strings.js";
class CreateName extends Component<Props> {
  constructor(props) {
    super(props);
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state = {
      first_name: "",
      last_name: "",
      validation: true,
      phone_number: this.props.route.params.phone_number,
    };
  }

  componentDidMount() {
    setTimeout(() => {
      this.first_name.focus();
    }, 200);
  }

  handleBackButtonClick = () => {
    this.props.navigation.goBack(null);
  };

  async check_name() {
    await this.check_validate();
    if (this.state.validation) {
      await this.props.createFirstName(this.state.first_name);
      await this.props.createLastName(this.state.last_name);
      await this.props.navigation.navigate("CreateEmail", {
        phone_number: this.state.phone_number,
      });
    }
  }

  async check_validate() {
    if (this.state.first_name == "" || this.state.last_name == "") {
      this.setState({ validation: false });
      this.show_alert(strings.please_enter_first_name_and_last_name);
    } else {
      this.setState({ validation: true });
    }
  }

  show_alert(message) {
    this.dropDownAlertRef.alertWithType("error", "Error", message);
  }

  render() {
    return (
      <View style={styles.header_content}>
        <View>
          <View style={styles.view_title}>
            <Text style={styles.name_title}>{strings.enter_your_name}</Text>
            <View style={styles.margin_10} />
            <View style={{ flexDirection: "row" }}>
              <View style={{ width: "50%" }}>
                <TextInput
                  ref={(ref) => (this.first_name = ref)}
                  placeholder={strings.john}
                  placeholderTextColor={colors.theme_fg_four}
                  style={styles.textinput}
                  onChangeText={(TextInputValue) =>
                    this.setState({ first_name: TextInputValue })
                  }
                />
              </View>
              <View style={{ width: 10, flexDirection: "column" }} />
              <View style={{ width: "50%" }}>
                <TextInput
                  ref={(ref) => (this.last_name = ref)}
                  placeholder={strings.willams}
                  placeholderTextColor={colors.theme_fg_four}
                  style={styles.textinput}
                  onChangeText={(TextInputValue) =>
                    this.setState({ last_name: TextInputValue })
                  }
                />
              </View>
            </View>
            <View style={styles.margin_50} />
            <TouchableOpacity onPress={this.check_name.bind(this)}>
              <Image style={styles.image} source={go_icon} />
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
  createFirstName: (data) => dispatch(createFirstName(data)),
  createLastName: (data) => dispatch(createLastName(data)),
});

export default connect(null, mapDispatchToProps)(CreateName);

const styles = StyleSheet.create({
  header_content: {
    backgroundColor: colors.theme_fg_three,
    height: "100%",
    width: "100%",
  },
  view_title: {
    padding: 20,
    height: height_40,
  },
  name_title: {
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
    margin: 40,
  },
  image: {
    alignSelf: "flex-end",
    height: 65,
    width: 65,
    tintColor: colors.theme_bg,
  },
});
