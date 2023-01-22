import React, {Component} from 'react'; 
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as colors from '../assets/css/Colors';
import axios from 'axios';
import { font_title, font_description, affordable, get_subscription_list, api_url, add_subscription, img_url, convenient, authentication, wallet_payment_methods, stripe_payment, success } from '../config/Constants';
import { Button } from 'react-native-elements';
import Loader from '../components/Loader';
import RBSheet from "react-native-raw-bottom-sheet";
import stripe from 'tipsi-stripe';
import strings from "../languages/strings.js";
import RazorpayCheckout from 'react-native-razorpay';
import { currentSubId, subRides, subExpireDate } from '../actions/BookingActions';
import { connect } from 'react-redux';
import LottieView from "lottie-react-native";
import Dialog, {  SlideAnimation, DialogContent } from "react-native-popup-dialog";

class Subscription extends Component<Props> {
  constructor(props) {
    super(props)
    this.state = {
      isLoading:false,
      data:[],
      payment_methods:[],
      amount:0,
      current_subscription:'',
      sub_id:0,
      isLoaderVisible: false,
    }
    this.get_payment_methods();
    this.subscription_list();
  }

  subscription_list = async() =>{
    this.setState({ isLoading:true })
    await axios({
      method: 'post', 
      url: api_url + get_subscription_list,
      data: { customer_id : global.id }
    })
    .then(async response => {
      console.log(response.data.result)
      this.setState({ isLoading:false })
      this.setState({ data : response.data.result, sub_id: response.data.result[0].id, amount:response.data.result[0].amount });
      if(response.data.current_subscription){
        this.setState({ current_subscription:response.data.current_subscription });
        this.props.currentSubId(response.data.current_subscription.id);
      }
      
    })
    .catch(error => {
      console.log(error)
      this.setState({ isLoading:false })
    });
  }

  change_subscription = (sub_id, amount) =>{
    this.setState({ amount : amount, sub_id : sub_id });
  }

  subscribe = async() =>{
    console.log({ customer_id : global.id, sub_id : this.state.sub_id  });
    this.setState({ isLoading:true })
    await axios({
      method: 'post', 
      url: api_url + add_subscription,
      data: { customer_id : global.id, sub_id : this.state.sub_id  }
    })
    .then(async response => {
      this.setState({ isLoading:false })
      if(response.data.status == 1){
        this.setState({ sub_data:response.data.result})
        this.open_dialog_box();
        this.props.currentSubId(response.data.result.current_sub_id);
        this.props.subRides(response.data.result.subscription_trips);
        this.props.subExpireDate(response.data.result.sub_expired_at);
        this.subscription_list();
      }
    })
    .catch(error => {
      alert('Sorry something went wrong')
      this.setState({ isLoading:false })
    });
  }

  get_payment_methods = async () => {
    await axios({
      method: 'post', 
      url: api_url + wallet_payment_methods,
      data: {country_id :  global.country_id, lang:global.lang}
    })
    .then(async response => {
      this.setState({ payment_methods : response.data.result })
    })
    .catch(error => {
      alert(strings.sorry_something_went_wrong);
    });
  }

  open_rb_sheet = () =>{
    this.RBSheet.open();
  }

  select_payment = (item) =>{
    this.payment_done(item.payment_type);
    this.RBSheet.close();
  }

  payment_done = async(payment_type) =>{
    if(payment_type != 0){
      if(payment_type == 6){
        await this.stripe_card();
      }else if(payment_type == 5){
        await this.razorpay();
      }else if(payment_type == 6){
       // this.paypal();
      }
    }else{
      alert(strings.please_select_payment_method);
    }
  }

  razorpay = async() =>{
    console.log({
      currency: global.currency_short_code,
      key: global.razorpay_key,
      amount: this.state.amount * 100,
      name: global.app_name,
      prefill:{
        email: global.email,
        contact: global.phone_with_code,
        name: global.first_name
      },
      theme: {color: colors.theme_fg}
    })
    var options = {
      currency: global.currency_short_code,
      key: global.razorpay_key,
      amount: this.state.amount * 100,
      name: global.app_name,
      prefill:{
        email: global.email,
        contact: global.phone_with_code,
        name: global.first_name
      },
      theme: {color: colors.theme_fg}
    }
    RazorpayCheckout.open(options).then((data) => {
      this.subscribe();
    }).catch((error) => {
      alert(strings.sorry_something_went_wrong);
    });
  }

  stripe_card = async() =>{
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
        this.get_stripe_payment(response.tokenId);
      }else{
        console.log(response)
        alert(response);
      }
  }

  get_stripe_payment = async (token) => {
    this.setState({ isLoading : true });
    await axios({
      method: 'post', 
      url: api_url + stripe_payment,
      data:{ customer_id : global.id, amount:this.state.amount, token: token}
    })
    .then(async response => {
      this.setState({ isLoading : false });
      this.subscribe();
    })
    .catch(error => {
      alert(strings.sorry_something_went_wrong);
      console.log('stripe_payment')
      this.setState({ isLoading : false });
    });
  }

  open_dialog_box = () =>{
    this.setState({ isLoaderVisible:true })
  }

  close_dialog_box = () =>{
    this.setState({ isLoaderVisible:false })
  }
 
  render() {
    return (
      <SafeAreaView style={{backgroundColor:colors.theme_fg_three, flex:1}}>
        <Loader visible={this.state.isLoading} />
        <ScrollView style={{padding:20}}>
            <View style={{ flexDirection:'row', width:'100%', marginBottom:20}}>
                <View style={{ width:'15%', alignItems:'flex-start', justifyContent:'flex-start'}}>
                    <Image square source={affordable} style={{ height:30, width:30 }} />
                </View>
                <View style={{ width:'85%', alignItems:'flex-start', justifyContent:'center'}}>
                    <Text style={{ fontSize:15, color:colors.theme_fg, fontFamily:font_title }}>Affordable</Text>
                    <View style={{ margin:3 }} />
                    <Text style={{ fontSize:12, color:colors.theme_fg_four, fontFamily:font_description }}>No worries with surge price, traffic, or time of day, when you are under subscription.</Text>
                </View>
            </View>
            <View style={{ flexDirection:'row', width:'100%', marginBottom:20}}>
                <View style={{ width:'15%', alignItems:'flex-start', justifyContent:'flex-start'}}>
                    <Image square source={convenient} style={{ height:30, width:30 }} />
                </View>
                <View style={{ width:'85%', alignItems:'flex-start', justifyContent:'center'}}>
                    <Text style={{ fontSize:15, color:colors.theme_fg, fontFamily:font_title }}>Comfortable</Text>
                    <View style={{ margin:3 }} />
                    <Text style={{ fontSize:12, color:colors.theme_fg_four, fontFamily:font_description }}>Book your ride when ever you want and be tension free without payment.</Text>
                </View>
            </View>
            <View style={{ flexDirection:'row', width:'100%', marginBottom:20}}>
                <View style={{ width:'15%', alignItems:'flex-start', justifyContent:'flex-start'}}>
                    <Image square source={authentication} style={{ height:30, width:30 }} />
                </View>
                <View style={{ width:'85%', alignItems:'flex-start', justifyContent:'center'}}>
                    <Text style={{ fontSize:15, color:colors.theme_fg, fontFamily:font_title }}>Authentic</Text>
                    <View style={{ margin:3 }} />
                    <Text style={{ fontSize:12, color:colors.theme_fg_four, fontFamily:font_description }}>Get your first preference daily services at any time without cancellation.</Text>
                </View>
            </View>
            <View style={{ margin:10 }} />
            <View style={{ flexDirection:'row'}}>
              <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                {this.state.data.map((row, rowIndex)=> { 
                  return <TouchableOpacity onPress={this.change_subscription.bind(this,row.id,row.amount)} style={[this.state.sub_id == row.id ? styles.active_sub_bg : styles.inactive_sub_bg]}>
                            <Image source={{ uri : img_url + row.sub_image }} style={{ height:30, width:30 }} />
                            <View style={{ margin:2 }} />
                            <Text style={[this.state.sub_id == row.id ? styles.active_sub_title : styles.inactive_sub_title]}>{row.sub_name}</Text>
                            <View style={{ margin:2 }} />
                            <Text style={[this.state.sub_id == row.id ? styles.active_sub_desc : styles.inactive_sub_desc]}>{row.validity_label}</Text>
                        </TouchableOpacity>
                  })
                }
              </ScrollView>
            </View>
            <View style={{ margin:10 }} />
            <Text style={{ fontSize:14, color:colors.theme_fg_four, fontFamily:font_description, alignSelf:'center', fontStyle: 'italic' }}>Try out the our subscription plan</Text>
            <View style={{ margin:10 }} />
            {this.props.current_sub_id != 0 ?
              <View style={{ flexDirection:'row', borderWidth:1, borderRadius:10, borderColor:colors.theme_fg, width:'100%', alignItems:'center', justifyContent:'center', padding:5 }}>
                <View style={{ width:'20%', alignItems:'center', justifyContent:'center' }}>
                  <Image square source={{uri: img_url+this.state.current_subscription.sub_image}} style={{ height:40, width:40 }} />
                </View>
                <View style={{  width:'80%', alignItems:'flex-start', justifyContent:'center' }}>
                  <Text style={{ fontFamily:font_title, fontSize:16, color:colors.theme_bg}}>your are in {this.state.current_subscription.sub_name} Plan</Text>
                  <Text  style={{ fontFamily:font_description, fontSize:14, color:colors.theme_bg}}>This package covers {this.state.current_subscription.free_bookings} rides.</Text>
                </View>
              </View>
              :
              <Button
                title="Get Started"
                onPress={this.open_rb_sheet}
                buttonStyle={{ backgroundColor:colors.theme_bg, width:'90%', marginLeft:'5%' }}
                titleStyle={{ fontFamily:font_title,color:colors.theme_fg_three, fontSize:14 }}
              />
            }
        </ScrollView>
        <RBSheet
          ref={ref => {
            this.RBSheet = ref;
          }}
          height={250}
          animationType="fade"
          duration={250}
        >
          <FlatList
            data={this.state.payment_methods}
            renderItem={({ item,index }) => (
              item.payment_type != 1 &&
              <View style={{ flexDirection:'row'}} >
                <View style={{ width:'30%', alignItems:'center', justifyContent:'center'}}>
                  <Image 
                    onPress={this.select_payment.bind(this,item)}
                    style= {{flex:1 ,height:50, width:50 }}
                    source={{ uri : img_url + item.icon }}
                  />
                </View>
                <View activeOpacity={1} style={{ alignItems:'flex-start', justifyContent:'center'}}>
                  <Text  onPress={this.select_payment.bind(this,item)} style={{color:colors.theme_fg_two, fontSize:14, fontFamily:font_title}}>{item.payment}</Text>
                </View>
              </View>
            )}
            keyExtractor={item => item.id}
          />
        </RBSheet>
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
            this.setState({ isLoaderVisible: false });
          }}
        >
          <DialogContent>
            <TouchableOpacity onPress={this.close_dialog_box.bind(this)} activeOpacity={1}
              style={{
                padding: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View style={{ alignItems: "center", padding: 20 }}>
                <LottieView
                  style={{ height: 100, width: 100 }}
                  source={success}
                  autoPlay
                  loop
                />
              </View>
              <Text onPress={this.close_dialog_box.bind(this)} style={{ fontSize: 14, fontFamily: font_title, color:colors.green }}>
                Successfully subscribed
              </Text>
              <View style={{ margin: 10 }} />
            </TouchableOpacity>
          </DialogContent>
        </Dialog>
      </SafeAreaView>
    );
  }
}

function mapStateToProps(state){
  return{
    current_sub_id : state.booking.current_sub_id,
    sub_rides : state.booking.sub_rides,
    sub_expire_date : state.booking.sub_expire_date,
  };
}

const mapDispatchToProps = (dispatch) => ({
  currentSubId: (data) => dispatch(currentSubId(data)),
  subRides: (data) => dispatch(subRides(data)),
  subExpireDate: (data) => dispatch(subExpireDate(data))
});

export default connect(mapStateToProps,mapDispatchToProps)(Subscription);

const styles = StyleSheet.create({
  active_sub_bg :{
    margin:5, 
    width:150, 
    height:150, 
    borderRadius:10, 
    backgroundColor:colors.theme_bg, 
    alignItems:'center', 
    justifyContent:'center'
  },
  active_sub_title:{
    fontSize:20, 
    color:colors.theme_fg_three, 
    fontFamily:font_title
  },
  active_sub_desc:{
    fontSize:12, 
    color:colors.theme_fg_three, 
    fontFamily:font_title
  },
  inactive_sub_bg :{
    margin:5, 
    width:150, 
    height:150, 
    borderRadius:10, 
    backgroundColor:colors.theme_bg_three, 
    alignItems:'center', 
    justifyContent:'center',
    borderWidth:1,
    borderColor:colors.theme_fg
  },
  inactive_sub_title:{
    fontSize:20, 
    color:colors.theme_fg_two, 
    fontFamily:font_title
  },
  inactive_sub_desc:{
    fontSize:12, 
    color:colors.theme_fg_two, 
    fontFamily:font_title
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
});