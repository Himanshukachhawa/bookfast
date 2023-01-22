import React, { Component } from "react";
import { StyleSheet, Text, Image, View, TouchableOpacity } from "react-native";
import * as colors from "../assets/css/Colors";
import {
  api_url,
  profile,
  profile_picture_update,
  profile_picture_path,
  font_title,
  font_description,
  img_url,
  check_email,
} from "../config/Constants";
import Loader from "../components/Loader";
import { Divider } from "react-native-elements";
import axios from "axios";
import { connect } from "react-redux";
import {
  profilePending,
  profileError,
  profileSuccess,
  updateProfilePicture,
} from "../actions/ProfileActions";
import strings from "../languages/strings.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native-gesture-handler";
import * as ImagePicker from "react-native-image-picker";
import RNFetchBlob from "rn-fetch-blob";
import ImgToBase64 from "react-native-image-base64";

//Image upload options
const options = {
  title: "Select a photo",
  takePhotoButtonTitle: "Take a photo",
  chooseFromLibraryButtonTitle: "Choose from gallery",
  base64: true,
  quality: 1,
  maxWidth: 500,
  maxHeight: 500,
};

class Profile extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      profile_picture: "",
      first_name: "",
      last_name: "",
      phone_number: "",
      email: "",
      password: "",
      validation: true,
      data: "",
      data_img: "",
      gender: "",
      gender_name: "",
      isLoading: false,
      profile_timer: true,
      img_data: "",
      email_verification_status: 0,
      profile_image: "",
      current_sub_name: "",
      current_sub_id: "",
    };
  }

  async componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener("focus", async () => {
      await this.get_profile();
    });
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  get_profile = async () => {
    this.setState({ isLoading: true });
    this.props.profilePending();
    await axios({
      method: "post",
      url: api_url + profile,
      data: { customer_id: global.id, lang: global.lang },
    })
      .then(async (response) => {
        await this.props.profileSuccess(response.data);
        this.setState({
          isLoading: false,
          first_name: this.props.data.first_name,
          last_name: this.props.data.last_name,
          email: this.props.data.email,
          phone_number: this.props.data.phone_with_code,
          profile_picture: this.props.data.profile_picture,
          gender: this.props.data.gender,
          gender_name: this.props.data.gender_name,
          email_verification_status: this.props.data.email_verification_status,
          current_sub_name: this.props.data.current_sub,
          current_sub_id: this.props.data.current_sub_id,
        });
      })
      .catch((error) => {
        this.setState({ isLoading: false });
        alert(strings.sorry_something_went_wrong);
        this.props.profileError(error);
      });
  };

  select_photo = async () => {
    if (this.state.profile_timer) {
      ImagePicker.launchImageLibrary(options, async (response) => {
        if (response.didCancel) {
          console.log("User cancelled image picker");
        } else if (response.error) {
          console.log("ImagePicker Error: ", response.error);
        } else {
          const source = response.assets[0].uri;
          this.setState({ img_data: response.data });
          await ImgToBase64.getBase64String(response.assets[0].uri)
            .then(async (base64String) => {
              await this.profile_image_upload(base64String);
              this.setState({ profile_image: response.assets[0].uri });
            })
            .catch((err) => console.log(err));
        }
      });
    } else {
      alert("Please try after 20 seconds");
    }
  };

  profile_image_upload = async (data_img) => {
    this.setState({ isLoading: true });
    RNFetchBlob.fetch(
      "POST",
      api_url + profile_picture_path,
      {
        "Content-Type": "multipart/form-data",
      },
      [
        {
          name: "image",
          filename: "image.png",
          data: data_img,
        },
        {
          name: "customer_id",
          data: global.id.toString(),
        },
      ]
    )
      .then(async (resp) => {
        this.setState({ isLoading: false });
        let data = await JSON.parse(resp.data);
        console.log(data);
        if (data.result) {
          await this.profile_image_update(data.result);
        }
      })
      .catch((err) => {
        this.setState({ isLoading: false });
        console.log(err);
        alert("Error on while upload try again later.");
      });
  };

  profile_image_update = async (data) => {
    this.setState({ isLoading: true });
    await axios({
      method: "post",
      url: api_url + profile_picture_update,
      data: { id: global.id, profile_picture: data },
    })
      .then(async (response) => {
        this.setState({ isLoading: false });
        if (response.data.status == 1) {
          alert("Update Successfully");
          this.saveProfilePicture(data);
          this.setState({ profile_timer: false });
          setTimeout(() => {
            this.setState({ profile_timer: false });
          }, 20000);
        } else {
          alert(response.data.message);
        }
      })
      .catch((error) => {
        this.setState({ isLoading: false });
        alert("Sorry something went wrong");
      });
  };

  saveProfilePicture = async (data) => {
    try {
      await AsyncStorage.setItem("profile_picture", data.toString());
      global.profile_picture = await data;
      await this.props.updateProfilePicture(data);
      this.get_profile();
    } catch (e) {
      alert(e);
    }
  };

  show_alert(message) {
    this.dropDownAlertRef.alertWithType("error", "Error", message);
  }

  edit_first_name(id) {
    this.props.navigation.navigate("EditFirstName", {
      first_name: this.props.data.first_name,
    });
  }

  edit_last_name(id) {
    this.props.navigation.navigate("EditLastName", {
      last_name: this.props.data.last_name,
    });
  }

  edit_phone_number(id) {
    this.props.navigation.navigate("EditPhoneNumber", {
      phone_number: this.props.data.phone_number,
    });
  }

  edit_email(id) {
    this.props.navigation.navigate("EditEmail", {
      email: this.props.data.email,
    });
  }

  edit_gender(id) {
    if (this.props.data.gender == 0) {
      this.props.navigation.navigate("EditGender", { gender: 1 });
    } else {
      this.props.navigation.navigate("EditGender", {
        gender: this.props.data.gender,
      });
    }
  }

  edit_password(id) {
    this.props.navigation.navigate("EditPassword", {
      password: this.props.data.password,
    });
  }

  check_email = async () => {
    this.setState({ isLoading: true });
    await axios({
      method: "post",
      url: api_url + check_email,
      data: { id: global.id, email: this.state.email },
    })
      .then(async (response) => {
        this.setState({ isLoading: false });
        if (response.data.status == 1) {
          global.email_verification_status = 1;
          alert("Please check your email and confirm it");
        }
      })
      .catch((error) => {
        this.setState({ isLoading: false });
        alert(strings.sorry_something_went_wrong);
      });
  };

  render() {
    return (
      <SafeAreaView>
        <ScrollView
          style={{ backgroundColor: colors.theme_fg_three, padding: 20 }}
        >
          <Loader visible={this.state.isLoading} />
          <View style={{ margin: 10 }} />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TouchableOpacity onPress={this.select_photo.bind(this)}>
              <View style={styles.profile}>
                <Image
                  style={{
                    flex: 1,
                    width: undefined,
                    height: undefined,
                    borderRadius: 50,
                    borderColor: colors.theme_fg,
                  }}
                  source={{ uri: img_url + this.state.profile_picture }}
                />
              </View>
              <View style={{ margin: 5 }} />
            </TouchableOpacity>
          </View>
          {this.state.current_sub_id != 0 && (
            <Text
              style={{
                textAlign: "center",
                justifyContent: "center",
                fontFamily: font_description,
                fontSize: 12,
                color: colors.theme_fg_two,
              }}
            >
              You are in {this.state.current_sub_name} plan
            </Text>
          )}
          <Divider style={styles.default_divider} />
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              style={{ flexDirection: "column" }}
              onPress={this.edit_first_name.bind(this, 1)}
              activeOpacity={1}
            >
              <Text style={styles.label}>{strings.first_name}</Text>
              <View style={{ margin: 3 }} />
              <Text style={styles.value}>{this.state.first_name}</Text>
            </TouchableOpacity>
          </View>
          <Divider style={styles.default_divider} />
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              style={{ flexDirection: "column" }}
              onPress={this.edit_last_name.bind(this, 1)}
              activeOpacity={1}
            >
              <Text style={styles.label}>{strings.last_name}</Text>
              <View style={{ margin: 3 }} />
              <Text style={styles.value}>{this.state.last_name}</Text>
            </TouchableOpacity>
          </View>
          <Divider style={styles.default_divider} />
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              style={{ flexDirection: "column" }}
              onPress={this.edit_phone_number.bind(this, 1)}
              activeOpacity={1}
            >
              <Text style={styles.label}>{strings.phone_number}</Text>
              <View style={{ margin: 3 }} />
              <Text style={styles.value}>{this.state.phone_number}</Text>
            </TouchableOpacity>
          </View>
          <Divider style={styles.default_divider} />
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              style={{ flexDirection: "column" }}
              onPress={this.edit_email.bind(this, 1)}
              activeOpacity={1}
            >
              <Text style={styles.label}>{strings.email}</Text>
              <View style={{ margin: 3 }} />
              <Text style={styles.value}>{this.state.email}</Text>
              <View style={{ margin: 3 }} />
              {this.state.email_verification_status == 0 ? (
                <TouchableOpacity onPress={this.check_email}>
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.red,
                      fontFamily: font_description,
                    }}
                  >
                    Please verify your Email
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.green,
                    fontFamily: font_description,
                  }}
                >
                  Your email is verified
                </Text>
              )}
            </TouchableOpacity>
          </View>
          <Divider style={styles.default_divider} />
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              style={{ flexDirection: "column" }}
              onPress={this.edit_gender.bind(this, 1)}
              activeOpacity={1}
            >
              <Text style={styles.label}>{strings.gender}</Text>
              <View style={{ margin: 3 }} />
              <Text style={styles.value}>{this.state.gender_name}</Text>
            </TouchableOpacity>
          </View>
          <Divider style={styles.default_divider} />
          {/* <View style={{ flexDirection:'row'}}>
            <TouchableOpacity style={{ flexDirection:'column'}} onPress={this.edit_password.bind(this,1)} activeOpacity={1}>
              <Text style={styles.label}>{strings.password}</Text>
              <View style={{ margin:3 }} />
              <Text style={styles.value}>******</Text>
            </TouchableOpacity>
          </View>
          <Divider style={styles.default_divider} /> */}
        </ScrollView>
      </SafeAreaView>
    );
  }
}

function mapStateToProps(state) {
  return {
    isLoding: state.profile.isLoding,
    message: state.profile.message,
    status: state.profile.status,
    data: state.profile.data,
    profile_picture: state.profile.profile_picture,
  };
}

const mapDispatchToProps = (dispatch) => ({
  profilePending: () => dispatch(profilePending()),
  profileError: (error) => dispatch(profileError(error)),
  profileSuccess: (data) => dispatch(profileSuccess(data)),
  updateProfilePicture: (data) => dispatch(updateProfilePicture(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Profile);

const styles = StyleSheet.create({
  profile: {
    height: 100,
    width: 100,
    borderColor: colors.theme_fg,
    borderWidth: 1,
    borderRadius: 50,
  },
  default_divider: {
    marginTop: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    color: colors.theme_fg_two,
    fontFamily: font_description,
  },
  value: {
    fontSize: 18,
    color: colors.theme_fg_two,
    fontFamily: font_description,
  },
});
