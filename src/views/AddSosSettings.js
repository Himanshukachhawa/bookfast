import React, {Component} from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, SafeAreaView } from 'react-native';
import * as colors from '../assets/css/Colors';
import { alert_close_timing, api_url, font_title, font_description, height_40, add_sos_contact } from '../config/Constants';
import DropdownAlert from 'react-native-dropdownalert';
import axios from 'axios';
import { connect } from 'react-redux';
import { profilePending, profileError, profileSuccess } from '../actions/ProfileActions';
import Loader from '../components/Loader';
import strings from "../languages/strings.js";

class AddSosSettings extends Component<Props> {
  constructor(props) {
    super(props)
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state = {
      name:'',
      phone_number:'', 
      validation:true, 
      isLoading:false
      }
  } 

  handleBackButtonClick= () => {
    this.props.navigation.goBack(null);
  }

  sos_settings = () => {
    this.props.navigation.navigate('SosSettings');
  }

  add_sos = async () => { 
    this.setState({ isLoading:true })
    await axios({ 
      method: 'post',  
      url: api_url + add_sos_contact,
      data:{  name:this.state.name,
              phone_number:this.state.phone_number,
              customer_id:global.id
            }
    })
    .then(async response => {
      this.setState({ isLoading:false })
      if(response.data.status == 0){
        alert(response.data.message);
      }
      else{
        this.handleBackButtonClick();
      }   
    })
    .catch(error => { 
     alert(strings.sorry_something_went_wrong); 
     this.setState({ isLoading:false })
    });
  }

  show_alert(message){
    this.dropDownAlertRef.alertWithType('error', 'Error',message);
  }

  render() {
    return (
      <SafeAreaView style={{backgroundColor:colors.theme_fg_three, flex:1}}>
          <View style={styles.main_view_two}>
            <Loader visible={this.state.isLoading} />
              <View style={styles.view_padding}>
                <Text style={styles.name_title}>{strings.phone_number}</Text>
                <TextInput
                  ref={ref => this.name = ref}
                  placeholder={strings.phone_number}
                  placeholderTextColor = {colors.theme_fg_four}
                  style = {styles.textinput}
                  keyboardType="number-pad"
                  onChangeText={ TextInputValue =>
                    this.setState({phone_number : TextInputValue }) }
                />
                <View style={styles.margin_10}/>
                <Text style={styles.name_title}>{strings.name}</Text>
                <TextInput
                  ref={ref => this.name = ref}
                  placeholder={strings.john}
                  placeholderTextColor = {colors.theme_fg_four}
                  style = {styles.textinput}
                  value = {this.state.first_name} 
                  onChangeText={ TextInputValue =>
                    this.setState({name : TextInputValue }) }
                />
              </View>
          </View> 
            <View style={styles.margin_5}/>  
            <TouchableOpacity activeOpacity={1} onPress={this.add_sos} style={styles.footer}>
              <Text style={styles.title_style}>{strings.submit}</Text>
            </TouchableOpacity>
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

export default connect(mapStateToProps,mapDispatchToProps)(AddSosSettings); 

const styles = StyleSheet.create({
  name_title:{
    alignSelf:'center', 
    color:colors.theme_fg_two,
    alignSelf:'flex-start', 
    fontSize:18,
    letterSpacing:0.5,
    fontFamily:font_title,
    marginLeft:10
  },
  margin_10:{
    margin:10
  },
  margin_5:{
    margin:5
  },
  textinput:{
    borderBottomWidth : 1, 
    fontSize:18,
    color:colors.theme_fg_four,
    fontFamily:font_description,
    marginLeft:10,
    borderBottomColor:colors.theme_bg_two,
    marginTop:10
  },
  footer:{
    position:'absolute',
    bottom:0,
    height:45,
    alignItems:'center',
    justifyContent:'center',
    width:'100%',
    backgroundColor: colors.theme_bg
  },
  title_style:{ 
    fontFamily:font_description,
    color:colors.theme_fg_three,
    fontSize:18
  },
  main_view_style:{
    backgroundColor:colors.theme_fg_three,height:"100%",width:"100%"
  },
  main_view_two:{
    backgroundColor:colors.theme_fg_three
  },
  view_padding:{
    padding:15, height:height_40
  },
});