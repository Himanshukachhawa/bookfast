import React, {Component} from 'react';
import { StyleSheet, View, Text } from 'react-native';
import * as colors from '../assets/css/Colors';
import { alert_close_timing, profile_update, api_url, font_title, font_description, height_10, height_40 } from '../config/Constants';
import DropdownAlert from 'react-native-dropdownalert';
import { Button } from 'react-native-elements';
import PhoneInput from 'react-native-phone-input';
import axios from 'axios';
import { connect } from 'react-redux';
import { profilePending, profileError, profileSuccess } from '../actions/ProfileActions';
import strings from "../languages/strings.js";
import Loader from '../components/Loader';

class EditPhoneNumber extends Component<Props> {
  constructor(props) {
    super(props)
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.check_phone_number = this.check_phone_number.bind(this);
    this.state = {
      phone: this.props.route.params.phone_number,
      validation:true,
      isLoading:false
      }
  }

  componentDidMount() {
    setTimeout(() => {
      this.phone.focus();
    }, 200);
  }

  handleBackButtonClick= () => {
    this.props.navigation.goBack(null);
  }

  async check_phone_number(){
    await this.check_validate();
    if(this.state.validation){
      await this.update_data();
    }
  }

  async check_validate(){
    
    if('+'+this.phone.getCountryCode() == this.phone.getValue()){
      this.setState({ validation:false });
      this.show_alert(strings.please_enter_phone_number);
    }else if(!this.phone.isValidNumber()){
      this.setState({ validation:false });
      this.show_alert(strings.please_enter_valid_phone_number);
    }else{
      let phone_number = this.phone.getValue();
      phone_number = phone_number.replace("+"+this.phone.getCountryCode(), "");
      this.setState({ phone : phone_number });
      this.setState({ validation:true });
    }
  }

  update_data = async () => {
    this.setState({ isLoading:true })
    this.props.profilePending();
      await axios({
        method: 'post', 
        url: api_url + profile_update,
        data:{ id : global.id, phone_number : this.state.phone, country_code : '+'+this.phone.getCountryCode(), phone_with_code: '+'+this.phone.getCountryCode()+this.state.phone } 
      })
      .then(async response => {
        this.setState({ isLoading:false })
        await this.props.profileSuccess(response.data);
        this.handleBackButtonClick();
      })
      .catch(error => {
        this.setState({ isLoading:false })
          this.showSnackbar(strings.sorry_something_went_wrong);
          this.props.profileError(error);
    });
  }

  show_alert(message){
    this.dropDownAlertRef.alertWithType('error', 'Error',message);
  }

  render() {
    return (
       <View style={{backgroundColor:colors.theme_fg_three,height:"100%",width:"100%" }}>
         <Loader visible={this.state.isLoading} />
        <View style={{backgroundColor:colors.theme_fg_three}}>
          <View style={{ padding:20, height:height_40 }}>
            <Text style={styles.name_title}>{strings.edit_your_phone_number}</Text>
            <View style={styles.margin_10} />
            <PhoneInput style={{ borderColor:colors.theme_fg_two, borderBottomWidth:0.5 }} flagStyle={styles.flag_style} ref={(ref) => { this.phone = ref; }} value={this.state.phone} initialCountry="in" offset={10} textStyle={styles.country_text} textProps={{ placeholder: strings.phone_number, placeholderTextColor : colors.theme_fg_four }} autoFormat={true} />
            <View style={styles.margin_20} />
            <Button
              title={strings.update}
              onPress={this.check_phone_number.bind(this)}
              buttonStyle={{ backgroundColor:colors.theme_bg }}
               titleStyle={{ fontFamily:font_description,color:colors.theme_fg_three, fontSize:14 }}
            />
          </View>
        <View style={{ height:height_10 }} />    
        </View>
        <DropdownAlert ref={ref => this.dropDownAlertRef = ref} closeInterval={alert_close_timing} />
      </View>
    );
  }
}
function mapStateToProps(state){
  return{
    isLoding : state.profile.isLoding,
    message : state.profile.message,
    status : state.profile.status,
    data : state.profile.data,
  };
}

const mapDispatchToProps = (dispatch) => ({
    profilePending: () => dispatch(profilePending()),
    profileError: (error) => dispatch(profileError(error)),
    profileSuccess: (data) => dispatch(profileSuccess(data)),
});

export default connect(mapStateToProps,mapDispatchToProps)(EditPhoneNumber);

const styles = StyleSheet.create({
  name_title:{
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
  flag_style:{
    width: 38, 
    height: 24
  },
  country_text:{
    fontSize:18, 
    borderBottomWidth:1, 
    paddingBottom:8, 
    height:35,
    color:colors.theme_fg_four,
    fontFamily:font_description,
    fontSize:14,
  },
  margin_20:{
    margin:20
  },
});
