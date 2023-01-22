import React, {Component} from 'react';
import { StyleSheet, Text, Image, View, ScrollView, Button  } from 'react-native';
import * as colors from '../assets/css/Colors';
import { logo, font_title, font_description, about_us, api_url } from '../config/Constants';
import { Divider } from 'react-native-elements';
import axios from 'axios';
import { CommonActions } from '@react-navigation/native';
import strings from "../languages/strings.js";
import Icon, { Icons } from '../components/Icons';
import Loader from '../components/Loader';
import crashlytics from '@react-native-firebase/crashlytics';

class AboutUs extends Component<Props> {
  constructor(props) {
      super(props)
      this.about_us();
      this.state={
        about_us:[],
        isLoading:false
      }
      crashlytics().log('App mounted.');
  }

  show_alert(message){
    this.dropDownAlertRef.alertWithType('error', 'Error',message);
  }

  about_us = async () => {
    this.setState({ isLoading:true })
     await axios({
      method: 'post', 
      url: api_url + about_us,
      data: {lang:global.lang}
    })
    .then(async response => {
      this.setState({ isLoading:false })
        await this.setState({  about_us:response.data.result});
    })
    .catch(error => {
      this.setState({ isLoading:false })
        this.showSnackbar(strings.sorry_something_went_wrong);
    });
  }

  render() {
    return (
      <ScrollView  style={styles.content_padder}>
        <Loader visible={this.state.isLoading} />
        <View style={{ alignItems:'center', justifyContent:'center', backgroundColor:colors.theme_bg_two }}>
          <View style={styles.logo}>
            <Image
              style= {styles.image_style}
              source={logo}
            />
          </View>
          <View style={styles.margin_10} />
          <Text style={styles.version}>{strings.version} 1.0</Text>
        </View>
        <Divider style={styles.default_divider} />
        <View style={{ flexDirection:'row'}}>
          <Text style={styles.description_title}>{strings.who_we_are}</Text>
        </View>
        <View style={styles.margin_10} />
        <Text style={styles.description}>{this.state.about_us.about_us}</Text>
        <View style={styles.margin_10} />
        <View style={{ flexDirection:'row'}}>
          <Text style={styles.contact_details}>{strings.contact_details}</Text>
        </View>
        <View style={styles.margin_10} />
        <View style={{ flexDirection:'row'}}>
          <Icon type={Icons.Ionicons} style={styles.icon_style} name='call' /><Text style={styles.phone_no}>{this.state.about_us.phone_number}</Text>
        </View>
        <View style={styles.margin_10} />
        <View style={{ flexDirection:'row'}}>
          <Icon type={Icons.Ionicons} style={styles.icon_style} name='mail' /><Text style={styles.email}>{this.state.about_us.email}</Text>
        </View>
        <View style={styles.margin_10} />
        <View style={{ flexDirection:'row'}}>
          <Icon type={Icons.Ionicons} style={styles.icon_style} name='pin' /><Text style={styles.address}>{this.state.about_us.address}</Text>
        </View>
      </ScrollView>
    );
  }
}

export default AboutUs;

const styles = StyleSheet.create({
  margin_10:{
    margin:10
  },
  logo:{
    height:'40%', 
    width:'71%',
  },
  default_divider:{ 
    marginTop:20, 
    marginBottom:20 
  },
  version:{ 
    fontSize:15, 
    fontFamily:font_title,
    color:colors.theme_fg_two
  },
  description_title:{ 
    fontSize:18, 
    fontFamily:font_title, 
    color:colors.theme_fg_two 
  },
  description:{ 
    color:colors.theme_fg_four, 
    fontFamily:font_description,
    fontSize:14
  },
  contact_details:{ 
    fontSize:18, 
    fontFamily:font_title, 
    color:colors.theme_fg_two 
  },
  phone_no:{ 
    fontSize:14, 
    color:colors.theme_fg_four, 
    fontFamily:font_description
  },
  email:{ 
    fontSize:14, 
    color:colors.theme_fg_four, 
    fontFamily:font_description 
  },
  address:{ 
    fontSize:14, 
    color:colors.theme_fg_four, 
    fontFamily:font_description 
  },
  content_padder:{ 
    backgroundColor:colors.theme_bg_three,
    padding:20,
    flex:1
  },
  icon_style:{ 
    fontSize:18, marginRight:10,color:colors.theme_fg
  },
  image_style:{ 
    flex:1 , width: undefined, height: undefined
  },
});
