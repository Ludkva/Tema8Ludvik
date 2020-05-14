<script>
	import { fade, fly, scale } from 'svelte/transition'

	const api_key = 'IiShUXx82NJ99Jm6Go5fVvaWRQ6yNnGR'
	const limit = 1
	let giphy 
	let inp 

const hentbilde = () => {
	giphy = null
	fetch(`http://api.giphy.com/v1/gifs/search?q=${inp}&api_key=${api_key}&limit=${limit}`)
		.then( res => res.json())
			.then( json => {
				console.log(json)
				giphy = json.data[0].images.downsized_medium.url
			})
}	
			
// husk like bokstaver på JSON og json.

 
	
</script>

<main>

	<input type="text" bind:value={inp} on:keydown={ event => event.key == 'Enter' ? hentbilde() : ''} on:click={ e => e.target.value = ''} on:focus={ e => e.target.value = ''}>
	<!-- Husk at du må legge funksjonen på on:keydown på INPUT ikkje, knapp. e = forkortelse av event -->
	<!--Tar bort knapp fordi den har en unødvendig vansklig funksjon-->
	<!--<button on:click={hentbilde}>Hent ny gif!</button>-->
	<div>
	{#if giphy}
		<img in:scale src="{giphy}" alt="{inp}">
	{:else}
		 <h2>Henter bilde</h2>
	{/if}
	</div>

</main>

<style>
main{
	display: grid;
	place-items: center;
	padding-top: 6rem;
	background: linear-gradient(0deg, rgba(53,252,255,1) 0%, rgba(244,245,71,1) 100%);
}
div{
	display: grid;
	place-items: center;
	height: 100vh;
	padding-bottom: 5rem;
}

</style>