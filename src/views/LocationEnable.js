import React, {Component} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import * as colors from '../assets/css/Colors';
import LottieView from 'lottie-react-native';
import { location_lottie, app_name, font_title, font_description } from '../config/Constants';
import { Button } from 'react-native-elements';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import Geolocation from '@react-native-community/geolocation';
import strings from "../languages/strings.js";
import { SafeAreaView } from 'react-native-safe-area-context';

export default class LocationEnable extends Component<Props> {
  constructor(props) {
    super(props)
  }

  enable_gps = () =>{
    if(Platform.os === "android"){
      RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({interval: 10000, fastInterval: 5000})
      .then(data => {
        this.props.navigation.navigate('Splash');
      }).catch(err => {
         
      });
    }else{
      Geolocation.getCurrentPosition( async(position) => {
          this.props.navigation.navigate('Splash');
        }, error => alert('Please try again once') , 
        {enableHighAccuracy: false, timeout: 10000 });
    }
  }

  render() {
    return (
      <SafeAreaView style={{ backgroundColor:colors.theme_fg_three, flex:1, padding:20 }}>
        <View style={{ alignItems:'center', marginTop:'40%', padding:20}}>
          <LottieView style={{ height:200, width:200 }}source={location_lottie} autoPlay loop />
          <View style={{ margin:10}} />
          <Text style={styles.title} >{strings.enable_your_GPS_location}</Text>
          <View style={{ margin:10}} />
          <Text style={styles.description}>{strings.please_allow} {app_name} {strings.to_enable_your_phone_GPS_for_accurate_pickup}</Text>
        </View>
        <TouchableOpacity style={styles.footer} >
          <View style={styles.footer_content}>
            <Button
              onPress={this.enable_gps.bind(this)}
              title={strings.enable_GPS}
              buttonStyle={styles.footer_btn}
              titleStyle={{ fontFamily:font_description,color:colors.theme_fg_three, fontSize:14 }}
            />
          </View>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  title:{
    alignSelf:'center', 
    color:colors.theme_fg_two,
    alignSelf:'center', 
    fontSize:20, 
    fontFamily:font_title
  },
  description:{
    color:colors.theme_fg_four, 
    fontSize:14,
    textAlign:'center',
    fontFamily:font_description
  },
  footer:{
    backgroundColor:colors.theme_bg_three,
    alignSelf:'center'
  },
  footer_content:{
    width:'90%'
  },
  footer_btn:{
    backgroundColor:colors.theme_bg
  }
});
