<script>
    import axios from "axios";
    export let id;
    import { Row, Col, Select, MaterialApp, Button } from 'svelte-materialify';
    let chosenEmployee= null;

    const getProjectById = async () => {
        console.log("getting it");
        try{
            const res = await axios({
            method: "GET",
            url: `${LOCAL_ENV}api/projects/${id}`
            });
            console.log(res.data);
            return res.data;
        }catch(err){
            alert(err);
            window.location.assign('/dashboard');
        }
    }

    const getUnassigned = async () => {
        try{
            const res = await axios({
            method: "GET",
            url: `${LOCAL_ENV}api/projects/unassigned/${id}`
            });

            const unassigned = res.data.map((item) => {
                let obj = {
                    name: `${item.last_name}, ${item.first_name}`,
                    value: item.id
                }
                return obj;
            })
            console.log(unassigned);
            return unassigned;

        }catch(err){
            alert(err);
            window.location.assign('/dashboard');
        }
    }
        
    const getAssigned = async () => {
        try{
            const res = await axios({
            method: "GET",
            url: `${LOCAL_ENV}api/projects/assigned/${id}`
            });

        
            const assigned = res.data.map((item) => {
                let obj = {
                    name: `${item.last_name}, ${item.first_name}`,
                    value: item.id
                }
                return obj;
            })
           // console.log(unassigned);
            return assigned;

        }catch(err){
            alert(err);
            window.location.assign('/dashboard');
        }
    }
    
    let project = getProjectById();
    let promisedItems = getUnassigned();
    let pAssigned = getAssigned();

    const assignEmployee = async () => {
        console.log(chosenEmployee);

        try{
            const res = await axios({
            method: "POST",
            url: `${LOCAL_ENV}api/projects/assign`,
            data: {
                person_id: parseInt(chosenEmployee),
                project_id: parseInt(id),
            }
            });
            console.log(res);
            promisedItems = getUnassigned();
            pAssigned = getAssigned();
            chosenEmployee = null;
        }catch(err){
            alert(err);
        }
    }

    const unassignEmployee = async (person_id) => {

        console.log(person_id);
        try{
            const res = await axios({
            method: "DELETE",
            url: `${LOCAL_ENV}api/projects/unassign`,
            data: {
                person_id,
                project_id: parseInt(id),
            }
            });
            console.log(res);
            promisedItems = getUnassigned();
            pAssigned = getAssigned();

        }catch(err){
            alert(err);
        }
    }

</script>

{#await project then proj}
    <div>
        <h4 style="margin-bottom: 1.6rem">Project: <strong>{proj.name}</strong></h4>
        <div style="width: 640px; margin: 0 auto;">
            <MaterialApp>
                <Row style="margin: 1.6rem auto 3.2rem; text-align: :center; display:flex; justify-content: center;">
                    <Col md={8}>
                        {#await promisedItems then items}
                            <Select chips outlined {items} bind:value = {chosenEmployee}>Select Employee</Select>                        
                        {/await}
                    </Col>
                    <Col md={4}>
                        <Button size="x-large" on:click={assignEmployee}>Add Employee</Button>
                    </Col>
                </Row>
                <Row>
                    {#await pAssigned then assignedEmp}
                        {#each assignedEmp as emp}
                            <div style="width: 100%; display: flex; justify-content: space-between; align-items: center;">
                                <p>{emp.name}</p>
                                <Button size="large" class="red white-text" on:click={unassignEmployee(emp.value)}>Remove</Button>
                            
                            </div>
                            
                        {/each}
                    {/await}
                </Row>
            </MaterialApp>
    
        </div>
        </div>    
{/await}

<style>

</style>
