<script lang="ts">
	import mapboxgl from 'mapbox-gl';
	import 'mapbox-gl/dist/mapbox-gl.css';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { io } from 'socket.io-client';

	let { data }: { data: PageData } = $props();
	const { token } = data;

	let socket = io('http://localhost:8080');

	let watchLocationHandlerId = $state<number | undefined>();

	let map: mapboxgl.Map | undefined;
	mapboxgl.accessToken =
		'pk.eyJ1IjoiaWRldjMxMDUiLCJhIjoiY201MXZzeHRhMXF3NzJxc2ZhY2tocmh2eSJ9.QB4Ijy-nhwCYkRebf7TxJg';

	let currentLocation = $state<{ lng: number; lat: number } | undefined>();
	$inspect(currentLocation);
	let currentLocationMarker: mapboxgl.Marker | undefined;

	let teamateLocation = $state<{ lng: number; lat: number } | undefined>();
	$inspect(teamateLocation);
	let teamateLocationMarker: mapboxgl.Marker | undefined;

	// currentLocation on map
	$effect(() => {
		currentLocation?.lat;
		currentLocation?.lng;

		// if map is not initialized, do nothing
		if (!map) return;

		// if currentLocation is undefined, it mean user is not sharing location
		// so remove the marker
		if (!currentLocation) {
			currentLocationMarker?.remove();
			currentLocationMarker = undefined;
			return;
		}

		// if currentLocation is defined, fly to the location
		// and add/move a marker
		map.flyTo({ center: [currentLocation.lng, currentLocation.lat] });
		if (!currentLocationMarker) {
			currentLocationMarker = new mapboxgl.Marker()
				.setLngLat([currentLocation.lng, currentLocation.lat])
				.addTo(map);
		} else {
			currentLocationMarker.setLngLat([currentLocation.lng, currentLocation.lat]);
		}

		// send location to server
		socket.emit('location', currentLocation);
	});

	// teamateLocation on map
	$effect(() => {
		teamateLocation?.lat;
		teamateLocation?.lng;

		// if map is not initialized, do nothing
		if (!map) return;

		// if teamateLocation is undefined, it mean user is not sharing location
		// so remove the marker
		if (!teamateLocation) {
			teamateLocationMarker?.remove();
			teamateLocationMarker = undefined;
			return;
		}

		// if teamateLocation is defined
		// and add/move a marker
		if (!teamateLocationMarker) {
			teamateLocationMarker = new mapboxgl.Marker()
				.setLngLat([teamateLocation.lng, teamateLocation.lat])
				.addTo(map);
		} else {
			teamateLocationMarker.setLngLat([teamateLocation.lng, teamateLocation.lat]);
		}
	});

	onMount(() => {
		initMap();

		if (!map) {
			alert('Init map failed');
			return;
		}

		startSubcribeLocation();
	});

	function startLocationTracking() {
		if (navigator.geolocation) {
			watchLocationHandlerId = navigator.geolocation.watchPosition(
				(position) => {
					console.log('Received location:', position.coords);

					const { longitude, latitude } = position.coords;

					if (!currentLocation) {
						currentLocation = {
							lng: longitude + Math.random() * 0.1,
							lat: latitude + Math.random() * 0.1
						};
					} else {
						currentLocation.lng = longitude + Math.random() * 0.1;
						currentLocation.lat = latitude + Math.random() * 0.1;
					}
				},
				(error) => {
					console.error('Error getting location:', error);
				}
			);
		}
	}

	function stopLocationTracking() {
		if (watchLocationHandlerId) {
			navigator.geolocation.clearWatch(watchLocationHandlerId);
			watchLocationHandlerId = undefined;
			currentLocation = undefined;
		}
	}

	function initMap() {
		map = new mapboxgl.Map({
			container: 'map',
			style: 'mapbox://styles/mapbox/streets-v12',
			center: [105.81541523004084, 21.049416441831404],
			zoom: 14,
			pitch: 45,
			bearing: -17.6,
			antialias: true
		});
	}

	function startSubcribeLocation() {
		socket.emit('join', token);
		socket.on('location', (location: { lat: number; lng: number }) => {
			teamateLocation = location;
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
	{#if watchLocationHandlerId}
		<button class="btn absolute bottom-4 right-4 z-10 w-28" onclick={stopLocationTracking}>
			Stop Sharing
		</button>
	{:else}
		<button class="btn absolute bottom-4 right-4 z-10 w-28" onclick={startLocationTracking}
			>Share</button
		>
	{/if}
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
