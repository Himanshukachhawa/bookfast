import React, {Component} from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import * as colors from '../assets/css/Colors';
import { font_title, font_description , img_url} from '../config/Constants';
import { connect } from 'react-redux';
import { change_active_vehicle, change_active_vehicle_details } from '../actions/BookingActions';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';

class VehicleCategories extends Component<Props> {
  constructor(props) {
    super(props)
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.change_vehicle = this.change_vehicle.bind(this);
    this.state = {
      vehicle_categories:this.props.route.params.vehicle_categories
    }
  }

  handleBackButtonClick= () => {
    this.props.navigation.goBack(null);
  }

  async change_vehicle(data){
    await this.props.change_active_vehicle(data.id);
    await this.props.change_active_vehicle_details(data);
    this.handleBackButtonClick();
  }

  render() {
    return (
      <SafeAreaView style={{ flex:1, backgroundColor:colors.theme_fg_three }}>
        <ScrollView padder style={{backgroundColor:colors.theme_fg_three}}>
          {this.state.vehicle_categories.map((row, index) => (
            <TouchableOpacity onPress={() => this.change_vehicle(row) } style={{ flexDirection:'row', borderWidth:1, borderColor:colors.theme_fg_two, borderRadius:5, width:'90%', marginLeft:'5%', marginRight:'5%', backgroundColor:colors.theme_fg_three, marginTop:10, padding:10 }}>
              <View style={{ width:'30%', alignItems:'center', justifyContent:'center'}}>
                <Image style={{ alignSelf: 'center', height:60, width:60 }} source={{ uri : img_url+row.active_icon}}/>
              </View>
              <View style={{ width:'70%', alignItems:'flex-start', justifyContent:'center'}}>
                <Text style={{color:colors.theme_fg_two, fontFamily:font_title, fontSize:14}}>{row.vehicle_type}</Text>
                <View style={{ margin:2 }} />
                <Text numberOfLines={2} style={{color:colors.theme_fg_two, fontSize:12, fontFamily:font_description}}>{row.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }
}

function mapStateToProps(state){
  return{
    active_vehicle : state.booking.active_vehicle,
 };
}

const mapDispatchToProps = (dispatch) => ({
    change_active_vehicle: (data) => dispatch(change_active_vehicle(data)),
    change_active_vehicle_details: (data) => dispatch(change_active_vehicle_details(data))
});


export default connect(mapStateToProps,mapDispatchToProps)(VehicleCategories);

const styles = StyleSheet.create({
  
});
