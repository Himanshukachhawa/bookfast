import React, {Component} from 'react';
import { StyleSheet, Text, View, FlatList, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import * as colors from '../assets/css/Colors';
import { font_title, font_description, promo_code, api_url, profile_picture_path } from '../config/Constants';
import { Button } from 'react-native-elements';
import axios from 'axios';
import { update_promo } from '../actions/BookingActions';
import { connect } from 'react-redux';
import strings from "../languages/strings.js";
import Loader from '../components/Loader';

class Promo extends Component<Props> {
  constructor(props) {
    super(props)
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.get_promo_code();
    this.state={
      data:[],
      isLoading:false,
      total_fare:this.props.route.params.total_fare,
    }
  }

  show_alert(message){
    this.dropDownAlertRef.alertWithType('error', 'Error',message);
  }

  handleBackButtonClick= () => {
      this.props.navigation.goBack(null);
  }

  get_promo_code = async () => {
    this.setState({ isLoading:true })
    await axios({
      method: 'post', 
      url: api_url + promo_code,
      data: {country_id :  global.country_id, customer_id:global.id, lang:global.lang}
    })
    .then(async response => {
      this.setState({ isLoading:false })
      this.setState({ data : response.data.result });
    })
    .catch(error => {
      this.setState({ isLoading:false })
    });
  } 

  select_promo = async(promo) =>{
    if(promo.min_fare <= this.state.total_fare){
      await this.props.update_promo(promo.id);
      this.handleBackButtonClick();
    }else{
      alert('Sorry, your ride total should be '+promo.min_fare+' to apply');
    }
    
  }

  render() {
    return (
      <SafeAreaView style={{ backgroundColor:colors.theme_fg_three, flex:1 }}>
        <Loader visible={this.state.isLoading} />
        <ScrollView style={{ padding:20 }}>
          <FlatList
            data={this.state.data}
            renderItem={({ item,index }) => (
              <TouchableOpacity onPress={this.select_promo.bind(this,item)}>
            <View style={styles.promo_block} >
              <View style={{ flexDirection:'row' }} >
                <View style={{ alignItems:'flex-start', width:'50%', justifyContent:'center'}}>
                  <Text style={styles.promo_code} >{item.promo_code}</Text>
                </View>
                <View style={{ alignItems:'flex-end', width:'50%', justifyContent:'center'}}>
                  <Button
                    title={strings.apply}
                    buttonStyle={styles.apply_btn}
                    onPress={this.select_promo.bind(this,item)}
                    titleStyle={{ fontFamily:font_description,color:colors.theme_fg_three,fontSize:14 }}
                  />
                </View>
              </View>
              <View style={{ flexDirection:'row' }} >
                <View style={{ alignItems:'flex-start', justifyContent:'center'}}>
                  <Text style={styles.promo_name} >{item.promo_name}</Text>
                </View>
              </View>
              <View style={{ flexDirection:'row' }} >
                <View style={{ alignItems:'flex-start', justifyContent:'center'}}>
                  <Text style={styles.description} >
                    {item.description}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
            )}
            keyExtractor={item => item.id}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }
}

function mapStateToProps(state){
  return{
    promo : state.booking.promo,
  };
}

const mapDispatchToProps = (dispatch) => ({
    update_promo: (data) => dispatch(update_promo(data)),
});


export default connect(mapStateToProps,mapDispatchToProps)(Promo);

const styles = StyleSheet.create({
  promo_block:{
    width:'100%', 
    backgroundColor:colors.theme_bg_three, 
    marginTop:10,
    borderBottomWidth:0.5,
    paddingBottom:10, 
    paddingTop:10,
    borderColor:colors.theme_fg_four
  },
  promo_code:{
    borderWidth:1, 
    borderColor:colors.theme_fg_two, 
    color:colors.theme_fg_two, 
    paddingTop:5, 
    paddingRight:10, 
    paddingBottom:5, 
    paddingLeft:10,
    fontFamily:font_description,
    borderRadius:5,
    fontSize:14
  },
  apply_btn:{
    fontSize:14, 
    fontFamily:font_title, 
    color:colors.theme_fg_three,
    backgroundColor:colors.theme_fg,
    width:75,
    height:40,   
  },
  promo_name:{
    fontSize:15, 
    fontFamily:font_title, 
    color:colors.theme_fg_two, 
    marginTop:10
  },
  description:{
    fontSize:12,
    marginTop:5,
    fontFamily:font_description,
    color:colors.theme_fg_four 
  }
});
