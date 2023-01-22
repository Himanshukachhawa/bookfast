import React, {Component} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Modal, Image } from 'react-native';
import * as colors from '../assets/css/Colors';
import LottieView from 'lottie-react-native';
import { font_title, font_description , api_url, customer_offers, scratch, img_url , scratch_img_url, update_view_status, my_rewards } from '../config/Constants';
import axios from 'axios';
import ScratchView from 'react-native-scratch'
import strings from "../languages/strings.js";
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';
import Icon, { Icons } from '../components/Icons';
import Loader from '../components/Loader';
import CardView from 'react-native-cardview';

class Rewards extends Component<Props> {
  constructor(props) {
    super(props)
    this.state = {
      show_scratch: 0, 
      offers:[],
      modalVisible:false,
      current_card:undefined,
      isLoading:false
    }
  }

  async componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener("focus", () => {
      this.customer_offers();
    });
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  customer_offers = async () => {
    this.setState({ isLoading:true })
    await axios({
      method: 'post', 
      url: api_url + customer_offers,
      data:{ customer_id : global.id, lang:global.lang }
    })
    .then(async response => {
      this.setState({ offers : response.data.result, isLoading:false });
    })
    .catch(error => {
      this.setState({ isLoading:false })
      alert(strings.sorry_something_went_wrong);
    });
  }

  show_alert(message){
    this.dropDownAlertRef.alertWithType('error', 'Error',message);
  }

  onImageLoadFinished = ({ id, success }) => {
      //alert('Loaded')
  }

  onScratchProgressChanged = ({ value, id }) => {
      //alert(value)
  }

  onScratchDone = ({ isScratchDone, id }) => {
    this.setState({ show_scratch : 1 });
    this.scrath_update();
  }

  onScratchTouchStateChanged = ({ id, touchState }) => {
      this.setState({ scrollEnabled: !touchState });
  }

  select_card = (current_card) =>{
    if(current_card.view_status == 1){
      this.setState({ show_scratch : 1, current_card:current_card, modalVisible : true });
    }else{
      this.setState({ current_card:current_card, modalVisible : true });
    }
  }

  close_modal = (id) =>{
    this.setState({ modalVisible : false, show_scratch:0 });
  }

  scrath_update = async() =>{
    this.setState({ isLoading:true })
    await axios({
      method: 'post', 
      url: api_url + update_view_status,
      data:{ customer_id : global.id, offer_id:this.state.current_card.id, status:1 }
    })
    .then(async response => {
      this.customer_offers();
    })
    .catch(error => {
      alert(strings.sorry_something_went_wrong);
    });
  }

  render() {
    return (
      <SafeAreaView style={{backgroundColor:colors.theme_fg_three, flex:1}}>
        <Loader visible={this.state.isLoading} />
        <View style={{ margin:10 }} />
        <ScrollView>
          <FlatList
            data={this.state.offers}
            renderItem={({ item,index }) => (
              <View style={{ width:'50%', marginBottom:25, alignItems:'center', justifyContent:'center'}}>
                <TouchableOpacity onPress={ ()=> this.select_card(item) } activeOpacity={1} style={{ backgroundColor:'#FFFFFF' }}>
                  {item.view_status == 0 &&
                    <Image square style={{ width:160, height:160 }} source={scratch} />
                  }
                  {item.view_status == 1 &&
                    <CardView cardElevation={2} cardMaxElevation={5} cornerRadius={10} style={{ width:160, height:160, alignItems:'center', justifyContent:'center'}}>
                      <Image square style={{ width:40, height:40 }} source={{ uri: img_url + item.image }} />
                      <Text style={{ color:colors.theme_bg_two, fontFamily:font_title, fontSize:14}}>{item.title}</Text>
                    </CardView>
                  }
                </TouchableOpacity>
              </View>
            )}
            numColumns={2}
            keyExtractor={item => item.id}
          />
          <View style={{ alignItems:'center', marginTop:'40%'}}>
            {this.state.offers.length == 0 &&  
              <LottieView style={{ height:200, width:200 }} source={my_rewards} autoPlay loop />
              }
            {this.state.offers.length == 0 && 
            <Text style={styles.amt}>{strings.no_rewards_found}</Text>
            }
          </View>
        </ScrollView>
        <Modal
          animationType={'fade'} 
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            this.setState({ modalVisible: false });
          }}
        >
          <View
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0,0,0,0.7)',
              padding: 20,
            }}
          >
            <TouchableOpacity onPress={ ()=> this.close_modal() }>
              <Icon type={Icons.Ionicons} style={{ alignSelf:'flex-end', color:'#FFFFFF'}}  name='close-circle' />
            </TouchableOpacity>
            <View style={{ alignItems:'center', justifyContent:'center', marginTop:'30%'}}>
              <View style={{ width: 200, height: 200, alignItems:'center', justifyContent:'center', backgroundColor:'#FFFFFF' }}>
                {this.state.show_scratch == 0 &&
                  <ScratchView
                    id={1} 
                    brushSize={40} 
                    threshold={30} 
                    fadeOut={true} 
                    style={{ color:colors.theme_fg_two }}
                    placeholderColor={colors.theme_fg_two}
                    imageUrl={img_url + scratch_img_url} 
                    resourceName="your_image" 
                    resizeMode="cover|contain|stretch" 
                    onImageLoadFinished={this.onImageLoadFinished} 
                    onTouchStateChanged={this.onTouchStateChangedMethod} 
                    onScratchProgressChanged={this.onScratchProgressChanged} 
                    onScratchDone={this.onScratchDone} 
                  />
                }
                {this.state.show_scratch == 1 &&
                  <View>
                    <Image square style={{ width:100, height:100, alignSelf:'center' }} source={{ uri: img_url + this.state.current_card.image }} />
                    <Text style={{ color:colors.theme_fg_two, alignSelf:'center', fontFamily:font_description, fontSize:14}}>{this.state.current_card.title}</Text>
                  </View>
                }
              </View>
            </View>
            {this.state.show_scratch == 1 &&
              <View style={{ alignItems:'center', marginTop:20 }}>
                <Text style={{ color:colors.theme_bg_three, fontFamily:font_title, fontSize:14}}>{this.state.current_card.description}</Text>
              </View>
            }
          </View>
        </Modal>
      </SafeAreaView>
    );
  }
}

export default Rewards;

const styles = StyleSheet.create({
  amt:{ 
    fontSize:16, 
    fontFamily:font_title, 
    color:colors.theme_fg_two 
  }
});
