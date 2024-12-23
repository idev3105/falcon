<script lang="ts">
	import mapboxgl from 'mapbox-gl';
	import 'mapbox-gl/dist/mapbox-gl.css';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const { token } = data;

	let map: mapboxgl.Map;
	mapboxgl.accessToken =
		'pk.eyJ1IjoiaWRldjMxMDUiLCJhIjoiY2t6YXNsM3cwMHgwdzJvcDQzbjN3czlpdSJ9.ARcnNt_TmtEfLqw-pbWZCg';

	onMount(() => {
		initMap();
	});

	function getCurrentLocation() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const { latitude, longitude } = position.coords;
					map.flyTo({ center: [longitude, latitude] });
				},
				(error) => {
					console.error('Error getting location:', error);
				}
			);
		}
	}

	function initMap() {
		map = new mapboxgl.Map({
			container: 'map',
			style: 'mapbox://styles/mapbox/streets-v11',
			center: [-74.0066, 40.7135],
			zoom: 15.5,
			pitch: 45,
			bearing: -17.6,
			antialias: true
		});

		map.on('style.load', () => {
			const layers = map.getStyle()?.layers;

			// find label layer to add symbol after
			const labelLayerId = layers?.find(
				(layer) => layer.type === 'symbol' && layer.layout && layer.layout['text-field']
			)?.id;

			// Add a 3D building layer to the map
			map.addLayer(
				{
					id: 'add-3d-buildings',
					source: 'composite',
					'source-layer': 'building',
					filter: ['==', 'extrude', 'true'],
					type: 'fill-extrusion',
					minzoom: 15,
					paint: {
						'fill-extrusion-color': '#aaa',

						// Use an 'interpolate' expression to
						// add a smooth transition effect to
						// the buildings as the user zooms in.
						'fill-extrusion-height': [
							'interpolate',
							['linear'],
							['zoom'],
							15,
							0,
							15.05,
							['get', 'height']
						],
						'fill-extrusion-base': [
							'interpolate',
							['linear'],
							['zoom'],
							15,
							0,
							15.05,
							['get', 'min_height']
						],
						'fill-extrusion-opacity': 0.6
					}
				},
				labelLayerId
			);
		});
	}

	function copyToken() {
		if (!token) return;
		navigator.clipboard.writeText(token);
		alert('Token copied to clipboard!');
	}
</script>

<main>
	<div id="map"></div>
	<button class="btn absolute bottom-4 right-4 z-10" onclick={getCurrentLocation}>Share</button>
	<div class="absolute bottom-4 left-4 z-10 rounded bg-base-100 px-4 py-2">
		{token}
		<button class="btn rounded px-2 py-1" onclick={copyToken}>Copy</button>
	</div>
</main>

<style>
	#map {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 100%;
	}
</style>
