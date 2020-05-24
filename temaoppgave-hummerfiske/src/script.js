

mapboxgl.accessToken = 'pk.eyJ1IjoibHVkdmlra3ZhbHN2aWsiLCJhIjoiY2s5NGFnOG45MDVjMzNvbnhoanBzb3BoNCJ9.UyR6o9v82LFpr3naB6_YLg';
var map = new mapboxgl.Map({
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
    
const RegSor = document.querySelector("#sor")
const RegNord = document.querySelector("#nord")

const flySor = () => {
    map.flyTo({
        center: [6.282324, 60.254881],
        zoom: 4.65
    })
}

const flyNord = () => {
    map.flyTo({
        center: [13.071520 , 68.925976],
        zoom: 3.65
    })
    
}
sor.onclick = flySor
nord.onclick = flyNord

fetch('./Regler-json.json')
    .then( res => res.json)
    .then((res) => {
        const data = res.data;
        getElement("region").innerHTML = 'Region ' + data.Region
        getElement("tidsrom").innerHTML = 'Region ' + data.Tidsrom
        getElement("minstemal").innerHTML = 'Region ' + data.Minstemål
        getElement("nodutgang").innerHTML = 'Region ' + data.Nødutgang
        getElement("soknad").innerHTML = 'Region ' + data.Søknad
    })