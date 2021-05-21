<script>
  import { link } from "svelte-routing";

import axios from "axios";
export let items;

  const logout = async () => {
    try{
            const res = await axios({
                method: "POST",
                withCredentials: true,
                url: `${LOCAL_ENV}logout`,
            });

            window.location.assign("/")
        }catch(err){
            alert(err);
        }

  }
</script>

    <nav>
        <h1><a href="/app/" use:link>The Projector</a></h1>
        <div>
            <ul>
                {#each items as item}
                    {#if item.clientAction === true}
                        <li><a href="{item.clientRoute}" style="color: white;" use:link>{item.label}</a></li>  
                    {:else}
                        <li><a href="../" style="{item.style} color: white;" on:click={logout}>{item.label}</a></li>  
                    {/if}
                {/each}
            </ul>             
        </div>
    </nav>

<style>
    nav{
        background-color: #ff3e00;
        height: 120px;
        width:100%;
        padding: 0 3.2rem;
        position:absolute;
        left: 0;
        top:0;
        display: flex;
        align-items: center;
        justify-content: space-between;

    }
    ul{
        list-style-type: none;
        display: inline-block;
    }

    ul li{
        display: inline-block;
        margin: 1.6rem;
        text-transform: uppercase;
    }

    ul li a, a{
        color: #Fff;
        opacity: 0.8;
        transition: all .4s;
    }

    ul li a:hover, a{
        opacity: 1;
    }


    h1 {
        color: #FFF;
		text-transform: uppercase;
		font-size: 3rem;
		font-weight: 100;
	}


</style>