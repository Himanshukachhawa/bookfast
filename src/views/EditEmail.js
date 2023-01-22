import React, {Component} from 'react';
import { StyleSheet, View, TextInput, Text } from 'react-native';
import * as colors from '../assets/css/Colors';
import { alert_close_timing, api_url, profile_update, font_title, font_description, height_10, height_40, update_email } from '../config/Constants';
import DropdownAlert from 'react-native-dropdownalert';
import { Button } from 'react-native-elements';
import axios from 'axios';
import { connect } from 'react-redux';
import { profilePending, profileError, profileSuccess } from '../actions/ProfileActions';
import strings from "../languages/strings.js";
import { SafeAreaView } from 'react-native-safe-area-context';
import Loader from '../components/Loader';

class EditEmail extends Component<Props> {
  constructor(props) {
    super(props)
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state = {
      email: this.props.route.params.email,
      validation:true,
      isLoading:false
      }
  }

  componentDidMount() {
    setTimeout(() => {
      this.email.focus();
    }, 200);
  }

  handleBackButtonClick= () => {
    this.props.navigation.goBack(null);
  }

  async check_name(){
    this.check_validate();
    if(this.state.validation){
      this.handleBackButtonClick();
    }
  }

  check_validate = () =>{
    if(this.state.email == ""){
      this.show_alert(strings.please_enter_email_address);
    }else{
      this.check_email();
    }
  }

  check_email = async() =>{
    this.setState({ isLoading:true })
     await axios({
      method: 'post', 
      url: api_url + update_email,
      data:{ id : global.id, email: this.state.email}
    })
    .then(async response => {
      this.setState({ isLoading:false })
      if(response.data.status == 0 ){
        alert(response.data.message)
      }else{
        this.handleBackButtonClick();
      }

    })
    .catch(error => {
      this.setState({ isLoading:false })
      alert(strings.sorry_something_went_wrong);
    });
  }

  show_alert(message){
    this.dropDownAlertRef.alertWithType('error', 'Error',message);
  }

  render() {
    return (
       <SafeAreaView style={{backgroundColor:colors.theme_fg_three,height:"100%",width:"100%" }}>
        <Loader visible={this.state.isLoading} />
        <View style={{backgroundColor:colors.theme_fg_three}}>
          <View style={{ padding:20, height:height_40 }}>
            <Text style={styles.name_title}>{strings.edit_your_email_address}</Text>
            <View style={styles.margin_10} />
            <TextInput
              ref={ref => this.email = ref}
              placeholderTextColor = {colors.theme_fg_four}
              style = {styles.textinput}
              value = {this.state.email}
              onChangeText={ TextInputValue =>
                this.setState({email : TextInputValue }) }
            />
            <View style={styles.margin_20} />
            <Button
              title={strings.update}
              onPress={this.check_validate}
              buttonStyle={{ backgroundColor:colors.theme_bg }}
              titleStyle={{ fontFamily:font_description,color:colors.theme_fg_three, fontSize:14 }}
            />
          </View>
           <View style={{ height:height_10 }} /> 
        </View>
        <DropdownAlert ref={ref => this.dropDownAlertRef = ref} closeInterval={alert_close_timing} />
      </SafeAreaView>
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

export default connect(mapStateToProps,mapDispatchToProps)(EditEmail);

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
  textinput:{
    borderBottomWidth : 1, 
    fontSize:18,
    color:colors.theme_fg_four,
    fontFamily:font_description
  },
  margin_20:{
    margin:20
  },
  
});
