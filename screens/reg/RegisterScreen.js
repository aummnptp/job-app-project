import React, { useState } from "react";
import { View, Text, Button, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import firebase from '../../database/firebaseDB';

const RegisterScreen = ({ route, navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegistration = async () => {
    try {
      if (password === confirmPassword) {
        await firebase.auth().createUserWithEmailAndPassword(email, password);
        navigation.navigate("Login");
        // การลงทะเบียนสำเร็จ
      } else {
        console.log("รหัสผ่านไม่ตรงกัน");
      }
    } catch (error) {
      // การลงทะเบียนไม่สำเร็จ
      console.error(error);
    }
  }

  return (
    <View style={styles.screen}>

    {/* username */}
    <View style={{ ...{ alignSelf: "left", width: "80%" } }}>
      <Text style={{ ...styles.text, ...{} }}>ชื่อผู้ใช้</Text>

    </View>
    <TextInput
      style={styles.input}
      blurOnSubmit
      autoCapitalize="none"
      autoCorrect={false}

      keyboardType="default"
      onChangeText={(text) => setUsername(text)}

      // จำนวนตัวอักษรมากสุด
      maxLength={20}
      placeholder="ชื่อผู้ใช้"
      //...เพิ่ม property value และ onChangeText...
      // value={enteredValue}
      // onChangeText={numberInputHandler}
    />

        {/* email */}
    <View style={{ ...{ alignSelf: "left", width: "80%" } }}>
      <Text style={{ ...styles.text, ...{} }}>อีเมล</Text>
    </View>
    <TextInput
      style={styles.input}
      blurOnSubmit
      autoCapitalize="none"
      autoCorrect={false}
      keyboardType="email-address"
      onChangeText={(text) => setEmail(text)}
      // จำนวนตัวอักษรมากสุด
      maxLength={20}
      placeholder="อีเมล"
      //...เพิ่ม property value และ onChangeText...
      // value={enteredValue}
      // onChangeText={numberInputHandler}
    />

       {/* =ชื่อ */}
       <View style={{ ...{ alignSelf: "left", width: "80%" } }}>
      <Text style={{ ...styles.text, ...{} }}>ชื่อจริง</Text>
    </View>
    <TextInput
      style={styles.input}
      blurOnSubmit
      autoCapitalize="none"
      autoCorrect={false}
      onChangeText={(text) => setFirstName(text)}
      keyboardType="default"
      // จำนวนตัวอักษรมากสุด
      maxLength={20}
      placeholder="ชื่อจริง"

      //...เพิ่ม property value และ onChangeText...
      // value={enteredValue}
      // onChangeText={numberInputHandler}
    />
       {/* สกุล*/}
       <View style={{ ...{ alignSelf: "left", width: "80%" } }}>
      <Text style={{ ...styles.text, ...{} }}>นามสกุล</Text>
    </View>
    <TextInput
      style={styles.input}
      blurOnSubmit
      autoCapitalize="none"
      autoCorrect={false}
      onChangeText={(text) => setLastName(text)}
      keyboardType="default"
      // จำนวนตัวอักษรมากสุด
      maxLength={20}
      placeholder="นามสกุล"

      //...เพิ่ม property value และ onChangeText...
      // value={enteredValue}
      // onChangeText={numberInputHandler}
    />
    {/* รหัสผ่าน */}
    <View style={{ ...{ alignSelf: "left", width: "80%" } }}>
      <Text style={styles.text}>รหัสผ่าน</Text>
    </View>
    <TextInput
      style={styles.input}
      blurOnSubmit
      autoCapitalize="none"
      autoCorrect={false}
      onChangeText={(text) => setPassword(text)}
      keyboardType="password"

      // จำนวนตัวอักษรมากสุด
      maxLength={20}
      placeholder="รหัสผ่าน"
      //...เพิ่ม property value และ onChangeText...
      // value={enteredValue}
      // onChangeText={numberInputHandler}
    />
     {/* ยืนยันรหัสผ่าน */}
     <View style={{ ...{ alignSelf: "left", width: "80%" } }}>
      <Text style={styles.text}>ยืนยันรหัสผ่าน</Text>
    </View>
    <TextInput
      style={styles.input}
      blurOnSubmit
      autoCapitalize="none"
      autoCorrect={false}
      onChangeText={(text) => setConfirmPassword(text)}
      keyboardType="default"
      // จำนวนตัวอักษรมากสุด
      maxLength={20}
      placeholder="ยืนยันรหัสผ่าน"

      //...เพิ่ม property value และ onChangeText...
      // value={enteredValue}
      // onChangeText={numberInputHandler}
    />

   <TouchableOpacity style={styles.button}
    >
      <Button title="ลงทะเบียน" onPress={handleRegistration} />
    </TouchableOpacity>

    <View style={{ ...styles.postRow,...{ alignSelf: "left", width: "80%",justifyContent:"center" } }}>

      <Text style={{...styles.text,...{fontSize:18,color:"blue",marginLeft:20}}}>มีบัญชีแล้ว</Text>
      <TouchableOpacity  onPress={() => {
      navigation.navigate("Login");
    }}>
      <Text style={{...styles.text,...{fontSize:18,marginLeft:10,textDecorationLine:"underline"}}}>เข้าสู่ระบบที่นี่</Text>

      </TouchableOpacity>
    </View>
  </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    paddingTop: "10%",
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  input: {
    width: "85%",
    paddingHorizontal: 10,
    height: 40,
    borderBottomColor: "grey",
    borderBottomWidth: 1,
    marginVertical: 10,
    alignSelf: "center",
    textAlign: "left",
    marginLeft: 15,
    backgroundColor: "white",
  },
  text: {
    textAlign: "left",
    fontSize: 15,
  },
  button: {
    marginVertical: 10,
    backgroundColor: "#BEBDFF",
    width: "50%",
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  postRow: {
    flexDirection: "row",
  },
});

export default RegisterScreen;
