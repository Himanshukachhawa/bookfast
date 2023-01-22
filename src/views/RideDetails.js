import React, { Component } from "react";
import { StyleSheet, Text, View, Image, ScrollView } from "react-native";
import * as colors from "../assets/css/Colors";
import {
  car_icon_small,
  meter_icon,
  font_title,
  font_description,
  send_invoice,
  api_url,
  label,
  img_url,
  cancel,
} from "../config/Constants";
import { Badge, Divider } from "react-native-elements";
import StarRating from "react-native-star-rating";
import axios from "axios";
import Moment from "moment";
import strings from "../languages/strings.js";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native-gesture-handler";
import Icon, { Icons } from "../components/Icons";
import Loader from "../components/Loader";

class RideDetails extends Component<Props> {
  constructor(props) {
    super(props);
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state = {
      data: this.props.route.params.data,
      isLoading: false,
    };
  }

  handleBackButtonClick = () => {
    this.props.navigation.goBack(null);
  };

  send_invoice = async () => {
    this.setState({ isLoading: true });
    await axios({
      method: "post",
      url: api_url + send_invoice,
      data: { id: this.state.data.id, country_code: global.country_id },
    })
      .then(async (response) => {
        this.setState({ isLoading: false });
        if (response.data.status == 1) {
          alert(strings.your_invoices_successfully_processes);
        }
      })
      .catch((error) => {
        this.setState({ isLoading: false });
        alert(strings.sorry_something_went_wrong);
      });
  };

  show_alert(message) {
    this.dropDownAlertRef.alertWithType("error", "Error", message);
  }

  support(item) {
    this.props.navigation.navigate("ComplaintCategory", {
      trip_id: this.state.data.id,
      driver_id: this.state.data.driver_id,
    });
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <Loader visible={this.state.isLoading} />
        <ScrollView style={{ backgroundColor: colors.theme_bg_three }}>
          <View style={{ padding: 20 }}>
            <View style={{ flexDirection: "row" }}>
              <View style={{ width: "25%", flexDirection: "column" }}>
                <Image
                  source={{ uri: img_url + this.state.data.profile_picture }}
                  style={{ height: 50, width: 50 }}
                />
              </View>
              <View
                style={{ justifyContent: "center", flexDirection: "column" }}
              >
                <Text style={styles.cab_driver}>
                  {this.state.data.driver_name}
                </Text>
                <View style={{ margin: 3 }} />
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <StarRating
                    disabled={true}
                    maxStars={5}
                    starSize={10}
                    rating={this.state.data.ratings}
                    starStyle={{ paddingRight: 5, color: colors.star_rating }}
                  />
                  <Text style={styles.rate}> ({strings.you_rated})</Text>
                </View>
              </View>
            </View>
            <Divider style={styles.default_divider} />
            <View style={{ flexDirection: "row" }}>
              <View
                style={{
                  width: "25%",
                  paddingBottom: 10,
                  flexDirection: "column",
                }}
              >
                <Image
                  square
                  source={car_icon_small}
                  style={{ height: 50, width: 50, tintColor: colors.theme_bg }}
                />
              </View>
              <View
                style={{ justifyContent: "center", flexDirection: "column" }}
              >
                <Text style={styles.cab_details}>
                  {this.state.data.vehicle_type} - {this.state.data.color}{" "}
                  {this.state.data.vehicle_name}
                </Text>
              </View>
            </View>
            <Divider style={styles.default_divider} />
            <View style={{ flexDirection: "row" }}>
              <View style={{ width: "25%", flexDirection: "column" }}>
                <Image
                  square
                  source={label}
                  style={{ height: 50, width: 50, tintColor: colors.theme_bg }}
                />
              </View>
              <View
                style={{ justifyContent: "center", flexDirection: "column" }}
              >
                <Text style={styles.cab_details}>
                  {strings.trip_type} - {this.state.data.trip_type}
                </Text>
              </View>
            </View>
            <Divider style={styles.default_divider} />
            {this.state.data.status < 6 ? (
              <View style={{ flexDirection: "row" }}>
                <View style={{ width: "25%", flexDirection: "column" }}>
                  <Image
                    square
                    source={meter_icon}
                    style={{
                      height: 50,
                      width: 50,
                      tintColor: colors.theme_bg,
                    }}
                  />
                </View>
                <View
                  style={{
                    justifyContent: "center",
                    width: "75%",
                    flexDirection: "column",
                  }}
                >
                  <View style={{ flexDirection: "row" }}>
                    <View
                      style={{
                        justifyContent: "center",
                        width: "30%",
                        flexDirection: "column",
                      }}
                    >
                      <Text style={styles.cab_details}>
                        {global.currency}
                        {this.state.data.total}
                      </Text>
                    </View>
                    <View style={{ width: "15%" }} />
                    <View
                      style={{
                        justifyContent: "center",
                        width: "30%",
                        flexDirection: "column",
                      }}
                    >
                      <Text style={styles.cab_details}>
                        {this.state.data.distance} {strings.km}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ) : (
              <View style={{ flexDirection: "row" }}>
                <View style={{ width: "25%", flexDirection: "column" }}>
                  <Image
                    square
                    source={meter_icon}
                    style={{
                      height: 50,
                      width: 50,
                      tintColor: colors.theme_bg,
                    }}
                  />
                </View>
                <View
                  style={{
                    justifyContent: "center",
                    width: "75%",
                    flexDirection: "column",
                  }}
                >
                  <View style={{ flexDirection: "row" }}>
                    <View
                      style={{
                        justifyContent: "center",
                        width: "30%",
                        fle: "column",
                      }}
                    >
                      <Text style={styles.cab_details}>{global.currency}0</Text>
                    </View>
                    <View style={{ width: "15%" }} />
                    <View
                      style={{
                        justifyContent: "center",
                        width: "30%",
                        flexDirection: "column",
                      }}
                    >
                      <Text style={styles.cab_details}>0{strings.km}</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
            {this.state.data.status < 6 && (
              <View>
                <Divider style={styles.default_divider} />
                <View style={{ flexDirection: "row" }}>
                  <View
                    style={{
                      width: "25%",
                      justifyContent: "center",
                      flexDirection: "column",
                    }}
                  >
                    <Text style={styles.time}>
                      {Moment(this.state.data.start_time).format("hh:mm A")}
                    </Text>
                  </View>
                  <View
                    style={{
                      justifyContent: "center",
                      flexDirection: "column",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 5,
                      }}
                    >
                      <Badge status="success" />
                      <View style={{ marginLeft: 10 }} />
                      <Text style={styles.address}>
                        {this.state.data.actual_pickup_address}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={{ margin: 10 }} />
                <View style={{ flexDirection: "row" }}>
                  <View
                    style={{
                      width: "25%",
                      justifyContent: "center",
                      flexDirection: "column",
                    }}
                  >
                    <Text style={styles.time}>
                      {Moment(this.state.data.end_time).format("hh:mm A")}
                    </Text>
                  </View>
                  <View
                    style={{
                      justifyContent: "center",
                      flexDirection: "column",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 5,
                      }}
                    >
                      <Badge status="error" />
                      <View style={{ marginLeft: 10 }} />
                      <Text style={styles.address}>
                        {this.state.data.actual_drop_address}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
            {this.state.data.status < 6 ? (
              <View>
                <Divider style={styles.default_divider} />
                <Text style={styles.billing}>{strings.bill_details}</Text>
                <View style={{ margin: 10 }} />
                <View style={{ flexDirection: "row" }}>
                  <View style={{ width: "80%", justifyContent: "center" }}>
                    <Text style={styles.trip}>{strings.fare}</Text>
                  </View>
                  <View
                    style={{
                      justifyContent: "center",
                      width: "20%",
                      alignItems: "flex-end",
                    }}
                  >
                    <Text style={styles.trip_amt}>
                      {global.currency}
                      {this.state.data.sub_total}
                    </Text>
                  </View>
                </View>
                <View style={{ margin: 5 }} />
                <View style={{ flexDirection: "row" }}>
                  <View style={{ width: "80%", justifyContent: "center" }}>
                    <Text style={styles.trip}>{strings.taxes}</Text>
                  </View>
                  <View
                    style={{
                      justifyContent: "center",
                      width: "20%",
                      alignItems: "flex-end",
                    }}
                  >
                    <Text style={styles.trip_amt}>
                      {global.currency}
                      {this.state.data.tax}
                    </Text>
                  </View>
                </View>
                <View style={{ margin: 5 }} />
                <View style={{ flexDirection: "row" }}>
                  <View
                    style={{
                      width: "80%",
                      justifyContent: "center",
                      alignItems: "flex-start",
                    }}
                  >
                    <Text style={styles.trip}>{strings.discount}</Text>
                  </View>
                  <View
                    style={{
                      justifyContent: "center",
                      width: "20%",
                      alignItems: "flex-end",
                    }}
                  >
                    <Text style={styles.trip_amt}>
                      {global.currency}
                      {this.state.data.discount}
                    </Text>
                  </View>
                </View>
                {this.state.data.tip != 0 && (
                  <View style={{ flexDirection: "row", marginTop: 10 }}>
                    <View
                      style={{
                        width: "80%",
                        justifyContent: "center",
                        alignItems: "flex-start",
                      }}
                    >
                      <Text style={styles.tip}>{strings.tip_for_you}</Text>
                    </View>
                    <View
                      style={{
                        justifyContent: "center",
                        width: "20%",
                        alignItems: "flex-end",
                      }}
                    >
                      <Text style={styles.tip_amt}>
                        + {global.currency}
                        {this.state.data.tip}
                      </Text>
                    </View>
                  </View>
                )}
                <View style={{ margin: 10 }} />
                <View style={{ flexDirection: "row" }}>
                  <View
                    style={{
                      width: "80%",
                      justifyContent: "center",
                      alignItems: "flex-start",
                    }}
                  >
                    <Text style={styles.bill_amt}>{strings.total_bill}</Text>
                  </View>
                  <View
                    style={{
                      justifyContent: "center",
                      width: "20%",
                      alignItems: "flex-end",
                    }}
                  >
                    <Text style={styles.bill_amt}>
                      {global.currency}
                      {this.state.data.total}
                    </Text>
                  </View>
                </View>
                <Divider style={styles.default_divider} />
                {this.state.data.payment_method != 4 ? (
                  <View>
                    <Text style={styles.payment}>{strings.payment_mode}</Text>
                    <View style={{ margin: 10 }} />
                    <View style={{ flexDirection: "row" }}>
                      <View
                        style={{
                          width: "80%",
                          justifyContent: "center",
                          alignItems: "flex-start",
                        }}
                      >
                        <Text style={styles.cash}>
                          {this.state.data.payment}
                        </Text>
                      </View>
                      <View
                        style={{
                          justifyContent: "center",
                          width: "20%",
                          alignItems: "flex-end",
                        }}
                      >
                        <Text style={styles.cash_amt}>
                          {global.currency}
                          {this.state.data.total}
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  <View>
                    <Text style={styles.payment}>{strings.payment_mode}</Text>
                    <View style={{ margin: 10 }} />
                    <View style={{ flexDirection: "row" }}>
                      <View
                        style={{
                          width: "80%",
                          justifyContent: "center",
                          alignItems: "flex-start",
                        }}
                      >
                        <Text style={styles.cash}>
                          {this.state.data.payment}
                        </Text>
                      </View>
                      <View
                        style={{
                          justifyContent: "center",
                          width: "20%",
                          alignItems: "flex-end",
                        }}
                      >
                        <Text style={styles.cash_amt}>{strings.free_ride}</Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            ) : (
              <View
                style={{
                  alignItems: "center",
                  marginTop: 50,
                  flexDirection: "column",
                }}
              >
                <Image
                  square
                  source={cancel}
                  style={{ height: 100, width: 130 }}
                />
              </View>
            )}
          </View>
          <View style={{ margin: 30 }} />
        </ScrollView>
        {this.state.data.status < 6 && (
          <View style={styles.footer}>
            <View
              activeOpacity={1}
              style={{ width: "50%", alignItems: "flex-start" }}
            >
              <TouchableOpacity
                onPress={this.send_invoice}
                style={{
                  width: 50,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon
                  type={Icons.Ionicons}
                  name="mail-outline"
                  style={{ color: colors.theme_fg_two }}
                />
                <Text style={styles.font}>{strings.invoice}</Text>
              </TouchableOpacity>
            </View>
            <View
              activeOpacity={1}
              style={{ width: "50%", alignItems: "flex-end" }}
            >
              <TouchableOpacity
                onPress={this.support.bind(this)}
                style={{
                  width: 50,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon
                  type={Icons.Ionicons}
                  name="chatbubbles-outline"
                  style={{ color: colors.theme_fg_two }}
                />
                <Text style={styles.font}>{strings.support}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    );
  }
}

export default RideDetails;

const styles = StyleSheet.create({
  cab_driver: {
    fontSize: 14,
    fontFamily: font_title,
    color: colors.theme_fg_two,
    alignSelf: "flex-start",
  },
  rate: {
    fontSize: 12,
    color: colors.theme_fg_four,
    fontFamily: font_description,
  },
  default_divider: {
    marginTop: 10,
    marginBottom: 10,
  },
  footer: {
    backgroundColor: colors.theme_bg_three,
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    paddingLeft: 20,
    paddingRight: 20,
  },
  cab_details: {
    fontSize: 14,
    fontFamily: font_title,
    color: colors.theme_fg_four,
    letterSpacing: 0.5,
  },
  time: {
    fontSize: 14,
    color: colors.theme_fg_two,
    fontFamily: font_description,
    padding: 5,
  },
  address: {
    fontSize: 14,
    color: colors.theme_fg_two,
    fontFamily: font_description,
  },
  billing: {
    fontSize: 14,
    color: colors.theme_fg_two,
    fontFamily: font_description,
  },
  trip: {
    fontSize: 15,
    color: colors.theme_fg_four,
    fontFamily: font_description,
  },
  tip: {
    fontSize: 15,
    color: colors.green,
    fontFamily: font_title,
  },
  tip_amt: {
    fontSize: 15,
    color: colors.green,
    fontFamily: font_title,
  },
  trip_amt: {
    fontSize: 15,
    color: colors.theme_fg_four,
    fontFamily: font_description,
  },
  bill_amt: {
    fontSize: 14,
    fontFamily: font_title,
    color: colors.theme_fg_four,
  },
  payment: {
    fontSize: 15,
    fontFamily: font_title,
    color: colors.theme_fg_two,
    letterSpacing: 1,
  },
  cash: {
    fontSize: 15,
    color: colors.theme_fg_four,
    fontFamily: font_description,
  },
  cash_amt: {
    fontSize: 15,
    color: colors.green,
    fontFamily: font_title,
  },
  font: {
    fontFamily: font_description,
    color: colors.theme_fg_two,
    fontSize: 14,
  },
});
