import React from 'react';
import {
  View,
} from 'react-native';

const ShowHideView = (props) => {
  const { children, hide, style } = props;
  if (hide) {
    return null;
  }
  return (
    <View {...props} style={style}>
      { children }
    </View>
  );
};

export default ShowHideView;