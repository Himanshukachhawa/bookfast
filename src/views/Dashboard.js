import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  Image,
  View,
  TouchableOpacity,
  PermissionsAndroid,
  ScrollView,
  Platform,
  I18nManager,
} from "react-native";
import * as colors from "../assets/css/Colors";
import {
  img_url,
  font_description,
  alert_close_timing,
  GOOGLE_KEY,
  LATITUDE_DELTA,
  LONGITUDE_DELTA,
  api_url,
  get_vehicles,
  get_packages,
  get_trip_type,
  font_title,
  app_name,
  add_favourite,
  delete_favourite,
  get_fare,
  width_50,
  height_50,
  zones,
  get_subscription_details,
} from "../config/Constants";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { Button, Badge } from "react-native-elements";
import Dash from "react-native-dash";
import axios from "axios";
import { connect } from "react-redux";
import {
  pickupAddress,
  pickupLat,
  pickupLng,
  dropAddress,
  dropLat,
  dropLng,
  km,
  package_id,
  trip_sub_type,
  change_active_vehicle,
  change_active_vehicle_details,
  currentSubId,
  subRides,
  subExpireDate,
} from "../actions/BookingActions";
import Geolocation from "@react-native-community/geolocation";
import database from "@react-native-firebase/database";
import { StatusBar } from "../components/GeneralComponents";
import strings from "../languages/strings.js";
import DropdownAlert from "react-native-dropdownalert";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import CardView from "react-native-cardview";
import Icon, { Icons } from "../components/Icons";
import Loader from "../components/Loader";
import { Picker } from "@react-native-picker/picker";
import RNRestart from "react-native-restart";
import AsyncStorage from "@react-native-async-storage/async-storage";
import crashlytics from "@react-native-firebase/crashlytics";

class Dashboard extends Component<Props> {
  constructor(props) {
    super(props);
    this.get_vehicles = this.get_vehicles.bind(this);
    this.state = {
      active_location: "FROM_LOCATION",
      markers: [],
      fab_active: false,
      region: this.props.initial_region,
      active_vehicle: 5,
      isLoading: false,
      vehicles: [],
      filter: 0,
      active_icon: "people",
      trip_types: [],
      vehicle_open_status: 0,
      active_trip_type: 1,
      from_city: "",
      to_city: "",
      packages: [],
      package_id: 0,
      pickup_heart: "heart-outline",
      drop_heart: "heart-outline",
      pickup_favourite: 0,
      drop_favourite: 0,
      current_location: this.props.initial_lat + "," + this.props.initial_lng,
      marginBottom: 1,
      trip_sub_type_index: 0,
      trip_sub_type: 0,
      active_trip_sub_types: [],
      active_trip_sub_labels: [],
      vehicle_mode: 0,
      fare: 0,
      zone: 0,
    };
    this.mapRef = null;
    this.get_trip_type();
    this.get_packages();
    this.getInitialLocation();
    /*if(Platform.OS == "android"){
        this.requestCameraPermission();
      }else{
        this.getInitialLocation();
      }*/
  }

  async componentDidMount() {
    crashlytics().log("App mounted.");
    this._unsubscribe = this.props.navigation.addListener("focus", async () => {
      /*if(Platform.OS == "android"){
        this.requestCameraPermission();
      }else{
        this.getInitialLocation();
      }*/
      await this.set_location();
      await this.find_active_vehicle();
      await this.subscription_detail();
    });
    this.booking_sync();
  }

  async subscription_detail() {
    crashlytics().log("App mounted.");
    await axios({
      method: "post",
      url: api_url + get_subscription_details,
      data: { customer_id: global.id },
    })
      .then(async (response) => {
        if (response.data.result.current_sub_id != 0) {
          this.props.currentSubId(response.data.result.current_sub_id);
          this.props.subRides(response.data.result.subscription_trips);
          this.props.subExpireDate(response.data.result.sub_expired_at);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  find_active_vehicle = async () => {
    crashlytics().log("App mounted.");
    if (
      this.props.active_vehicle != this.state.active_vehicle &&
      this.props.active_vehicle != 0
    ) {
      await this.setState({
        active_vehicle: this.props.active_vehicle,
        active_vehicle_details: this.props.active_vehicle_details,
      });
      this.get_vehicles();
    }
  };

  componentWillUnmount() {
    crashlytics().log("App mounted.");
    this._unsubscribe();
  }

  booking_sync = () => {
    crashlytics().log("App mounted.");
    database()
      .ref(`/customers/${global.id}`)
      .on("value", (snapshot) => {
        if (
          snapshot.val() != null &&
          snapshot.val().booking_status == 2 &&
          snapshot.val().booking_id != 0
        ) {
          this.props.navigation.navigate("Ride", {
            trip_id: snapshot.val().booking_id,
          });
        }
      });
  };

  get_vehicles = async () => {
    crashlytics().log("App mounted.");
    database()
      .ref(
        `${global.country_id}/drivers/${this.state.active_vehicle}/${this.state.zone}`
      )
      .on("value", (snapshot) => {
        console.log(
          "Get_vechical",
          global.country_id,
          this.state.active_vehicle,
          this.state.zone
        );
        console.log("res", snapshot);
        let vehicles = [];
        snapshot.forEach(function (childSnapshot) {
          if (
            childSnapshot.val() != null &&
            childSnapshot.val().booking.booking_status == 0 &&
            childSnapshot.val().online_status == 1
          ) {
            vehicles.push({
              latitude: childSnapshot.val().geo.lat,
              longitude: childSnapshot.val().geo.lng,
              gender: childSnapshot.val().gender,
            });
          }
        });
        this.setState({ markers: vehicles });
      });
  };

  async get_vehicle_categories() {
    crashlytics().log("App mounted.");
    this.setState({ isLoading: true });
    await axios({
      method: "post",
      url: api_url + get_vehicles,
      data: {
        country_id: global.country_id,
        lang: global.lang,
        vehicle_mode: this.state.vehicle_mode,
      },
    })
      .then(async (response) => {
        this.setState({
          isLoading: false,
          vehicles: response.data.result,
          active_vehicle: response.data.result[0].id,
          active_vehicle_details: response.data.result[0],
          vehicle_open_status: 1,
        });
        if (!this.state.zone) {
          this.get_zone();
        } else {
          await this.get_vehicles();
        }
      })
      .catch((error) => {
        this.setState({ isLoading: false });
      });
  }

  get_fare = async () => {
    console.log({
      country_id: global.country_id,
      km: this.props.kms.slice(0, this.props.kms.length - 2),
      promo: this.props.promo,
      vehicle_type: this.state.active_vehicle,
      trip_type: this.state.active_trip_type,
      days: 1,
      package_id: this.state.package_id,
      lang: global.lang,
      trip_sub_type: this.props.active_trip_sub_type,
    });
    crashlytics().log("App mounted.");
    await axios({
      method: "post",
      url: api_url + get_fare,
      data: {
        country_id: global.country_id,
        km: this.props.kms.slice(0, this.props.kms.length - 2),
        promo: this.props.promo,
        vehicle_type: this.state.active_vehicle,
        trip_type: this.state.active_trip_type,
        days: 1,
        package_id: this.state.package_id,
        lang: global.lang,
        trip_sub_type: this.props.active_trip_sub_type,
        surge: 1,
      },
    })
      .then(async (response) => {
        console.log("fare", response?.data);
        if (response.data.status == 1) {
          this.setState({ fare: response.data.result.total_fare });
        }
      })
      .catch((error) => {
        alert(strings.sorry_something_went_wrong);
      });
  };

  async get_packages() {
    crashlytics().log("App mounted.");
    await axios({
      method: "post",
      url: api_url + get_packages,
      data: { lang: global.lang },
    })
      .then(async (response) => {
        if (response.data.result.length > 0) {
          this.setState({
            packages: response.data.result,
            package_id: response.data.result[0].id,
          });
        }
      })
      .catch((error) => {
        alert(strings.sorry_something_went_wrong);
      });
  }

  async get_trip_type() {
    crashlytics().log("App mounted.");
    await axios({
      method: "post",
      url: api_url + get_trip_type,
      data: { lang: global.lang },
    })
      .then(async (response) => {
        this.setState({
          trip_types: response.data.result,
          active_trip_type: response.data.result[0].id,
          active_trip_sub_types_labels:
            response.data.result[0].trip_sub_type_labels,
          active_trip_sub_types: response.data.result[0].trip_sub_type,
          vehicle_mode: response.data.result[0].vehicle_mode,
        });
        await this.get_vehicle_categories();
      })
      .catch((error) => {
        alert(strings.sorry_something_went_wrong);
      });
  }

  get_zone = async () => {
    console.log({ lat: this.props.initial_lat, lng: this.props.initial_lng });
    crashlytics().log("App mounted.");
    await axios({
      method: "post",
      url: api_url + zones,
      data: { lat: this.props.initial_lat, lng: this.props.initial_lng },
    })
      .then(async (response) => {
        console.log("get_zone", response?.data);
        if (response.data.result) {
          await this.setState({ zone: response.data.result });
          await this.get_vehicles();
        } else {
          alert("sorry service not available at this location");
        }
      })
      .catch((error) => {
        alert(strings.sorry_something_went_wrong);
      });
  };

  check_zone = async () => {
    crashlytics().log("App mounted.");
    await axios({
      method: "post",
      url: api_url + zones,
      data: { lat: this.props.pickup_lat, lng: this.props.pickup_lng },
    })
      .then(async (response) => {
        if (this.state.zone == response.data.result) {
          this.pick_now(response.data.result);
        } else {
          alert("sorry service not available at this location");
        }
      })
      .catch((error) => {
        alert(strings.sorry_something_went_wrong);
      });
  };

  pick_now = async (zone_id) => {
    crashlytics().log("App mounted.");
    if (
      this.state.active_trip_type == 2 &&
      this.props.pickup_address != undefined
    ) {
      await this.props.km("0 km");
      await this.props.navigation.navigate("ConfirmBooking", {
        vehicle_type: this.state.active_vehicle,
        filter: this.state.filter,
        trip_type: this.state.active_trip_type,
        zone_id: zone_id,
      });
    } else if (
      this.state.active_trip_type != 2 &&
      this.props.pickup_address != undefined &&
      this.props.drop_address != undefined &&
      this.props.km != 0
    ) {
      if (this.state.active_trip_type == 1) {
        this.props.navigation.navigate("ConfirmBooking", {
          vehicle_type: this.state.active_vehicle,
          filter: this.state.filter,
          trip_type: this.state.active_trip_type,
          zone_id: zone_id,
        });
      } else if (this.state.active_trip_type == 2) {
        this.props.navigation.navigate("ConfirmBooking", {
          vehicle_type: this.state.active_vehicle,
          filter: this.state.filter,
          trip_type: this.state.active_trip_type,
          zone_id: zone_id,
        });
      } else if (this.state.active_trip_type == 3) {
        this.props.navigation.navigate("ConfirmBooking", {
          vehicle_type: this.state.active_vehicle,
          filter: this.state.filter,
          trip_type: this.state.active_trip_type,
          zone_id: zone_id,
        });
      } else if (this.state.active_trip_type == 4) {
        this.props.navigation.navigate("ConfirmBooking", {
          vehicle_type: this.state.active_vehicle,
          filter: this.state.filter,
          trip_type: this.state.active_trip_type,
          zone_id: zone_id,
        });
      } else if (this.state.active_trip_type == 5) {
        this.props.navigation.navigate("ConfirmBooking", {
          vehicle_type: this.state.active_vehicle,
          filter: this.state.filter,
          trip_type: this.state.active_trip_type,
          zone_id: zone_id,
        });
      }
    } else {
      alert(strings.please_select_valid_pickup_and_drop_location);
    }
  };

  set_location() {
    crashlytics().log("App mounted.");
    if (
      this.props.pickup_address == undefined &&
      this.state.active_location == "FROM_LOCATION"
    ) {
      //Write here
    } else if (
      this.props.pickup_address != undefined &&
      this.state.active_location == "FROM_LOCATION"
    ) {
      this.mapRef.animateToCoordinate(
        {
          latitude: this.props.pickup_lat,
          longitude: this.props.pickup_lng,
        },
        10
      );
    }
    if (
      this.props.drop_address == undefined &&
      this.state.active_location == "TO_LOCATION"
    ) {
      //Write here
    } else if (
      this.props.drop_address != undefined &&
      this.state.active_location == "TO_LOCATION"
    ) {
      this.mapRef.animateToCoordinate(
        {
          latitude: this.props.drop_lat,
          longitude: this.props.drop_lng,
        },
        10
      );
    }
  }

  async requestCameraPermission() {
    crashlytics().log("App mounted.");
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: strings.location_access_required,
          message:
            { app_name } + strings.needs_to_access_your_location_for_tracking,
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

  async getInitialLocation() {
    crashlytics().log("App mounted.");
    Geolocation.getCurrentPosition(
      async (position) => {
        let region = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        };
        this.setState({
          region: region,
          current_location:
            position.coords.latitude + "," + position.coords.longitude,
        });
        this.onRegionChange(region);
      },
      (error) => console.log(error),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  createMarker(lat, lng) {
    crashlytics().log("App mounted.");
    return {
      latitude: lat,
      longitude: lng,
    };
  }

  active_location_changing = (active_location) => {
    crashlytics().log("App mounted.");
    this.setState({ active_location: active_location });
    if (active_location == "FROM_LOCATION" && this.props.pickup_address) {
      this.mapRef.animateToCoordinate(
        {
          latitude: this.props.pickup_lat,
          longitude: this.props.pickup_lng,
        },
        1000
      );
    }
    if (active_location == "TO_LOCATION" && this.props.drop_address) {
      this.mapRef.animateToCoordinate(
        {
          latitude: this.props.drop_lat,
          longitude: this.props.drop_lng,
        },
        1000
      );
    }
    if (
      this.state.active_location == "FROM_LOCATION" &&
      active_location == "FROM_LOCATION"
    ) {
      this.props.navigation.navigate("Location", {
        header_name: strings.pickup_location,
        mode: "pickup",
        mode_status: 1,
        current_location: this.state.current_location,
      });
    } else if (
      this.state.active_location == "TO_LOCATION" &&
      active_location == "TO_LOCATION"
    ) {
      this.props.navigation.navigate("Location", {
        header_name: strings.drop_location,
        mode: "drop",
        mode_status: 2,
        current_location: this.state.current_location,
      });
    }
  };

  async vehicle_details() {
    crashlytics().log("App mounted.");
    this.props.navigation.navigate("VehicleCategories", {
      vehicle_categories: this.state.vehicles,
    });
  }

  async change_vehicle(data) {
    crashlytics().log("App mounted.");
    await this.setState({
      active_vehicle: data.id,
      active_vehicle_details: data,
    });
    if (this.props.pickup_address && this.props.drop_address) {
      this.get_fare();
    }
  }

  onRegionChange = async (value) => {
    crashlytics().log("App mounted.");
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
            this.setState({ pickup_heart: "heart-outline" });
            this.props.pickupAddress(responseJson.results[0].formatted_address);
            this.props.pickupLat(value.latitude);
            this.props.pickupLng(value.longitude);
          } else {
            this.setState({ drop_heart: "heart-outline" });
            this.props.dropAddress(responseJson.results[0].formatted_address);
            this.props.dropLat(value.latitude);
            this.props.dropLng(value.longitude);
          }
          this.get_distance();
          this.find_city(responseJson.results[0]);
        }
      });
  };

  find_city = async (item) => {
    crashlytics().log("App mounted.");
    var arrAddress = await item.address_components;
    for (var i = 0; i < arrAddress.length; i++) {
      if (arrAddress[i].types[0] == "locality") {
        if (this.state.active_location == "FROM_LOCATION") {
          this.setState({ from_city: arrAddress[i].long_name });
        } else {
          this.setState({ to_city: arrAddress[i].long_name });
        }
      }
    }
  };

  getCoordinates(region) {
    crashlytics().log("App mounted.");
    return [
      {
        longitude: region.longitude,
        latitude: region.latitude,
      },
    ];
  }

  get_distance = async () => {
    crashlytics().log("App mounted.");
    if (this.props.pickup_address && this.props.drop_address) {
      let waypoints = await this.waypoints_making();
      this.setState({ isLoading: true });
      await axios({
        method: "get",
        url:
          "https://maps.googleapis.com/maps/api/directions/json?origin=" +
          this.props.pickup_lat +
          "," +
          this.props.pickup_lng +
          "&destination=" +
          this.props.drop_lat +
          "," +
          this.props.drop_lng +
          "&waypoints=" +
          waypoints +
          "&key=" +
          GOOGLE_KEY,
      })
        .then(async (response) => {
          this.setState({ isLoading: false });
          if (response.data.routes) {
            await this.props.km(response.data.routes[0].legs[0].distance.text);
            await this.get_fare();
          }
        })
        .catch((error) => {
          this.setState({ isLoading: false });
        });
    }
  };

  waypoints_making = async () => {
    crashlytics().log("App mounted.");
    let text = "";
    for (let i = 0; i < this.props.stops.length; i++) {
      if (i == 0) {
        text +=
          "via:" + this.props.stops[i].lat + "," + this.props.stops[i].lng;
      } else {
        text +=
          "|via:" + this.props.stops[i].lat + "," + this.props.stops[i].lng;
      }
    }
    return text;
  };

  show_alert(mode, title, message) {
    crashlytics().log("App mounted.");
    this.dropDownAlertRef.alertWithType(mode, title, message);
  }

  region_change(region) {
    crashlytics().log("App mounted.");
    this.setState({ region: region });
    this.onRegionChange(region);
  }

  /*async change_filter(active_icon,filter){
    this.setState({ isLoading : true });
      await axios({
        method: 'post', 
        url: api_url + get_gender,
        data:{ customer_id : global.id }
      })
      .then(async response => {
        this.setState({ isLoading : false });
        if(response.data.result == 1){
          if(filter != 2){
            this.setState({ filter : filter, active_icon : active_icon, fab_active : false });
            this.get_vehicles();
          }else{
            alert(strings.sorry_you_are_not_applicable_for_female_driver_filter)
          }
        }else if(response.data.result == 2){
          this.setState({ filter : filter, active_icon : active_icon, fab_active : false });
          this.get_vehicles();
        }else if(response.data.result == 0){
          alert(strings.please_update_your_gender_in_profile_settings_page);
        }
      })
      .catch(error => {
        this.setState({ isLoading : false });
        alert(strings.sorry_something_went_wrong);
      });
  }*/

  delete_favourite = async (id) => {
    crashlytics().log("App mounted.");
    await axios({
      method: "post",
      url: api_url + delete_favourite,
      data: { id: id },
    })
      .then(async (response) => {})
      .catch((error) => {
        //alert(strings.sorry_something_went_wrong)
      });
  };

  add_favourite = async (type, address, lat, lng) => {
    crashlytics().log("App mounted.");
    if (type == 1) {
      if (this.state.pickup_heart == "heart") {
        this.setState({ pickup_heart: "heart-outline" });
        this.delete_favourite(this.state.pickup_favourite);
        return false;
      } else {
        this.setState({ pickup_heart: "heart" });
      }
    } else {
      if (this.state.drop_heart == "heart") {
        this.setState({ drop_heart: "heart-outline" });
        this.delete_favourite(this.state.drop_favourite);
        return false;
      } else {
        this.setState({ drop_heart: "heart" });
      }
    }
    await axios({
      method: "post",
      url: api_url + add_favourite,
      data: {
        customer_id: global.id,
        type: type,
        address: address,
        lat: lat,
        lng: lng,
      },
    })
      .then(async (response) => {
        this.show_alert(
          "success",
          "Success",
          "Your favourite location successfully added"
        );
        if (type == 1) {
          this.setState({ pickup_favourite: response.data.result.id });
        } else {
          this.setState({ drop_favourite: response.data.result.id });
        }
      })
      .catch((error) => {
        alert(strings.sorry_something_went_wrong);
      });
  };

  renderMarker() {
    crashlytics().log("App mounted.");
    return this.state.markers.map((marker) => {
      if (this.state.filter == marker.gender || this.state.filter == 0) {
        if (this.state.vehicle_mode == 18) {
          return (
            <MapView.Marker coordinate={marker}>
              <Image
                style={{ flex: 1, height: 29, width: 17 }}
                source={require(".././assets/img/car.png")}
              />
            </MapView.Marker>
          );
        } else {
          return (
            <MapView.Marker coordinate={marker}>
              <Image
                style={{ flex: 1, height: 29, width: 17 }}
                source={require(".././assets/img/truck.png")}
              />
            </MapView.Marker>
          );
        }
      }
    });
  }

  navigate_multiple_drops = () => {
    crashlytics().log("App mounted.");
    this.props.navigation.navigate("MultipleLocation", {
      current_location: this.state.current_location,
    });
  };

  getstyle(val) {
    crashlytics().log("App mounted.");
    if (val == this.state.package_id) {
      return { borderColor: colors.theme_fg, borderWidth: 1.2 };
    } else {
      return { borderColor: colors.theme_fg_two, borderWidth: 1.2 };
    }
  }

  change_trip_type = async (type, sub_type, labels, vehicle_mode) => {
    crashlytics().log("App mounted.");
    this.setState({
      vehicle_mode: vehicle_mode,
      active_trip_type: type,
      active_trip_sub_types_labels: labels,
      trip_sub_type_index: 0,
      active_trip_sub_types: sub_type,
    });
    if (sub_type.length > 0) {
      await this.trip_sub_type_index_to_id(0);
    } else {
      this.props.trip_sub_type(0);
    }
    this.setState({ vehicle_mode: vehicle_mode });
    await this.get_vehicle_categories();
    await this.get_fare();
    if (type == 2) {
      this.props.package_id(this.state.package_id);
    }
  };

  _onMapReady = () => {
    crashlytics().log("App mounted.");
    this.setState({ marginBottom: 0 });
  };

  select_package = async (val) => {
    crashlytics().log("App mounted.");
    this.setState({ package_id: val });
    await this.props.package_id(val);
    await this.get_fare();
  };

  trip_sub_type_index_to_id = async (index) => {
    crashlytics().log("App mounted.");
    this.setState({
      trip_sub_type: this.state.active_trip_sub_types[index].id,
    });
    await this.props.trip_sub_type(this.state.active_trip_sub_types[index].id);
    await this.get_fare();
  };

  drawer = () => {
    crashlytics().log("App mounted.");
    this.props.navigation.toggleDrawer();
  };

  render() {
    return (
      <View>
        <StatusBar />
        <View style={styles.map_container}>
          <Loader visible={this.state.isLoading} />
          <MapView
            ref={(ref) => {
              this.mapRef = ref;
            }}
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1, marginBottom: this.state.marginBottom }}
            onMapReady={this._onMapReady}
            showsUserLocation={true}
            showsMyLocationButton={true}
            onRegionChangeComplete={(region) => {
              this.region_change(region);
            }}
            initialRegion={this.state.region}
          >
            {this.renderMarker()}
          </MapView>

          <TouchableOpacity
            onPress={this.drawer.bind(this)}
            activeOpacity={1}
            style={styles.menu_markers}
          >
            <Icon
              type={Icons.Ionicons}
              style={styles.drawer_icon}
              name="menu"
            />
          </TouchableOpacity>
          <View style={styles.location_markers}>
            <View style={{ height: 30, width: 25 }}>
              {this.state.active_location == "FROM_LOCATION" ? (
                <Image
                  style={{ flex: 1, width: undefined, height: undefined }}
                  source={require(".././assets/img/from_location_pin.png")}
                />
              ) : (
                <Image
                  style={{ flex: 1, width: undefined, height: undefined }}
                  source={require(".././assets/img/to_location_pin.png")}
                />
              )}
            </View>
          </View>
        </View>
        <View style={styles.vehicle_container}>
          <ScrollView>
            {global.app_type == 2 ? (
              <View style={{ flexDirection: "row" }}>
                {this.state.trip_types.map((row, index) => (
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() =>
                      this.change_trip_type(
                        row.id,
                        row.trip_sub_type,
                        row.trip_sub_type_labels,
                        row.vehicle_mode
                      )
                    }
                    style={{ width: "20%", alignItems: "center" }}
                  >
                    {row.id == this.state.active_trip_type ? (
                      <Image
                        style={{ alignSelf: "center", height: 40, width: 60 }}
                        source={{ uri: img_url + row.active_icon }}
                      />
                    ) : (
                      <Image
                        style={{ alignSelf: "center", height: 40, width: 60 }}
                        source={{ uri: img_url + row.inactive_icon }}
                      />
                    )}
                    <Text style={styles.trip_type_name} note numberOfLines={1}>
                      {row.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={{ flexDirection: "row" }}>
                {this.state.vehicles.map((row, index) => (
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={this.change_vehicle.bind(this, row)}
                    style={{ width: "25%", alignItems: "center" }}
                  >
                    {row.id == this.state.active_vehicle ? (
                      <Image
                        style={{ alignSelf: "center", height: 40, width: 40 }}
                        source={{ uri: img_url + row.active_icon }}
                      />
                    ) : (
                      <Image
                        style={{ alignSelf: "center", height: 40, width: 40 }}
                        source={{ uri: img_url + row.inactive_icon }}
                      />
                    )}
                    <Text style={styles.trip_type_name} note numberOfLines={1}>
                      {row.vehicle_type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <View style={{ margin: 10 }} />
            {this.state.active_trip_type != 2 && (
              <View>
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => this.active_location_changing("FROM_LOCATION")}
                  style={{ flexDirection: "row", marginLeft: 20 }}
                >
                  <View
                    style={{
                      width: "5%",
                      alignItems: "flex-start",
                      justifyContent: "center",
                    }}
                  >
                    <Badge status="success" />
                  </View>
                  <View style={{ width: "80%" }}>
                    <Text style={styles.pickup_location}>
                      {strings.pickup_location}
                    </Text>
                    <Text style={styles.address} note numberOfLines={1}>
                      {this.props.pickup_address}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      this.add_favourite(
                        1,
                        this.props.pickup_address,
                        this.props.pickup_lat,
                        this.props.pickup_lng
                      )
                    }
                    style={{
                      width: "15%",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon
                      type={Icons.Ionicons}
                      color={colors.theme_fg}
                      name={this.state.pickup_heart}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
                <View>
                  <Dash
                    style={{
                      width: 1,
                      height: 15,
                      flexDirection: "column",
                      backgroundColor: colors.theme_fg_two,
                      borderStyle: "dotted",
                      marginLeft: 23,
                    }}
                  />
                </View>
                {this.state.active_trip_type == 1 &&
                  this.props.drop_address &&
                  this.props.stops.length > 0 && (
                    <View>
                      <TouchableOpacity
                        activeOpacity={1}
                        style={{
                          flexDirection: "row",
                          marginLeft: 20,
                          marginTop: 3,
                        }}
                      >
                        <View
                          style={{
                            width: "5%",
                            alignItems: "flex-start",
                            justifyContent: "center",
                          }}
                        >
                          <Badge status="error" />
                        </View>
                        <View style={{ width: "80%" }}>
                          <Text style={styles.drop_location}>
                            {this.props.stops.length} stops here
                          </Text>
                        </View>
                      </TouchableOpacity>
                      <View>
                        <Dash
                          style={{
                            width: 1,
                            height: 15,
                            flexDirection: "column",
                            backgroundColor: colors.theme_fg_two,
                            borderStyle: "dotted",
                            marginLeft: 23,
                          }}
                        />
                      </View>
                    </View>
                  )}
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => this.active_location_changing("TO_LOCATION")}
                  style={{ flexDirection: "row", marginLeft: 20, marginTop: 3 }}
                >
                  <View
                    style={{
                      width: "5%",
                      alignItems: "flex-start",
                      justifyContent: "center",
                    }}
                  >
                    <Badge status="error" />
                  </View>
                  <View style={{ width: "80%" }}>
                    <Text style={styles.drop_location}>
                      {strings.drop_location}
                    </Text>
                    {this.props.drop_address != undefined ? (
                      <Text style={styles.address} note numberOfLines={1}>
                        {this.props.drop_address}
                      </Text>
                    ) : (
                      <Text style={styles.address} note numberOfLines={1}>
                        {strings.destination}......
                      </Text>
                    )}
                  </View>
                  {this.props.drop_address != undefined && (
                    <TouchableOpacity
                      onPress={() =>
                        this.add_favourite(
                          2,
                          this.props.drop_address,
                          this.props.drop_lat,
                          this.props.drop_lng
                        )
                      }
                      style={{
                        width: "15%",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon
                        type={Icons.Ionicons}
                        style={{ fontSize: 25 }}
                        color={colors.theme_fg}
                        name={this.state.drop_heart}
                      />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
                {this.state.active_trip_type == 1 &&
                  this.props.drop_address && (
                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={() => this.navigate_multiple_drops()}
                      style={{
                        alignSelf: "flex-end",
                        marginRight: 15,
                        marginTop: 10,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: font_description,
                          fontSize: 14,
                          color: colors.theme_fg,
                        }}
                      >
                        + Add stops...
                      </Text>
                    </TouchableOpacity>
                  )}
              </View>
            )}
            {this.state.active_trip_type == 2 && (
              <View>
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => this.active_location_changing("FROM_LOCATION")}
                  style={{ flexDirection: "row", marginLeft: 20 }}
                >
                  <View
                    style={{
                      width: "5%",
                      alignItems: "flex-start",
                      justifyContent: "center",
                    }}
                  >
                    <Badge status="success" />
                  </View>
                  <View style={{ width: "80%" }}>
                    <Text style={styles.pickup_location}>
                      {strings.pickup_location}
                    </Text>
                    <Text style={styles.address} note numberOfLines={1}>
                      {this.props.pickup_address}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      this.add_favourite(
                        1,
                        this.props.pickup_address,
                        this.props.pickup_lat,
                        this.props.pickup_lng
                      )
                    }
                    style={{
                      width: "15%",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon
                      type={Icons.Ionicons}
                      style={{ fontSize: 25, color: colors.theme_fg }}
                      name={this.state.pickup_heart}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
                <View style={{ margin: 5 }} />
                <View style={{ justifyContent: "center", marginLeft: 20 }}>
                  <Text
                    style={{
                      color: colors.theme_fg_two,
                      fontFamily: font_title,
                      fontSize: 14,
                    }}
                  >
                    {strings.select_package}
                  </Text>
                </View>
                <View
                  style={{ flexDirection: "row", marginLeft: 20, marginTop: 5 }}
                >
                  <ScrollView
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                  >
                    {this.state.packages.map((row, index) => (
                      <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => this.select_package(row.id)}
                        style={[
                          styles.package_container,
                          this.getstyle(row.id),
                        ]}
                      >
                        <Text
                          style={{
                            color: colors.theme_fg_two,
                            fontFamily: font_title,
                            fontSize: 14,
                          }}
                        >
                          {row.hours} hr
                        </Text>
                        <Text
                          style={{
                            color: colors.theme_fg_two,
                            fontFamily: font_description,
                            fontSize: 14,
                          }}
                        >
                          {row.kilometers} km
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            )}
            {this.state.active_trip_sub_types.length > 0 && (
              <View
                style={{ width: "90%", alignSelf: "center", marginTop: 20 }}
              >
                <SegmentedControl
                  values={this.state.active_trip_sub_types_labels}
                  selectedIndex={this.state.trip_sub_type_index}
                  onChange={(event) => {
                    this.setState({
                      trip_sub_type_index:
                        event.nativeEvent.selectedSegmentIndex,
                    });
                    this.trip_sub_type_index_to_id(
                      event.nativeEvent.selectedSegmentIndex
                    );
                  }}
                  enabled={true}
                  fontStyle={{
                    color: colors.theme_fg_two,
                    fontFamily: font_description,
                  }}
                  activeFontStyle={{
                    color: colors.theme_fg,
                    fontFamily: font_title,
                    fontSize: 15,
                  }}
                />
              </View>
            )}
            <View style={{ margin: 10 }} />
            {this.state.vehicle_open_status == 1 && (
              <CardView
                style={{
                  width: "94%",
                  marginLeft: "3%",
                  margin: 10,
                  borderRadius: 10,
                }}
                cardElevation={5}
                cardMaxElevation={5}
                cornerRadius={10}
              >
                <View
                  style={{
                    width: "100%",
                    flexDirection: "row",
                    borderRadius: 10,
                    backgroundColor: colors.theme_fg_three,
                    borderColor: colors.theme_bg_two,
                    borderWidth: 1,
                  }}
                >
                  <View
                    style={{
                      width: "30%",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Image
                      style={{ height: 50, width: 50 }}
                      source={{
                        uri:
                          img_url +
                          this.state.active_vehicle_details.active_icon,
                      }}
                    />
                  </View>
                  <View
                    style={{
                      width: "30%",
                      alignItems: "flex-start",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: colors.theme_fg_two,
                        fontFamily: font_title,
                        fontSize: 10,
                      }}
                    >
                      {this.state.active_vehicle_details.vehicle_type}
                    </Text>
                    {this.state.fare == 0 && (
                      <Text
                        style={{
                          color: colors.theme_fg_two,
                          fontFamily: font_title,
                          fontSize: 14,
                        }}
                      >
                        Calculating...
                      </Text>
                    )}
                    {this.state.fare != 0 &&
                      this.state.active_trip_type != 2 && (
                        <View>
                          <Text
                            style={{
                              color: colors.theme_fg_two,
                              fontFamily: font_title,
                              fontSize: 14,
                            }}
                          >
                            {global.currency}
                            {parseFloat(this.state.fare).toFixed(1)}
                          </Text>
                          <Text
                            style={{
                              color: colors.theme_fg_two,
                              fontFamily: font_title,
                              fontSize: 14,
                            }}
                          >
                            {this.props.kms}
                          </Text>
                        </View>
                      )}
                    {this.state.fare != 0 &&
                      this.state.active_trip_type == 2 && (
                        <Text
                          style={{
                            color: colors.theme_fg_two,
                            fontFamily: font_title,
                            fontSize: 14,
                          }}
                        >
                          {global.currency}
                          {this.state.fare}
                        </Text>
                      )}
                  </View>
                  <View
                    style={{
                      width: "35%",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Button
                      title={
                        global.app_type == 1
                          ? strings.view_details
                          : strings.change_vehicle
                      }
                      onPress={this.vehicle_details.bind(this)}
                      buttonStyle={styles.button_style}
                      titleStyle={styles.vehicle_title_style}
                    />
                  </View>
                </View>
              </CardView>
            )}
          </ScrollView>
          <TouchableOpacity style={styles.footer}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={this.check_zone.bind(this)}
              style={styles.cnf_button_style}
            >
              <Text style={styles.title_style}>{strings.ride}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
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
    pickup_address: state.booking.pickup_address,
    pickup_lat: state.booking.pickup_lat,
    pickup_lng: state.booking.pickup_lng,
    drop_address: state.booking.drop_address,
    drop_lat: state.booking.drop_lat,
    drop_lng: state.booking.drop_lng,
    active_vehicle: state.booking.active_vehicle,
    active_vehicle_details: state.booking.active_vehicle_details,
    kms: state.booking.km,
    active_trip_sub_type: state.booking.trip_sub_type,
    stops: state.booking.stops,
    package_id: state.booking.package_id,
    promo: state.booking.promo,
    initial_lat: state.booking.initial_lat,
    initial_lng: state.booking.initial_lng,
    initial_region: state.booking.initial_region,
    current_sub_id: state.booking.current_sub_id,
    sub_rides: state.booking.sub_rides,
    sub_expire_date: state.booking.sub_expire_date,
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
  package_id: (data) => dispatch(package_id(data)),
  trip_sub_type: (data) => dispatch(trip_sub_type(data)),
  change_active_vehicle: (data) => dispatch(change_active_vehicle(data)),
  change_active_vehicle_details: (data) =>
    dispatch(change_active_vehicle_details(data)),
  currentSubId: (data) => dispatch(currentSubId(data)),
  subRides: (data) => dispatch(subRides(data)),
  subExpireDate: (data) => dispatch(subExpireDate(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);

const styles = StyleSheet.create({
  map_container: {
    height: "50%",
    width: "100%",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    height: 45,
    alignItems: "center",
    width: "100%",
    backgroundColor: colors.theme_bg,
  },
  vehicle_container: {
    height: "50%",
    backgroundColor: colors.theme_bg_three,
  },
  icon: {
    color: colors.theme_fg_three,
  },
  drawer_icon: {
    color: colors.theme_fg_two,
  },
  location_markers: {
    position: "absolute",
    marginLeft: width_50 - 12.5,
    marginTop: height_50 / 2 - 15,
  },
  menu_markers: {
    position: "absolute",
    marginLeft: 25,
    marginTop: 25,
    top: 30,
    color: colors.theme_bg_three,
  },
  active_vehicle: {
    height: 40,
    width: 40,
  },
  pickup_location: {
    fontSize: 12,
    color: "#52C41B",
    fontFamily: font_description,
    marginLeft: 5,
  },
  address: {
    color: colors.theme_fg_two,
    fontSize: 14,
    fontFamily: font_description,
    marginLeft: 5,
  },
  drop_location: {
    fontSize: 12,
    color: "#FF180C",
    fontFamily: font_description,
    marginLeft: 5,
  },
  description: {
    fontSize: 11,
    color: colors.theme_fg_two,
    fontFamily: font_description,
    marginLeft: 5,
  },
  header: {
    justifyContent: "flex-start",
    height: "22%",
    backgroundColor: colors.theme_bg_three,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowOffset: { width: 0, height: 20 },
    shadowColor: colors.theme_bg,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  button_style: {
    backgroundColor: colors.theme_bg,
    borderColor: colors.theme_bg,
    borderWidth: 1,
    height: 35,
  },
  cnf_button_style: {
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
  vehicle_title_style: {
    fontFamily: font_description,
    color: colors.theme_fg_three,
    fontSize: 12,
  },
  trip_type_name: {
    color: colors.theme_fg_two,
    fontSize: 12,
    fontFamily: font_description,
  },
  package_container: {
    marginRight: 10,
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    backgroundColor: colors.theme_fg_three,
    alignItems: "center",
  },
});
