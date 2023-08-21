'use client';
import { FormEvent, useRef, useState } from 'react';
import { useMap } from '../hooks/useMap';
import type { DirectionsResponseData, FindPlaceFromTextResponseData } from '@googlemaps/google-maps-services-js';

export function NewRoutePage() {
    
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const map = useMap(mapContainerRef);

    const [directionsResponseData, setDirectionsResponseData] = useState<DirectionsResponseData & { request: any }>();
    

    async function searchPlaces(event: FormEvent) {
        event.preventDefault();

        const source = document.querySelector<HTMLInputElement>("input[name=source_place]")?.value;
        const destination = document.querySelector<HTMLInputElement>("input[name=destination_place]")?.value;

        const [sourceResponse, destinationResponse] = await Promise.all([
            fetch(`http://localhost:3000/places?text=${source}`),
            fetch(`http://localhost:3000/places?text=${destination}`),
        ]);

        const [sourcePlace, destinationPlace]: FindPlaceFromTextResponseData[] = await Promise.all([
            sourceResponse.json(),
            destinationResponse.json()
        ]);

        if (sourcePlace.status !== 'OK') {
            console.error(sourceResponse);
            alert('Não foi possível encontrar o local de origem');
        };

        if (destinationPlace.status !== 'OK') {
            console.error(destinationResponse);
            alert('Não foi possível encontrar o local de destino');
        };

        const queryParams = new URLSearchParams(
            {
                originId: sourcePlace.candidates[0].place_id as string,
                destinationId: destinationPlace.candidates[0].place_id as string,
            }
        );

        const directionsResponse = await fetch(`http://localhost:3000/directions?${queryParams.toString()}`);

        const directionsResponseData: DirectionsResponseData & { request: any} = await directionsResponse.json();
        setDirectionsResponseData(directionsResponseData);
        map?.removeAllRoutes();
        map?.addRouteWithIcons({
            routeId: '1',
            startMarkerOptions: {
                position: directionsResponseData.routes[0]!.legs[0]!.start_location
            },
            endMarkerOptions: {
                position: directionsResponseData.routes[0]!.legs[0]!.end_location
            },
            carMarkerOptions: {
                position: directionsResponseData.routes[0]!.legs[0]!.start_location
            },
            directionsResponseData
        });
    };
    
    return (
        <div className ="flex flex-row h-full">
            <div>
                <h1>Nova rota</h1>
                <form className="flex flex-col" onSubmit={searchPlaces}>
                    <input name="source_place" placeholder="Origem"/>
                    <input name="destination_place" placeholder="Destino"/>
                    <button type="submit">Pesquisar</button>
                </form>
                {directionsResponseData && (
                    <ul>
                        <li>    
                            Origem: {directionsResponseData?.routes[0]!.legs[0]!.start_address}
                        </li>
                        <li>
                            Destino: {directionsResponseData?.routes[0]!.legs[0]!.end_address}
                        </li>
                        <li>
                            Distancia: {directionsResponseData?.routes[0]!.legs[0]!.distance.text}
                        </li>
                        <li>
                            Duração: {directionsResponseData?.routes[0]!.legs[0]!.duration.text}
                        </li>
                        <li>
                            <button className='bg-blue-400 p-2 text-white rounded'>
                                Adicionar rota
                            </button>
                        </li>
                    </ul>
                )};
            </div>
            <div id='map' className="h-full w-full" ref={mapContainerRef}>
                
            </div>
        </div>
    )
}

export default NewRoutePage;