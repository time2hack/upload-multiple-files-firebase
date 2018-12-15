function onChildAdd (snap) {
  console.log(snap)
  document.querySelector('#content').innerHTML += mediaHtmlFromObject(snap.key, snap.val());
}

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

function updateUserStatus(userInfo) {
  userInfo = userInfo || Auth.currentUser;
  const userInfoContainer = document.querySelector('#user-info-container');
  if (userInfo) {
    user = userInfo;
    body.classList.remove('auth-false');
    body.classList.add('auth-true');
    console.log(userInfo)
    if (userInfo.photoURL) {
      const img = document.createElement('img');
      img.setAttribute('src', userInfo.photoURL);
      img.setAttribute('style', 'max-height: 100%; max-width: 2rem;');
      img.setAttribute('class', 'rounded-circle border border-primary align-middle');
      userInfoContainer.appendChild(img);
    }
    if (userInfo.displayName) {
      const span = document.createElement('span');
      span.textContent = userInfo.displayName;
      span.classList.add('align-middle');
      userInfoContainer.appendChild(span);
    }
    userImagesRef.child(user.uid).orderByChild('timestamp').on('child_added', onChildAdd);
  } else {
    // No user is signed in.
    user && userImagesRef.child(user.uid).off('child_added', onChildAdd);
    body.classList.add('auth-false');
    body.classList.remove('auth-true');
    user = null;
  }
}

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

function mediaHtmlFromObject(key, status){
  return document.querySelector('#'+key) ? ''
  : '<article class="card m-1" style="" id="'+key+'">'
    + '<div class="card-body">'
      + '<h4 class="card-title">'+status.status+'</h4>'
      + (status.pictures || []).map(imageMarkup).join('')
    + '</div>'
  + '</article>';
}
const generatePreviewData = (file) => {
  const fr = new FileReader();
  return new Promise((resolve, reject) => {
    fr.addEventListener('load', (e) => {
      const div = document.createElement('div');
      const img = document.createElement('img');
      img.src = fr.result;
      img.setAttribute('class', 'border rounded img-preview');
      div.appendChild(img)
      resolve(div);
    });
    fr.addEventListener('error', (e) => {
      reject();
    });
    fr.readAsDataURL(file);
  });
}

const imageMarkup = (src) => {
  return `<img src="${src}" alt="" class="m-1 p-1 ml-0 rounded border border-primary feed-content-media" style="max-height:8rem;"/>`;
}
const removeAllChildren = (el) => {
  while(el.childElementCount) {
    el.removeChild(el.children[0]);
  }
}
