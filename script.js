//initialize the firebase app
var config = {
  apiKey: "AIzaSyCKNcULQZxFMYioXei32XNWQVoeutz4XDA",
  authDomain: "contact-book-new.firebaseapp.com",
  databaseURL: "https://contact-book-new.firebaseio.com",
  projectId: "contact-book-new",
  storageBucket: "contact-book-new.appspot.com",
  messagingSenderId: "473268388365"
};

firebase.initializeApp(config);
//create firebase references
const Storage = firebase.storage();
const allImagesRef = Storage.ref().child('all-images')
const dbRef = firebase.database();
const userImagesRef = dbRef.ref('user-images');
const Auth = firebase.auth();
let user = null;
let userData = null;
const body = document.body;

Auth.onAuthStateChanged(updateUserStatus);

document.addEventListener("DOMContentLoaded", function(event) {
  const logoutButton = document.querySelector('#logout');
  const fbLoginButton = document.querySelector('#fbLogin');
  const twLoginButton = document.querySelector('#twLogin');
  const createPostButton = document.querySelector('#create-post');

  document.querySelector('#pictures').addEventListener('change', (e) => {
    const formData = extractFormData('#statusForm');
    Promise
    .all([].slice.call(formData.pictures).map(generatePreviewData))
    .then(imgs => {
      console.log(imgs)
      imgs.map(img => document.querySelector('#form-image-preview').appendChild(img))
    })
  });
  document.forms.statusForm.addEventListener('submit', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const formData = extractFormData('#statusForm');
    Promise.all([].slice.call(formData.pictures).map((file) => {
      return saveImage(file, +(new Date) + '_' + Math.random(), allImagesRef, progress);
    })).then((values) => {
      console.log(values)
      userImagesRef.child(user.uid).push({
        status: formData.status,
        pictures: values,
      });
      document.forms.statusForm.reset();
    })
  })
  
  logoutButton.addEventListener('click', (e) => {
    e.preventDefault();
    Auth.signOut();
  });
  fbLoginButton.addEventListener('click', (e) => {
    const provider = new firebase.auth.FacebookAuthProvider();
    provider.addScope('public_profile');
    request = Auth.signInWithPopup(provider)
    e.preventDefault();
    Auth.signOut();
  });
  twLoginButton.addEventListener('click', (e) => {
    const provider = new firebase.auth.TwitterAuthProvider();
    request = Auth.signInWithPopup(provider)
    e.preventDefault();
    Auth.signOut();
  });
});
