<script>
    import { MaterialApp, TextField, Row, Col } from "svelte-materialify";
    import { emailRules, passwordRules } from '../helpers';
    import axios from "axios";
    export let user;
    let firstname="";
    let lastname="";
    let email="";
    let password ="";
    const addPerson = async () => {
        console.log("Add Person");
        
        try{

            if(!lastname || !firstname || !email || !password)
                throw "Please input all data required";

            if(/^S*$/.test(password))
                throw "Password must not contain a space";

            const res = await axios({
                method: "POST",
                url: `${LOCAL_ENV}api/people`,
                data: {
                    last_name: lastname,
                    first_name: firstname,
                    username: email,
                    password
                }
            });
            if(res.status === 201){
                alert("User Successfully Added! Redirecting to Dashboard");
                window.location.href= "/app";
            }
        }catch(err){
      //      console.log(err);
            alert(err);
        }
    }

    const deletePeople = async () => {
        console.log("Delete People");

        try{
            const res = await axios({
                method: "DELETE",
                url: `${LOCAL_ENV}api/people`,
            });

            if(res.status === 204){
                alert("All People Successfully Delete");

            }
        }catch(err){
            alert("Unsuccessful");
        }


    }


</script>

<div style="margin: 0 3.2rem">
    <h3 style="text-align:left;">Welcome, {user}!</h3>
    <div style="margin-top:3.6rem" class="form-container">
        <h3 style="padding-bottom: 3.2rem">Add People</h3>
        <MaterialApp>
            <Row>
                <Col>
                    <TextField placeholder="First Name" color="#ff3e00" style={"margin-bottom: 2.4rem"} name="firstname" id="firstname" bind:value={firstname} />
                </Col>
                <Col>
                    <TextField placeholder="Last Name" color="#ff3e00" style={"margin-bottom: 2.4rem"} name="lastname" id="lastname" bind:value={lastname}/>    
                </Col>
            </Row>
            <Row>
                <Col>            
                    <TextField placeholder="Email" color="#ff3e00" rules={emailRules} style={"margin-bottom: 2.4rem"} type="email" name="email" id="email" bind:value={email}/>
                </Col>                
                <Col>            
                    <TextField placeholder="Password" color="#ff3e00" rules={passwordRules} style={"margin-bottom: 2.4rem"} type="password" name="password" id="password" bind:value={password}/>
                </Col>                
            </Row>
            <button class="btn" on:click={addPerson}>ADD PERSON</button>
            <button class="btn btn--dangerous" on:click={deletePeople}>RESET PEOPLE</button>
        </MaterialApp>

    </div>
</div>

<style>

.btn{
        background-color: #ff3e00;
        color: #FFF;
        width: 100%;
        display: block;
    }

.btn--dangerous{
    background-color: #ff0000;
}
</style>



