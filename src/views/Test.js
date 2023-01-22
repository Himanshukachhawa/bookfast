import React, {Component} from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as colors from '../assets/css/Colors';
import { font_title, font_description } from '../config/Constants';

class Test extends Component<Props> {
  constructor(props) {
    super(props);
  }
 
  render() {
    return (
      <SafeAreaView style={{backgroundColor:colors.theme_fg_three, flex:1}}>
        <View style={{ padding:10}}>
                <Text style={{ color:colors.theme_fg_two, fontSize:20, fontFamily:font_title }}>Add a tip for your driver</Text>
                <View style={{ margin:2 }} />
                <Text style={{ color:colors.theme_fg_two, fontSize:14, fontFamily:font_description }}>The entire amount will be transferred to the rider. Valid only if you pay online.</Text>
                <View style={{ margin:5 }} />
                
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection:'row'}}>
                    <TouchableOpacity style={{ width:60, margin:5, height:35, borderRadius:10, borderColor:colors.theme_fg, borderWidth:1, alignItems:'center', justifyContent:'center'}}>
                        <Text  style={{ color:colors.theme_fg_two, fontSize:14, fontFamily:font_title }}>+{global.currency}10</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ width:60, margin:5, height:35, borderRadius:10, borderColor:colors.theme_fg, borderWidth:1, alignItems:'center', justifyContent:'center'}}>
                        <Text  style={{ color:colors.theme_fg_two, fontSize:14, fontFamily:font_title }}>+{global.currency}10</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ width:60, margin:5, height:35, borderRadius:10, borderColor:colors.theme_fg, borderWidth:1, alignItems:'center', justifyContent:'center'}}>
                        <Text  style={{ color:colors.theme_fg_two, fontSize:14, fontFamily:font_title }}>+{global.currency}10</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ width:60, margin:5, height:35, borderRadius:10, borderColor:colors.theme_fg, borderWidth:1, alignItems:'center', justifyContent:'center'}}>
                        <Text  style={{ color:colors.theme_fg_two, fontSize:14, fontFamily:font_title }}>+{global.currency}10</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ width:60, margin:5, height:35, borderRadius:10, borderColor:colors.theme_fg, borderWidth:1, alignItems:'center', justifyContent:'center'}}>
                        <Text  style={{ color:colors.theme_fg_two, fontSize:14, fontFamily:font_title }}>+{global.currency}10</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ width:60, margin:5, height:35, borderRadius:10, borderColor:colors.theme_fg, borderWidth:1, alignItems:'center', justifyContent:'center'}}>
                        <Text  style={{ color:colors.theme_fg_two, fontSize:14, fontFamily:font_title }}>+{global.currency}10</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ width:60, margin:5, height:35, borderRadius:10, borderColor:colors.theme_fg, borderWidth:1, alignItems:'center', justifyContent:'center'}}>
                        <Text  style={{ color:colors.theme_fg_two, fontSize:14, fontFamily:font_title }}>+{global.currency}10</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ width:60, margin:5, height:35, borderRadius:10, borderColor:colors.theme_fg, borderWidth:1, alignItems:'center', justifyContent:'center'}}>
                        <Text  style={{ color:colors.theme_fg_two, fontSize:14, fontFamily:font_title }}>+{global.currency}10</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
                
            </View>
      </SafeAreaView>
    );
  }
}

export default Test;

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
