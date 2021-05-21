<script>
    import {  TextField, MaterialApp } from 'svelte-materialify';
    import { emailRules, passwordRules } from '../helpers';

   import axios from "axios";
    let email = "";
    let password = "";

    console.log("COOKIE"+ document.cookie.jwt);
    const login = async () => {
        console.log(LOCAL_ENV);
        try{
            const res = await axios({
                method: "POST",
                withCredentials: true,
                url: `${LOCAL_ENV}api/auth/login`,
                data: {
                    username:email,
                    password
                }
            });

            if(res.status === 200){
                alert("Welcome back!");
                console.log(res);
            }

            console.log(res);

        }catch(err){
            alert(err);
        }
  }

</script>
<div class="form-login">
    <h2>Projector</h2>
        <MaterialApp>
            <TextField placeholder="Email" color="#ff3e00" rules={emailRules} style={"margin-bottom: 2.4rem"} name="email" id="email"bind:value = {email}/>
            <TextField placeholder="Password" color="#ff3e00" rules={passwordRules}  style={"margin-bottom: 2.4rem"} type="password" name="password" id="password" bind:value = {password}/>
            <button class="btn" on:click={login}>LOGIN</button>
        </MaterialApp>
</div>
    
<style>
.form-login {
    background-color: #FFF;
    -webkit-box-shadow: 10px 10px 19px 2px rgba(0, 0, 0, 0.13);
    -moz-box-shadow: 10px 10px 19px 2px rgba(0, 0, 0, 0.13);
    box-shadow: 10px 10px 19px 2px rgba(0, 0, 0, 0.13);
    border-radius: 6px;
    width: 480px;
    margin: 0 auto;
    padding: 3.2rem 3.2rem 3.6rem;
}
    h2 {
        color: #ff3e00;
		text-transform: uppercase;
		font-size:2.4rem;
		font-weight: 400;
        padding: 1.6rem 1.6rem 3.2rem;
	}
    .btn{
        background-color: #ff3e00;
        color: #FFF;
        width: 100%;
        display: block;
    }
</style>
    
