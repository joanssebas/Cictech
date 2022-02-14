import React from "react";
import {createStackNavigator} from "@react-navigation/stack";
import Account from "../screens/Account/Account";
import Login from "../screens/Account/Login";
import Register from "../screens/Account/Register";

//los stacks sirven para crear sub menus (paginas dentro de los menus principales)

const Stack = createStackNavigator();

export default function AccountStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="account"
        component={Account}
        options={{title: "Mi cuenta"}}
      />

      <Stack.Screen
        name="login"
        component={Login}
        options={{title: "Iniciar sesion"}}
      />

      <Stack.Screen
        name="register"
        component={Register}
        options={{title: "Registro de usuario"}}
      />
    </Stack.Navigator>
  );
}
