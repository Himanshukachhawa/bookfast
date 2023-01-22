import React from 'react';
import { Image as Img, StatusBar as Sb, View } from 'react-native';
import * as colors from '../assets/css/Colors';
import ContentLoader from 'react-content-loader'
import {Circle, Rect} from 'react-native-svg'
import Spinner from 'react-native-loading-spinner-overlay';

export function StatusBar(props){
	return <Sb
	    barStyle = "light-content"
	    hidden = {false}
	    backgroundColor = {colors.theme_bg}
	    translucent = {false}
	    networkActivityIndicatorVisible = {true}
	 />
}

export function SingleListLoader(props){
	if(props.visible == true){
		return <ContentLoader duration={1000}>
            <Rect x="20" y="15" rx="4" ry="4" width="80%" height="15"/>
            <Rect x="20" y="35" rx="4" ry="4" width="95%" height="10"/>
            <Rect x="20" y="60" rx="4" ry="4" width="80%" height="15"/>
            <Rect x="20" y="80" rx="4" ry="4" width="95%" height="10"/>
            <Rect x="20" y="105" rx="4" ry="4" width="80%" height="15"/>
            <Rect x="20" y="125" rx="4" ry="4" width="95%" height="10"/>
            <Rect x="20" y="150" rx="4" ry="4" width="80%" height="15"/>
            <Rect x="20" y="170" rx="4" ry="4" width="95%" height="10"/>
          </ContentLoader>
	}else{
		return <View />
	}
}

export function HeaderWithContentLoader(props){
	if(props.visible == true){
		return <ContentLoader height={600} duration={1000}>
            <Rect x="20" y="25" rx="4" ry="4" width="70%" height="15"/>
            <Rect x="20" y="65" rx="4" ry="4" width="99%" height="5"/>
            <Rect x="20" y="75" rx="4" ry="4" width="80%" height="5"/>
            <Rect x="20" y="85" rx="4" ry="4" width="99%" height="5"/>
            <Rect x="20" y="95" rx="4" ry="4" width="80%" height="5"/>
            <Rect x="20" y="105" rx="4" ry="4" width="99%" height="5"/>
            <Rect x="20" y="165" rx="4" ry="4" width="70%" height="15"/>
            <Rect x="20" y="205" rx="4" ry="4" width="99%" height="5"/>
            <Rect x="20" y="215" rx="4" ry="4" width="80%" height="5"/>
            <Rect x="20" y="225" rx="4" ry="4" width="99%" height="5"/>
            <Rect x="20" y="235" rx="4" ry="4" width="80%" height="5"/>
            <Rect x="20" y="245" rx="4" ry="4" width="99%" height="5"/>
          </ContentLoader>
	}else{
		return <View />
	}
}
