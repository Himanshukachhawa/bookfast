import React, {Component} from 'react';
import { StyleSheet, Text, View, FlatList, ScrollView, SafeAreaView } from 'react-native';
import * as colors from '../assets/css/Colors';
import { font_title, font_description, api_url, privacy} from '../config/Constants';
import axios from 'axios';
import { connect } from 'react-redux';
import { serviceActionPending, serviceActionError, serviceActionSuccess } from '../actions/PrivacyActions';
import Loader from '../components/Loader';

class PrivacyPolicies extends Component<Props> {
  constructor(props) {
    super(props)
    this.privacy_policies();
  }
  
  show_alert(message){
    this.dropDownAlertRef.alertWithType('error', 'Error',message);
  }

  privacy_policies = async () => {
    this.props.serviceActionPending();
    await axios({
      method: 'post', 
      url: api_url + privacy,
      data:{country_id: global.country_id, lang:global.lang},
    })
    .then(async response => {
        await this.props.serviceActionSuccess(response.data)
    })
    .catch(error => {
      this.props.serviceActionError(error);
    });
  }

  render() {
    const { isLoding, data } = this.props
    return (
      <SafeAreaView style={{backgroundColor:colors.theme_fg_three, flex:1}}>
        <Loader visible={isLoding} />
        <ScrollView style={{ padding:20 }}>
          <FlatList
            data={data}
            renderItem={({ item,index }) => (
              <View>
                <Text style={styles.policy_title}>{item.title}</Text>
                <View style={styles.margin_10} />
                <Text style={styles.description}>{item.description}</Text>
              </View>
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
    isLoding : state.privacy.isLoding,
    error : state.privacy.error,
    data : state.privacy.data,
    message : state.privacy.message,
    status : state.privacy.status,
  };
}

const mapDispatchToProps = (dispatch) => ({
    serviceActionPending: () => dispatch(serviceActionPending()),
    serviceActionError: (error) => dispatch(serviceActionError(error)),
    serviceActionSuccess: (data) => dispatch(serviceActionSuccess(data))
});


export default connect(mapStateToProps,mapDispatchToProps)(PrivacyPolicies);

const styles = StyleSheet.create({
  margin_10:{
    margin:10
  },
  policy_title:{ 
    color:colors.theme_fg_two,
    fontSize:20,
    fontFamily:font_title
  },
  description:{ 
    color:colors.theme_fg_two, 
    fontFamily:font_description,
    fontSize:14
  }
});
