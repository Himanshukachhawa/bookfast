import React, {Component} from 'react';
import { StyleSheet, View, TextInput, Text } from 'react-native';
import * as colors from '../assets/css/Colors';
import { alert_close_timing, api_url, profile_update, font_title, font_description, height_10, height_40 } from '../config/Constants';
import DropdownAlert from 'react-native-dropdownalert';
import { Button } from 'react-native-elements';
import axios from 'axios';
import { connect } from 'react-redux';
import { profilePending, profileError, profileSuccess } from '../actions/ProfileActions';
import strings from "../languages/strings.js";
import Loader from '../components/Loader';

class EditPassword extends Component<Props> {
  constructor(props) {
    super(props)
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state = {
      password:'',
      validation:true,
      isLoading:false
      }
  }

  componentDidMount() {
    setTimeout(() => {
      this.password.focus();
    }, 200);
  }

  handleBackButtonClick= () => {
    this.props.navigation.goBack(null);
  }

  check_validate = () =>{
    if(this.state.password == ""){
      this.show_alert(strings.please_enter_password);
    }else{
      this.update_data();
    }
  }

  update_data = async () => {
    this.setState({ isLoading:true })
      this.props.profilePending();
      await axios({
        method: 'post', 
        url: api_url + profile_update,
        data:{ id : global.id, password : this.state.password}
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
            <Text style={styles.name_title}>{strings.edit_your_password}</Text>
            <View style={styles.margin_10} />
            <TextInput
              ref={ref => this.password = ref}
              placeholder="******"
              secureTextEntry={true}
              placeholderTextColor = {colors.theme_fg_four}
              style = {styles.textinput}
              onChangeText={ TextInputValue =>
                this.setState({password : TextInputValue }) }
            />
            <View style={styles.margin_20} />
            <Button
              title="Update"
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

export default connect(mapStateToProps,mapDispatchToProps)(EditPassword);

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
