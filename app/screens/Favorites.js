import React, {useState, useRef, useCallback} from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import {Image, Icon, Button} from "react-native-elements";

import {useFocusEffect} from "@react-navigation/native";
import Toast from "react-native-easy-toast";
import {firebaseApp} from "../utils/firebase";
import firebase from "firebase";
import "firebase/firestore";

import Loading from "../components/Loading";
import {size} from "lodash";

const db = firebase.firestore(firebaseApp);

export default function Favorites(props) {
  const toastRef = useRef();

  const [reloadData, setReloadData] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  //console.log(props);

  const {navigation} = props;

  const [restaurants, setRestaurants] = useState(null);
  const [userLogged, setUserLogged] = useState(false);

  //console.log(restaurants);

  firebase.auth().onAuthStateChanged((user) => {
    user ? setUserLogged(true) : setUserLogged(false);
  });

  useFocusEffect(
    useCallback(() => {
      if (userLogged) {
        const idUser = firebase.auth().currentUser.uid;
        db.collection("favorites")
          .where("idUser", "==", idUser)
          .get()
          .then((response) => {
            const idRestaurantsArray = [];
            response.forEach((doc) => {
              idRestaurantsArray.push(doc.data().idRestaurant);
              //console.log(doc.data());
            });
            //console.log(idRestaurantsArray);
            getDataRestaurant(idRestaurantsArray).then((response) => {
              const restaurants = [];
              response.forEach((doc) => {
                //console.log(doc.data());
                const restaurant = doc.data();
                restaurant.id = doc.id;
                restaurants.push(restaurant);
              });
              setRestaurants(restaurants);
            });
          });
      }
      setReloadData(false);
    }, [userLogged, reloadData])
  );

  const getDataRestaurant = (idRestaurantsArray) => {
    //console.log(idRestaurantsArray);
    const arrayRestaurants = [];
    idRestaurantsArray.forEach((idRestaurant) => {
      const result = db.collection("restaurants").doc(idRestaurant).get();
      arrayRestaurants.push(result);
    });
    return Promise.all(arrayRestaurants);
  };

  if (!userLogged) {
    return <UserNotLogged navigation={navigation} />;
  }

  /*if (!restaurants) {
    return <Loading isVisible={true} text="Cargando restaurantes" />;
  } else*/

  //console.log(restaurants.lenght);
  if (size(restaurants) === 0) {
    return <NotFoundRestaurants />;
  }

  return (
    <View style={styles.viewBody}>
      {restaurants ? (
        <FlatList
          data={restaurants}
          renderItem={(restaurant) => (
            <Restaurant
              setIsLoading={setIsLoading}
              toastRef={toastRef}
              restaurant={restaurant}
              setReloadData={setReloadData}
              navigation={navigation}
            />
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      ) : (
        <View style={styles.loaderRestaurants}>
          <ActivityIndicator size="large" />
          <Text style={{textAlign: "center"}}>Cargando Productos</Text>
        </View>
      )}
      <Toast ref={toastRef} position="center" opacity={0.9} />
      <Loading text="Eliminando producto" isVisible={isLoading} />
    </View>
  );
}

function NotFoundRestaurants() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon type="material-community" name="alert-outline" size={50} />

      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
        }}
      >
        No tienes productos en favoritos
      </Text>
    </View>
  );
}

function UserNotLogged(props) {
  const {navigation} = props;

  return (
    <View style={{flex: 1, alignItems: "center", justifyContent: "center"}}>
      <Icon type="material-community" name="alert-outline" size={50} />
      <Text style={{fontSize: 20, fontWeight: "bold", textAlign: "center"}}>
        Necesitas estar logeado para ver esta seccion
      </Text>

      <Button
        title="Ir al login"
        containerStyle={{marginTop: 20, width: "80%"}}
        buttonStyle={{backgroundColor: "#00a680"}}
        onPress={() => navigation.navigate("account", {screen: "login"})}
      />
    </View>
  );
}

function Restaurant(props) {
  //console.log(props);
  const {restaurant, setIsLoading, toastRef, setReloadData, navigation} = props;

  const {name, images, id} = restaurant.item;

  const confirmRemoveFavorite = () => {
    Alert.alert(
      "Eliminar producto de favoritos",
      "??Estas seguro?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          onPress: removeFavorite,
        },
      ],
      {cancelable: false}
    );
  };

  const removeFavorite = () => {
    setIsLoading(true);
    //console.log("Borrando");
    db.collection("favorites")
      .where("idRestaurant", "==", id)
      .where("idUser", "==", firebase.auth().currentUser.uid)
      .get()
      .then((response) => {
        response.forEach((doc) => {
          const idFavorite = doc.id;
          db.collection("favorites")
            .doc(idFavorite)
            .delete()
            .then(() => {
              setIsLoading(false);
              setReloadData(true);
              //console.log("Eliminado");
              toastRef.current.show("Producto eliminado correctamente");
            })
            .catch(() => {
              setIsLoading(false);
              //console.log("Eliminado");
              toastRef.current.show("Ha ocurrido un error");
            });
        });
      });
  };

  return (
    <View style={styles.restaurant}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("restaurants", {
            screen: "restaurant",
            params: {id},
          })
        }
      >
        <Image
          resizeMode="cover"
          style={styles.image}
          PlaceholderContent={<ActivityIndicator color="#fff" />}
          source={
            images[0]
              ? {uri: images[0]}
              : require("../../assets/img/no-image.png")
          }
        />

        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <Icon
            type="material-community"
            name="heart"
            color="#f00"
            containerStyle={styles.favorites}
            onPress={confirmRemoveFavorite}
            underlayColor="trasparent"
          />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  viewBody: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  loaderRestaurants: {
    marginTop: 10,
    marginBottom: 10,
  },
  restaurant: {
    margin: 10,
  },
  image: {
    width: "100%",
    height: 180,
  },
  info: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: -30,
    backgroundColor: "#fff",
  },
  name: {
    fontWeight: "bold",
    fontSize: 20,
  },
  favorites: {
    marginTop: -35,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 100,
  },
});
