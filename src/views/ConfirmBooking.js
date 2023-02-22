import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  Image,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  BackHandler,
  SafeAreaView,
} from "react-native";
import * as colors from "../assets/css/Colors";
import {
  font_title,
  font_description,
  payment_methods,
  api_url,
  get_fare,
  ride_confirm,
  img_url,
  LATITUDE_DELTA,
  LONGITUDE_DELTA,
  stripe_payment,
  search_lottie,
  GOOGLE_KEY,
  trip_request_cancel,
} from "../config/Constants";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { Button, Badge, Divider } from "react-native-elements";
import RBSheet from "react-native-raw-bottom-sheet";
import axios from "axios";
import Dialog, {
  DialogTitle,
  SlideAnimation,
  DialogContent,
  DialogFooter,
  DialogButton,
} from "react-native-popup-dialog";
import {
  pickupAddress,
  pickupLat,
  pickupLng,
  dropAddress,
  dropLat,
  dropLng,
  km,
  reset,
} from "../actions/BookingActions";
import { connect } from "react-redux";
import Loader from "../components/Loader";
import stripe from "tipsi-stripe";
import RazorpayCheckout from "react-native-razorpay";
import LottieView from "lottie-react-native";
import DateTimePicker from "react-native-modal-datetime-picker";
import { CommonActions } from "@react-navigation/native";
import database from "@react-native-firebase/database";
import strings from "../languages/strings.js";
import PolylineDirection from "@react-native-maps/polyline-direction";
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const EDGE_PADDING = {
  top: 200,
  right: 100,
  bottom: 200,
  left: 100,
};
import Icon, { Icons } from "../components/Icons";
class ConfirmBooking extends Component<Props> {
  constructor(props) {
    super(props);
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state = {
      isDialogVisible: false,
      markers: [
        this.createMarker(this.props.pickup_lat, this.props.pickup_lng),
        this.createMarker(this.props.drop_lat, this.props.drop_lng),
      ],
      payment_methods: [],
      vehicle_type: this.props.route.params.vehicle_type,
      filter: this.props.route.params.filter,
      trip_type: this.props.route.params.trip_type,
      total_fare: 0,
      discount: 0,
      tax: 0,
      base_fare: 0,
      price_per_km: 0,
      price_per_m: 0,
      payment_method: 0,
      payment_name: "Setup Payment",
      isLoading: false,
      confirm_status: 0,
      payment_type: 1,
      isLoaderVisible: false,
      show_time: "",
      deliveryDatePickerVisible: false,
      trip_request_id: 0,
      cancel_status: 0,
      zone_id: this.props.route.params.zone_id,
    };
    this.get_payment_methods();
    this.booking_sync();
    this.default_date(new Date());
  }

  default_date = async (currentdate) => {
    var datetime =
      (await (currentdate.getDate() < 10 ? "0" : "")) +
      currentdate.getDate() +
      "-" +
      (currentdate.getMonth() + 1 < 10 ? "0" : "") +
      (currentdate.getMonth() + 1) +
      "-" +
      currentdate.getFullYear() +
      " " +
      (currentdate.getHours() < 10 ? "0" : "") +
      currentdate.getHours() +
      ":" +
      (currentdate.getMinutes() < 10 ? "0" : "") +
      currentdate.getMinutes() +
      ":" +
      (currentdate.getSeconds() < 10 ? "0" : "") +
      currentdate.getSeconds();
    var show_time =
      (await (currentdate.getDate() < 10 ? "0" : "")) +
      currentdate.getDate() +
      " " +
      monthNames[currentdate.getMonth()] +
      ", " +
      this.formatAMPM(currentdate);

    this.setState({ pickup_date: datetime, show_time: show_time });
  };

  showDeliveryDatePicker = () => {
    this.setState({ deliveryDatePickerVisible: true });
  };

  hideDeliveryDatePicker = () => {
    this.setState({ deliveryDatePickerVisible: false });
  };

  handleDeliveryDatePicked = async (date) => {
    this.setState({ deliveryDatePickerVisible: false });
    this.default_date(new Date(date));
  };

  formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var strTime = hours + ":" + minutes + " " + ampm;
    return strTime;
  }

  booking_sync = () => {
    database()
      .ref("/customers/" + global.id)
      .on("value", (snapshot) => {
        if (
          snapshot.val() != null &&
          snapshot.val().booking_status == 1 &&
          this.state.confirm_status == 1
        ) {
          this.setState({ isLoaderVisible: true });
        } else if (
          snapshot.val() != null &&
          snapshot.val().booking_status == 0 &&
          this.state.confirm_status == 1
        ) {
          this.setState({ confirm_status: 0, isLoaderVisible: false });
          alert(strings.sorry_drivers_not_available_right_now_please_try_again);
        } else if (
          snapshot.val() != null &&
          snapshot.val().booking_status == 2 &&
          this.state.confirm_status == 1
        ) {
          this.setState({
            confirm_status: 0,
            isLoaderVisible: false,
            trip_request_id: 0,
          });
          this.props.reset();
          this.props.navigation.navigate("Ride", {
            trip_id: snapshot.val().booking_id,
          });
        }
      });
  };

  get_fare = async () => {
    this.setState({ isLoading: true });
    await axios({
      method: "post",
      url: api_url + get_fare,
      data: {
        country_id: global.country_id,
        km: this.props.kms.slice(0, this.props.kms.length - 2),
        promo: this.props.promo,
        vehicle_type: this.state.vehicle_type,
        trip_type: this.state.trip_type,
        days: 1,
        package_id: this.props.package_id,
        lang: global.lang,
        trip_sub_type: this.props.trip_sub_type,
        surge: 1,
      },
    })
      .then(async (response) => {
        console.log("fares", response?.data?.result);
        this.setState({ isLoading: false });
        if (response.data.status == 1) {
          this.setState({
            base_fare: response.data.result.fare,
            price_per_km: response.data?.result?.price_per_km,
            price_per_m: response?.data?.result?.price_per_m,
            discount: response.data.result.discount,
            tax: response.data.result.tax,
            total_fare: response.data.result.total_fare,
          });
        }
      })
      .catch((error) => {
        this.setState({ isLoading: false });
        alert(strings.sorry_something_went_wrong);
      });
  };

  get_payment_methods = async () => {
    await axios({
      method: "post",
      url: api_url + payment_methods,
      data: { country_id: global.country_id, lang: global.lang },
    })
      .then(async (response) => {
        console.log("paymentmethod", response?.data);
        this.setState({ payment_methods: response.data.result });
        this.select_payment(response.data.result[0]);
      })
      .catch((error) => {
        alert(strings.sorry_something_went_wrong);
      });
  };

  onRegionChange = async (value) => {
    fetch(
      "https://maps.googleapis.com/maps/api/geocode/json?address=" +
        value.latitude +
        "," +
        value.longitude +
        "&key=" +
        GOOGLE_KEY
    )
      .then((response) => response.json())
      .then(async (responseJson) => {
        if (responseJson.results[0].formatted_address != undefined) {
          if (this.state.active_location == "FROM_LOCATION") {
            this.props.pickupAddress(responseJson.results[0].formatted_address);
            this.props.pickupLat(value.latitude);
            this.props.pickupLng(value.longitude);
          } else {
            this.props.dropAddress(responseJson.results[0].formatted_address);
            this.props.dropLat(value.latitude);
            this.props.dropLng(value.longitude);
          }
          this.get_distance();
          this.find_city(responseJson.results[0]);
        }
      });
  };

  ride_confirm = async () => {
    console.log({
      country_id: global.country_id,
      km: this.props.kms.slice(0, this.props.kms.length - 2),
      promo: this.props.promo,
      vehicle_type: this.state.vehicle_type,
      payment_method: this.state.payment_method,
      customer_id: global.id,
      trip_type: this.state.trip_type,
      pickup_address: this.props.pickup_address,
      pickup_date: this.state.pickup_date,
      pickup_lat: this.props.pickup_lat,
      pickup_lng: this.props.pickup_lng,
      drop_address: this.props.drop_address,
      drop_lat: this.props.drop_lat,
      drop_lng: this.props.drop_lng,
      filter: this.state.filter,
      package_id: this.props.package_id,
      trip_sub_type: this.props.trip_sub_type,
      stops: JSON.stringify(this.props.stops),
      zone: this.state.zone_id,
    });
    this.setState({ isLoading: true });
    await axios({
      method: "post",
      url: api_url + ride_confirm,
      data: {
        country_id: global.country_id,
        km: this.props.kms.slice(0, this.props.kms.length - 2),
        promo: this.props.promo,
        vehicle_type: this.state.vehicle_type,
        payment_method: this.state.payment_method,
        customer_id: global.id,
        trip_type: this.state.trip_type,
        pickup_address: this.props.pickup_address,
        pickup_date: this.state.pickup_date,
        pickup_lat: this.props.pickup_lat,
        pickup_lng: this.props.pickup_lng,
        drop_address: this.props.drop_address,
        drop_lat: this.props.drop_lat,
        drop_lng: this.props.drop_lng,
        filter: this.state.filter,
        package_id: this.props.package_id,
        trip_sub_type: this.props.trip_sub_type,
        stops: JSON.stringify(this.props.stops),
        zone: this.state.zone_id,
        surge: 0,
      },
    })
      .then(async (response) => {
        this.setState({ isLoading: false });
        console.log("sss", response?.data);
        if (response.data.status == 1) {
          if (response.data.booking_type == 1) {
            this.setState({
              confirm_status: 1,
              trip_request_id: response.data.result,
            });
            this.booking_sync();
          } else {
            Alert.alert(
              strings.success,
              strings.your_scheduled_booking_is_registered_please_wait_our_driver_will_contact_you_soon,
              [{ text: strings.ok, onPress: () => this.home() }],
              { cancelable: false }
            );
          }
        } else {
          alert(strings.sorry_drivers_not_available_right_now_please_try_again);
          this.setState({ confirm_status: 0 });
        }
      })
      .catch((error) => {
        console.log(error?.response);
        this.setState({ isLoading: false });
      });
  };

  async home() {
    this.props.navigation.goBack(null);
  }

  createMarker(lat, lng) {
    return {
      latitude: lat,
      longitude: lng,
    };
  }

  componentWillMount = async () => {
    await this.setState({ isDialogVisible: false });
    await BackHandler.addEventListener(
      "hardwareBackPress",
      this.handleBackButtonClick
    );
  };

  componentWillUnmount() {
    BackHandler.removeEventListener(
      "hardwareBackPress",
      this.handleBackButtonClick
    );
  }

  handleBackButtonClick = async () => {
    if (this.state.trip_request_id == 0) {
      await this.props.navigation.goBack(null);
    } else {
      await this.cancel_request();
      await this.props.navigation.goBack(null);
    }
  };

  booking_request = () => {
    this.props.navigation.navigate("Ride");
  };

  choose_payment = () => {
    this.RBSheet.open();
  };

  open_dialog() {
    this.setState({ isDialogVisible: true });
  }

  change_vehicle(id) {
    this.setState({ active_vehicle: id });
  }

  async componentDidMount() {
    let options = {
      edgePadding: EDGE_PADDING,
      animated: true,
    };
    setTimeout(() => {
      this.mapRef.fitToCoordinates(this.state.markers, options);
    }, 200);

    this._unsubscribe = this.props.navigation.addListener("focus", () => {
      this.get_fare();
    });
  }

  componentWillUnmount() {
    this._unsubscribe();
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

  apply_promo() {
    this.props.navigation.navigate("Promo", {
      total_fare: this.state.total_fare,
    });
  }

  select_payment = (item) => {
    this.setState({
      payment_method: item.id,
      payment_name: item.payment,
      payment_type: item.payment_type,
    });
    this.RBSheet.close();
  };

  payment_done = async () => {
    if (this.state.payment_method != 0) {
      if (this.state.payment_type == 1) {
        this.ride_confirm();
      } else if (this.state.payment_type == 2) {
        await this.stripe_card();
      } else if (this.state.payment_type == 5) {
        await this.razorpay();
      }
    } else {
      alert(strings.please_select_payment_method);
    }
  };

  razorpay = async () => {
    var options = {
      currency: global.currency_short_code,
      key: global.razorpay_key,
      amount: this.state.total_fare * 100,
      name: "BookFast",
      prefill: {
        email: global.email,
        contact: global.phone_with_code,
        name: global.first_name,
      },
      theme: { color: colors.theme_fg },
    };
    RazorpayCheckout.open(options)
      .then((data) => {
        this.ride_confirm();
      })
      .catch((error) => {
        alert("Your transaction is declined.");
      });
  };

  /* stripe_card = async() =>{

    stripe.setOptions({
      publishableKey: global.stripe_key,
      merchantId: 'MERCHANT_ID', // Optional
      androidPayMode: 'test', // Android only
    })
    

   const response = await stripe.paymentRequestWithCardForm({
      requiredBillingAddressFields: 'full',
      prefilledInformation: {
        billingAddress: {
           name: global.first_name,
        },
      },
    });

    if(response.tokenId){
      this.stripe_payment(response.tokenId);
    }else{
      alert('Sorry something went wrong');
    }
  }

  stripe_payment = async (token) => {
    this.setState({ isLoading : true });
    await axios({
      method: 'post', 
      url: api_url + stripe_payment,
      data:{ customer_id : global.id, amount:this.state.total_fare, token: token}
    })
    .then(async response => {
      this.setState({ isLoading : false });
      this.ride_confirm();
    })
    .catch(error => {
      this.setState({ isLoading : false });
    });
  }*/

  cancel_request = async () => {
    this.setState({ isLoading: true });
    await axios({
      method: "post",
      url: api_url + trip_request_cancel,
      data: { trip_request_id: this.state.trip_request_id },
    })
      .then(async (response) => {
        this.setState({ isLoading: false });
        if (response.data.status == 1) {
          this.setState({
            isLoaderVisible: 0,
            cancel_status: 1,
            trip_request_id: 0,
          });
        }
      })
      .catch((error) => {
        this.setState({ isLoading: false });
        alert("Sorry something went wrong");
      });
  };

  render() {
    return (
      <SafeAreaView>
        <MapView
          provider={PROVIDER_GOOGLE}
          ref={(ref) => (this.mapRef = ref)}
          style={styles.map}
          initialRegion={{
            latitude: this.props.pickup_lat,
            longitude: this.props.pickup_lng,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }}
        >
          <MapView.Marker coordinate={this.state.markers[0]}>
            <Image
              style={styles.image_style}
              source={require(".././assets/img/from_location_pin.png")}
            />
          </MapView.Marker>
          {this.state.trip_type != 2 && (
            <MapView.Marker coordinate={this.state.markers[1]}>
              <Image
                style={styles.image_style}
                source={require(".././assets/img/to_location_pin.png")}
              />
            </MapView.Marker>
          )}

          {global.polyline_status == 1 && (
            <PolylineDirection
              origin={this.state.markers[0]}
              destination={this.state.markers[1]}
              apiKey={GOOGLE_KEY}
              strokeWidth={4}
              strokeColor={colors.theme_fg}
            />
          )}
        </MapView>
        <View style={styles.address}>
          <View style={styles.address_view_style}>
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
              <Text style={styles.pickup_address} note numberOfLines={1}>
                {this.props.pickup_address}
              </Text>
            </View>
            <View style={{ margin: 5 }} />
            {this.state.trip_type != 2 && (
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
                <Text style={styles.drop_address} note numberOfLines={1}>
                  {this.props.drop_address}
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.footer_style}>
          <View style={{ flex: 1, flexDirection: "column", padding: 10 }}>
            {this.state.trip_type == 5 && this.props.current_sub_id != 0 ? (
              <View>
                <Text style={styles.price}>Free Ride</Text>
              </View>
            ) : (
              <TouchableOpacity
                activeOpacity={1}
                style={{ alignItems: "center", justifyContent: "center" }}
                onPress={this.open_dialog.bind(this)}
              >
                <Text style={styles.price}>
                  {global.currency}
                  {this.state.total_fare}
                </Text>
                <Text style={styles.total}>{strings.total_fare}</Text>
              </TouchableOpacity>
            )}

            <Divider style={styles.default_divider} />
            <TouchableOpacity
              activeOpacity={1}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={this.showDeliveryDatePicker.bind(this)}
            >
              <Text style={styles.date}>
                {strings.booking_for}
                <Text style={{ color: "#3498DB" }}>{this.state.show_time}</Text>
              </Text>
            </TouchableOpacity>
            <Divider style={styles.default_divider} />
            <View style={{ flexDirection: "row" }}>
              <View style={{ width: "49%" }}>
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={this.apply_promo.bind(this)}
                  activeOpacity={1}
                  style={{
                    flexDirection: "row",
                    paddingLeft: 5,
                    paddingRight: 5,
                    justifyContent: "center",
                    padding: 5,
                  }}
                >
                  <View style={{ width: "20%" }}>
                    <Icon
                      type={Icons.Ionicons}
                      style={styles.price_icon_style}
                      name="pricetag"
                    />
                  </View>
                  <View>
                    <Text style={styles.coupon}>{strings.apply_coupon}</Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View
                style={{
                  width: "2%",
                  borderLeftWidth: 1,
                  borderColor: colors.theme_fg_four,
                }}
              />
              <View style={{ width: "49%" }}>
                <View
                  style={{
                    paddingLeft: 5,
                    paddingRight: 5,
                    justifyContent: "center",
                    padding: 5,
                    flexDirection: "row",
                  }}
                >
                  <View style={{ width: "20%", padding: 5 }}>
                    <Icon
                      type={Icons.Ionicons}
                      style={styles.card_icon_style}
                      name="card"
                    />
                  </View>
                  {this.state.trip_type == 5 &&
                  this.props.current_sub_id != 0 ? (
                    <View>
                      <Text style={styles.payment}>Subscription</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => {
                        this.choose_payment();
                      }}
                    >
                      <Text style={styles.payment}>
                        {this.state.payment_name}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={1}
            onPress={this.payment_done.bind(this)}
            style={styles.footer}
          >
            <Text style={styles.title_style}>{strings.confirm_booking}</Text>
          </TouchableOpacity>
        </View>
        <DateTimePicker
          isVisible={this.state.deliveryDatePickerVisible}
          onConfirm={this.handleDeliveryDatePicked}
          onCancel={this.hideDeliveryDatePicker}
          mode="datetime"
          date={new Date()}
          minimumDate={new Date(Date.now() + 10 * 60 * 1000)}
          is24Hour={false}
        />
        <RBSheet
          ref={(ref) => {
            this.RBSheet = ref;
          }}
          height={250}
          animationType="fade"
          duration={250}
        >
          <View style={{ flexDirection: "row" }}>
            <View style={{ alignSelf: "center" }}>
              <Text style={styles.payment_option}>
                {strings.select_a_payment_option}
              </Text>
            </View>
          </View>
          <FlatList
            data={this.state.payment_methods}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{ flexDirection: "row" }}
                onPress={this.select_payment.bind(this, item)}
              >
                <View style={{ width: "15%" }}>
                  <Image
                    style={styles.image_style_two}
                    source={{ uri: img_url + item.icon }}
                  />
                </View>
                <View>
                  <Text style={styles.font}>{item.payment}</Text>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
          />
        </RBSheet>
        <Dialog
          visible={this.state.isDialogVisible}
          width="90%"
          animationDuration={100}
          dialogTitle={<DialogTitle title={strings.fare_details} />}
          dialogAnimation={
            new SlideAnimation({
              slideFrom: "bottom",
            })
          }
          footer={
            <DialogFooter>
              <DialogButton
                text={strings.ok}
                textStyle={{
                  fontSize: 16,
                  fontFamily: font_description,
                  color: colors.theme_fg_two,
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
            <View style={{ padding: 10, flexDirection: "column" }}>
              <View style={{ flexDirection: "row", margin: 5 }}>
                <View style={{ width: "70%" }}>
                  <Text style={styles.font}>{strings.base_fare}</Text>
                </View>
                <View style={{ width: "30%" }}>
                  <Text style={styles.font}>
                    {global.currency}
                    {this.state.base_fare}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", margin: 5 }}>
                <View style={{ width: "70%" }}>
                  <Text style={styles.font}>{strings.per_km}</Text>
                </View>
                <View style={{ width: "30%" }}>
                  <Text style={styles.font}>
                    {global.currency}
                    {this.state.price_per_km}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", margin: 5 }}>
                <View style={{ width: "70%" }}>
                  <Text style={styles.font}>{strings.per_m}</Text>
                </View>
                <View style={{ width: "30%" }}>
                  <Text style={styles.font}>
                    {global.currency}
                    {this.state.price_per_km}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", margin: 5 }}>
                <View style={{ width: "70%" }}>
                  <Text style={styles.font}>{strings.tax}</Text>
                </View>
                <View style={{ width: "30%" }}>
                  <Text style={styles.font}>
                    {global.currency}
                    {this.state.tax}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", margin: 5 }}>
                <View style={{ width: "70%" }}>
                  <Text style={styles.font}>{strings.discount}</Text>
                </View>
                <View style={{ width: "30%" }}>
                  <Text style={styles.font}>
                    {global.currency}
                    {this.state.discount}
                  </Text>
                </View>
              </View>
              <Divider style={styles.default_divider} />
              <View style={{ flexDirection: "row", margin: 5 }}>
                <View style={{ width: "70%" }}>
                  <Text style={styles.tot}>{strings.total}</Text>
                </View>
                <View style={{ width: "30%" }}>
                  <Text style={styles.tot}>
                    {global.currency}
                    {this.state.total_fare}
                  </Text>
                </View>
              </View>
              <View style={{ margin: 10 }} />
              <Text style={styles.note_describ}>
                {strings.this_fare_may_be_different_from_your_actual_fare}
              </Text>
            </View>
          </DialogContent>
        </Dialog>
        <Dialog
          visible={this.state.isLoaderVisible}
          width="90%"
          animationDuration={100}
          dialogAnimation={
            new SlideAnimation({
              slideFrom: "bottom",
            })
          }
          onTouchOutside={() => {
            this.setState({ isLoaderVisible: true });
          }}
        >
          <DialogContent>
            <View
              style={{
                padding: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View style={{ alignItems: "center", padding: 20 }}>
                <LottieView
                  style={{ height: 100, width: 100 }}
                  source={search_lottie}
                  autoPlay
                  loop
                />
              </View>
              <Text style={{ fontSize: 13, fontFamily: font_title }}>
                Please wait while searching the driver...
              </Text>
              <View style={{ margin: 10 }} />
              <Text
                onPress={this.cancel_request.bind(this)}
                style={{
                  color: "red",
                  fontSize: 16,
                  fontFamily: font_title,
                  alignSelf: "center",
                }}
              >
                Cancel
              </Text>
            </View>
          </DialogContent>
        </Dialog>
        <Loader visible={this.state.isLoading} />
      </SafeAreaView>
    );
  }
}

function mapStateToProps(state) {
  return {
    pickup_address: state.booking.pickup_address,
    pickup_lat: state.booking.pickup_lat,
    pickup_lng: state.booking.pickup_lng,
    drop_address: state.booking.drop_address,
    drop_lat: state.booking.drop_lat,
    drop_lng: state.booking.drop_lng,
    kms: state.booking.km,
    package_id: state.booking.package_id,
    promo: state.booking.promo,
    trip_sub_type: state.booking.trip_sub_type,
    stops: state.booking.stops,
  };
}

const mapDispatchToProps = (dispatch) => ({
  pickupAddress: (data) => dispatch(pickupAddress(data)),
  pickupLat: (data) => dispatch(pickupLat(data)),
  pickupLng: (data) => dispatch(pickupLng(data)),
  dropAddress: (data) => dispatch(dropAddress(data)),
  dropLat: (data) => dispatch(dropLat(data)),
  dropLng: (data) => dispatch(dropLng(data)),
  km: (data) => dispatch(km(data)),
  reset: () => dispatch(reset()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ConfirmBooking);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.theme_bg_three,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  footer: {
    width: "100%",
    backgroundColor: colors.theme_bg,
    alignItems: "center",
    justifyContent: "center",
    height: 45,
  },
  footer_style: {
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
  price: {
    color: colors.theme_fg_two,
    alignSelf: "center",
    fontSize: 18,
    fontFamily: font_title,
  },
  pickup_address: {
    fontSize: 14,
    color: colors.theme_fg_two,
    fontFamily: font_description,
  },
  drop_address: {
    fontSize: 14,
    color: colors.theme_fg_two,
    fontFamily: font_description,
  },
  total: {
    fontSize: 12,
    color: colors.theme_fg_two,
    fontFamily: font_description,
  },
  date: {
    fontSize: 14,
    color: colors.theme_fg_two,
    fontFamily: font_title,
  },
  coupon: {
    color: colors.theme_fg_two,
    fontFamily: font_description,
    padding: 5,
  },
  payment: {
    color: colors.theme_fg_two,
    fontFamily: font_description,
    padding: 5,
  },
  font: {
    fontFamily: font_description,
  },
  payment_option: {
    fontSize: 18,
    color: colors.theme_fg_three,
    fontFamily: font_title,
    padding: 5,
  },
  tot: {
    fontFamily: font_title,
    fontSize: 15,
  },
  note_describ: {
    fontSize: 12,
    color: colors.theme_fg_four,
    fontFamily: font_description,
  },
  image_style: {
    flex: 1,
    height: 30,
    width: 25,
  },
  image_style_two: {
    flex: 1,
    height: 30,
    width: 30,
  },
  button_style: {
    backgroundColor: colors.theme_bg,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  title_style: {
    fontFamily: font_description,
    color: colors.theme_fg_three,
    fontSize: 18,
  },
  price_icon_style: {
    color: colors.theme_fg,
    fontSize: 22,
  },
  card_icon_style: {
    color: colors.theme_fg,
    fontSize: 20,
  },
  address_view_style: {
    flex: 1,
    flexDirection: "column",
    padding: 10,
  },
});
