import React, { Component } from "react";
import { StyleSheet, Text, View, FlatList, Image } from "react-native";
import * as colors from "../assets/css/Colors";
import {
  stripe_payment,
  alert_close_timing,
  api_url,
  add_wallet,
  get_wallet,
  wallet_icon,
  font_title,
  font_description,
  wallet_payment_methods,
  img_url,
} from "../config/Constants";
import DropdownAlert from "react-native-dropdownalert";
import { Button } from "react-native-elements";
import DialogInput from "react-native-dialog-input";
import axios from "axios";
import { connect } from "react-redux";
import {
  addWalletPending,
  addWalletError,
  addWalletSuccess,
  walletPending,
  walletError,
  walletSuccess,
} from "../actions/WalletActions";
import RBSheet from "react-native-raw-bottom-sheet";
import RazorpayCheckout from "react-native-razorpay";
import stripe from "tipsi-stripe";
import Moment from "moment";
import strings from "../languages/strings.js";
import { CreditCardInput } from "react-native-credit-card-input";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import Icon, { Icons } from "../components/Icons";
import CardView from "react-native-cardview";
import Loader from "../components/Loader";

class Wallet extends Component<Props> {
  constructor(props) {
    super(props);
    this.open_dialog = this.open_dialog.bind(this);
    this.get_wallet = this.get_wallet.bind(this);
    this.state = {
      isDialogVisible: false,
      wallet_amount: 0,
      wallet_history: "",
      payment_methods: [],
      amount: 0,
      isLoading: false,
      access_code: "",
      open_flutterwave: 0,
      exp_month: "",
      exp_month: "",
      number: "",
      cvc: "",
      validation: false,
      res: "",
      open_paystack: 0,
    };
    this.get_payment_methods();
  }

  async componentDidMount() {
    await this.get_wallet();
  }

  onChange = async (form) => {
    console.log(form.valid);
    this.setState({ validation: form.valid });
    if (form.valid) {
      let expiry = await form.values.expiry;
      let res = await expiry.split("/");
      this.setState({
        number: form.values.number,
        exp_month: res[0],
        exp_year: res[1],
        cvc: form.values.cvc,
      });
      await this.paystack();
    }
  };

  open_dialog() {
    this.setState({ isDialogVisible: true });
  }

  get_paystack_accesstoken = async () => {
    this.setState({ isLoading: true });
    await axios({
      method: "post",
      url: "https://api.paystack.co/transaction/initialize",
      headers: { Authorization: "Bearer " + global.paystack_secret_key },
      data: { email: global.email, amount: this.state.amount * 100 },
    })
      .then(async (response) => {
        this.setState({ isLoading: false });
        this.setState({ access_code: response.data.data.access_code });
      })
      .catch((error) => {
        this.setState({ isLoading: false });
        alert(strings.sorry_something_went_wrong);
      });
  };

  paystack = async () => {
    await RNPaystack.init({ publicKey: global.paystack_public_key });
    await this.get_paystack_accesstoken();
    this.setState({ isLoading: true });
    await RNPaystack.chargeCardWithAccessCode({
      cardNumber: this.state.number,
      expiryMonth: this.state.exp_month,
      expiryYear: this.state.exp_year,
      cvc: this.state.cvc,
      accessCode: this.state.access_code,
    })
      .then((response) => {
        this.setState({ isLoading: false, open_paystack: 0 });
        if (response.reference) {
          this.add_wallet();
        } else {
          alert(strings.sorry_something_went_wrong);
        }
      })
      .catch((error) => {
        this.setState({ isLoading: false, open_paystack: 0 });
        alert(strings.sorry_something_went_wrong);
      });
  };

  get_wallet = async () => {
    await axios({
      method: "post",
      url: api_url + get_wallet,
      data: { id: global.id, lang: global.lang },
    })
      .then(async (response) => {
        this.setState({
          wallet_amount: response.data.result.wallet,
          wallet_history: response.data.result.wallet_histories,
        });
        global.wallet = response.data.result.wallet;
      })
      .catch((error) => {
        this.showSnackbar(strings.sorry_something_went_wrong);
      });
  };

  add_wallet = async () => {
    this.props.addWalletPending();
    await axios({
      method: "post",
      url: api_url + add_wallet,
      data: {
        id: global.id,
        country_id: global.country_id,
        amount: this.state.amount,
      },
    })
      .then(async (response) => {
        await this.props.addWalletSuccess(response.data);
        await this.get_wallet();
      })
      .catch((error) => {
        alert(strings.sorry_something_went_wrong);
        this.props.addWalletError(error);
      });
  };

  show_alert(message) {
    this.dropDownAlertRef.alertWithType("error", "Error", message);
  }

  choose_payment = (total_fare) => {
    if (!isNaN(total_fare) && total_fare > 0) {
      this.setState({ isDialogVisible: false, amount: total_fare });
      this.select_payment();
    } else {
      alert("Please enter valid amount");
    }
  };

  get_payment_methods = async () => {
    await axios({
      method: "post",
      url: api_url + wallet_payment_methods,
      data: { country_id: global.country_id, lang: global.lang },
    })
      .then(async (response) => {
        this.setState({ payment_methods: response.data.result });
      })
      .catch((error) => {
        alert(strings.sorry_something_went_wrong);
      });
  };

  select_payment = () => {
    this.payment_done(5);
    this.RBSheet.close();
  };

  payment_done = async (payment_type) => {
    if (payment_type != 0) {
      if (payment_type == 4) {
        await this.stripe_card();
      } else if (payment_type == 5) {
        await this.razorpay();
      } else if (payment_type == 6) {
        this.paypal();
      }
    } else {
      alert(strings.please_select_payment_method);
    }
  };

  razorpay = async () => {
    var options = {
      currency: global.currency_short_code,
      key: global.razorpay_key,
      amount: this.state.amount * 100,
      name: "Bookfast",
      prefill: {
        email: global.email,
        contact: global.phone_with_code,
        name: global.first_name,
      },
      theme: { color: colors.theme_fg },
    };
    RazorpayCheckout.open(options)
      .then((data) => {
        this.add_wallet();
      })
      .catch((error) => {
        alert(strings.sorry_something_went_wrong);
      });
  };

  stripe_card = async () => {
    stripe.setOptions({
      publishableKey: global.stripe_key,
      merchantId: "MERCHANT_ID", // Optional
      androidPayMode: "test", // Android only
    });

    const response = await stripe.paymentRequestWithCardForm({
      requiredBillingAddressFields: "full",
      prefilledInformation: {
        billingAddress: {
          name: global.first_name,
        },
      },
    });
    if (response.tokenId) {
      this.stripe_payment(response.tokenId);
    } else {
      alert(strings.sorry_something_went_wrong);
    }
  };

  stripe_payment = async (token) => {
    this.setState({ isLoading: true });
    await axios({
      method: "post",
      url: api_url + stripe_payment,
      data: { customer_id: global.id, amount: this.state.amount, token: token },
    })
      .then(async (response) => {
        this.setState({ isLoading: false });
        this.add_wallet();
      })
      .catch((error) => {
        alert(strings.sorry_something_went_wrong);
        this.setState({ isLoading: false });
      });
  };

  handleOnRedirect = (data) => {
    this.setState({ open_flutterwave: 0 });
    if (data.status == "successful") {
      this.add_wallet();
    } else {
      alert("Sorry, your payment declined");
    }
  };

  close_flutterwave = () => {
    this.setState({ open_flutterwave: 0, open_paystack: 0 });
  };

  paypal = () => {
    RNPaypal.paymentRequest({
      clientId: global.paypal_id,
      environment: RNPaypal.ENVIRONMENT.NO_NETWORK,
      intent: RNPaypal.INTENT.SALE,
      price: parseFloat(this.state.amount),
      currency: global.currency,
      description: `Android testing`,
      acceptCreditCards: true,
    })
      .then((response) => {
        JSON.stringify(response);
      })
      .catch((err) => {
        console.log(err);
        alert(err);
      });
  };

  render() {
    const { isLoding, error, data, message, status } = this.props;
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.theme_bg_three }}>
        <ScrollView style={{ padding: 20 }}>
          <Loader visible={this.state.isLoading} />
          <CardView
            cardElevation={2}
            cardMaxElevation={5}
            cornerRadius={10}
            style={{
              padding: 20,
              justifyContent: "center",
              margin: 5,
              backgroundColor: colors.theme_bg_three,
              borderColor: colors.theme_bg_two,
              borderWidth: 1,
            }}
          >
            <View style={{ flexDirection: "row" }}>
              <View
                style={{
                  width: "15%",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon
                  type={Icons.Ionicons}
                  style={{ fontSize: 30, color: colors.theme_fg_two }}
                  name="ios-wallet"
                />
              </View>
              <View
                style={{
                  width: "45%",
                  alignItems: "flex-start",
                  justifyContent: "center",
                }}
              >
                <Text style={styles.bal_amt}>
                  {global.currency}
                  {this.state.wallet_amount}
                </Text>
                <Text style={styles.bal}>{strings.your_balance}</Text>
              </View>
              <View
                style={{
                  width: "40%",
                  alignItems: "flex-end",
                  justifyContent: "center",
                }}
              >
                <Button
                  title={strings.add_money}
                  onPress={this.open_dialog}
                  type="outline"
                  buttonStyle={{ borderColor: colors.theme_fg_two }}
                  titleStyle={{
                    color: colors.theme_fg_four,
                    fontFamily: font_description,
                    fontSize: 14,
                  }}
                />
              </View>
            </View>
          </CardView>
          <View style={styles.margin_10} />
          {this.state.open_flutterwave == 0 &&
            this.state.open_paystack == 0 && (
              <View>
                <Text style={styles.wal_trans}>
                  {strings.wallet_transactions}
                </Text>
                <View style={{ margin: 10 }} />
                <FlatList
                  data={this.state.wallet_history}
                  renderItem={({ item, index }) => (
                    <View style={{ flexDirection: "row" }}>
                      <View
                        style={{
                          width: "20%",
                          alignItems: "flex-start",
                          justifyContent: "center",
                        }}
                      >
                        <Image
                          square
                          source={wallet_icon}
                          style={{ height: 35, width: 35 }}
                        />
                      </View>
                      <View
                        style={{
                          width: "50%",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text style={styles.paid_wal}>{item.message}</Text>
                        <Text style={styles.date_time}>
                          {Moment(item.created_at).format(
                            "MMM DD, YYYY hh:mm A"
                          )}
                        </Text>
                      </View>
                      <View
                        style={{
                          width: "30%",
                          alignItems: "flex-end",
                          justifyContent: "center",
                        }}
                      >
                        <Text style={styles.amt}>
                          {global.currency}
                          {item.amount}
                        </Text>
                      </View>
                    </View>
                  )}
                  keyExtractor={(item) => item.id}
                />
              </View>
            )}
          {this.state.open_flutterwave == 1 && (
            <View>
              <PayWithFlutterwave
                onRedirect={this.handleOnRedirect}
                options={{
                  tx_ref: Date.now() + "-" + global.id,
                  authorization: global.flutterwave_public_key,
                  customer: {
                    email: global.email,
                  },
                  amount: this.state.amount,
                  currency: "NGN",
                  payment_options: "card",
                }}
              />
              <View style={{ margin: 10 }} />
              <Text
                style={{
                  fontFamily: font_description,
                  color: colors.theme_fg_two,
                  alignSelf: "center",
                  fontSize: 16,
                }}
                onPress={this.close_flutterwave.bind(this)}
              >
                Cancel
              </Text>
            </View>
          )}
          {this.state.open_paystack == 1 && (
            <View>
              <CreditCardInput
                onChange={this.onChange}
                labelStyle={{ color: colors.theme_fg }}
                inputStyle={{ color: colors.theme_fg }}
                validColor={{ color: colors.theme_fg }}
                placeholderColor={colors.theme_fg_three}
                additionalInputsProps={colors.theme_fg}
              />
              <View style={{ margin: 10 }} />
              <Text
                style={{
                  fontFamily: font_description,
                  color: colors.theme_fg_two,
                  alignSelf: "center",
                  fontSize: 16,
                }}
                onPress={this.close_flutterwave.bind(this)}
              >
                Cancel
              </Text>
            </View>
          )}
        </ScrollView>
        <RBSheet
          ref={(ref) => {
            this.RBSheet = ref;
          }}
          height={250}
          animationType="fade"
          duration={250}
        >
          <FlatList
            data={this.state.payment_methods}
            renderItem={({ item, index }) =>
              item.payment_type != 1 && (
                <View style={{ flexDirection: "row" }}>
                  {console.log("sss", item)}
                  <View
                    style={{
                      width: "30%",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Image
                      onPress={this.select_payment.bind(this, item)}
                      style={{ flex: 1, height: 50, width: 50 }}
                      source={{ uri: img_url + item.icon }}
                    />
                  </View>
                  <View
                    activeOpacity={1}
                    style={{
                      alignItems: "flex-start",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      onPress={this.select_payment.bind(this, item)}
                      style={{
                        color: colors.theme_fg_two,
                        fontSize: 14,
                        fontFamily: font_title,
                      }}
                    >
                      {item.payment}
                    </Text>
                  </View>
                </View>
              )
            }
            keyExtractor={(item) => item.id}
          />
        </RBSheet>
        <DialogInput
          isDialogVisible={this.state.isDialogVisible}
          title={strings.add_wallet}
          message={strings.please_enter_your_amount_here}
          hintInput={strings.enter_amount}
          textInputProps={{ keyboardType: "numeric" }}
          submitInput={(inputText) => {
            this.choose_payment(inputText);
          }}
          submitText={strings.submit}
          closeDialog={() => {
            this.setState({ isDialogVisible: false });
          }}
        >
          cancelText={strings.cancel}
        </DialogInput>
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
    isLoding: state.wallet.isLoding,
    message: state.wallet.message,
    status: state.wallet.status,
    data: state.wallet.data,
  };
}

const mapDispatchToProps = (dispatch) => ({
  addWalletPending: () => dispatch(addWalletPending()),
  addWalletError: (error) => dispatch(addWalletError(error)),
  addWalletSuccess: (data) => dispatch(addWalletSuccess(data)),
  walletPending: () => dispatch(walletPending()),
  walletError: (error) => dispatch(walletError(error)),
  walletSuccess: (data) => dispatch(walletSuccess(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Wallet);

const styles = StyleSheet.create({
  margin_10: {
    margin: 10,
  },
  description: {
    color: colors.theme_fg_four,
  },
  bal_amt: {
    fontFamily: font_title,
    fontSize: 18,
    color: colors.theme_fg_four,
  },
  bal: {
    fontSize: 13,
    color: colors.theme_fg_four,
    fontFamily: font_description,
  },
  wal_trans: {
    fontSize: 16,
    fontFamily: font_title,
    color: colors.theme_fg_two,
  },
  paid_wal: {
    fontSize: 14,
    fontFamily: font_title,
    color: colors.theme_fg_two,
    alignSelf: "flex-start",
  },
  date_time: {
    fontSize: 12,
    color: colors.theme_fg_two,
    fontFamily: font_description,
    alignSelf: "flex-start",
  },
  amt: {
    fontSize: 16,
    fontFamily: font_title,
    color: colors.theme_fg_two,
  },
});
