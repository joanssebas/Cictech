import React, {useEffect, useState} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
} from "react-native";
import {Icon, Avatar, Image, Input, Button} from "react-native-elements";
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import {askAsync} from "expo-permissions";
import {map, size, filter, result} from "lodash";
import Modal from "../Modal";
import * as Location from "expo-location";
import MapView from "react-native-maps";
import {log} from "react-native-reanimated";
import {firebaseApp} from "../../utils/firebase";
import firebase from "firebase/app";

import uuid from "random-uuid-v4";
import "firebase/firestore";

const db = firebase.firestore(firebaseApp);

const widthScreen = Dimensions.get("window").width;

export default function AddRestaurantForm(props) {
  const [locationRestaurant, setLocationRestaurant] = useState(null);

  const {navigation, toastRef, setIsLoading} = props;

  const [restaurantName, setRestaurantName] = useState("");

  const [restaurantAddress, setRestaurantAddess] = useState("");

  const [restaurantDescription, setRestaurantDescription] = useState("");

  const [imagesSelected, setImagesSelected] = useState([]);

  const [isVisibleMap, setIsVisibleMap] = useState(false);

  const addRestaurant = () => {
    if (!restaurantName || !restaurantDescription || !restaurantAddress) {
      toastRef.current.show("Todos los campos del formulario son obligatorios");
    } else if (size(imagesSelected) === 0) {
      toastRef.current.show("Debes elegir al menos una foto");
    } else if (!locationRestaurant) {
      toastRef.current.show("Por favor selecciona una ubicacion");
    } else {
      setIsLoading(true);
      //console.log("OKKKKK");
      uploadImageStorage().then((response) => {
        //console.log(response);
        //setIsLoading(false);

        db.collection("restaurants")
          .add({
            name: restaurantName,
            address: restaurantAddress,
            description: restaurantDescription,
            location: locationRestaurant,
            images: response,
            rating: 0,
            ratingTotal: 0,
            quantityVoting: 0,
            createAt: new Date(),
            createBy: firebaseApp.auth().currentUser.uid,
          })
          .then(() => {
            setIsLoading(false);
            //console.log("OKOOOOOOo");
            navigation.navigate("restaurants");
          })
          .catch(() => {
            setIsLoading(false);
            toastRef.current.show("Ha ocurrido un error, intenta de nuevo");
          });
      });
      //console.log(pepe);
    }

    // console.log(imagesSelected);

    //console.log(locationRestaurant);
    //console.log("ok");
    //console.log("restaurant name: " + restaurantName);
    //console.log("restaurant Address: " + restaurantAddress);
    //console.log("restaurant description: " + restaurantDescription);
  };

  const uploadImageStorage = async () => {
    //console.log(imagesSelected);

    const imageBlob = [];

    await Promise.all(
      map(imagesSelected, async (image) => {
        const response = await fetch(image);
        const blob = await response.blob();
        const ref = firebase.storage().ref("restaurants").child(uuid());

        await ref.put(blob).then(async (result) => {
          // console.log("OKKKKKk");

          await firebase
            .storage()
            .ref(`restaurants/${result.metadata.name}`)
            .getDownloadURL()
            .then((photoUrl) => {
              //console.log(photoUrl);
              imageBlob.push(photoUrl);
            });
        });

        //console.log(JSON.stringify(response));
      })
    );

    return imageBlob;
  };

  return (
    <ScrollView style={styles.scrollView}>
      <ImageRestaurant imageRestaurant={imagesSelected[0]} />
      <FormAdd
        setRestaurantName={setRestaurantName}
        setRestaurantAddess={setRestaurantAddess}
        setRestaurantDescription={setRestaurantDescription}
        setIsVisibleMap={setIsVisibleMap}
        locationRestaurant={locationRestaurant}
      />
      <UploadImage
        toastRef={toastRef}
        setImagesSelected={setImagesSelected}
        imagesSelected={imagesSelected}
      />
      <Button
        title="Crear producto"
        onPress={addRestaurant}
        buttonStyle={styles.btnAddRestaurant}
      />
      <Map
        isVisibleMap={isVisibleMap}
        setIsVisibleMap={setIsVisibleMap}
        setLocationRestaurant={setLocationRestaurant}
        toastRef={toastRef}
      />
    </ScrollView>
  );
}

function ImageRestaurant(props) {
  const {imageRestaurant} = props;

  return (
    <View style={styles.viewPhoto}>
      <Image
        source={
          imageRestaurant
            ? {uri: imageRestaurant}
            : require("../../../assets/img/no-image.png")
        }
        style={{width: widthScreen, height: 200}}
      />
    </View>
  );
}

function FormAdd(props) {
  //console.log(props);

  const {
    setRestaurantName,
    setRestaurantAddess,
    setRestaurantDescription,
    setIsVisibleMap,
    locationRestaurant,
  } = props;

  return (
    <View style={styles.viewForm}>
      <Input
        placeholder="Nombre del producto"
        containerStyle={styles.input}
        onChange={(e) => setRestaurantName(e.nativeEvent.text)}
      />
      <Input
        placeholder="Direccion"
        containerStyle={styles.input}
        onChange={(e) => setRestaurantAddess(e.nativeEvent.text)}
        rightIcon={{
          type: "material-community",
          name: "google-maps",
          color: locationRestaurant ? "#00a680" : "#c2c2c2",
          onPress: () => setIsVisibleMap(true),
        }}
      />
      <Input
        placeholder="Descripcion del producto"
        multiline={true}
        inputContainerStyle={styles.textArea}
        onChange={(e) => setRestaurantDescription(e.nativeEvent.text)}
      />
    </View>
  );
}

function Map(props) {
  const {isVisibleMap, setIsVisibleMap, setLocationRestaurant, toastRef} =
    props;

  const [location, setLocation] = useState(null);

  useEffect(() => {
    (async () => {
      const resultPermissions = await Permissions.askAsync(
        Permissions.LOCATION
      );
      //console.log(resultPermissions);
      const statusPermissions = resultPermissions.permissions.location.status;

      if (statusPermissions !== "granted") {
        toastRef.current.show("Paila pri aceptelos", 3000);
      } else {
        const loc = await Location.getCurrentPositionAsync({});
        //console.log(loc);
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001,
        });
      }
    })();
  }, []);

  const confirmLocation = () => {
    setLocationRestaurant(location);
    toastRef.current.show("Localizacion guadada correctamente");
    setIsVisibleMap(false);
  };

  return (
    <Modal isVisible={isVisibleMap} setIsVisible={setIsVisibleMap}>
      <View>
        {location && (
          <MapView
            style={styles.mapStyle}
            initialRegion={location}
            showsUserLocation={true}
            onRegionChange={(region) => setLocation(region)}
          >
            <MapView.Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              draggable
            />
          </MapView>
        )}

        <View style={styles.viewMapBtn}>
          <Button
            title="Guardar Ubicacion"
            containerStyle={styles.viewMapBtnContainerSave}
            buttonStyle={styles.viewMapBtnSave}
            onPress={confirmLocation}
          />
          <Button
            title="Cancelar Ubicacion"
            containerStyle={styles.viewMapBtnContainerCancel}
            buttonStyle={styles.viewMapBtnCancel}
            onPress={() => setIsVisibleMap(false)}
          />
        </View>
      </View>
    </Modal>
  );
}

function UploadImage(props) {
  const {toastRef, setImagesSelected, imagesSelected} = props;
  const ImageSelect = async () => {
    //console.log("añadir Imagenes");
    const resultPermissions = await Permissions.askAsync(
      Permissions.MEDIA_LIBRARY
    );

    if (resultPermissions === "denied") {
      toastRef.current.show(
        "Por favor dale permisos de galeria a la aplicacion",
        3000
      );
    } else {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
      });

      //console.log(result);
      if (result.cancelled) {
        toastRef.current.show(
          "Has cerrado la galeria sin seleccionar ninguna imagen",
          2000
        );
      } else {
        //console.log("OKKKKKK");
        setImagesSelected([...imagesSelected, result.uri]);
      }
    }
    //console.log(resultPermissions);
  };

  const removeImage = (image) => {
    //console.log(image);
    const arrayImages = imagesSelected;
    Alert.alert(
      "Eliminar imagen",
      "Estas seguro?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Eliminar",
          onPress: () => {
            setImagesSelected(
              filter(arrayImages, (imageUrl) => imageUrl !== image)
            );
            //console.log("Eliminada");

            //console.log(test);
          },
        },
      ],
      {cancelable: false}
    );
  };

  return (
    <View style={styles.viewImage}>
      {size(imagesSelected) < 4 && (
        <Icon
          type="material-community"
          name="camera"
          color="#7a7a7a"
          containerStyle={styles.containerIcon}
          onPress={ImageSelect}
        />
      )}

      {map(imagesSelected, (imageRestaurant, index) => (
        <Avatar
          key={index}
          style={styles.miniatureStyle}
          source={{uri: imageRestaurant}}
          onPress={() => removeImage(imageRestaurant)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    height: "100%",
  },
  viewForm: {
    marginLeft: 10,
    marginRight: 10,
  },
  input: {
    marginBottom: 10,
  },
  textArea: {
    height: 100,
    width: "100%",
    padding: 0,
    margin: 0,
  },
  btnAddRestaurant: {
    backgroundColor: "#00a680",
    margin: 20,
  },
  viewImage: {
    flexDirection: "row",
    marginLeft: 20,
    marginRight: 20,
    marginTop: 30,
  },
  containerIcon: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    height: 70,
    width: 70,
    backgroundColor: "#e3e3e3",
  },
  miniatureStyle: {
    width: 70,
    height: 70,
    marginRight: 10,
  },
  viewPhoto: {
    alignItems: "center",
    height: 200,
    marginBottom: 20,
  },
  mapStyle: {
    width: "100%",
    height: 550,
  },
  viewMapBtn: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  viewMapBtnContainerCancel: {
    paddingLeft: 5,
  },
  viewMapBtnCancel: {
    backgroundColor: "#a60d0d",
  },
  viewMapBtnContainerSave: {
    paddingRight: 5,
  },
  viewMapBtnSave: {
    backgroundColor: "#00a680",
  },
});
