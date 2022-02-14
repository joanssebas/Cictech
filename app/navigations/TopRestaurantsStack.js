import React from "react";
import {createStackNavigator} from "@react-navigation/stack";
import TopRestaurants from "../screens/TopRestaurants";

//los stacks sirven para crear sub menus (paginas dentro de los menus principales)

const Stack = createStackNavigator();

export default function TopRestaurantsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="top-restaurants"
        component={TopRestaurants}
        options={{title: "Los mejores productos"}}
      />
    </Stack.Navigator>
  );
}
