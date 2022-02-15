import React, {useState, useEffect, useCallback} from "react";
import {View, Text, StyleSheet} from "react-native";
import {Icon} from "react-native-elements";
import {firebaseApp} from "../../utils/firebase";
import firebase from "firebase/app";
import {useFocusEffect} from "@react-navigation/native";

import "firebase/firestore";
import ListRestaurants from "../../components/Restaurants/ListRestaurants";

const db = firebase.firestore(firebaseApp);

export default function Restaurants(props) {
  const {navigation} = props;
  //console.log(props);
  const [user, setUser] = useState(null);

  const limitRestaurants = 10;

  const [restaurants, setRestaurants] = useState([]);
  const [totalRestaurants, setTotalRestaurants] = useState(0);

  const [startRestaurants, setStartRestaurants] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  //console.log(restaurants);

  //console.log(totalRestaurants);

  useEffect(() => {
    firebase.auth().onAuthStateChanged((userInfo) => {
      //console.log("USEEEEEEEER INFO!!!!!!");
      //console.log(userInfo);
      setUser(userInfo);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      db.collection("restaurants")
        .get()
        .then((snap) => {
          setTotalRestaurants(snap.size);
        });

      const resultRestaurants = [];

      db.collection("restaurants")
        .orderBy("createAt", "desc")
        .limit(limitRestaurants)
        .get()
        .then((response) => {
          //console.log(response);
          setStartRestaurants(response.docs[response.docs.length - 1]);

          response.forEach((doc) => {
            //console.log(doc.data());

            //console.log(doc.id);

            const restaurant = doc.data();
            restaurant.id = doc.id;
            //console.log(restaurant);

            resultRestaurants.push(restaurant);
          });
          setRestaurants(resultRestaurants);
        });
    }, [])
  );

  //useEffect(() => {

  //}, []);

  const handleLoadMore = () => {
    const resultRestaurants = [];
    restaurants.length < totalRestaurants && setIsLoading(true);

    db.collection("restaurants")
      .orderBy("createAt", "desc")
      .startAfter(startRestaurants.data().createAt)
      .limit(limitRestaurants)
      .get()
      .then((response) => {
        if (response.docs.length > 0) {
          setStartRestaurants(response.docs[response.docs.length - 1]);
        } else {
          setIsLoading(false);
        }
        response.forEach((doc) => {
          const restaurant = doc.data();
          restaurant.id = doc.id;
          resultRestaurants.push(restaurant);
        });
        setRestaurants([...restaurants, ...resultRestaurants]);
      });
  };

  const userAdmin = firebase.auth().currentUser;

  var userTrue = null;

  if (userAdmin != null) {
    if (userAdmin.email === "admin@gmail.com") {
      userTrue = true;
    } else {
      userTrue = false;
    }
  }
  //console.log("EMAIL USER");

  //console.log(userAdmin.email);

  //const emailUser = userAdmin.email;

  //console.log(emailUser);

  //const usertrue = "admin@gmail.com" === emailUser;

  //console.log(usertrue);

  return (
    <View style={styles.viewBody}>
      <ListRestaurants
        restaurants={restaurants}
        handleLoadMore={handleLoadMore}
        isLoading={isLoading}
      />

      {userTrue ? (
        <Icon
          type="material-community"
          name="plus"
          color="#00a680"
          reverse
          containerStyle={styles.btnContainer}
          onPress={() => navigation.navigate("add-restaurant")}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  viewBody: {
    flex: 1,
    backgroundColor: "#fff",
  },
  btnContainer: {
    position: "absolute",
    bottom: 10,
    right: 10,
    shadowColor: "black",
    shadowOffset: {width: 2, height: 2},
    shadowOpacity: 0.5,
  },
});
