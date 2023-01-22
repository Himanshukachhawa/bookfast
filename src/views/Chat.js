import React, {Component} from 'react';
import { BackHandler } from 'react-native';
import { img_url } from '../config/Constants';
import { GiftedChat } from 'react-native-gifted-chat';
import database from '@react-native-firebase/database';
import NotificationSounds, { playSampleSound } from  'react-native-notification-sounds';

class Chat extends Component<Props> {
  constructor(props) {
    super(props)
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state={
      messages:[],
      trip_id:this.props.route.params.trip_id,
      driver_name:this.props.route.params.driver_name
    }
  }

  componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
  }

  handleBackButtonClick() {
      this.props.navigation.goBack(null);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
  }

  componentDidMount() {
    this.refOn(message => 
      this.setState(previousState => ({
        messages: GiftedChat.append(previousState.messages, message),
        })
      ) 
    );
  }

  refOn = callback => {
    database().ref(`/chat/${this.state.trip_id}`)
      .limitToLast(20)
      .on('child_added', snapshot => callback(this.parse(snapshot)));
  }
  
  parse = snapshot => {
    if(this.state.messages.length > 0){
      this.notification_sound();
    }
    const { text, user } = snapshot.val();
    const { key: _id } = snapshot;
    const message = {_id, text, user };
    return message;
  };

  onSend = messages => {
    for (let i = 0; i < messages.length; i++) {
      const { text, user } = messages[i];
      const message = {text, user };
      database().ref(`/chat/${this.state.trip_id}`).push(message);
      
    }
  }

  notification_sound  =  () => {
    NotificationSounds.getNotifications('notification').then(soundsList  => {
      console.warn('SOUNDS', JSON.stringify(soundsList));
      
      playSampleSound(soundsList[1]);

    });
  }

  render() {
    return (
      <GiftedChat
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          user={{
            _id: global.id+'-Cr',
            name: global.first_name,
            avatar: img_url + global.profile_picture
          }}
          showUserAvatar
        />
    );
  }
}

export default Chat;
