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
var Auth = firebase.auth();
var Storage = firebase.storage();
var dbRef = firebase.database();
var contactsRef = dbRef.ref('contacts')
var profileImagesRef = Storage.ref().child('profile-images')
var usersRef = dbRef.ref('users')
var user = null;
var userData = null;

var mimes = {
  "image/gif": {
    "source": "iana",
    "compressible": false,
    "extensions": ["gif"]
  },
  "image/jpeg": {
    "source": "iana",
    "compressible": false,
    "extensions": ["jpeg","jpg","jpe"]
  },
  "image/png": {
    "source": "iana",
    "compressible": false,
    "extensions": ["png"]
  },
  "image/svg+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["svg","svgz"]
  },
  "image/webp": {
    "source": "apache",
    "extensions": ["webp"]
  },
};

var saveImage = function(file, filename, ref, callbacks) {
  if(!ref) ref = firebase.storage().ref();
  if(!callbacks) callbacks = {};
  if(mimes[file.type].extensions[0]) {
    callbacks.success = callbacks.success || console.log;
    callbacks.progress = callbacks.progress || console.log;
    callbacks.error = callbacks.error || console.error;

    // Create the file metadata
    var metadata = {
      contentType: file.type
    };

    // Upload file and metadata to the object
    var uploadTask = ref.child(filename + '.' + mimes[file.type].extensions[0]).put(file, metadata);
    uploadTask.on('state_changed', callbacks.progress, callbacks.error, callbacks.success);
    
    return uploadTask.then(function(snapshot) { return snapshot.ref.getDownloadURL(); });
  }
}

var extractFormData = function (form) {
  const formData = new FormData(document.querySelector(form));
  values = {};
  for(var pair of formData.entries()) {
    if( values[pair[0]] ) {
      if(!(values[pair[0]] instanceof Array)) {
        values[pair[0]] = new Array(values[pair[0]]);
      }
      values[pair[0]].push(pair[1]);
    } else {
      values[pair[0]] = pair[1];
    }
  }
  return values;
}

var progress = function(snapshot){
  // Observe state change events such as progress, pause, and resume
  var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
  console.log('Upload is ' + progress + '% done');
  switch (snapshot.state) {
    case firebase.storage.TaskState.PAUSED: // or 'paused'
      console.log('Upload is paused');
      break;
    case firebase.storage.TaskState.RUNNING: // or 'running'
      console.log('Upload is running');
      break;
  }
}

var error = function(error){
  console.error(error);
}
