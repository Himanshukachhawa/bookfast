import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import Icon, { Icons } from '../components/Icons';
import * as colors from '../assets/css/Colors';
import { app_name, light, regular, bold, home_banner, base_url, width_100 } from '../config/Constants';
import { useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
const AdminChat = () => {

  const navigation = useNavigation();

  const handleBackButtonClick= () => {
    navigation.goBack()
  }

  return (
    <SafeAreaView style={styles.container}>
        <WebView 
          source={{ uri: base_url+'customer_chat/'+global.id }} 
          style={{ width: width_100 }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
        />
    </SafeAreaView> 
  )
}

const styles = StyleSheet.create({
  container: {
    flex:1,
  },
  header: {
    justifyContent: 'flex-start',
    alignItems:'center',
    flexDirection:'row',
    padding:10
  },

});

export default AdminChat;
