import React, {Component} from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView} from 'react-native';
import * as colors from '../assets/css/Colors';
import { font_description, api_url, add_complaint } from '../config/Constants';
import { Divider } from 'react-native-elements';
import axios from 'axios';
import { connect } from 'react-redux';
import { serviceActionPending, serviceActionError, serviceActionSuccess } from '../actions/ComplaintActions';
import Loader from '../components/Loader';
import strings from "../languages/strings.js";
import { SafeAreaView } from 'react-native-safe-area-context';

class Complaint extends Component<Props> {
  constructor(props) {
    super(props)
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state = {
      description: '',
      category_id: this.props.route.params.category_id,
      category_name: this.props.route.params.category_name,
      sub_category_id: this.props.route.params.data.id,
      complaint_sub_category_name: this.props.route.params.data.complaint_sub_category_name,
      trip_id: this.props.route.params.trip_id,
      driver_id: this.props.route.params.driver_id,
      isLoading:false,
      }
  }

  handleBackButtonClick= () => {
    this.props.navigation.goBack(null);
  }

  make_complaint = async(item) =>{
    this.props.serviceActionPending();
    this.setState({ isLoading:true })
     await axios({
      method: 'post', 
      url: api_url + add_complaint,
      data:{ trip_id : this.state.trip_id, customer_id: global.id, driver_id: this.state.driver_id, complaint_category : this.state.category_id , complaint_sub_category : this.state.sub_category_id, description : this.state.description }
    })
    .then(async response => {
      this.setState({ isLoading:false })
        alert(strings.your_complaint_registered_successfully);
        await this.props.serviceActionSuccess(response.data);
        await this.props.navigation.navigate('RideDetails');
    })
    .catch(error => {
      this.setState({ isLoading:false })
      this.showSnackbar(strings.sorry_something_went_wrong);
      this.props.serviceActionError(error);
    });
  }
  
  render() {
    return (
      <SafeAreaView style={{ flex:1, backgroundColor:colors.theme_bg_three }}>
        <ScrollView padder style={styles.content_style}>
        <Loader visible={this.state.isLoading} />
          <View style={styles.margin_10} />
          <Text style={styles.category_title}>{this.state.category_name}</Text>
          <View style={styles.margin_5} />
          <Text style={styles.description}>{this.state.complaint_sub_category_name}</Text>
          <Divider style={styles.default_divider} />
          <Text style={styles.category_title}>{strings.enter_your_command}</Text>
          <View style={styles.margin_5} />
          <View style={styles.text_area_container} >
            <TextInput
              style={styles.text_area}
              underlineColorAndroid="transparent"
              placeholderTextColor = {colors.theme_fg_four}
              numberOfLines={10}
              multiline={true}
              value = {this.state.description}
              onChangeText={ TextInputValue =>
                this.setState({description : TextInputValue }) }
            />
          </View>
        </ScrollView>
        <TouchableOpacity activeOpacity={1} onPress={this.make_complaint.bind(this,1)} style={styles.footer}>
          <Text style={styles.title_style}>{strings.submit}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
}

function mapStateToProps(state){
  return{
    isLoding : state.complaint.isLoding,
    error : state.complaint.error,
    data : state.complaint.data,
    message : state.complaint.message,
    status : state.complaint.status,
  };
}

const mapDispatchToProps = (dispatch) => ({
    serviceActionPending: () => dispatch(serviceActionPending()),
    serviceActionError: (error) => dispatch(serviceActionError(error)),
    serviceActionSuccess: (data) => dispatch(serviceActionSuccess(data))
});

export default connect(mapStateToProps,mapDispatchToProps)(Complaint);

const styles = StyleSheet.create({
  content_style:{
    backgroundColor:colors.theme_fg_three,
    padding:20
  },
  margin_10:{
    margin:10
  },
  category_title:{ 
    color:colors.theme_fg_two,
    fontSize:18,
    fontFamily:font_description
  },
  margin_5:{
    margin:5
  },
  description:{ 
    color:colors.theme_fg_four, 
    fontSize:16, 
    fontFamily:font_description 
  },
  default_divider:{ 
    marginTop:20, 
    marginBottom:20 
  },
  text_area_container:{
    borderColor: colors.theme_fg_four,
    borderWidth: 1,
    padding: 5,
    borderRadius:10,
    width:'100%',
    alignSelf:'center'
  },
  text_area:{
    height: 150,
    alignItems:"flex-start",
    color:colors.theme_fg_four,
    fontFamily:font_description,
    fontSize:14
  },
  footer:{
    position:'absolute',
    height:45,
    bottom:0,
    alignItems:'center',
    justifyContent:'center',
    width:'100%',
    backgroundColor: colors.theme_bg
  },
  title_style:{ 
    fontFamily:font_description,
    color:colors.theme_fg_three,
    fontSize:18
  },

});
