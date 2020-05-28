<script>
	import { info } from './data.js'
	
	let map
	
	const init = () => {
		mapboxgl.accessToken = 'pk.eyJ1IjoibHVkdmlra3ZhbHN2aWsiLCJhIjoiY2s5NGFnOG45MDVjMzNvbnhoanBzb3BoNCJ9.UyR6o9v82LFpr3naB6_YLg';
		
		map = new mapboxgl.Map({
			container: 'map',
			style: 'mapbox://styles/mapbox/satellite-v9',
			zoom: 2.5,
			center: [6.856797, 66.597289]
		});
		
		map.addControl(
			new mapboxgl.GeolocateControl({
				positionOptions: {
					enableHighAccuracy: true  
				}, 
				trackUserLocation: true
			})
			);
			var nav = new mapboxgl.NavigationControl()
			map.addControl(nav, 'bottom-right')
	}
	let region 
	
	const flySor = () => {
		region = info[0]
		map.flyTo({
			center: [6.282324, 60.254881],
			zoom: 5.25
		})
	}
	const flyNord = () => {
		region = info[1]
		map.flyTo({
			center: [18.241552, 67.088957],
			zoom: 4.15
		})	
	}

	const soknad = 'https://www.fiskeridir.no/Fritidsfiske/Skjema/Registrer-deg-til-aarets-hummarfiske'
</script>
<!-- Svelte:head for å hente inn mapbox til Svelte.app.-->
<svelte:head>
	<script on:load={init} src='https://api.mapbox.com/mapbox-gl-js/v1.8.0/mapbox-gl.js'></script>
	<script src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-directions/v4.0.2/mapbox-gl-directions.js">
	</script>
	<link href='https://api.mapbox.com/mapbox-gl-js/v1.8.0/mapbox-gl.css' rel='stylesheet' />
	<link rel="stylesheet"
		href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-directions/v4.0.2/mapbox-gl-directions.css"
		type="text/css" />
</svelte:head>


<main>
	{#if region}
		<div class="region">
			<h1>{region.Region}</h1>
			<p><b>Når:</b> {region.Tidsrom}</p>
			<p><b>Minstemål:</b> {region.Minstemål}</p>
			<p><b>Utstyr og nødutgong:</b> {region.Nødutgong}</p>
			<p><b>Søknad til fiskeridirektorat:</b> <a href="{soknad}" target="_parent">{region.Søknad}</a></p>
		</div>
	{:else}
		<div class="region">
		<h1>Velg din region</h1>
		</div>
	{/if}
	<div class="venstre">
		<div id='map' />
		<div class="knapper">
		<button on:click={flySor}>Region Sør</button>
		<button on:click={flyNord}>Region Nord</button>
		</div>
	</div>

	<footer>
	<h3>Developed by Ludvik Kvalsvik - Interaksjonsdesign 2020</h3>
	</footer>
</main>

<style>
	*{
		box-sizing: border-box;
	}
	

	main {
		width: 100vw;
		height: 100vh;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		padding: 2rem;
	}
	#map {
		width: 60vw;
		height: 60vh;
		border-radius:16px;
		margin-right: 2rem;
	}
	.region{
		border-radius: 16px;
		border: solid black;
		height: 60vh;
		text-align: left;
		padding-left: 1rem;
		background: linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(201,201,201,1) 100%);
	}
	footer{
		height: 3rem;
		position: fixed;
		width: 100%;
		background: linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(201,201,201,1) 100%);
		left: 0;
		bottom: 0;
		text-align: center;	
	}
	

	.knapper button{
    border-radius: 8px;
    background-color: white;
    border: 2px solid lightskyblue;
    outline: none;
    font-size: 20px;
    padding: 12px 12px;
    cursor: pointer;
	box-shadow: 0 6px lightgray;
	
	}
	.knapper :hover{
	    background-color: skyblue;
	}
	.knapper :active{
	    background-color: skyblue;
	    box-shadow: 0 5px gray;
	    transform: translateY(2px);
	}
	p{
		font-size: 1.6rem;
	}

	@media (max-width:1440px){
		p{
			font-size: 1.3rem;
		}
	
	}
	@media (max-width: 930px){
		p{
			font-size: 1.2rem;
		}


	}
	@media (max-width:800px){
		#map{
			display: none;
		}
		main{
			display: block;
			width: 95vw;
		}
	
	}

	


</style>