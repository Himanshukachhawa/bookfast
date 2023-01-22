import React, {Component} from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as colors from '../assets/css/Colors';
import { font_title, font_description } from '../config/Constants';

class FaqDetails extends Component<Props> {
  constructor(props) {
    super(props)
    this.state = {
      data:this.props.route.params.data
    }
  }
 
  render() {
    return (
      <SafeAreaView style={{backgroundColor:colors.theme_fg_three, flex:1}}>
        <ScrollView style={{padding:20}}>
          <View style={{ flexDirection:'row'}}>
            <View style={{ alignItems:'center', justifyContent:'center'}}>
              <Text style={styles.faq_title}>{this.state.data.question}</Text>
              </View>
          </View>
          <View style={styles.margin_10} />
          <Text style={{ color:colors.theme_fg_four, fontFamily:font_description, fontSize:14 }}>{this.state.data.answer}</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

export default FaqDetails;

const styles = StyleSheet.create({
  margin_10:{
    margin:10
  },
  faq_title:{
    alignSelf:'center', 
    color:colors.theme_fg_two,
    fontSize:20,
    fontFamily:font_title,
  },
});
