import React, { Component } from "react";
import { StyleSheet, Text, FlatList, View, Image } from "react-native";
import * as colors from "../assets/css/Colors";
import {
  bell_icon,
  font_description,
  api_url,
  get_notification_messages,
  font_title,
} from "../config/Constants";
import Loader from "../components/Loader";
import axios from "axios";
import { connect } from "react-redux";
import {
  serviceActionPending,
  serviceActionError,
  serviceActionSuccess,
} from "../actions/NotificationActions";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import Moment from "moment";

class Notifications extends Component<Props> {
  constructor(props) {
    super(props);
    this.notification();
  }

  show_alert(message) {
    this.dropDownAlertRef.alertWithType("error", "Error", message);
  }

  notification_details(item) {
    this.props.navigation.navigate("NotificationDetails", { data: item });
  }

  notification = async () => {
    this.props.serviceActionPending();
    await axios({
      method: "post",
      url: api_url + get_notification_messages,
      data: {
        country_id: global.country_id,
        customer_id: global.id,
        lang: global.lang,
      },
    })
      .then(async (response) => {
        await this.props.serviceActionSuccess(response.data);
      })
      .catch((error) => {
        this.props.serviceActionError(error);
      });
  };

  render() {
    const { isLoding, error, data, message, status } = this.props;
    return (
      <SafeAreaView style={{ backgroundColor: colors.theme_fg_three, flex: 1 }}>
        <Loader visible={isLoding} />
        <ScrollView style={{ padding: 20 }}>
          <FlatList
            data={data}
            renderItem={({ item, index }) => (
              <TouchableOpacity onPress={() => this.notification_details(item)}>
                <View style={{ flexDirection: "row", width: "100%" }}>
                  <View style={{ width: "20%" }}>
                    <Image
                      square
                      style={{
                        height: 40,
                        width: 40,
                        tintColor: colors.theme_bg,
                      }}
                      source={bell_icon}
                    />
                  </View>
                  <View style={{ width: "80%" }}>
                    <Text style={styles.coupon_title}>{item.title}</Text>
                    <Text
                      style={styles.coupon_description}
                      ellipsizeMode="tail"
                      numberOfLines={1}
                    >
                      {item.message}
                    </Text>
                    <Text style={styles.justnow}>
                      {Moment(item.created_at).fromNow()}
                    </Text>
                  </View>
                </View>
                <View style={{ marginTop: 10 }} />
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
          />
          <View style={{ alignItems: "center", marginTop: "60%" }}>
            {data.length == 0 && (
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: font_title,
                  color: colors.theme_fg_two,
                  textAlign: "justify",
                }}
              >
                Notification List is empty
              </Text>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

function mapStateToProps(state) {
  return {
    isLoding: state.notification.isLoding,
    error: state.notification.error,
    data: state.notification.data,
    message: state.notification.message,
    status: state.notification.status,
  };
}

const mapDispatchToProps = (dispatch) => ({
  serviceActionPending: () => dispatch(serviceActionPending()),
  serviceActionError: (error) => dispatch(serviceActionError(error)),
  serviceActionSuccess: (data) => dispatch(serviceActionSuccess(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Notifications);

const styles = StyleSheet.create({
  coupon_title: {
    fontSize: 14,
    fontFamily: font_description,
    color: colors.theme_fg_two,
  },
  coupon_description: {
    color: colors.theme_fg_four,
    fontSize: 12,
    fontFamily: font_description,
  },
  justnow: {
    color: colors.theme_fg_four,
    fontSize: 11,
    fontFamily: font_description,
  },
});
