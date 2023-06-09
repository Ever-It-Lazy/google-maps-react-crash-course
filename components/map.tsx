import { useState, useMemo, useCallback, useRef } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  Circle,
  MarkerClusterer,
} from "@react-google-maps/api";
import Places from "./places";
import Distance from "./distance";

type LatLngLiteral = google.maps.LatLngLiteral;
type DirectionsResult = google.maps.DirectionsResult;
type MapOptions = google.maps.MapOptions;

export default function Map() {
	const [directions, setDirections] = useState<DirectionsResult>();
	const mapRef = useRef<GoogleMap>();
	const center = useMemo<LatLngLiteral>(() => ({ lat: 43, lng: -80 }), []);
	const [office, setOffice] = useState<LatLngLiteral>(center);
	const options = useMemo<MapOptions>(() => ({
		mapId: "7ed5982448867083",
		disableDefaultUI: true,
		clickableIcons: false
	}), []);
	const onLoad = useCallback(map => (mapRef.current = map), []);
	const houses = useMemo(() => generateHouses(office), [office]);

	const fetchDirections = (house: LatLngLiteral) => {
		if (!office) return;

		const service = new google.maps.DirectionsService();
		service.route(
			{
				origin: house,
				destination: office,
				travelMode: google.maps.TravelMode.DRIVING
			},
			(result, status) => {
				if (status === "OK" && result) {
					setDirections(result);
				}
			}
		)
	};

	return <div className="container">
		<div className="controls">
			<h1>Commute?</h1>
			<Places setOffice={(position) => {
				setOffice(position);
				mapRef.current?.panTo(position);
			}} />
			{!office && <p>Enter the address of your office.</p>} {/* this will never get run */}
			{directions && (
				<Distance leg={directions.routes[0].legs[0]} />
			)}
		</div>
		<div className="map">
			<GoogleMap
				zoom={10}
				center={center}
				mapContainerClassName="map-container"
				options={options}
				onLoad={onLoad}
			>
				{directions && (
					<DirectionsRenderer
						directions={directions}
						options={{
							polylineOptions: {
								zIndex: 50,
								strokeColor: "green",
								strokeWeight: 5
							}
						}}
					/>
				)}

				{office && (
					<>
						<Marker
							position={office}
							icon="https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png"
						/>

						{houses.length > 0 &&
							<MarkerClusterer>
								{clusterer =>
									houses.map(house => (
										<Marker
											key={house.lat}
											position={house}
											clusterer={clusterer}
											onClick={() => {
												fetchDirections(house);
											}}
										/>
									))
								}
							</MarkerClusterer>
						}

						<Circle center={office} radius={15000} options={closeOptions} />
						<Circle center={office} radius={30000} options={middleOptions} />
						<Circle center={office} radius={45000} options={farOptions} />
					</>
				)}
			</GoogleMap>
		</div>
	</div>;
}

const defaultOptions = {
  strokeOpacity: 0.5,
  strokeWeight: 2,
  clickable: false,
  draggable: false,
  editable: false,
  visible: true,
};
const closeOptions = {
  ...defaultOptions,
  zIndex: 3,
  fillOpacity: 0.05,
  strokeColor: "#8BC34A",
  fillColor: "#8BC34A",
};
const middleOptions = {
  ...defaultOptions,
  zIndex: 2,
  fillOpacity: 0.05,
  strokeColor: "#FBC02D",
  fillColor: "#FBC02D",
};
const farOptions = {
  ...defaultOptions,
  zIndex: 1,
  fillOpacity: 0.05,
  strokeColor: "#FF5252",
  fillColor: "#FF5252",
};

const generateHouses = (position: LatLngLiteral) => {
  const _houses: Array<LatLngLiteral> = [];
  for (let i = 0; i < 100; i++) {
    const direction = Math.random() < 0.5 ? -2 : 2;
    _houses.push({
      lat: position.lat + Math.random() / direction,
      lng: position.lng + Math.random() / direction,
    });
  }
  return _houses;
};
