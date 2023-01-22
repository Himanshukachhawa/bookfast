import React, {Component} from 'react';
import { Share, StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import * as colors from '../assets/css/Colors';
import { refer_lottie } from '../config/Constants';
import LottieView from 'lottie-react-native';
import { font_title, font_description , api_url, get_referral_message, app_name} from '../config/Constants';
import axios from 'axios';
import strings from "../languages/strings.js";
import { SafeAreaView } from 'react-native-safe-area-context';
import Loader from '../components/Loader';

class Refer extends Component<Props> {
  constructor(props) {
    super(props)
    this.state = { 
      msg: strings.your_refferal_code_from,
      refferal_message:'',
      referral_bonus: '',
      isLoading:false
    } 
    this.referral();
  } 

  show_alert(message){
    this.dropDownAlertRef.alertWithType('error', 'Error',message);
  }

  referral = async () => {
    this.setState({ isLoading:true })
    await axios({
      method: 'post', 
      url: api_url + get_referral_message,  
       data:{ customer_id:global.id, lang:global.lang }
    })
    .then(async response => {
      this.setState({ isLoading:false })
      this.setState({ referral_code:response.data.code, refferal_message: response.data.result.referral_message, referral_bonus: response.data.result.referral_bonus})
    })
    .catch(error => {
      console.log(error)
      this.setState({ isLoading:false })
      alert('Sorry something went wrong');
    });
  } 
 
  open_sms = async()=>{
    try {
      const result = await Share.share({
        title: strings.share_your_referral,
        message: this.state.msg + app_name + strings.app_is + this.state.referral_code, 
        url: 'https://play.google.com/store/apps/details?id=nic.goi.aarogyasetu&hl=en'
      });
    } catch (error) {
      alert(error.message);
    }
  }

  render() {
    return (
      <SafeAreaView style={{ backgroundColor:colors.theme_fg_three, flex:1}}>
        <Loader visible={this.state.isLoading} />
        <ScrollView style={{ padding:20 }}>
          <View style={{ alignItems:'center', padding:20}}>
            <LottieView style={{ height:200, width:200 }}source={refer_lottie} autoPlay loop />
          </View>
          <View style={{ margin:10}} />
          <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'center'}}> 
            <Text style={styles.refering}>{strings.refer_your_friends_and_get} {this.state.referral_bonus}</Text>
          </View>
          <View style={{ margin:10}} />
          <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'center'}}> 
            <Text style={styles.description}>{this.state.refferal_message}</Text>
          </View>
        </ScrollView>
        <TouchableOpacity activeOpacity={1} onPress={this.open_sms} style={styles.footer} >
          <Text style={{ fontFamily:font_description, fontSize:14, color:colors.theme_fg_three}}>{strings.refer_friends}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
}

export default Refer;

const styles = StyleSheet.create({
  footer:{
    position:'absolute',
    bottom:0,
    height:45,
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:colors.theme_bg,
    width:'100%'
  },
  refering:{ fontSize:20, fontFamily:font_title, color:colors.theme_fg_two },
  description:{ color:colors.theme_fg_four, fontFamily:font_description, fontSize:14},


});
