<script>
	export let name;
	let info='Nothing happening yet'


const showNotification = (title) => {
    let myNotification = new Notification('Hello', {
      body: title + 'You are now officially part of the system OS'
    })
    myNotification.onclick = () => {
        info = 'Notification clicked'
    }
}

const amIOnline = () => {
    window.alert(navigator.onLine ? 'You are online' : 'You are offline')
    info = 'Alert accepted'
}

const { remote } = require('electron')
const { Menu, MenuItem } = remote


const menu = new Menu()
menu.append(new MenuItem({ label: 'meny 1', click() { info = 'item 1 klikket' } }))
menu.append(new MenuItem({ type: 'separator' }))
menu.append(new MenuItem({ label: 'meny 2', click() { info = 'item 2 klikket' } } ))


const context = e => {
  e.preventDefault() //hindrer det vanlige højreklikk
  menu.popup({ window: remote.getCurrentWindow() }) //kalder menufunksjon i Electron
}

</script>

<main>
	<div class="stuff" on:contextmenu={context}>
	<h1>Svelte in Electron</h1>
	</div>
    <p>{info}</p>
	<button on:click={ () => showNotification('Dear Mr or Mrs, ') }>Trykk her</button>
	<button on:click={ () => amIOnline()}>Status sjekk</button>

</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}
	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}
	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>