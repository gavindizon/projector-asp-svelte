<script>
        import { MaterialApp, TextField, Textarea } from "svelte-materialify";
    import { numericRules } from '../helpers';
    import axios from "axios";
    export let user;

    let code ="";
    let name ="";
    let budget = null;
    let remarks ="";

    const addProject = async () => {
        console.log("Add Project");
        budget = parseFloat(budget);
        try{

            if(!code || !name || !budget || !remarks)
                throw "Please input all data required";

            const res = await axios({
                method: "POST",
                withCredentials: true,
                url: `${LOCAL_ENV}api/projects`,
                data: {
                    code, name, remarks, budget
                }
            });
            if(res.status === 201){
                alert("Project Added! Redirecting to Dashboard");
                window.location.href= "/app";
            }
        }catch(err){
            alert(err);
        }
    }

    const deleteProjects = async () => {
        console.log("Delete Projects");

        try{
            const res = await axios({
                method: "DELETE",
                url: `${LOCAL_ENV}api/projects`,
            });

            if(res.status === 204){
                alert("All Projects Successfully Delete");

            }
        }catch(err){
            alert("Unsuccessful");
        }


    }
</script>
    <div style="margin: 0 3.2rem">
        <h3 style="text-align:left; ">Welcome, {user}!</h3>
        <div style="padding-top:3.6rem" class="form-project">
            <h4 style="padding-bottom: 2.4rem">Add Project</h4>
            <MaterialApp>
                        <TextField placeholder="Code" color="#ff3e00" style={"margin-bottom: 2.1rem"} name="code" id="code" bind:value = {code} />
                        <TextField placeholder="Name" color="#ff3e00" style={"margin-bottom: 2.1rem"} name="name" id="name" bind:value = {name}/>    
                        <TextField placeholder="Budget" color="#ff3e00" rules={numericRules} style={"margin-bottom: 2.1rem"} name="budget" id="budget" type="number" bind:value = {budget}/>
                        <Textarea outlined clearable autogrow rows={3} placeholder="Remarks" color="#ff3e00"  style={"margin-bottom: 2.1rem"} name="remarks" id="remarks" bind:value = {remarks}/>
                <button class="btn" on:click={addProject}>ADD PROJECT</button>
                <button class="btn btn--dangerous" on:click={deleteProjects}>RESET PROJECTS</button>
            </MaterialApp>
        </div>
    </div>    

<style>
     .form-project {
    background-color: #FFF;
    -webkit-box-shadow: 10px 10px 19px 2px rgba(0, 0, 0, 0.13);
    -moz-box-shadow: 10px 10px 19px 2px rgba(0, 0, 0, 0.13);
    box-shadow: 10px 10px 19px 2px rgba(0, 0, 0, 0.13);
    border-radius: 6px;
    width: 480px;
    margin: 0 auto;
    padding: 3.2rem 3.2rem 3.6rem;
} 
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
