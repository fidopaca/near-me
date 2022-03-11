<template>
  <div class="h-screen relative">
    <GeoErrorModal v-if="geoError" :geoErrorMsg="geoErrorMsg" @closeGeoError="closeGeoError"></GeoErrorModal>

    <MapFeatures :coords="coords" :fetchCoords="fetchCoords" @getGeolocation="getGeolocation" @plotResult="plotResult" :searchResults="searchResults" @toggleSearchResults="toggleSearchResults" @removeResult="removeResult"></MapFeatures>

    <div id="map" class="h-full z-[1]"></div>
  </div>
</template>

<script>
import leaflet from "leaflet";
import { onMounted, ref } from "vue";
import GeoErrorModal from "../components/GeoErrorModal.vue";
import MapFeatures from "../components/MapFeatures.vue";
export default {
  name: "HomeView",
  components: { GeoErrorModal, MapFeatures },
  setup() {
    let map;
    onMounted(() => {
      // init map here
      map = leaflet.map("map").setView([28.538336, -81.379234], 10);
      // tile layer
      leaflet
        .tileLayer(`https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${process.env.VUE_APP_API_KEY}`, {
          attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          maxZoom: 18,
          id: "mapbox/streets-v11",
          tileSize: 512,
          zoomOffset: -1,
          accessToken: process.env.VUE_APP_API_KEY,
        })
        .addTo(map);

      map.on("moveend", () => {
        closeSearchResults();
      });
      getGeolocation();
    });
    const coords = ref(null);
    const fetchCoords = ref(null);
    const geoMarker = ref(null);
    const geoError = ref(null);
    const geoErrorMsg = ref(null);

    const getGeolocation = () => {
      if (coords.value) {
        coords.value = null;
        sessionStorage.removeItem("coords");
        map.removeLayer(geoMarker.value);
        return;
      }
      // check session storage for coords
      if (sessionStorage.getItem("coords")) {
        coords.value = JSON.parse(sessionStorage.getItem("coords"));
        plotGeolocation(coords.value);
      } else {
        fetchCoords.value = true;
        navigator.geolocation.getCurrentPosition(setCoords, getLocError);
      }
    };
    const setCoords = (pos) => {
      // stop fetchCords
      fetchCoords.value = null;
      // set coords in session storage
      const setSessionCoords = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };
      sessionStorage.setItem("coords", JSON.stringify(setSessionCoords));
      // set coords
      coords.value = setSessionCoords;
      plotGeolocation(coords.value);
    };
    const getLocError = (err) => {
      fetchCoords.value = null;
      geoError.value = true;
      geoErrorMsg.value = err.message;
    };
    const plotGeolocation = (coords) => {
      // create custom marker
      const customMarker = leaflet.icon({
        iconUrl: require("../assets/map-marker-red.svg"),
        iconSize: [35, 35],
      });
      // create new marker with coords custom icon
      geoMarker.value = leaflet.marker([coords.lat, coords.lng], { icon: customMarker }).addTo(map);
      // set map view to user loc
      map.setView([coords.lat, coords.lng], 10);
    };
    const closeGeoError = () => {
      geoError.value = null;
      geoErrorMsg.value = null;
    };

    const resultMarker = ref(null);
    const plotResult = (coords) => {
      // check if resultMarker already has value
      if (resultMarker.value) {
        map.removeLayer(resultMarker.value);
      }

      // create custom marker
      const customMarker = leaflet.icon({
        iconUrl: require("../assets/map-marker-blue.svg"),
        iconSize: [35, 35],
      });
      // create new marker with coords custom icon
      resultMarker.value = leaflet.marker([coords.coordinates[1], coords.coordinates[0]], { icon: customMarker }).addTo(map);
      // set map view to user loc
      map.setView([coords.coordinates[1], coords.coordinates[0]], 15);
      closeSearchResults();
    };

    const searchResults = ref(null);
    const toggleSearchResults = () => {
      searchResults.value = !searchResults.value;
    };
    const closeSearchResults = () => {
      searchResults.value = null;
    };
    const removeResult = () => {
      map.removeLayer(resultMarker.value);
    };

    return { coords, fetchCoords, geoMarker, geoError, geoErrorMsg, removeResult, closeGeoError, getGeolocation, plotResult, searchResults, toggleSearchResults, closeSearchResults };
  },
};
</script>
