<script>
import {link } from "svelte-routing";
import { getMyProjects } from "../helpers";
   
const myProject = getMyProjects();
export let user;

</script>
    <div style="margin: 0 3.2rem">
        <h3 style="text-align:left; ">Welcome, {user}!</h3>
        <br/>
        {#await myProject then projects}
            {#if projects.length === 0}
                <p>No Projects Assigned for you</p>
            {:else}
                <table cellpadding="0" cellspacing="0">
                    <tr>
                        <th>Project Name</th>
                        <th>Budget</th>
                        <th>Tasks</th>
                    </tr>
                    {#each projects as project}
                        <tr>
                            <td>{project.name}</td>
                            <td>{project.budget}</td>
                            <td><a href="/app/projects/{project.id}" style="color: blue;" use:link>Tasks</a></td>
                        </tr>        
                    {/each}       
                </table>
            {/if}
        {/await}
    </div>    

<style>
    table {border: none;}

    th, tr:first-of-type{
        background-color: #ff3e00;
        padding: 0.8rem 1.6rem;
        color: #FFF;
        text-transform: uppercase;
        font-size: 1.4rem;
}
td{
    padding: 0.8rem 1.6rem;
}
tr:nth-child(even){
    background-color: beige;
}
tr:nth-child(odd){
    background-color: azure;
}
</style>