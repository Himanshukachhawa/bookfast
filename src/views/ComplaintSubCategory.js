import React, {Component} from 'react';
import { StyleSheet, Text, FlatList, View, TouchableOpacity } from 'react-native';
import * as colors from '../assets/css/Colors';
import { font_title, font_description, api_url, complaint_sub_category } from '../config/Constants';
import axios from 'axios';
import { connect } from 'react-redux';
import { serviceActionPending, serviceActionError, serviceActionSuccess } from '../actions/ComplaintActions';
import Loader from '../components/Loader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';
import Icon, { Icons } from '../components/Icons';

class ComplaintSubCategory extends Component<Props> {

  constructor(props) {
    super(props)
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state = {
      category_id: this.props.route.params.data.id,
      category_name: this.props.route.params.data.complaint_category_name,
      trip_id: this.props.route.params.trip_id,
      driver_id: this.props.route.params.driver_id,
      isLoading:false,
      }
      this.complaint_sub_category();
  }

  handleBackButtonClick= () => {
    this.props.navigation.goBack(null);
  }

  move_complaint(item){
    this.props.navigation.navigate('Complaint',{data: item, category_name : this.state.category_name, trip_id: this.state.trip_id, driver_id: this.state.driver_id, category_id: this.state.category_id});
  }

  complaint_sub_category = async () => {
    this.setState({ isLoading:true })
    this.props.serviceActionPending();
    await axios({
      method: 'post', 
      url: api_url + complaint_sub_category,
      data: {country_id :  global.country_id, complaint_category_id : this.state.category_id, lang: global.lang}
    })
    .then(async response => {
      this.setState({ isLoading:false })
        await this.props.serviceActionSuccess(response.data)
    })
    .catch(error => {
      this.setState({ isLoading:false })
        this.props.serviceActionError(error);
    });
  }

  render() {
    const { data, isLoding } = this.props
    return (
      <SafeAreaView style={{ flex:1, backgroundColor:colors.theme_bg_three }}>
        <ScrollView>
          <Loader visible={isLoding} />
           <FlatList
              data={data}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => this.move_complaint(item)} style={{ flexDirection:'row', padding:15, justifyContent:'center' }} >
                  <View style={{ width:'70%'}}>
                    <Text style={styles.sub_category_title} >{item.complaint_sub_category_name}</Text>
                  </View>
                  <View style={{ alignItems:'flex-end', justifyContent:'center', width:'30%'}}>
                    <Icon type={Icons.Ionicons} style={styles.text_icon} name="ios-arrow-forward" />
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


export default connect(mapStateToProps,mapDispatchToProps)(ComplaintSubCategory);

const styles = StyleSheet.create({
  content_style:{
    backgroundColor:colors.theme_fg_three
  },
  sub_category_title:{
    color:colors.theme_fg_two,
    fontSize:15,
    fontFamily:font_description
  },
  text_icon:{
    color:colors.theme_fg_two
  },
 
});
