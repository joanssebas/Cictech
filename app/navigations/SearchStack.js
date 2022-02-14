import React from "react";
import {createStackNavigator} from "@react-navigation/stack";
import Search from "../screens/Search";

//los stacks sirven para crear sub menus (paginas dentro de los menus principales)

const Stack = createStackNavigator();

export default function SearchStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="search"
        component={Search}
        options={{title: "Buscador"}}
      />
    </Stack.Navigator>
  );
}
