import React, {Component} from 'react';
import { StyleSheet, View, Text } from 'react-native';
import * as colors from '../assets/css/Colors';
import { alert_close_timing, profile_update, api_url, font_title, font_description, height_10, height_40 } from '../config/Constants';
import DropdownAlert from 'react-native-dropdownalert';
import { Button } from 'react-native-elements';
import axios from 'axios';
import { connect } from 'react-redux';
import { profilePending, profileError, profileSuccess } from '../actions/ProfileActions';
import strings from "../languages/strings.js";
import {Picker} from '@react-native-picker/picker';
import Loader from '../components/Loader';

class EditGender extends Component<Props> {
  constructor(props) {
    super(props)
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state = {
      gender: this.props.route.params.gender,
      validation:true,
      isLoading:false
      }
  }

  handleBackButtonClick= () => {
    this.props.navigation.goBack(null);
  }

  check_validate = () =>{
    if(this.state.gender == ""){
      this.show_alert(strings.please_choose_your_gender);
    }else{
     this.update_data()
    }
  }

 update_data = async () => {
  this.setState({ isLoading:true })
    this.props.profilePending();
     await axios({
      method: 'post', 
      url: api_url + profile_update,
      data:{ id : global.id, gender : this.state.gender}
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

    gender_list = async(value)=>{
    //alert(value);
    await this.setState({gender : value});
  }

  render() {
    return (
      <View style={{backgroundColor:colors.theme_fg_three,height:"100%",width:"100%" }}>
        <Loader visible={this.state.isLoading} />
        <View style={{backgroundColor:colors.theme_fg_three}}>
          <View style={{ padding:20, height:height_40 }}>
            <Text style={styles.name_title}>{strings.edit_your_gender}</Text>
            <Picker
              selectedValue={this.state.gender}
              style={{height: 100, color:colors.theme_fg_two}}
              onValueChange={(itemValue, itemIndex) =>
                this.gender_list(itemValue)
              }>
              <Picker.Item label="Male" value={1} fontSize={20} />
              <Picker.Item label="Female" value={2} />
            </Picker>
            <View style={styles.margin_5} />
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

export default connect(mapStateToProps,mapDispatchToProps)(EditGender);

const styles = StyleSheet.create({
  name_title:{
    alignSelf:'center', 
    color:colors.theme_fg_two,
    alignSelf:'flex-start', 
    fontSize:20,
    letterSpacing:0.5,
    fontFamily:font_title
  },
  margin_5:{
    margin:5
  },
});
  
  
