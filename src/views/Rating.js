import React, {Component} from 'react';
import { StyleSheet, Text, View,  TouchableOpacity, SafeAreaView, Image, TextInput } from 'react-native';
import * as colors from '../assets/css/Colors';
import { font_title, img_url, font_description, api_url, submit_rating } from '../config/Constants';
import { Divider, Badge } from 'react-native-elements';
import StarRating from 'react-native-star-rating';
import axios from 'axios';
import Loader from '../components/Loader';
import { CommonActions } from '@react-navigation/native';
import Moment from 'moment';
import strings from "../languages/strings.js";

class Rating extends Component<Props> {
  constructor(props) {
    super(props)
    this.home = this.home.bind(this);
    this.state = {
      data:this.props.route.params.data,
      isLoading:false,
      feedback:'',
    }
  }

  home = () => {
    this.props.navigation.dispatch(
      CommonActions.reset({
          index: 0,
          routes: [{ name: "Home" }],
      })
    );
  }

  onStarRatingPress(rating){
    this.setState({ rating: rating});
  }

  async submit_rating(){
    this.setState({ isLoading : true });
    await axios({
      method: 'post', 
      url: api_url + submit_rating,
      data:{ trip_id : this.state.data.id, ratings : this.state.rating }
    })
    .then(async response => {
      this.setState({ isLoading : false });
      this.home();
    })
    .catch(error => {
      this.setState({ isLoading : false });
    });
  }

  render() {
    return (
      <SafeAreaView style={{backgroundColor:colors.theme_fg_three, flex:1}}> 
        <Loader visible={this.state.isLoading} />
          <View style={{ margin:20 }} />
          <View style={{ alignItems:'center', justifyContent:'center'}}>
            <Text style={styles.price} >{global.currency}{this.state.data.collection_amount}</Text>
            <Text style={styles.date_time}>{Moment(this.state.data.pickup_date).format('MMM DD, YYYY hh:mm A')}</Text>
            <Text style={styles.date_time}>{strings.your_bill} : {global.currency}{this.state.data.total}</Text>
          </View>
          <Divider style={styles.default_divider} />
          <View style={{ justifyContent:'center', flexDirection:'column' }}>
              <View style={{ flexDirection:'row', alignItems:'center', width:'90%', marginLeft:'5%' }}>
              <Badge status="success" />
              <View style={{ marginLeft : 10}} />
              <Text style={styles.address}>{this.state.data.actual_pickup_address}</Text>
            </View>
          </View>
          <View style={{ margin:10 }} />
          <View style={{ justifyContent:'center', flexDirection:'column' }}>
              <View style={{ flexDirection:'row', alignItems:'center',  width:'90%', marginLeft:'5%' }}>
              <Badge status="error" />
              <View style={{ marginLeft : 10}} />
              <Text style={styles.address}>{this.state.data.actual_drop_address}</Text>
            </View>
          </View>
          <Divider style={styles.default_divider} />
          <View style={{ alignItems:'center', justifyContent:'center'}}>
            <Image square source={{ uri : img_url + this.state.data.driver_profile_picture}} style={{ height:80, width:80, borderRadius:40 }} />
          </View>
          <View style={{ margin:5 }} />
          <View style={{ alignItems:'center', justifyContent:'center'}}>
            <Text style={styles.driver_name}>{this.state.data.driver_name}</Text>
          </View>
          <View style={{ margin:10 }} />
          <View style={{ alignItems:'center', justifyContent:'center'}}>
            <StarRating
              disabled={false}
              emptyStar={'star-border'}
              fullStar={'star'}
              halfStar={'star-half'}
              iconSet={'MaterialIcons'}
              maxStars={5}
              rating={this.state.rating}
              selectedStar={(rating) => this.onStarRatingPress(rating)}
              fullStarColor={colors.star_rating}
              starStyle={{ padding:2 ,color:colors.star_rating}}
            />
          </View>
          <View style={{ alignItems:'center', justifyContent:'center'}}>
              <TextInput
                placeholder="Enter your feed back"
                placeholderTextColor = {colors.theme_fg_four}
                style = {styles.textinput}
                onChangeText={ TextInputValue =>
                  this.setState({feedback : TextInputValue }) }
              />
            </View>
        <TouchableOpacity style={styles.footer}>
            <TouchableOpacity activeOpacity={1} onPress={this.submit_rating.bind(this)} style={styles.cnf_button_style}>
            <Text style={styles.title_style}>{strings.submit}</Text>
            </TouchableOpacity>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
}

export default Rating;

const styles = StyleSheet.create({
  default_divider:{ 
    marginTop:20, 
    marginBottom:20 
  },
  price:{
    alignSelf:'center', 
    color:colors.theme_fg_two,
    alignSelf:'center', 
    fontSize:40, 
    fontFamily:font_description 
  },
  footer:{
    position:'absolute',
    height:45,
    alignItems:'center',
    justifyContent:'center',
    bottom:0,
    width:'100%',
    backgroundColor: colors.theme_bg
  },
  cnf_button_style:{ 
    backgroundColor:colors.theme_bg,
    width:'100%',
    height:'100%',
    alignItems:'center',
    justifyContent:'center'
  },
  title_style:{ 
    fontFamily:font_description,
    color:colors.theme_fg_three,
    fontSize:18
  },
  date_time:{ color:colors.theme_fg_two, fontSize:12, fontFamily:font_description },
  address:{ fontSize:14, color:colors.theme_fg_two, fontFamily:font_description  },
  driver_name:{ color:colors.theme_fg_two, fontSize:18, letterSpacing:1, fontFamily:font_description }

});
