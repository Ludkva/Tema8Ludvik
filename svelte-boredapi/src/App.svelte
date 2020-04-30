<script>
	import Activity from './components/Activity.svelte'
	let activity = {}

	let show = false
	const getActivity  = () =>{
		show = false
		fetch('https://www.boredapi.com/api/activity?type=recreational')
			.then( res => res.json())
				.then( JSON =>{
					activity = JSON
					show = true
				} )
}
</script>

<main>

	<button on:click={getActivity}>SPANK ME!</button>
	{#if show}
		 <Activity {activity} />
	{:else}
		 <h1>Roll the activity-dice!</h1>
		 <h2>SPANK ME DADDY!</h2>
	{/if}
	

</main>

<style>
	main{
		display: grid;
		place-items: center;
		height: 100vh;
		position: relative;
	}
	button{
		top: 2rem;
		position: absolute;
		background: lightsteelblue;
		border-radius: 50%;
		cursor: pointer;

	}



</style>