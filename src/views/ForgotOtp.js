import React, {Component} from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import * as colors from '../assets/css/Colors';
import { alert_close_timing, otp_validation_error, font_title, font_description, height_10, api_url, forgot } from '../config/Constants';
import DropdownAlert from 'react-native-dropdownalert';
import CodeInput from 'react-native-confirmation-code-input';
import strings from "../languages/strings.js";
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import Loader from '../components/Loader';
class ForgotOtp extends Component<Props> {
  constructor(props) {
    super(props)
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state={
      otp:this.props.route.params.otp,
      phone_with_code:this.props.route.params.phone_with_code,
      timer: 30,
      isLoading:false
    }
    console.log(this.state.phone_with_code);
  }

  componentDidMount() {
      this.start_timer()
  }
   
  start_timer(){
    this.clockCall = setInterval(() => {
      this.decrementClock();
    }, 1000);
  }

  componentWillUnmount() {
  clearInterval(this.clockCall);
  }
  
  decrementClock = () => {   
    if(this.state.timer < 1){
    clearInterval(this.clockCall);
    }else{
    this.setState((prevstate) => ({ timer: prevstate.timer-1 }));
    }   
  };

  handleBackButtonClick= () => {
    this.props.navigation.goBack(null);
  }

  async check_phone(phone_with_code){
    this.setState({ isLoading:true })
    await axios({
      method: 'post', 
      url: api_url + forgot,
      data:{ phone_with_code : phone_with_code}
    })
    .then(async response => {
      console.log(response.data);
      this.setState({ isLoading:false })
      if(response.data.status == 1){
        this.setState({ otp : response.data.result.otp, timer:30 })
        this.start_timer();
      }
    })
    .catch(error => {
      this.setState({ isLoading:false })
      alert('Sorry somethin went wrong');
    });
  }

  async check_otp(code) {
    if(code != this.state.otp.otp) {
      this.show_alert(otp_validation_error);
    } else {
      this.props.navigation.navigate('ResetPassword', {id: this.state.otp.id});
    }
  }

  show_alert(message){
    this.dropDownAlertRef.alertWithType('error', 'Error',message);
  }

  render() {
    return (
      <SafeAreaView style={{backgroundColor:colors.theme_fg_three,height:"100%",width:"100%" }}>
        <Loader visible={this.state.isLoading} />
        <ScrollView style={{backgroundColor:colors.theme_fg_three}}>
          <View style={styles.padding_20}>
            <Text style={styles.otp_title}>{strings.please_enter_OTP}</Text>
            <View style={styles.margin_10} />
            <View>
              <CodeInput
                ref="codeInputRef2"
                keyboardType="numeric"
                codeLength={4}
                className='border-circle'
                autoFocus={false}
                codeInputStyle={{ fontWeight: '800' }}
                activeColor={colors.theme_bg}
                inactiveColor={colors.theme_bg}
                onFulfill={(isValid) => this.check_otp(isValid)}
              />
            </View>
            <View style={styles.margin_10} />
            <Text style={styles.description} >{strings.enter_the_code_you_have_received_by_SMS_in_order_to_verify_account}</Text>
            <View style={{ margin:10 }} />
            {this.state.timer == 0 ? 
            <Text onPress={this.check_phone.bind(this,this.state.phone_with_code)} style={{ fontSize:15, fontFamily:font_title, color:colors.theme_fg_two, alignSelf:'center', textDecorationLine: 'underline'}} >{strings.resend_otp}</Text>
            :
            <Text style={{ fontSize:15, fontFamily:font_title, color:colors.theme_fg_four, alignSelf:'center'}} >{strings.resend_code_in}{this.state.timer}</Text>
            }
          </View>
          <View style={{ height:height_10 }} />
          <View style={{margin:50}} />
        </ScrollView>
        <DropdownAlert ref={ref => this.dropDownAlertRef = ref} closeInterval={alert_close_timing} />
      </SafeAreaView>
    );
  }
}

export default ForgotOtp;

const styles = StyleSheet.create({
  otp_title:{
    alignSelf:'center', 
    color:colors.theme_fg_two,
    alignSelf:'flex-start', 
    fontSize:20,
    letterSpacing:0.5,
    fontFamily:font_title
  },
  margin_10:{
    margin:10
  },
  padding_20:{
    padding:20
  },
  description:{
    color:colors.theme_fg_four,
    fontFamily:font_description,
    fontSize:14
  }
});
