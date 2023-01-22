import React, { Component } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  Image,
  View,
  Linking,
  TouchableOpacity,
  FlatList,
  PermissionsAndroid,
  Platform,
  BackHandler,
  Alert,
} from "react-native";
import * as colors from "../assets/css/Colors";
import {
  GOOGLE_KEY,
  font_title,
  font_description,
  api_url,
  alert_close_timing,
  ride_list,
  cancel_ride,
  sos_sms,
  LATITUDE_DELTA,
  LONGITUDE_DELTA,
  img_url,
  trip_cancel,
  warning,
  show_cancellation_policy,
  get_tips,
  add_tip,
} from "../config/Constants";
import DropdownAlert from "react-native-dropdownalert";
import MapView, { PROVIDER_GOOGLE, AnimatedRegion } from "react-native-maps";
import { Badge, Divider } from "react-native-elements";
import PolylineDirection from "@react-native-maps/polyline-direction";
import Dialog, {
  DialogTitle,
  SlideAnimation,
  DialogContent,
  DialogFooter,
  DialogButton,
} from "react-native-popup-dialog";
import axios from "axios";
import database from "@react-native-firebase/database";
import { connect } from "react-redux";
import {
  serviceActionPending,
  serviceActionError,
  serviceActionSuccess,
} from "../actions/RideActions";
import Loader from "../components/Loader";
import {
  pickupAddress,
  pickupLat,
  pickupLng,
  dropAddress,
  dropLat,
  dropLng,
  km,
} from "../actions/BookingActions";
import { CommonActions } from "@react-navigation/native";
import Geolocation from "@react-native-community/geolocation";
import strings from "../languages/strings.js";
import Polyline from "@mapbox/polyline";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon, { Icons } from "../components/Icons";
import Modal from "react-native-modal";
import { ScrollView } from "react-native-gesture-handler";

class Ride extends Component<Props> {
  constructor(props) {
    super(props);
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.trip_cancel = this.trip_cancel.bind(this);
    this.state = {
      coords: [],
      isDialogVisible: false,
      trip_id: this.props.route.params.trip_id,
      booking_id: "",
      markers: [],
      coordinate: new AnimatedRegion({
        latitude: 9.914372,
        longitude: 78.155033,
      }),
      marker: {
        latitude: 0,
        longitude: 0,
      },
      home_marker: {
        latitude: 0,
        longitude: 0,
      },
      destination_marker: {
        latitude: 0,
        longitude: 0,
      },
      status: 0,
      bearing: 0,
      cancellation_policy: {
        description: "",
        description_ar: "",
      },
      sync: undefined,
      isLoading: false,
      polyline_coordinates: [],
      tips: [],
      isModalVisible: false,
      tip: 1,
      live_location: {
        latitude: 0,
        longitude: 0,
      },
      _isMounted: false,
      msg_state: 0,
      arrival_time: "Not updated",
    };
    this.booking_sync();
    this.ride_list();
    this.cancel_ride();
    this.getDirections();
    this.get_cancellation_policy();
    this.get_tips_list();
  }

  send_sos = async () => {
    Alert.alert(
      strings.please_confirm,
      strings.are_you_in_emergency,
      [
        {
          text: strings.yes,
          onPress: () => this.get_location(),
        },
        {
          text: strings.no,
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
      ],
      { cancelable: false }
    );
  };

  toggleModal = () => {
    this.setState({ isModalVisible: !this.state.isModalVisible });
  };

  get_location = async () => {
    if (Platform.OS == "android") {
      await this.requestCameraPermission();
    } else {
      await this.getInitialLocation();
    }
  };

  async requestCameraPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: strings.location_access_required,
          message:
            { app_name } + strings.needs_to_Access_your_location_for_tracking,
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        await this.getInitialLocation();
      } else {
        alert(strings.sorry_cannot_fetch_your_location);
      }
    } catch (err) {
      alert(strings.sorry_cannot_fetch_your_location);
    }
  }

  send_sos_alert = async (lat, lng) => {
    this.setState({ isLoading: true });
    await axios({
      method: "post",
      url: api_url + sos_sms,
      data: {
        customer_id: global.id,
        booking_id: this.state.trip_id,
        latitude: lat,
        longitude: lng,
        lang: global.lang,
      },
    })
      .then(async (response) => {
        this.setState({ isLoading: false });
        if (response.data.status == 1) {
          alert(response.data.message);
        } else {
          Alert.alert(
            strings.alert,
            response.data.message,
            [
              {
                text: strings.okay,
                onPress: () => this.add_sos(),
              },
              {
                text: strings.cancel,
                onPress: () => console.log("Cancel Pressed"),
                style: "cancel",
              },
            ],
            { cancelable: false }
          );
        }
      })
      .catch((error) => {
        if (global.mode == "DEMO") {
          alert("SOS activated");
        } else {
          alert(strings.sorry_something_went_wrong);
        }
        this.setState({ isLoading: false });
      });
  };

  async getInitialLocation() {
    Geolocation.getCurrentPosition(
      async (position) => {
        let region = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        this.send_sos_alert(
          position.coords.latitude,
          position.coords.longitude
        );
      },
      (error) => console.log(error),
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }

  booking_sync = () => {
    database()
      .ref(`/trips/${this.state.trip_id}`)
      .on("value", (snapshot) => {
        console.log("Ridejs", snapshot);

        this.setState({ sync: snapshot.val() });
        if (snapshot.val().status == 7) {
          this.home();
        }

        let marker = {
          latitude: parseFloat(snapshot.val().driver_lat),
          longitude: parseFloat(snapshot.val().driver_lng),
        };
        this.animate(marker);
        this.setState({ live_location: marker });

        let markers = [];

        this.setState({
          status: snapshot.val().status,
          home_marker: this.createMarker(
            parseFloat(snapshot.val().pickup_lat),
            parseFloat(snapshot.val().pickup_lng)
          ),
          destination_marker: this.createMarker(
            parseFloat(snapshot.val().drop_lat),
            parseFloat(snapshot.val().drop_lng)
          ),
          bearing: snapshot.val().bearing,
        });

        if (snapshot.val().status == 4) {
          this.props.navigation.navigate("Rating", { data: snapshot.val() });
        }
      });

    database()
      .ref(`/chat/${this.state.trip_id}`)
      .limitToLast(1)
      .on("child_added", (snapshot) => {
        if (this.state._isMounted) {
          const { text, user } = snapshot.val();
          const { key: _id } = snapshot;
          const message = { _id, text, user };

          if (this.state.msg_state == 1) {
            this.show_message(message.text);
          }
        }
      });
  };

  createMarker(lat, lng) {
    return {
      latitude: lat,
      longitude: lng,
    };
  }

  ride_list = async () => {
    this.props.serviceActionPending();
    await axios({
      method: "post",
      url: api_url + ride_list,
      data: { country_id: global.country_id, customer_id: global.id },
    })
      .then(async (response) => {
        await this.props.serviceActionSuccess(response.data);
      })
      .catch((error) => {
        this.props.serviceActionError(error);
      });
  };

  async getDirections() {
    if (this.state.sync.status < 2) {
      try {
        let resp = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${
            this.state.home_marker.latitude +
            "," +
            this.state.home_marker.longitude
          }&destination=${
            this.state.live_location.latitude +
            "," +
            this.state.live_location.longitude
          }&mode=${"driving"}&key=${GOOGLE_KEY}`
        );
        let respJson = await resp.json();
        let points = Polyline.decode(
          respJson.routes[0].overview_polyline.points
        );

        let coords = points.map((point, index) => {
          return {
            latitude: point[0],
            longitude: point[1],
          };
        });
        this.setState({
          coords: coords,
          arrival_time: respJson.routes[0].legs[0].duration.text,
        });
        return coords;
      } catch (error) {
        return error;
      }
    }
  }

  trip_cancel = async (reason_id) => {
    this.setState({ isDialogVisible: false, isLoading: true });
    await axios({
      method: "post",
      url: api_url + trip_cancel,
      data: {
        reason_id: reason_id,
        trip_id: this.state.trip_id,
        status: 6,
        cancelled_by: 1,
      },
    })
      .then(async (response) => {
        this.setState({ isLoading: false });
        if (response.data.status == 1) {
          this.home();
        }
      })
      .catch((error) => {
        this.setState({ isLoading: false });
        alert(strings.sorry_something_went_wrong);
      });
  };

  get_cancellation_policy = async () => {
    await axios({
      method: "post",
      url: api_url + show_cancellation_policy,
      data: { country_id: global.country_id },
    })
      .then(async (response) => {
        this.setState({ isLoading: false });
        this.setState({ cancellation_policy: response.data.result });
      })
      .catch((error) => {
        this.setState({ isLoading: false });
        alert(strings.sorry_something_went_wrong);
      });
  };

  get_tips_list = async () => {
    await axios({
      method: "post",
      url: api_url + get_tips,
      data: { country_id: global.country_id, trip_id: this.state.trip_id },
    })
      .then(async (response) => {
        this.setState({
          tip: response.data.result["tip"],
          tips: response.data.result["data"],
        });
      })
      .catch((error) => {
        alert(strings.sorry_something_went_wrong);
      });
  };

  add_tip_to_driver = async (tip) => {
    this.setState({ isLoading: true });
    await axios({
      method: "post",
      url: api_url + add_tip,
      data: { trip_id: this.state.trip_id, tip: tip },
    })
      .then(async (response) => {
        this.setState({ isLoading: false });
        if (response.data.status == 1) {
          alert(strings.your_tip_added_successfully);
          this.setState({ tip: tip });
        }
      })
      .catch((error) => {
        this.setState({ isLoading: false });
        alert(strings.sorry_something_went_wrong);
      });
  };

  home = () => {
    this.props.navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Home" }],
      })
    );
  };

  componentWillMount() {
    BackHandler.addEventListener(
      "hardwareBackPress",
      this.handleBackButtonClick
    );
  }

  componentWillUnmount() {
    this._unsubscribe();
    this.setState({ _isMounted: false });
    BackHandler.removeEventListener(
      "hardwareBackPress",
      this.handleBackButtonClick
    );
  }

  componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener("focus", () => {
      this.setState({ _isMounted: true });
    });
    setTimeout(() => {
      this.setState({ msg_state: 1 });
    }, 1000);
    this.timer = setInterval(() => this.getDirections(), 30000);
    BackHandler.addEventListener(
      "hardwareBackPress",
      this.handleBackButtonClick
    );
  }

  handleBackButtonClick = async () => {
    this.setState({ isDialogVisible: false });
    return true;
  };

  cancel_ride = async () => {
    await axios({
      method: "post",
      url: api_url + cancel_ride,
      data: { lang: global.lang, type: 1 },
    })
      .then(async (response) => {
        this.setState({ data: response.data.result });
      })
      .catch((error) => {
        alert(strings.sorry_something_went_wrong);
      });
  };

  cancel_update = () => {
    this.setState({ isDialogVisible: false });
  };

  rating() {
    this.props.navigation.navigate("Rating", { data: this.state.sync });
  }

  open_dialog() {
    this.toggleModal();
    this.setState({ isDialogVisible: true });
  }

  getCoordinates(region) {
    return [
      {
        longitude: region.longitude,
        latitude: region.latitude,
      },
    ];
  }

  show_alert(message) {
    this.dropDownAlertRef.alertWithType("error", "Error", message);
  }

  show_message(message) {
    this.dropDownAlertRef.alertWithType("success", "New Message", message);
  }

  add_sos() {
    this.props.navigation.navigate("AddSosSettings");
  }

  chat = async () => {
    this.setState({ _isMounted: false });
    await this.props.navigation.navigate("Chat", {
      trip_id: this.state.trip_id,
      driver_name: this.state.sync.driver_name,
    });
  };

  animate(nextProps) {
    const duration = 500;

    if (this.state.marker !== nextProps) {
      if (Platform.OS === "android") {
        if (this.marker) {
          this.marker.animateMarkerToCoordinate(nextProps, duration);
        }
      } else {
        this.state.coordinate
          .timing({
            ...nextProps,
            duration,
          })
          .start();
      }
    }
  }

  call_driver = () => {
    Linking.openURL(`tel:${this.state.sync.driver_phone_number}`);
  };

  render() {
    const { isLoding, error, data, message, status } = this.props;
    return (
      <SafeAreaView>
        <Loader visible={this.state.isLoading} />
        <View androidStatusBarColor={colors.theme_bg} style={styles.header}>
          <View style={styles.flex_1}></View>
          <View style={styles.header_body}>
            {this.state.sync && (
              <Text style={styles.title}>
                {this.state.sync.customer_status_name}
              </Text>
            )}
          </View>
          <View style={{ alignItems: "flex-end", justifyContent: "center" }} />
        </View>
        {this.state.sync && (
          <View style={styles.container}>
            <MapView
              provider={PROVIDER_GOOGLE}
              ref={(ref) => (this.mapRef = ref)}
              style={styles.map}
              initialRegion={{
                latitude: parseFloat(this.state.sync.pickup_lat),
                longitude: parseFloat(this.state.sync.pickup_lng),
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA,
              }}
            >
              {this.state.status <= 2 && (
                <MapView.Marker coordinate={this.state.home_marker}>
                  <Image
                    style={{ flex: 1, height: 30, width: 25 }}
                    source={require(".././assets/img/from_location_pin.png")}
                  />
                </MapView.Marker>
              )}
              {this.state.status >= 2 && (
                <MapView.Marker coordinate={this.state.destination_marker}>
                  <Image
                    style={{ flex: 1, height: 30, width: 25 }}
                    source={require(".././assets/img/to_location_pin.png")}
                  />
                </MapView.Marker>
              )}
              <MapView.Marker.Animated
                ref={(marker) => {
                  this.marker = marker;
                }}
                rotation={this.state.bearing}
                coordinate={
                  Platform.OS === "ios"
                    ? this.state.coordinate
                    : this.state.marker
                }
                identifier={"mk1"}
              >
                {this.state.sync.trip_type <= 3 && (
                  <Image
                    style={{ width: 14, height: 27 }}
                    source={require(".././assets/img/car.png")}
                  />
                )}
                {this.state.sync.trip_type == 4 && (
                  <Image
                    style={{ width: 14, height: 27 }}
                    source={require(".././assets/img/truck.png")}
                  />
                )}
              </MapView.Marker.Animated>
              {global.polyline_status == 1 && (
                <PolylineDirection
                  origin={
                    this.state.status <= 2
                      ? this.state.home_marker
                      : this.state.destination_marker
                  }
                  destination={this.state.live_location}
                  apiKey={GOOGLE_KEY}
                  mode="driving"
                  resetOnChange={true}
                  strokeWidth={4}
                  strokeColor={colors.theme_fg}
                />
              )}
            </MapView>
            <View style={styles.address}>
              <View style={{ flex: 1, flexDirection: "column", padding: 10 }}>
                <View style={{ flexDirection: "row" }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingLeft: 10,
                      width: "80%",
                    }}
                  >
                    <Badge status="success" />
                    <View style={{ marginLeft: 10 }} />
                    <Text style={styles.location} note numberOfLines={1}>
                      {this.state.sync.pickup_address}
                    </Text>
                  </View>
                </View>
                <View style={{ margin: 5 }} />
                <View style={{ flexDirection: "row" }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingLeft: 10,
                      width: "80%",
                    }}
                  >
                    <Badge status="error" />
                    <View style={{ marginLeft: 10 }} />
                    <Text style={styles.location} note numberOfLines={1}>
                      {this.state.sync.drop_address}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.footer}>
              {this.state.sync.status < 2 && (
                <View
                  style={{
                    backgroundColor: "grey",
                    padding: 5,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.theme_fg_three,
                      fontFamily: font_description,
                    }}
                  >
                    Arriving in ~ {this.state.arrival_time}
                  </Text>
                </View>
              )}
              <View style={{ flex: 1, flexDirection: "column", padding: 10 }}>
                {this.state.sync.status < 3 && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={styles.booking}>
                      OTP : {this.state.sync.otp}
                    </Text>
                  </View>
                )}
                {this.state.sync.status < 3 && (
                  <Divider style={styles.default_divider} />
                )}
                {this.state.sync.status < 3 && (
                  <View style={{ flexDirection: "row" }}>
                    <View
                      style={{
                        alignItems: "center",
                        justifyContent: "center",
                        width: "49%",
                        padding: 10,
                        flexDirection: "column",
                      }}
                    >
                      <View style={{ flexDirection: "row" }}>
                        <View
                          style={{
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "column",
                          }}
                        >
                          <Image
                            style={{ width: 50, height: 50 }}
                            source={{
                              uri: img_url + this.state.sync.vehicle_image,
                            }}
                          />
                        </View>
                        <View
                          style={{
                            alignItems: "flex-start",
                            justifyContent: "center",
                            flexDirection: "column",
                          }}
                        >
                          {global.lang == "en" ? (
                            <Text style={styles.cab_no}>
                              {this.state.sync.vehicle_color}{" "}
                              {this.state.sync.vehicle_name}
                            </Text>
                          ) : (
                            <Text style={styles.cab_no}>
                              {this.state.sync.vehicle_color}{" "}
                              {this.state.sync.vehicle_name_ar}
                            </Text>
                          )}
                          <Text style={styles.cab_no}>
                            {this.state.sync.vehicle_number}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View
                      style={{
                        alignItems: "center",
                        justifyContent: "center",
                        width: "49%",
                        padding: 10,
                        flexDirection: "column",
                      }}
                    >
                      <View style={{ flexDirection: "row" }}>
                        <View
                          style={{
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "column",
                            width: "60%",
                          }}
                        >
                          <Text style={styles.cab_no}>
                            {this.state.sync.driver_name}
                          </Text>
                          <Text style={styles.cab_no}>
                            #{this.state.sync.trip_id}
                          </Text>
                        </View>
                        <View
                          style={{
                            alignItems: "flex-end",
                            justifyContent: "center",
                            flexDirection: "column",
                            width: "40%",
                          }}
                        >
                          <Image
                            style={{ width: 50, height: 50, borderRadius: 25 }}
                            source={{
                              uri:
                                img_url +
                                this.state.sync.driver_profile_picture,
                            }}
                          />
                        </View>
                      </View>
                    </View>
                  </View>
                )}
                {this.state.sync.status >= 3 && (
                  <View>
                    {this.state.tip == 0 && (
                      <View style={{ padding: 10 }}>
                        <Text
                          style={{
                            color: colors.theme_fg_two,
                            fontSize: 20,
                            fontFamily: font_title,
                          }}
                        >
                          Add a tip for your driver
                        </Text>
                        <View style={{ margin: 2 }} />
                        <Text
                          style={{
                            color: colors.theme_fg_two,
                            fontSize: 14,
                            fontFamily: font_description,
                          }}
                        >
                          The entire amount will be transferred to the rider.
                          Valid only if you pay online.
                        </Text>
                        <View style={{ margin: 5 }} />
                        <ScrollView
                          horizontal={true}
                          showsHorizontalScrollIndicator={false}
                        >
                          <View style={{ flexDirection: "row" }}>
                            {this.state.tips.map((row, index) => (
                              <TouchableOpacity
                                onPress={this.add_tip_to_driver.bind(this, row)}
                                style={{
                                  width: 60,
                                  margin: 5,
                                  height: 35,
                                  borderRadius: 10,
                                  borderColor: colors.theme_fg,
                                  borderWidth: 1,
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Text
                                  style={{
                                    color: colors.theme_fg_two,
                                    fontSize: 14,
                                    fontFamily: font_title,
                                  }}
                                >
                                  +{global.currency}
                                  {row}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </ScrollView>
                      </View>
                    )}
                    <TouchableOpacity
                      style={{
                        borderRadius: 10,
                        backgroundColor: colors.theme_fg,
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 10,
                      }}
                      activeOpacity={1}
                      onPress={this.send_sos.bind(this)}
                    >
                      <Text
                        style={{
                          color: colors.theme_fg_three,
                          fontFamily: font_title,
                          fontSize: 14,
                        }}
                      >
                        {strings.sos}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
                {this.state.sync.status < 3 && (
                  <Divider style={styles.default_divider} />
                )}
                {this.state.sync.status < 3 && (
                  <View style={{ flexDirection: "row", width: "100%" }}>
                    <View style={{ width: "30%", alignItems: "center" }}>
                      <TouchableOpacity
                        activeOpacity={1}
                        onPress={this.toggleModal.bind(this)}
                        activeOpacity={1}
                        style={{
                          paddingLeft: 5,
                          paddingRight: 5,
                          justifyContent: "center",
                          flexDirection: "row",
                        }}
                      >
                        <Icon
                          type={Icons.Ionicons}
                          style={{ color: colors.theme_fg, fontSize: 22 }}
                          name="close"
                        />
                        <View style={{ margin: 5 }} />
                        <Text style={styles.cancel}>{strings.cancel}</Text>
                      </TouchableOpacity>
                    </View>
                    <View
                      style={{
                        width: "2%",
                        borderLeftWidth: 1,
                        height: 20,
                        borderColor: colors.theme_fg_four,
                      }}
                    />
                    <View style={{ width: "30%", alignItems: "center" }}>
                      {this.state.sync.trip_type != 5 && (
                        <TouchableOpacity
                          activeOpacity={1}
                          onPress={this.chat.bind(this)}
                          activeOpacity={1}
                          style={{
                            paddingLeft: 5,
                            flexDirection: "row",
                            paddingRight: 5,
                            justifyContent: "center",
                          }}
                        >
                          <Icon
                            type={Icons.Ionicons}
                            style={{ color: colors.theme_fg, fontSize: 22 }}
                            name="chatbubble-ellipses-outline"
                          />
                          <View style={{ margin: 5 }} />
                          <Text style={styles.cancel}>{strings.chat}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <View
                      style={{
                        width: "2%",
                        borderLeftWidth: 1,
                        height: 20,
                        borderColor: colors.theme_fg_four,
                      }}
                    />
                    <View
                      style={{
                        width: "30%",
                        alignItems: "center",
                        flexDirection: "column",
                      }}
                    >
                      <TouchableOpacity
                        activeOpacity={1}
                        onPress={this.call_driver.bind(this)}
                        activeOpacity={1}
                        style={{
                          paddingLeft: 5,
                          flexDirection: "row",
                          paddingRight: 5,
                          justifyContent: "center",
                        }}
                      >
                        <Icon
                          type={Icons.Ionicons}
                          style={{ color: colors.theme_fg, fontSize: 20 }}
                          name="call"
                        />
                        <View style={{ margin: 5 }} />
                        <Text style={styles.call_driver}>{strings.call}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}
        <Dialog
          visible={this.state.isDialogVisible}
          width="90%"
          animationDuration={100}
          dialogTitle={<DialogTitle title={strings.please_select_reason} />}
          dialogAnimation={
            new SlideAnimation({
              slideFrom: "bottom",
            })
          }
          footer={
            <DialogFooter>
              <DialogButton
                text={strings.CLOSE}
                textStyle={{
                  fontSize: 16,
                  color: colors.theme_fg_two,
                  fontFamily: font_description,
                }}
                onPress={() => {
                  this.setState({ isDialogVisible: false });
                }}
              />
            </DialogFooter>
          }
          onTouchOutside={() => {
            this.setState({ isDialogVisible: false });
          }}
        >
          <DialogContent>
            <FlatList
              data={this.state.data}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  onPress={this.trip_cancel.bind(this, item.id)}
                >
                  <View style={{ padding: 10 }}>
                    <Text style={styles.font}>{item.reason}</Text>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
            />
          </DialogContent>
        </Dialog>
        <Modal
          isVisible={this.state.isModalVisible}
          onBackButtonPress={this.toggleModal}
          style={{ backgroundColor: colors.theme_bg_three }}
        >
          <ScrollView>
            <View style={{ flex: 1 }}>
              <View style={{ margin: 10 }} />
              <Text
                style={{
                  fontFamily: font_title,
                  fontSize: 18,
                  color: colors.theme_fg_two,
                  alignSelf: "center",
                }}
              >
                Warning!!
              </Text>
              <View style={{ margin: 10 }} />
              <Image
                source={warning}
                style={{ width: 100, height: 100, alignSelf: "center" }}
              />
              <View style={{ padding: 20 }}>
                {global.lang == "en" ? (
                  <Text
                    style={{
                      color: colors.gray,
                      fontFamily: font_description,
                      fontSize: 12,
                    }}
                  >
                    {this.state.cancellation_policy.description}
                  </Text>
                ) : (
                  <Text
                    style={{
                      color: colors.gray,
                      fontFamily: font_description,
                      fontSize: 12,
                    }}
                  >
                    {this.state.cancellation_policy.description_ar}
                  </Text>
                )}
              </View>
              <View style={{ margin: 10 }} />
              <TouchableOpacity
                activeOpacity={1}
                onPress={this.open_dialog.bind(this)}
                style={{
                  width: 150,
                  backgroundColor: colors.green,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 5,
                  height: 40,
                  alignSelf: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: font_title,
                    fontSize: 15,
                    color: colors.theme_fg_three,
                  }}
                >
                  Okay
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ margin: 10 }} />
          </ScrollView>
        </Modal>
        <DropdownAlert
          ref={(ref) => (this.dropDownAlertRef = ref)}
          closeInterval={alert_close_timing}
        />
      </SafeAreaView>
    );
  }
}

function mapStateToProps(state) {
  return {
    isLoding: state.ride.isLoding,
    error: state.ride.error,
    data: state.ride.data,
    message: state.ride.message,
    status: state.ride.status,
  };
}

const mapDispatchToProps = (dispatch) => ({
  serviceActionPending: () => dispatch(serviceActionPending()),
  serviceActionError: (error) => dispatch(serviceActionError(error)),
  serviceActionSuccess: (data) => dispatch(serviceActionSuccess(data)),
  pickupAddress: (data) => dispatch(pickupAddress(data)),
  pickupLat: (data) => dispatch(pickupLat(data)),
  pickupLng: (data) => dispatch(pickupLng(data)),
  dropAddress: (data) => dispatch(dropAddress(data)),
  dropLat: (data) => dispatch(dropLat(data)),
  dropLng: (data) => dispatch(dropLng(data)),
  km: (data) => dispatch(km(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Ride);

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.theme_bg,
  },
  icon: {
    color: colors.theme_fg_three,
  },
  flex_1: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  header_body: {
    flex: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: colors.theme_fg_three,
    alignSelf: "center",
    fontSize: 20,
    fontFamily: font_title,
  },
  container: {},
  map: {
    width: "100%",
    height: "100%",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: colors.theme_bg_three,
  },
  address: {
    position: "absolute",
    top: 0,
    width: "100%",
    backgroundColor: colors.theme_bg_three,
  },
  default_divider: {
    marginTop: 10,
    marginBottom: 10,
  },
  location: {
    fontSize: 14,
    color: colors.theme_fg_two,
    fontFamily: font_description,
  },
  booking: {
    fontSize: 14,
    color: colors.theme_fg_two,
    fontFamily: font_description,
  },
  font: {
    fontFamily: font_description,
    color: colors.theme_fg_four,
    fontSize: 14,
  },
  cancel: {
    color: colors.theme_fg_two,
    fontFamily: font_description,
    fontSize: 14,
  },
  call_driver: {
    color: colors.theme_fg_two,
    marginLeft: 5,
    fontFamily: font_description,
    fontSize: 14,
  },
  cab_no: { fontSize: 12, color: colors.theme_fg_four, fontFamily: font_title },
});
