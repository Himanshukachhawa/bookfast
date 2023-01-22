import React, {Component} from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import * as colors from '../assets/css/Colors';
import { font_title, GOOGLE_KEY, font_description, get_favourites, api_url, delete_favourite, get_recent_places } from '../config/Constants';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { pickupAddress, pickupLat, pickupLng, dropAddress, dropLat, dropLng } from '../actions/BookingActions';
import { connect } from 'react-redux';
import axios from 'axios';
import strings from "../languages/strings.js";
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon, { Icons } from '../components/Icons'; 
import { ColorSpace } from 'react-native-reanimated';
import Loader from '../components/Loader';

class Location extends Component<Props> {
  constructor(props) {
    super(props)
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state = {
      mode:this.props.route.params.mode,
      mode_status:this.props.route.params.mode_status,
      header_name:this.props.route.params.header_name,
      current_location:this.props.route.params.current_location,
      favourites:[],
      recent_places:[],
      isLoading:false
      }
      this.get_favourites();
      this.get_recent_places();
  }

  handleBackButtonClick= () => {
    this.props.navigation.goBack(null);
  }

  getLocations = (data, details) =>{
    this.get_lat_lng(details.place_id);
  }

  get_favourites = async() =>{
    this.setState({ isLoading:true })
    await axios({
      method: 'post', 
      url: api_url + get_favourites,
      data:{ customer_id:global.id, type:this.state.mode_status }
    })
    .then(async response => {
      this.setState({ favourites : response.data.result, isLoading:false });
    })
    .catch(error => {
      this.setState({ isLoading:false })
      alert(strings.sorry_something_went_wrong)
    });
  }

  get_recent_places = async() =>{
    this.setState({ isLoading:true })
    await axios({
      method: 'post', 
      url: api_url + get_recent_places,
      data:{ customer_id:global.id, type:this.state.mode_status }
    })
    .then(async response => {
      this.setState({ recent_places : response.data.result, isLoading:false });
    })
    .catch(error => {
      this.setState({ isLoading:false })
      alert(strings.sorry_something_went_wrong)
    });
  }

  get_lat_lng = async(place_id) =>{
    this.setState({ isLoading:true })
    await axios({
      method: 'get', 
      url: 'https://maps.googleapis.com/maps/api/place/details/json?placeid='+place_id+'&key='+GOOGLE_KEY
    })
    .then(async response => {
       if(this.state.mode == "pickup"){
        this.setState({ isLoading:true })
        await this.props.pickupAddress(response.data.result.formatted_address);
        await this.props.pickupLat(response.data.result.geometry.location.lat);
        await this.props.pickupLng(response.data.result.geometry.location.lng);
        this.handleBackButtonClick();
       }else{
        this.setState({ isLoading:true })
        await this.props.dropAddress(response.data.result.formatted_address);
        await this.props.dropLat(response.data.result.geometry.location.lat);
        await this.props.dropLng(response.data.result.geometry.location.lng);
        this.handleBackButtonClick();
       }
    })
    .catch(error => {
      
    });
  }

  delete_favourite = async(id) => {
    this.setState({ isLoading:true })
    await axios({
      method: 'post', 
      url: api_url + delete_favourite,
      data:{ id:id }
    })
    .then(async response => {
      this.setState({ isLoading:false })
      this.get_favourites();
    })
    .catch(error => {
      this.setState({ isLoading:false })
      alert(strings.sorry_something_went_wrong)
    });
  }

  select_favourite = async(item) =>{
    if(this.state.mode == "pickup"){
      await this.props.pickupAddress(item.address);
      await this.props.pickupLat(parseFloat(item.lat));
      await this.props.pickupLng(parseFloat(item.lng));
      this.handleBackButtonClick();
     }else{
      await this.props.dropAddress(item.address);
      await this.props.dropLat(parseFloat(item.lat));
      await this.props.dropLng(parseFloat(item.lng));
      this.handleBackButtonClick();
     }
  }
 
  render() {
    return (
      <SafeAreaView style={{ backgroundColor:colors.theme_fg_three, flex:1 }}>
        <Loader visible={this.state.isLoading} />
        <ScrollView style={{ padding:20}} keyboardShouldPersistTaps='handled'>
          <GooglePlacesAutocomplete
            placeholder={strings.search}
            styles={{ textInputContainer: { borderRadius:5, fontFamily:font_description, colors:colors.theme_fg_two, fontSize:14, borderColor:colors.theme_fg_two, borderWidth:1 } }}
            currentLocation={true}
            enableHighAccuracyLocation={true}
            onPress={(data, details = null) => {
              this.getLocations(data,details);
            }}
            GooglePlacesDetailsQuery={{ fields: 'name' }}
            query={{
                key: GOOGLE_KEY,
                language: 'en',
                location:this.state.current_location,
                radius: '1500', 
                types: ['geocode','address']
            }}
          />
          <View style={{ margin:10 }} />
          <Text style={{ fontFamily:font_title, fontSize:14, color:colors.theme_fg }}>{strings.recent_places}</Text>
            <FlatList
              data={this.state.recent_places}
              renderItem={({ item,index }) => (
                <TouchableOpacity onPress={() => this.select_favourite(item)} >
                  <View style={{ width:'90%'}}>
                    <Text style={{ fontFamily:font_description, color:colors.theme_fg_two, fontSize:14 }}>{item.address}</Text>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={item => item.question}
            />
          <View style={{ margin:10 }} />
          <Text style={{ fontFamily:font_title, fontSize:14, color:colors.theme_fg }}>{strings.favourite_places}</Text>
          
            <FlatList
              data={this.state.favourites}
              renderItem={({ item,index }) => (
                <TouchableOpacity style={{ flexDirection:'row' }} onPress={() => this.select_favourite(item)} >
                  <View style={{ width:'90%'}}>
                    <Text style={{ fontFamily:font_description, fontSize:14, color:colors.theme_fg_two }}>{item.address}</Text>
                  </View>
                  <View style={{ width:'10%'}}>
                    <TouchableOpacity onPress={this.delete_favourite.bind(this,item.id)} transparent>
                      <Icon type={Icons.Ionicons} style={{ color:colors.theme_fg_two, fontSize:20 }} name='trash' />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={item => item.question}
            />
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
    pickupAddress: (data) => dispatch(pickupAddress(data)),
    pickupLat: (data) => dispatch(pickupLat(data)),
    pickupLng: (data) => dispatch(pickupLng(data)),
    dropAddress: (data) => dispatch(dropAddress(data)),
    dropLat: (data) => dispatch(dropLat(data)),
    dropLng: (data) => dispatch(dropLng(data)),
});


export default connect(null,mapDispatchToProps)(Location);

const styles = StyleSheet.create({
 
});
