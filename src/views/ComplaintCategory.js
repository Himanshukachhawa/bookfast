import React, {Component} from 'react';
import { StyleSheet, Text, FlatList, TouchableOpacity, ScrollView, SafeAreaView, View } from 'react-native';
import * as colors from '../assets/css/Colors';
import { font_description, font_title , api_url, complaint_category} from '../config/Constants';
import axios from 'axios';
import { connect } from 'react-redux';
import { serviceActionPending, serviceActionError, serviceActionSuccess } from '../actions/ComplaintActions';
import Icon, { Icons } from '../components/Icons';
import Loader from '../components/Loader';

class ComplaintCategory extends Component<Props> {

  constructor(props) {
    super(props)
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state = {
      data:[],
      trip_id: this.props.route.params.trip_id,
      driver_id: this.props.route.params.driver_id,
      isLoading:false,
      }
      this.complaint_category();
  }

  handleBackButtonClick= () => {
    this.props.navigation.goBack(null);
  }

  sub_category(item){
    this.props.navigation.navigate('ComplaintSubCategory', {data: item, trip_id: this.state.trip_id, driver_id: this.state.driver_id});
  }

   complaint_category = async () => { 
    this.setState({ isLoading:true })
    await axios({
      method: 'post', 
      url: api_url + complaint_category,
      data: {country_id :  global.country_id, lang:global.lang}
    })
    .then(async response => {
        this.setState({ data : response.data.result, isLoading:false });
    })
    .catch(error => {
      this.setState({ isLoading:false })
    });
  }
  render() {
    return (
      <SafeAreaView style={{ flex:1, backgroundColor:colors.theme_bg_three }}>
        <ScrollView>
          <Loader visible={this.state.isLoading} />
            <FlatList
              data={this.state.data}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => this.sub_category(item)} style={{ flexDirection:'row', padding:15, justifyContent:'center' }} >
                  <View style={{ width:'70%'}}>
                    <Text style={styles.category_title} >{item.complaint_category_name}</Text>
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

export default ComplaintCategory;

const styles = StyleSheet.create({
  content_style:{ 
    backgroundColor:colors.theme_fg_three
  },
  category_title:{
    color:colors.theme_fg_two,
    fontSize:15,
    fontFamily:font_description
  },
  text_icon:{
    color:colors.theme_fg_two
  },

});