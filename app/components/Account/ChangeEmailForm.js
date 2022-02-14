import React, {useState} from "react";
import {StyleSheet, View} from "react-native";
import {Input, Button} from "react-native-elements";
import {validateEmail} from "../../utils/validations";
import {reauthenticate} from "../../utils/api";
import * as firebase from "firebase";

export default function ChangeEmailForm(props) {
  const {email, setShowModal, toastRef, setReloadUserInfo} = props;

  const [formData, setFormData] = useState(defaultValue());

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState({});

  const [isLoading, setIsLoading] = useState(false);

  const onChange = (e, type) => {
    setFormData({...formData, [type]: e.nativeEvent.text});
  };

  //console.log(formData);

  const onSubmit = () => {
    setError({});
    //console.log("enviando formulario");
    //console.log(formData);

    if (!formData.email || email === formData.email) {
      setError({
        email: "El email no ha cambiado",
      });
    } else if (!validateEmail(formData.email)) {
      setError({
        email: "Email incorrecto",
      });
    } else if (!formData.password) {
      setError({
        password: "la contraseña no debe estar vacia",
      });
    } else {
      setIsLoading(true);
      //console.log("OK!!!!!!!");
      reauthenticate(formData.password)
        .then(() => {
          //console.log(response);
          firebase
            .auth()
            .currentUser.updateEmail(formData.email)
            .then(() => {
              setIsLoading(false);
              setReloadUserInfo(true);
              toastRef.current.show("Email actuializado correctamente");
              setShowModal(false);
            })
            .catch(() => {
              setError({
                email: "Error al actualizar el email",
              });
              setIsLoading(false);
            });
        })
        .catch(() => {
          setIsLoading(false);
          setError({
            password: "La contraseña no es correcta",
          });
        });
    }
  };

  return (
    <View style={styles.view}>
      <Input
        placeholder="Correo electronico"
        containerStyle={styles.input}
        defaultValue={email || ""}
        rightIcon={{
          type: "material-community",
          name: "at",
          color: "#c2c2c2",
        }}
        onChange={(e) => onChange(e, "email")}
        errorMessage={error.email}
      />

      <Input
        placeholder="Contraseña"
        placeholderTextColor="#212121"
        containerStyle={styles.input}
        password={true}
        secureTextEntry={showPassword ? false : true}
        rightIcon={{
          type: "material-community",
          name: showPassword ? "eye-off-outline" : "eye-outline",
          color: "#c2c2c2",
          onPress: () => setShowPassword(!showPassword),
        }}
        onChange={(e) => onChange(e, "password")}
        errorMessage={error.password}
      />

      <Button
        title="Cambiar email"
        containerStyle={styles.btnContainer}
        buttonStyle={styles.btn}
        onPress={onSubmit}
        loading={isLoading}
      />
    </View>
  );
}

function defaultValue() {
  return {
    email: "",
    password: "",
  };
}

const styles = StyleSheet.create({
  view: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 10,
  },
  input: {
    marginBottom: 10,
  },
  btnContainer: {
    marginTop: 20,
    width: "95%",
  },
  btn: {
    backgroundColor: "#00a680",
  },
});
