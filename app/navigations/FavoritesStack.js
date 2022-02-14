import React from "react";
import {createStackNavigator} from "@react-navigation/stack";
import Favorites from "../screens/Favorites";

//los stacks sirven para crear sub menus (paginas dentro de los menus principales)

const Stack = createStackNavigator();

export default function FavoritesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="favorites"
        component={Favorites}
        options={{title: "Productos Favoritos"}}
      />
    </Stack.Navigator>
  );
}
