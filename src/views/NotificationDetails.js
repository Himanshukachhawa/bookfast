import React, {Component} from 'react';
import { StyleSheet, Text, Image, View, SafeAreaView, ScrollView } from 'react-native';
import * as colors from '../assets/css/Colors';
import { font_title, font_description , img_url} from '../config/Constants';

class NotificationDetails extends Component<Props> {
  constructor(props) {
    super(props)
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state = {
      data:this.props.route.params.data
    }
  }

  handleBackButtonClick= () => {
    this.props.navigation.goBack(null);
  }

  render() {
    return (
      <SafeAreaView style={{backgroundColor:colors.theme_fg_three, flex:1}}>
        <ScrollView>
          <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'center'}}>
            <View style={styles.notification_img}>
              <Image
                style= {{flex:1 , width: undefined, height: undefined}}
                source={{uri: img_url + this.state.data.image}}
              />
            </View>
          </View>
          <View style={{ padding:10 }}>
            <View style={{ flexDirection:'row'}}>
              <View style={{ alignItems:'center', justifyContent:'center'}}><Text style={styles.notification_title}>{this.state.data.title}</Text></View>
            </View>
            <View style={styles.margin_10} />
            <Text style={styles.description}>{this.state.data.message}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

export default NotificationDetails;

const styles = StyleSheet.create({
  margin_10:{
    margin:10
  },
  notification_title:{
    alignSelf:'center', 
    color:colors.theme_fg_two,
    fontSize:20,
    fontFamily:font_title
  },
  notification_img:{
    height:200, 
    width:'100%'
  },
  description:{ color:colors.theme_fg_four, alignSelf:'center', fontFamily:font_description, fontSize:14}
});
