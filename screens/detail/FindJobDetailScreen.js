import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  ImageBackground,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import {
  useNavigation,
  useIsFocused,
  useFocusEffect,
} from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import firebase from "../../database/firebaseDB";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as ImagePicker from "expo-image-picker";
import { Rating, AirbnbRating } from "react-native-ratings";
import { scoreRating } from "../../store/actions/jobAction";

const FindJobDetailScreen = ({ route, navigation }) => {
  const [ratingPost, setRatingPost] = useState(null);
  const[maxRating,setMax] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [commentBox, setCommentBox] = useState("");
  const [yourRating, setYourRating] = useState(null);
  const jobid = route.params.id;
  const availableJob = useSelector((state) => state.jobs.filteredJobs);
  const displayedJob = availableJob.find((job) => job.id == jobid);
  const currentUserId = firebase.auth().currentUser.uid;

  const availableUser = useSelector((state) => state.users.users);
  const availableComment = useSelector((state) => state.jobs.comments);
  const thisPostComment = availableComment.filter(
    (comment) => comment.postId == jobid
  );
  const thisFliteredPostComment = thisPostComment.map((comment) => {
    const user = availableUser.find((user) => user.id === comment.userId);

    return {
      ...comment,
      userId: user.id,
      userImage: user.imageUrl,
      userfistName: user.firstName,
      userlastName: user.lastName,
    };
  });

  const currentUserImg = availableUser.find((user) => user.id == currentUserId);
  const toggleFavorite = () => {
    setIsFavorite((prevIsFavorite) => !prevIsFavorite);
  };

  const sentComment = () => {
    if (commentBox.trim() !== "") {
      // ล้าง TextInput
      firebase
        .firestore()
        .collection("JobComments")
        .add({
          postId: jobid,
          userId: currentUserId,
          comment: commentBox,
        })
        .then(() => {
          console.log("Job added to comment on Firebase");
        })
        .catch((error) => {
          console.error("Error adding job to favorites: ", error);
        });
      setCommentBox("");
    }
  };

  const [uploading, setUploading] = useState(false);
  const [image, setImage] = useState(null);
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please allow access to your media library to pick an image."
      );
    } else {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        editImg(result.assets[0].uri);
      }
    }
  };

  const editImg = async () => {
    if (image) {
      let filename = image.substring(image.lastIndexOf("/") + 1);

      try {
        const response = await fetch(image);
        const blob = await response.blob();
        const uploadTask = firebase
          .storage()
          .ref()
          .child(`images/${filename}`)
          .put(blob);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload is ${progress}% done`);
          },
          (error) => {
            console.error("Upload Error: ", error);
          },
          () => {
            uploadTask.snapshot.ref
              .getDownloadURL()
              .then(async (downloadURL) => {
                const img = {
                  imageUrl: downloadURL,
                };
                const postRef = firebase
                  .firestore()
                  .collection("JobPosts")
                  .doc(jobid);
                await postRef
                  .update(img)
                  .then(() => {
                    console.log("อัพเดทข้อมูลสำเร็จ");
                    // getUserData();
                  })
                  .catch((error) => {
                    console.error("เกิดข้อผิดพลาดในการอัพเดทข้อมูล:", error);
                  });
              });
          }
        );
      } catch (e) {
        console.log(e);
      }
    } else {
      console.log("No image to upload");
    }
  };

  const dispatch = useDispatch();

  const availableRating = useSelector((state) => state.jobs.ratingJobs);
  console.log(jobid);
  const thisAllPostRating = availableRating.filter(
    (rating) => rating.postId === jobid
  );
  console.log(thisAllPostRating);
  useEffect(() => {
    const thisPostRating = availableRating.filter((rating) => rating.postId === jobid);

    if (thisPostRating.length > 0) {
        const totalRating = thisPostRating.reduce((acc, rating) => acc + rating.rating, 0);
        const averageRating = totalRating / thisPostRating.length;
        setRatingPost(averageRating.toFixed(2));
        setMax("/5 คะแนน");

        // Find the user's specific rating
        const userRating = thisPostRating.find((rating) => rating.userId === currentUserId);
        setYourRating(userRating ? userRating.rating : null);
    } else {
        setRatingPost(0);
        setMax(" รีวิว");
        setYourRating(null);
    }
}, [availableRating, jobid, currentUserId]);
  const ratingCompleted = (rating) => {
    // jobId ควรมาจากที่ไหนก็ได้ตามที่คุณเก็บ jobId ไว้ // ต้องแก้ตามที่คุณใช้
    dispatch(scoreRating(jobid, rating));
    console.log("Rating is: " + rating);
  };
  console.log(yourRating)
  return (
    <View style={styles.screen}>
      <ScrollView style={{ ...styles.item, ...{ backgroundColor: "white" } }}>
        <View style={{ ...styles.postRow, ...styles.postHeader }}>
          <ImageBackground
            source={{ uri: displayedJob.imageUrl }}
            style={styles.bgImage}
          ></ImageBackground>
        </View>
        {currentUserId === displayedJob.postById && (
          <TouchableOpacity
            style={{
              ...styles.button,
              ...{ width: "80%", marginleft: "5", marginVertical: 10 },
            }}
            onPress={pickImage}
          >
            <Text style={{ ...{ color: "white" } }}>แก้ไขรูปภาพ</Text>
          </TouchableOpacity>
        )}

        {/* ชื่อหน่วยงาน */}
        <Text style={styles.jobTitle}>{displayedJob.jobTitle}</Text>
        {/* คะแนนโพส */}
        <View style={{ ...styles.postRow, ...{ marginTop: 10 ,    marginLeft: 15,} }}>
        <Text style={{alignSelf:"center",fontSize:20,marginEnd:10}}>{ratingPost}{maxRating}</Text>
        <Rating
          readonly="true"
          style={{ paddingVertical: 10 }}
          startingValue={ratingPost}
          imageSize={20}
        />
         </View>
         <Text style={{fontSize:20,marginEnd:10,marginLeft:15}}>จาก {thisAllPostRating.length} ผู้ใช้</Text>
        {/* ชื่อหน่วยงาน */}
        <Text style={styles.title}>{displayedJob.agency}</Text>
        {/* ตำแหน่ง */}

        <Text style={styles.subTitle}>
          ตำแหน่ง : <Text style={styles.subText}>{displayedJob.position}</Text>
        </Text>

        {/* ค่าจ้าง */}

        <Text style={styles.subTitle}>
          รายละเอียดงาน :{" "}
          <Text style={styles.subText}>{displayedJob.detail}</Text>
        </Text>

        {/* ต้องทำเป็นflatlist แสดงคุณสมบัติ */}
        {/* คุณสมบัติ */}

        <Text style={styles.subTitle}>คุณสมบัติ :</Text>

        {/* เงื่อนไข */}
        {displayedJob.attributes.map((attribute, index) => (
          <Text style={styles.subText} key={index}>
            - {attribute}
          </Text>
        ))}

        {/* ค่าจ้าง */}

        <Text style={styles.subTitle}>
          ค่าจ้าง :{" "}
          <Text style={styles.subText}>
            {displayedJob.wage} บาท/{displayedJob.employmentType}
          </Text>
        </Text>

        {/* สวัสดิการ */}
        <Text style={styles.subTitle}>สวัสดิการ :</Text>
        {displayedJob.welfareBenefits.map((welfareBenefit, index) => (
          <Text style={styles.subText} key={index}>
            - {welfareBenefit}
          </Text>
        ))}
        {/* ช่องทางติดต่อ */}
        <Text style={styles.subTitle}>ช่องทางติดต่อ</Text>
        <Text style={styles.subText}>
          <MaterialCommunityIcons name="email" size={20} color="black" /> Email
          : {displayedJob.email}
        </Text>
        <Text style={styles.subText}>
          <MaterialCommunityIcons name="phone" size={20} color="black" />{" "}
          เบอร์โทร : {displayedJob.phone}
        </Text>

        {currentUserId !== displayedJob.postById && (
          <View style={{backgroundColor: "white", marginTop: 10, width: "95%", alignSelf: "center",
          borderWidth: 1, borderColor: "#B0C4DE",borderRadius: 10,
          shadowColor: "black",
          shadowOpacity: 0.26,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 10,
          elevation: 5,
          marginTop:20}}>
              <Text style={{alignSelf:"center",fontSize:20, marginTop:10}}>ให้คะแนนโพสต์นี้</Text>
          <Rating
            ratingTextColor="black"
            showRating
            onFinishRating={ratingCompleted}
            style={{ paddingVertical: 10 }}
            imageSize={30}
            startingValue={yourRating}
          />
          </View>
        )}
        {/* กล่องคอมเม้น */}
        <Text style={{ ...styles.subText, ...{ marginTop: 30 } }}>
          ความคิดเห็น {thisFliteredPostComment.length} รายการ
        </Text>
        {/* ช่องพิมพ์คอมเม้น + รูปโปรไฟล์ */}
        <View style={{ ...styles.postRow, ...{ marginVertical: 10 } }}>
          <Image
            source={{
              uri:
                currentUserImg.imageUrl ||
                "https://firebasestorage.googleapis.com/v0/b/log-in-d8f2c.appspot.com/o/profiles%2FprofilePlaceHolder.jpg?alt=media&token=35a4911f-5c6e-4604-8031-f38cc31343a1&_gl=1*51075c*_ga*ODI1Nzg1MDQ3LjE2NjI5N6JhaZ1Yx5r1r15r1h&_ga_CW55HF8NVT*MTY5ODA2NzU0NC4yNy4xLjE2OTgwNjgyMjEuMTcuMC4w",
            }}
            style={{ ...styles.profileImg, ...{} }}
          ></Image>
          <TextInput
            style={styles.input}
            blurOnSubmit
            autoCapitalize="none"
            autoCorrect={false}
            value={commentBox}
            onChangeText={(text) => setCommentBox(text)}
            maxLength={30}
            numberOfLines={3}
            placeholder="แสดงความคิดเห็น"
          />
          {/* ปุ่มส่งคอมเม้น */}
          <TouchableOpacity
            style={{ marginTop: 20, marginLeft: 10 }}
            onPress={sentComment}
          >
            <MaterialCommunityIcons name="send" size={20} color="black" />
          </TouchableOpacity>
        </View>
        {/* ต้องทำเป็นflatlist แสดงคอมเม้น */}

        {/* คอมเม้นทางบ้าน */}
        {thisFliteredPostComment.map((comment, index) => (
          <View
            style={{ ...styles.postRow, ...{ marginVertical: 10 } }}
            key={index}
          >
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("OtherProfile", {
                  id: comment.userId,
                });
              }}
            >
              <Image
                source={{
                  uri:
                    comment.userImage ||
                    "https://firebasestorage.googleapis.com/v0/b/log-in-d8f2c.appspot.com/o/profiles%2FprofilePlaceHolder.jpg?alt=media&token=35a4911f-5c6e-4604-8031-f38cc31343a1&_gl=1*51075c*_ga*ODI1Nzg1MDQ3LjE2NjI5N6JhaZ1Yx5r1r15r1h&_ga_CW55HF8NVT*MTY5ODA2NzU0NC4yNy4xLjE2OTgwNjgyMjEuMTcuMC4w",
                }}
                style={{ ...styles.profileImg, ...{} }}
              ></Image>
            </TouchableOpacity>
            <View>
              <Text style={{ ...styles.subTitle, ...{ marginTop: 10 } }}>
                {comment.userfistName} {comment.userlastName}
              </Text>
              <Text style={{ ...styles.subText, ...{} }}>
                {comment.comment}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {currentUserId === displayedJob.postById && (
        <TouchableOpacity
          style={styles.editbutton}
          onPress={() => {
            navigation.navigate("EditFind", {
              id: displayedJob.id,
            });
          }}
        >
          <MaterialCommunityIcons
            name="comment-edit-outline"
            size={25}
            color="white"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "flex-start",
    backgroundColor: "#BEBDFF",
  },
  jobTitle: {
    marginTop: 20,
    marginLeft: 15,
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "left",
    color: "black",
  },
  item: {
    backgroundColor: "#f9c2ff",
    width: "95%",
    height: "100%",
    marginVertical: "2%",
    borderRadius: 10,
    alignSelf: "center",
    paddingBottom: "20%",

    // padding: 20
  },
  title: {
    marginTop: 20,
    marginLeft: 15,
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "left",
    color: "#4B32E5",
  },
  subTitle: {
    marginTop: 10,
    fontSize: 18,
    marginLeft: 10,
    fontWeight: "bold",
    // backgroundColor:"red"
  },
  subText: {
    fontSize: 18,
    marginHorizontal: 20,
    // backgroundColor:"blue"
    fontWeight: "normal",
  },
  detailText: {
    fontSize: 11,
    color: "#929090",
    marginHorizontal: 10,
  },
  bgImage: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
    resizeMode: "stretch",
    borderTopEndRadius: 20,
    borderTopStartRadius: 20,
  },
  postRow: {
    flexDirection: "row",
    // backgroundColor:"red",
  },
  postHeader: {
    borderTopEndRadius: 20,
    borderTopStartRadius: 20,
    height: 200,
  },
  input: {
    width: 250,
    textAlign: "center",
    height: 30,
    borderBottomColor: "grey",
    borderBottomWidth: 1,
    marginVertical: 10,
    alignSelf: "center",
    textAlign: "left",
    marginLeft: 15,
  },
  profileImg: {
    marginTop: 10,
    marginLeft: 10,
    width: 45,
    height: 45,
    borderRadius: 360,
  },
  button: {
    backgroundColor: "#5A6BF5",
    width: "50%",
    height: 40,
    borderRadius: 10,
    padding: "2.5%",
    alignItems: "center",
    alignSelf: "center",
  },
  editbutton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "#5A6BF5",
    width: 55,
    height: 55,
    borderRadius: 30,
    padding: "2.5%",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
});

export default FindJobDetailScreen;
