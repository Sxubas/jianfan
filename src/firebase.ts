import * as firebase from 'firebase/app';
import 'firebase/analytics';
import 'firebase/auth';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAkwiyXm7FPZvUm9zftzZEyyWQinutfen8',
  authDomain: 'jianfan-888.firebaseapp.com',
  databaseURL: 'https://jianfan-888.firebaseio.com',
  projectId: 'jianfan-888',
  storageBucket: 'jianfan-888.appspot.com',
  messagingSenderId: '622738500080',
  appId: '1:622738500080:web:b92492f0f9537e69e31535',
  measurementId: 'G-1XCMERWE4T',
};

export default firebase.initializeApp(firebaseConfig);
