import React, {Component} from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import * as colors from '../assets/css/Colors';
import { font_title, GOOGLE_KEY, font_description } from '../config/Constants';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { pickupAddress, pickupLat, pickupLng, dropAddress, dropLat, dropLng, setStops, km } from '../actions/BookingActions';
import { connect } from 'react-redux';
import axios from 'axios';
import strings from "../languages/strings.js";
import { Button } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';
import Icon, { Icons } from '../components/Icons';
import Loader from '../components/Loader';

class MultipleLocation extends Component<Props> {
  constructor(props) {
    super(props)
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state = {
      mode_status:0,
      header_name:'Add Location',
      all_stops:[],
      stops:this.props.stops,
      current_location:this.props.route.params.current_location,
      add_address_status:0,
      isLoading:false
      }
      this.merge_all_stops();
  }

  handleBackButtonClick= () => {
    this.props.navigation.goBack(null);
  }

  getLocations = (data, details) =>{
    this.get_lat_lng(details.place_id);
  }

  get_lat_lng = async(place_id) =>{
    this.setState({ isLoading:true })
    await axios({
      method: 'get', 
      url: 'https://maps.googleapis.com/maps/api/place/details/json?placeid='+place_id+'&key='+GOOGLE_KEY
    })
    .then(async response => {
      this.setState({ isLoading:false })
        let all_stops = this.state.all_stops;
        all_stops = await all_stops.concat([ { address : response.data.result.formatted_address, lat:response.data.result.geometry.location.lat, lng:response.data.result.geometry.location.lng } ]);
        await this.setState({ all_stops : all_stops, add_address_status:0 });
    })
    .catch(error => {
      this.setState({ isLoading:false })
    });
  }

  change_sort = async(index) =>{
    let new_sort = await this.change_index(this.state.all_stops, index, index+1);
    this.setState({ all_stops : new_sort });
  }
  
  change_index(arr, old_index, new_index) {
    if(new_index >= arr.length) {
      let k = new_index - arr.length + 1;
      while (k--) {
          arr.push(undefined);
      }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr; 
  }

  remove_address = async(index) =>{
    let old_sort = this.state.all_stops;
    old_sort.splice(index, 1);
    this.setState({ all_stops : old_sort });
  }

  fix_sort = async() =>{
    let pickup_address = await this.state.all_stops[0];
    let drop_address = await this.state.all_stops[this.state.all_stops.length - 1];
    let stops = this.state.all_stops;
    stops.splice(0, 1);
    stops.splice(this.state.all_stops.length - 1, 1);
    
    await this.props.pickupAddress(pickup_address.address);
    await this.props.pickupLat(pickup_address.lat);
    await this.props.pickupLng(pickup_address.lng);
    await this.props.dropAddress(drop_address.address);
    await this.props.dropLat(drop_address.lat);
    await this.props.dropLng(drop_address.lng);
    await this.props.setStops(stops);
    this.handleBackButtonClick(); 
  }

  merge_all_stops = async() =>{
    let main_stops = [];
    let all_stops = [];
    main_stops[0] = { address : this.props.pickup_address, lat:this.props.pickup_lat, lng:this.props.pickup_lng }
    all_stops = main_stops.concat(this.state.stops);
    all_stops = all_stops.concat([ { address : this.props.drop_address, lat:this.props.drop_lat, lng:this.props.drop_lng } ]);
    this.setState({ all_stops : all_stops });
  }

  open_search = () =>{
    this.setState({ add_address_status : 1 });
  }

  close_search = () =>{
    this.setState({ add_address_status : 0 });
  }
  render() {
    return (
      <SafeAreaView style={{backgroundColor:colors.theme_fg_three,flex:1}}>
        <Loader visible={this.state.isLoading} />
        <ScrollView style={{ padding:20 }} keyboardShouldPersistTaps='handled'>
          {this.state.add_address_status == 0 &&
            <View>
              <FlatList
                data={this.state.all_stops}
                renderItem={({ item,index }) => (
                  <View style={{ marginBottom:10, flexDirection:'row' }}>
                    <View style={{ width:'80%', alignItems:'flex-start', justifyContent:'center'}}>
                      {index == 0 ?
                        <Text style={{ fontSize:14, fontFamily:font_description, color:colors.theme_bg_two}}>{item.address}</Text>
                        :
                        <Text style={{ fontSize:14, fontFamily:font_description, color:'red'}}>{item.address}</Text>
                      }
                    </View>
                    <View style={{ width:'20%', alignItems:'flex-end', justifyContent:'center' }}>
                      {index != 0 && index != this.state.all_stops.length - 1 &&
                        <View style={{ flexDirection:'row'}}>
                          <View style={{ flexDirection:'column'}}>
                            <TouchableOpacity activeOpacity={1} onPress={this.remove_address.bind(this,index)}>
                              <Icon type={Icons.Ionicons} name="close" />
                            </TouchableOpacity>
                          </View>
                          <View style={{ flexDirection:'column'}}>
                            <TouchableOpacity activeOpacity={1} onPress={this.change_sort.bind(this,index)}>
                              <Icon type={Icons.Ionicons} name="arrow-down" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      }
                    </View>
                  </View>
                )}
                keyExtractor={item => item.question}
              />
              <View style={{ margin:10 }} />
              <View style={{ flexDirection:'row'}}>
                <View style={{ marginRight:20, alignItems:'flex-end', justifyContent:'center' }}>
                  <TouchableOpacity activeOpacity={1} onPress={ () => this.open_search() }>
                    <Icon type={Icons.Ionicons} name="add-outline" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          }
          {this.state.add_address_status == 1 &&
            <View>
              <View style={{ flexDirection:'row'}}>
                <View style={{ alignItems:'flex-start', justifyContent:'center'}}>
                  <TouchableOpacity activeOpacity={1} onPress={ () => this.close_search() }>
                    <Icon type={Icons.Ionicons} name="close" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{ margin:10 }} />
              <GooglePlacesAutocomplete
                placeholder={strings.search}
                styles={{ textInputContainer: { borderColor:colors.theme_bg, borderWidth:1, borderRadius:5 } }}
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
            </View>
          }
        </ScrollView>
        {this.state.add_address_status == 0 &&
          <View style={styles.footer} >
            <Button
              title={strings.okay}
              onPress={this.fix_sort}
              buttonStyle={{ backgroundColor:colors.theme_bg }}
              titleStyle={{ fontFamily:font_description,color:colors.theme_fg_three, fontSize:14 }}
            />
          </View>
        }
      </SafeAreaView>
    );
  }
}

function mapStateToProps(state){
  return{
    pickup_address : state.booking.pickup_address,
    pickup_lat : state.booking.pickup_lat,
    pickup_lng : state.booking.pickup_lng,
    drop_address : state.booking.drop_address,
    drop_lat : state.booking.drop_lat,
    drop_lng : state.booking.drop_lng,
    stops : state.booking.stops,
  };
}

const mapDispatchToProps = (dispatch) => ({
    pickupAddress: (data) => dispatch(pickupAddress(data)),
    pickupLat: (data) => dispatch(pickupLat(data)),
    pickupLng: (data) => dispatch(pickupLng(data)),
    dropAddress: (data) => dispatch(dropAddress(data)),
    dropLat: (data) => dispatch(dropLat(data)),
    dropLng: (data) => dispatch(dropLng(data)),
    setStops: (data) => dispatch(setStops(data)),
    km: (data) => dispatch(km(data)),
});


export default connect(mapStateToProps,mapDispatchToProps)(MultipleLocation);

const styles = StyleSheet.create({
  footer:{
    backgroundColor:colors.theme_bg_three
  },
});
