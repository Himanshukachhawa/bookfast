import React, {Component} from 'react';
import { StyleSheet, Text, FlatList, ScrollView } from 'react-native';
import * as colors from '../assets/css/Colors';
import { font_description, api_url, faq } from '../config/Constants';
import axios from 'axios';
import { connect } from 'react-redux'; 
import { serviceActionPending, serviceActionError, serviceActionSuccess } from '../actions/FaqActions';
import { CommonActions } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { View } from 'react-native-animatable';
import Icon, { Icons } from '../components/Icons';
import Loader from '../components/Loader';

class Faq extends Component<Props> {
  constructor(props) { 
    super(props) 
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.faq();
    this.state={
      isLoading:false
    }
  }

  handleBackButtonClick() {
    this.props.navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Home" }],
      })
    );
    return true;
  }

  show_alert(message){
    this.dropDownAlertRef.alertWithType('error', 'Error',message);
  }

  faq_details(item){
    this.props.navigation.navigate('FaqDetails',{ data: item });
  }

  faq = async () => {
    this.setState({ isLoading:true })
    this.props.serviceActionPending();
    await axios({
      method: 'post', 
      url: api_url + faq,
      data: {country_id :  global.country_id, lang:global.lang}
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
    const { isLoding, error, data, message, status } = this.props
    return (
      <SafeAreaView style={{backgroundColor:colors.theme_fg_three, flex:1}}>
        <Loader visible={isLoding} />
        <ScrollView>
          <FlatList
            data={data}
            renderItem={({ item,index }) => (
              <TouchableOpacity style={{ flexDirection:'row', padding:15, justifyContent:'center' }} onPress={() => this.faq_details(item)} >
                <View style={{ width:'70%'}}>
                  <Text style={styles.faq_title} >{item.question}</Text>
                </View>
                <View style={{ alignItems:'flex-end', justifyContent:'center', width:'30%'}}>
                  <Icon type={Icons.Ionicons} style={styles.text_icon} name="ios-arrow-forward" />
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

function mapStateToProps(state){
  return{
    isLoding : state.faq.isLoding,
    error : state.faq.error,
    data : state.faq.data,
    message : state.faq.message,
    status : state.faq.status,
  };
}

const mapDispatchToProps = (dispatch) => ({
    serviceActionPending: () => dispatch(serviceActionPending()),
    serviceActionError: (error) => dispatch(serviceActionError(error)),
    serviceActionSuccess: (data) => dispatch(serviceActionSuccess(data))
});


export default connect(mapStateToProps,mapDispatchToProps)(Faq);

const styles = StyleSheet.create({
  faq_title:{
    color:colors.theme_fg_two,
    fontSize:15,
    fontFamily:font_description
  },
  text_icon:{
    color:colors.theme_fg_two
  },
});
