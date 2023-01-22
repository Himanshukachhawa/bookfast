import React, { useEffect, useRef } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { StyleSheet, Text, View, Image, I18nManager } from "react-native";
import Icon, { Icons } from "./src/components/Icons";
import * as colors from "./src/assets/css/Colors";
import { img_url, font_title } from "./src/config/Constants";
import strings from "./src/languages/strings.js";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import "react-native-gesture-handler";
import { connect } from "react-redux";
import { Picker } from "@react-native-picker/picker";
import CardView from "react-native-cardview";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNRestart from "react-native-restart";

/* Screens */
import Splash from "./src/views/Splash";
import LocationEnable from "./src/views/LocationEnable";
import LoginHome from "./src/views/LoginHome";
import Login from "./src/views/Login";
import Password from "./src/views/Password";
import Forgot from "./src/views/Forgot";
import Location from "./src/views/Location";
import Otp from "./src/views/Otp";
import ResetPassword from "./src/views/ResetPassword";
import CreateName from "./src/views/CreateName";
import CreateEmail from "./src/views/CreateEmail";
import CreatePassword from "./src/views/CreatePassword";
import Dashboard from "./src/views/Dashboard";
import ConfirmBooking from "./src/views/ConfirmBooking";
import Ride from "./src/views/Ride";
import Promo from "./src/views/Promo";
import Rating from "./src/views/Rating";
import Rewards from "./src/views/Rewards";
import MyRides from "./src/views/MyRides";
import ComplaintCategory from "./src/views/ComplaintCategory";
import ComplaintSubCategory from "./src/views/ComplaintSubCategory";
import Complaint from "./src/views/Complaint";
import RideDetails from "./src/views/RideDetails";
import Profile from "./src/views/Profile";
import EditFirstName from "./src/views/EditFirstName";
import EditLastName from "./src/views/EditLastName";
import EditPhoneNumber from "./src/views/EditPhoneNumber";
import EditEmail from "./src/views/EditEmail";
import EditPassword from "./src/views/EditPassword";
import Wallet from "./src/views/Wallet";
import Notifications from "./src/views/Notifications";
import NotificationDetails from "./src/views/NotificationDetails";
import Refer from "./src/views/Refer";
import Faq from "./src/views/Faq";
import FaqDetails from "./src/views/FaqDetails";
import PrivacyPolicies from "./src/views/PrivacyPolicies";
import AboutUs from "./src/views/AboutUs";
import Logout from "./src/views/Logout";
import SosSettings from "./src/views/SosSettings";
import AddSosSettings from "./src/views/AddSosSettings";
import EditGender from "./src/views/EditGender";
import VehicleCategories from "./src/views/VehicleCategories";
import Chat from "./src/views/Chat";
import MultipleLocation from "./src/views/MultipleLocation";
import AdminChat from "./src/views/AdminChat";
import Subscription from "./src/views/Subscription";
import Test from "./src/views/Test";

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function CustomDrawerContent(props) {
  language_change = async (lang) => {
    if (global.lang != lang) {
      try {
        await AsyncStorage.setItem("lang", lang);
        strings.setLanguage(lang);
        if (lang == "ar") {
          I18nManager.forceRTL(true);
          RNRestart.Restart();
        } else {
          I18nManager.forceRTL(false);
          RNRestart.Restart();
        }
      } catch (e) {}
    }
  };

  return (
    <DrawerContentScrollView {...props}>
      <View
        style={{
          padding: 10,
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <Image
          style={{
            width: 80,
            height: 80,
            borderRadius: 60 / 2,
            overflow: "hidden",
            alignSelf: "center",
          }}
          source={{ uri: img_url + global.profile_picture }}
        />
        <View style={{ margin: 5 }} />
        <View style={{ alignSelf: "center" }}>
          <Text
            style={{ color: colors.theme_fg, fontWeight: "bold", fontSize: 16 }}
          >
            {global.first_name}
          </Text>
        </View>
        {global.language_status != 1 && (
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              alignSelf: "center",
              marginTop: 20,
              marginBottom: 20,
            }}
          >
            <CardView
              cardElevation={2}
              cardMaxElevation={5}
              style={{
                width: 140,
                height: 40,
                borderRadius: 10,
                justifyContent: "center",
                backgroundColor: colors.theme_fg_three,
              }}
              cornerRadius={10}
            >
              <Picker
                selectedValue={global.lang}
                style={{ color: colors.theme_fg, width: 140 }}
                itemStyle={{ fontFamily: font_title }}
                onValueChange={(itemValue, itemIndex) =>
                  this.language_change(itemValue)
                }
              >
                <Picker.Item label={strings.english} value="en" />
                <Picker.Item label={strings.arabic} value="ar" />
              </Picker>
            </CardView>
          </View>
        )}
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

function MyDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      initialRouteName="Dashboard"
      drawerStyle={{ width: "80%", backgroundColor: colors.theme_fg_three }}
      drawerContentOptions={{
        activeTintColor: colors.theme_fg,
        inactiveTintColor: colors.theme_fg_two,
        labelStyle: { fontSize: 15, fontFamily: "GoogleSans-Bold" },
      }}
    >
      <Drawer.Screen
        name={strings.home}
        component={Dashboard}
        options={{
          drawerIcon: ({ tintColor }) => (
            <Icon
              type={Icons.Ionicons}
              name="home-outline"
              color={colors.theme_fg}
              size={25}
            />
          ),
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name={strings.my_rides}
        component={MyRides}
        options={{
          drawerIcon: ({ tintColor }) => (
            <Icon
              type={Icons.Ionicons}
              name="car-outline"
              color={colors.theme_fg}
              size={25}
            />
          ),
        }}
      />
      <Drawer.Screen
        name={strings.subscription}
        component={Subscription}
        options={{
          drawerIcon: ({ tintColor }) => (
            <Icon
              type={Icons.Ionicons}
              name="card-outline"
              color={colors.theme_fg}
              size={28}
            />
          ),
        }}
      />
      <Drawer.Screen
        name={strings.Admin_Chat}
        component={AdminChat}
        options={{
          drawerIcon: ({ tintColor }) => (
            <Icon
              type={Icons.Ionicons}
              name="chatbubble-ellipses-outline"
              color={colors.theme_fg}
              size={25}
            />
          ),
        }}
      />
      <Drawer.Screen
        name={strings.profile_settings}
        component={Profile}
        options={{
          drawerIcon: ({ tintColor }) => (
            <Icon
              type={Icons.Ionicons}
              name="person-outline"
              color={colors.theme_fg}
              size={25}
            />
          ),
        }}
      />
      <Drawer.Screen
        name={strings.wallet}
        component={Wallet}
        options={{
          drawerIcon: ({ tintColor }) => (
            <Icon
              type={Icons.Ionicons}
              name="wallet-outline"
              color={colors.theme_fg}
              size={25}
            />
          ),
        }}
      />
      <Drawer.Screen
        name={strings.notifications}
        component={Notifications}
        options={{
          drawerIcon: ({ tintColor }) => (
            <Icon
              type={Icons.Ionicons}
              name="ios-notifications-outline"
              color={colors.theme_fg}
              size={25}
            />
          ),
        }}
      />
      <Drawer.Screen
        name={strings.rewards}
        component={Rewards}
        options={{
          drawerIcon: ({ tintColor }) => (
            <Icon
              type={Icons.Ionicons}
              name="ios-bookmark-outline"
              color={colors.theme_fg}
              size={25}
            />
          ),
        }}
      />
      <Drawer.Screen
        name={strings.refer_earn}
        component={Refer}
        options={{
          drawerIcon: ({ tintColor }) => (
            <Icon
              type={Icons.Ionicons}
              name="md-share-outline"
              color={colors.theme_fg}
              size={25}
            />
          ),
        }}
      />
      <Drawer.Screen
        name={strings.sos_settings}
        component={SosSettings}
        options={{
          drawerIcon: ({ tintColor }) => (
            <Icon
              type={Icons.Ionicons}
              name="md-call-outline"
              color={colors.theme_fg}
              size={25}
            />
          ),
        }}
      />
      <Drawer.Screen
        name={strings.faq}
        component={Faq}
        initialParams={{
          data: "Faq Details",
        }}
        options={{
          drawerIcon: ({ tintColor }) => (
            <Icon
              type={Icons.Ionicons}
              name="ios-help-circle-outline"
              color={colors.theme_fg}
              size={28}
            />
          ),
        }}
      />
      <Drawer.Screen
        name={strings.privacy_policies}
        component={PrivacyPolicies}
        options={{
          drawerIcon: ({ tintColor }) => (
            <Icon
              type={Icons.Ionicons}
              name="ios-list-outline"
              color={colors.theme_fg}
              size={25}
            />
          ),
        }}
      />
      <Drawer.Screen
        name={strings.about_us}
        component={AboutUs}
        options={{
          drawerIcon: ({ tintColor }) => (
            <Icon
              type={Icons.Ionicons}
              name="information-circle-outline"
              color={colors.theme_fg}
              size={28}
            />
          ),
        }}
      />
      <Drawer.Screen
        name={strings.logout}
        component={Logout}
        options={{
          drawerIcon: ({ tintColor }) => (
            <Icon
              type={Icons.Ionicons}
              name="ios-exit-outline"
              color={colors.theme_fg}
              size={28}
            />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen
          name="Splash"
          options={{ headerShown: false }}
          component={Splash}
        />
        <Stack.Screen
          name="MultipleLocation"
          options={{ title: "Add Addtional Location" }}
          component={MultipleLocation}
        />
        <Stack.Screen
          name="LocationEnable"
          options={{ headerShown: false }}
          component={LocationEnable}
        />
        <Stack.Screen
          name="LoginHome"
          options={{ headerShown: false }}
          component={LoginHome}
        />
        <Stack.Screen
          name="Login"
          options={{ headerShown: false }}
          component={Login}
        />
        <Stack.Screen
          name="Location"
          options={{ title: "Search your location" }}
          component={Location}
        />
        <Stack.Screen
          name="Password"
          options={{ title: "Enter your OTP" }}
          component={Password}
        />
        <Stack.Screen
          name="Forgot"
          options={{ title: "Forgot Password" }}
          component={Forgot}
        />
        <Stack.Screen
          name="VehicleCategories"
          options={{ title: "Vehicle Categories" }}
          component={VehicleCategories}
        />
        <Stack.Screen
          name="ResetPassword"
          options={{ title: "Reset Password" }}
          component={ResetPassword}
        />
        <Stack.Screen
          name="Otp"
          options={{ title: "Enter OTP" }}
          component={Otp}
        />
        <Stack.Screen
          name="CreateName"
          options={{ title: "Create Name" }}
          component={CreateName}
        />
        <Stack.Screen
          name="CreateEmail"
          options={{ title: "Create Email" }}
          component={CreateEmail}
        />
        <Stack.Screen
          name="CreatePassword"
          options={{ title: "" }}
          component={CreatePassword}
        />
        <Stack.Screen
          name="Home"
          options={{ headerShown: false }}
          component={MyDrawer}
        />
        <Stack.Screen
          name="ConfirmBooking"
          options={{ headerShown: false }}
          component={ConfirmBooking}
        />
        <Stack.Screen
          name="Ride"
          options={{ headerShown: false }}
          component={Ride}
        />
        <Stack.Screen
          name="Promo"
          options={{ title: "Promo List" }}
          component={Promo}
        />
        <Stack.Screen
          name="Rating"
          options={{ headerShown: false }}
          component={Rating}
        />
        <Stack.Screen
          name="RideDetails"
          options={{ title: "Ride Details" }}
          component={RideDetails}
        />
        <Stack.Screen
          name="ComplaintCategory"
          options={{ title: "Complaint Categories" }}
          component={ComplaintCategory}
        />
        <Stack.Screen
          name="ComplaintSubCategory"
          options={{ title: "Complaint Sub Categories" }}
          component={ComplaintSubCategory}
        />
        <Stack.Screen
          name="Complaint"
          options={{ title: "Complaint" }}
          component={Complaint}
        />
        <Stack.Screen
          name="EditFirstName"
          options={{ title: "Edit First Name" }}
          component={EditFirstName}
        />
        <Stack.Screen
          name="EditLastName"
          options={{ title: "Edit Last Name" }}
          component={EditLastName}
        />
        <Stack.Screen
          name="EditPhoneNumber"
          options={{ title: "Edit Phone Number" }}
          component={EditPhoneNumber}
        />
        <Stack.Screen
          name="EditEmail"
          options={{ title: "Edit Email" }}
          component={EditEmail}
        />
        <Stack.Screen
          name="EditPassword"
          options={{ title: "Edit Password" }}
          component={EditPassword}
        />
        <Stack.Screen
          name="NotificationDetails"
          options={{ title: "Notification Details" }}
          component={NotificationDetails}
        />
        <Stack.Screen
          name="FaqDetails"
          options={{ title: "FAQ Details" }}
          component={FaqDetails}
        />
        <Stack.Screen
          name="SosSettings"
          options={{ title: "SOS Settings" }}
          component={SosSettings}
        />
        <Stack.Screen
          name="AddSosSettings"
          options={{ title: "Add Contacts" }}
          component={AddSosSettings}
        />
        <Stack.Screen
          name="EditGender"
          options={{ title: "Edit Gender" }}
          component={EditGender}
        />
        <Stack.Screen
          name="Chat"
          options={{ title: "Driver Chat" }}
          component={Chat}
        />
        <Stack.Screen
          name="Profile"
          options={{ title: "Profile" }}
          component={Profile}
        />
        <Stack.Screen
          name="Wallet"
          options={{ title: "Wallet" }}
          component={Wallet}
        />
        <Stack.Screen
          name="Notifications"
          options={{ title: "Notifications" }}
          component={Notifications}
        />
        <Stack.Screen
          name="Rewards"
          options={{ title: "Rewards" }}
          component={Rewards}
        />
        <Stack.Screen
          name="Refer"
          options={{ title: "Refer" }}
          component={Refer}
        />
        <Stack.Screen name="Faq" options={{ title: "FAQ" }} component={Faq} />
        <Stack.Screen
          name="PrivacyPolicies"
          options={{ title: "Privacy Policies" }}
          component={PrivacyPolicies}
        />
        <Stack.Screen
          name="AboutUs"
          options={{ title: "About Us" }}
          component={AboutUs}
        />
        <Stack.Screen
          name="Logout"
          options={{ headerShown: false }}
          component={Logout}
        />
        <Stack.Screen
          name="AdminChat"
          options={{ headerShown: false }}
          component={AdminChat}
        />
        <Stack.Screen
          name="Test"
          options={{ headerShown: false }}
          component={Test}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 16,
  },
});

function mapStateToProps(state) {
  return {
    profile_picture: state.profile.profile_picture,
  };
}

export default connect(mapStateToProps, null)(App);
