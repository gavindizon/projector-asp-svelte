<script>
	import Navbar from './shared/Navbar.svelte';
	import axios from "axios";
	
	import {Route, Router} from "svelte-routing";
	//import {Route, router, active } from "tinro";
	import Login from "./pages/Login.svelte"; // home
	import Dashboard from "./pages/Dashboard.svelte"; // home
	import PeopleForm from './pages/PeopleForm.svelte';
	import ProjectForm from './pages/ProjectForm.svelte';
	import Assignment from './pages/Assignment.svelte';
import { getSessionData } from './helpers';
	

	const promise = getSessionData();

//	console.log(data);
//	const promise = authenticate();
	
</script>
{#await promise then data}
	<Navbar items={data.accessibleNavItems}/>
	<main>
		<Router>
			<Route path="/app"><Dashboard user={data.username}/></Route>
			<Route path="/app/people"><PeopleForm user={data.username}/></Route>
			<Route path="/app/projects"> <ProjectForm user={data.username}/></Route>
			<Route path="/app/projects/:id" let:params><Assignment id="{params.id}" user={data.username}/></Route> 	
		</Router>
	</main>

{/await}

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 10rem auto;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>