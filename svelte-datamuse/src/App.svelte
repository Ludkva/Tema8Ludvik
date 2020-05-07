<script>
	import Datamuse from './components/Datamuse.svelte'
	let words = ''
	const clean = () => {
		event.target.placeholder = ''
	}
</script>


<main>
	<div class='input'>
		<input type="text" placeholder='write a word to rhyme' bind:value={words} on:click={clean}>
	</div>
	<Datamuse {words} />
</main>

<style>
	main{
		display:grid;
		grid-template-rows: 10vh 90vh;
	}
	.input{
		display:grid;
		place-items:center;
	}
	input{
		width:40vw;
		font-size:1.2rem;
		padding:.8rem;
		outline:none;
		border-radius:1rem;
	}

</style>}
