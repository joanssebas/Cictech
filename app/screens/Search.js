import React, {useState, useEffect} from "react";
import {View, Text, StyleSheet, FlatList, Image} from "react-native";

import {SearchBar, ListItem, Icon} from "react-native-elements";

import {FireSQL} from "firesql";
import firebase from "firebase/app";

const fireSQL = new FireSQL(firebase.firestore(), {includeId: "id"});

export default function Search(props) {
  const {navigation} = props;

  const [search, setSearch] = useState("");

  const [restaurants, setRestaurants] = useState([]);

  //console.log(restaurants);

  useEffect(() => {
    if (search) {
      fireSQL
        .query(
          `SELECT * FROM restaurants 
    WHERE name LIKE '${search}%'`
        )
        .then((response) => {
          //console.log(response);
          setRestaurants(response);
        });
    }
  }, [search]);

  return (
    <View>
      <SearchBar
        placeholder="Busca tu producto..."
        onChangeText={(e) => setSearch(e)}
        containerStyle={styles.searchBar}
        value={search}
      />

      {restaurants.length === 0 ? (
        <NotFoundRestaurants />
      ) : (
        <FlatList
          data={restaurants}
          renderItem={(restaurant) => (
            <Restaurant restaurant={restaurant} navigation={navigation} />
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      )}
    </View>
  );
}

function NotFoundRestaurants() {
  return (
    <View style={{flex: 1, alignItems: "center"}}>
      <Image
        source={require("../../assets/img/no-result-found.png")}
        resizeMode="cover"
        style={{width: 200, height: 200}}
      />
    </View>
  );
}

function Restaurant(props) {
  const {restaurant, navigation} = props;

  const {name, images, id} = restaurant.item;

  return (
    <ListItem
      title={name}
      leftAvatar={{
        source: images[0]
          ? {uri: images[0]}
          : require("../../assets/img/no-image.png"),
      }}
      rightIcon={<Icon type="material-community" name="chevron-right" />}
      onPress={() =>
        navigation.navigate("restaurants", {
          screen: "restaurant",
          params: {id, name},
        })
      }
    />
  );
}

const styles = StyleSheet.create({
  searchBar: {
    marginBottom: 20,
  },
});
