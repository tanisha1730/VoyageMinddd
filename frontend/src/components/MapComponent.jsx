import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon( {
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [ 25, 41 ],
    iconAnchor: [ 12, 41 ]
} );

L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to update map view when places change
function ChangeView ( { places } )
{
    const map = useMap();

    useEffect( () =>
    {
        if ( places && places.length > 0 )
        {
            const bounds = L.latLngBounds( places.map( p => [ p.location.lat, p.location.lng ] ) );
            map.fitBounds( bounds, { padding: [ 50, 50 ] } );
        }
    }, [ places, map ] );

    return null;
}

const MapComponent = ( { places } ) =>
{
    // Default center (can be 0,0 or standard default)
    const defaultCenter = [ 20, 0 ];

    // Filter valid places with location
    const validPlaces = places?.filter( p => p.location && p.location.lat && p.location.lng ) || [];

    return (
        <div className="h-full w-full rounded-xl overflow-hidden border border-gray-200 z-0">
            <MapContainer
                center={ defaultCenter }
                zoom={ 2 }
                style={ { height: '100%', width: '100%' } }
                scrollWheelZoom={ true }
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                { validPlaces.map( ( place, idx ) => (
                    <Marker
                        key={ `${ place.place_id || idx }` }
                        position={ [ place.location.lat, place.location.lng ] }
                    >
                        <Popup>
                            <div className="text-sm">
                                <strong className="block text-base font-bold text-gray-900">{ place.name }</strong>
                                <span className="text-gray-600 block mb-1">{ place.activity_type?.replace( '_', ' ' ) || 'Place' }</span>
                                <p className="text-xs text-gray-500 line-clamp-2">{ place.description }</p>
                            </div>
                        </Popup>
                    </Marker>
                ) ) }

                <ChangeView places={ validPlaces } />
            </MapContainer>
        </div>
    );
};

export default MapComponent;
