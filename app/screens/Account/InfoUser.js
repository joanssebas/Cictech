import React from "react";
import {StyleSheet, View, Text} from "react-native";
import {Avatar} from "react-native-elements";
//import AvatarDefault from "../../../assets/img/avatar-default.jpg";
import * as firebase from "firebase";
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import {result} from "lodash";

export default function InfoUser(props) {
  const {
    userInfo: {uid, photoURL, displayName, email},
    toastRef,
    setLoading,
    setLoadingText,
  } = props;

  //console.log(props.userInfo);

  const changeAvatar = async () => {
    //console.log("Change Avatar...");
    const resultPermission = await Permissions.askAsync(
      Permissions.MEDIA_LIBRARY
    );
    //console.log(resultPermission);
    const resultPermissionCamera =
      resultPermission.permissions.mediaLibrary.status;

    if (resultPermissionCamera === "denied") {
      toastRef.current.show("es necesario dar permisos de galeria");
    } else {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
      });
      //console.log(result);
      if (result.cancelled) {
        toastRef.current.show("has cerrado la seleccion de imagenes");
      } else {
        uploadImage(result.uri)
          .then(() => {
            //console.log("imagen subida");
            updatePhotoURL();
          })
          .catch(() => {
            toastRef.current.show("Error al subir la imagen");
          });
      }
    }
  };

  const uploadImage = async (uri) => {
    setLoadingText("Actualizando Avatar");
    setLoading(true);
    //console.log(uri);
    const response = await fetch(uri);
    //console.log(JSON.stringify(response));
    const blob = await response.blob();
    //console.log(JSON.stringify(blob));

    const ref = firebase.storage().ref().child(`avatar/${uid}`);
    return ref.put(blob);
  };

  const updatePhotoURL = () => {
    firebase
      .storage()
      .ref(`avatar/${uid}`)
      .getDownloadURL()
      .then(async (response) => {
        //console.log(response);
        const update = {
          photoURL: response,
        };
        await firebase.auth().currentUser.updateProfile(update);
        setLoading(false);
        //console.log("Imagen actualizada");
      })
      .catch(() => {
        toastRef.current.show("Error al actualizar el avatar");
      });
  };

  //const {photoURL} = userInfo;

  // console.log(photoURL);
  //console.log(displayName);

  //console.log(email);

  //console.log(userInfo);

  return (
    <View style={styles.viewUserInfo}>
      <Avatar
        rounded
        size="large"
        showEditButton
        onEditPress={changeAvatar}
        containerStyle={styles.userInfoAvatar}
        source={
          photoURL
            ? {uri: photoURL}
            : require("../../../assets/img/avatar-default.jpg")
        }
      />
      <View>
        <Text style={styles.displayName}>
          {displayName ? displayName : "Anonimo"}
        </Text>
        <Text>{email ? email : "Social login"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  viewUserInfo: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
    paddingTop: 30,
    paddingBottom: 30,
  },
  userInfoAvatar: {
    marginRight: 20,
  },
  displayName: {
    fontWeight: "bold",
    paddingBottom: 5,
  },
});
