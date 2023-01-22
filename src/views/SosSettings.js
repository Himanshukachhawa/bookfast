import React, {Component} from 'react';
import { StyleSheet, View, TouchableOpacity, Text, FlatList, Alert, SafeAreaView } from 'react-native';
import * as colors from '../assets/css/Colors';
import { alert_close_timing,  api_url, font_title, font_description, height_40, sos_contact_list, delete_sos_contact, sos_img } from '../config/Constants';
import DropdownAlert from 'react-native-dropdownalert';
import axios from 'axios';
import { connect } from 'react-redux';
import { profilePending, profileError, profileSuccess } from '../actions/ProfileActions';
import LottieView from 'lottie-react-native';
import strings from "../languages/strings.js";
import Icon, { Icons } from '../components/Icons';
import Loader from '../components/Loader';

class SosSettings extends Component<Props> {
  constructor(props) { 
    super(props) 
    this.state = {
      result:[],
      contact_id:'', 
      validation:true,
      isLoading:false
    }     
  }

  async componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener("focus", () => {
      this.sos_list();
    });
  }

  sos_list = async () => {
    this.setState({isLoading : true});
     await axios({
      method: 'post', 
      url: api_url + sos_contact_list,
      data:{ customer_id: global.id }
    })
    .then(async response => {
      this.setState({ isLoading: false });
      this.setState({ result:response.data.result }); 
    })
    .catch(error => {
     this.setState({isLoading : false});
     alert(strings.sorry_something_went_wrong);  
    });
  }

  delete_sos = async (id) => {
    this.setState({isLoading : true});
     await axios({ 
      method: 'post',  
      url: api_url + delete_sos_contact,
      data:{ customer_id: global.id, contact_id: id }
    })
    .then(async response => {
      this.setState({isLoading : false});
      Alert.alert(
      strings.success,
      strings.deleted_successfully,
      [
        { text: strings.ok, onPress: () => this.sos_list() }
      ],
      { cancelable: false } 
    );
    })
    .catch(error => { 
     this.setState({isLoading : false}); 
     alert(strings.sorry_something_went_wrong); 
    });
  }

  add_sos_settings = () => {
    this.props.navigation.navigate('AddSosSettings');
  }

  render() {
    return (
      <SafeAreaView style={{ flex:1 }}>
        <Loader visible={this.state.isLoading} />
        <View style={{backgroundColor:colors.theme_fg_three, flex:1}}>   
          <View style={{ padding:15, height:height_40 }}>
            <FlatList
              data={this.state.result} 
              renderItem={({ item,index }) => (
                <View style={{ flexDirection:'row', borderBottomWidth:1, borderColor:colors.theme_fg_four, paddingBottom:10, paddingTop:10 }}>
                  <View style={{ width:'80%', justifyContent:'center'}}>
                    <Text style={styles.faq_title} >{item.phone_number}</Text>
                    <Text style={styles.faq_title_small} >{item.name}</Text> 
                  </View>
                  <TouchableOpacity onPress={()=>this.delete_sos(item.id)} style={{ width:'20%', alignItems:'flex-end', justifyContent:'center'}}>
                    <Icon type={Icons.FontAwesome} name='trash-o' 
                      size={25}
                      color='black'
                      style={ styles.icon_image}
                    />
                  </TouchableOpacity>
                </View>
              )}
              keyExtractor={item => item.id}
            />  
            <View style={{ alignItems:'center', marginTop:'30%'}}>
              {this.state.result.length == 0 &&  
                <LottieView style={{ height:150, width:150 }} source={sos_img} autoPlay loop />
              }
              {this.state.result.length == 0 && 
                <Text style={{ color:colors.theme_bg_two, fontFamily:font_description, fontSize:14}}>{strings.no_contacts_found}</Text>
              }
            </View>
          </View>
        </View> 
        <TouchableOpacity activeOpacity={1} onPress={() => this.add_sos_settings()} style={styles.footer}>
          <Text style={styles.title_style}>{strings.add}</Text>
        </TouchableOpacity>
        <DropdownAlert ref={ref => this.dropDownAlertRef = ref} closeInterval={alert_close_timing} />
      </SafeAreaView>
    );
  }
}
function mapStateToProps(state){
  return{
    isLoding : state.profile.isLoding,
    message : state.profile.message,
    status : state.profile.status,
    data : state.profile.data,
  };
}

const mapDispatchToProps = (dispatch) => ({
    profilePending: () => dispatch(profilePending()),
    profileError: (error) => dispatch(profileError(error)),
    profileSuccess: (data) => dispatch(profileSuccess(data)),
});

export default connect(mapStateToProps,mapDispatchToProps)(SosSettings); 

const styles = StyleSheet.create({
  footer:{
    position:'absolute',
    bottom:0,
    height:45,
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
  faq_title:{
    color:colors.theme_fg_two,
    fontFamily:font_title,
    fontSize:15,    
  },
   icon_image:{
    color:colors.theme_fg
  },
  faq_title_small:{
    color:colors.theme_fg_four,
    fontFamily:font_description,
    fontSize:12, 
  },
});
