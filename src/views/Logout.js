import React, {Component} from 'react';
import { StyleSheet, View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { font_description, height_20 } from '../config/Constants';
import * as colors from '../assets/css/Colors';
import { CommonActions } from '@react-navigation/native';
import strings from "../languages/strings.js";

export default class Logout extends Component<Props> {
  static navigationOptions = {
    header:null
  }
  
  componentWillMount(){
    AsyncStorage.clear();
    this.resetMenu();
  }

  resetMenu() {
    this.props.navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "LoginHome" }],
      })
    );
  }

  render () {
    return (
      <View style={styles.container} >
        <View style={{ marginTop:height_20 }} >
          <Text style={{ fontSize:20, color:colors.theme_fg, fontFamily:font_description }}>{strings.please_wait}...</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:'#FFFFFF'
  }
});
