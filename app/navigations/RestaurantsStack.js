import React from "react";
import {createStackNavigator} from "@react-navigation/stack";
import Restaurants from "../screens/Restaurants/Restaurants";
import AddRestaurant from "../screens/Restaurants/AddRestaurant";
import Restaurant from "../screens/Restaurants/Restaurant";
import AddReviewRestaurant from "../screens/Restaurants/AddReviewRestaurant";

//los stacks sirven para crear sub menus (paginas dentro de los menus principales)

const Stack = createStackNavigator();

export default function RestaurantsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="restaurants"
        component={Restaurants}
        options={{title: "Productos"}}
      />
      <Stack.Screen
        name="add-restaurant"
        component={AddRestaurant}
        options={{title: "Añadir nuevo producto"}}
      />

      <Stack.Screen name="restaurant" component={Restaurant} />

      <Stack.Screen
        name="add-review--restaurant"
        component={AddReviewRestaurant}
        options={{
          title: "Nuevo comentario",
        }}
      />
    </Stack.Navigator>
  );
}
