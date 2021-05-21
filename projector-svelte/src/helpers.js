import axios from "axios";

export const emailRules = [
    (v) => !!v || 'Required',
    (v) => {
    const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return pattern.test(v) || 'Invalid e-mail.';
},
];

export const passwordRules = [
  (v) => !!v || 'Required',
  (v) => {
    const pattern = /^\S*$/;
    return pattern.test(v) || "Password must not contain a space"
  },
  (v) => v.length >= 8 || 'Password is 8 characters or more.'
]

export const numericRules = [
  (v) => {
    const pattern = /^[0-9]*$/;
    return pattern.test(v) || "Text should be numbers"
  }
]


// export const authenticate = async () => {
//   // /console.log("Authenticating");
//   try{
//       const res = await axios({
//         method: "GET",
//         withCredentials: true,
//         url: `${LOCAL_ENV}api/auth/verify`,
//       });
//       //if unauthorized
//     // if(res.status === 401)
  
//     if(res.status === 200){
//        // window.location.assign(`${LOCAL_ENV}dashboard`);  
//       return await res.data;
//     }


//   }catch(err){
//     if(window.location.href !== LOCAL_ENV)
//       window.location.assign("/");
//       return null;
    
//   }
// }

export const getSessionData = async () => {
  try{
      const res = await axios({
        method: "GET",
        withCredentials: true,
        url: `${LOCAL_ENV}api/session`,
      });
      console.log(res);


    if(res.status === 200){
      return await res.data;
    }
  }catch(err){
      window.location.assign("/");
      return null;

}}


export const getMyProjects = async () => {
  try{

    const res = await axios({
      method: "GET",
      withCredentials: true,
      url: `${LOCAL_ENV}api/projects/me`,
    });
    return res.data;
  }catch(err){  
    alert(err);
    
  }
}