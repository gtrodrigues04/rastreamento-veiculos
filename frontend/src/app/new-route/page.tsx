'use client';
import { FormEvent, useRef, useState } from 'react';
import { useMap } from '../hooks/useMap';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import type { DirectionsResponseData, FindPlaceFromTextResponseData } from '@googlemaps/google-maps-services-js';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Alert, Card, CardActions, CardContent, List, ListItem, ListItemText, Snackbar, TextField } from '@mui/material';

export function NewRoutePage() {
    
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const map = useMap(mapContainerRef);

    const [directionsResponseData, setDirectionsResponseData] = useState<DirectionsResponseData & { request: any }>();
    
    const [open, setOpen] = useState(false);

    async function searchPlaces(event: FormEvent) {
        event.preventDefault();

        const source = (document.getElementById("source") as HTMLInputElement).value;
        const destination = (document.getElementById("destination") as HTMLInputElement).value;

        // const source = (document.getElementById("source") as HTMLInputElement); Exemplo de maneira de setar variavel pelo input pelo id do elemento.

        const [sourceResponse, destinationResponse] = await Promise.all([
            fetch(`http://localhost:3001/api/places?text=${source}`),
            fetch(`http://localhost:3001/api/places?text=${destination}`),
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

        const directionsResponse = await fetch(`http://localhost:3001/api/directions?${queryParams.toString()}`);

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

    async function createRoute() {
        const startAddress = directionsResponseData?.routes[0].legs[0].start_address;
        const endAddress = directionsResponseData?.routes[0].legs[0].end_address;
        
        const origemPlaceId = directionsResponseData!.request.origin.place_id.replace("place_id:", "");
        const destinoPlaceId = directionsResponseData!.request.destination.place_id.replace("place_id:", "");

        const response = await fetch('http://localhost:3001/api/routes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: `${startAddress} - ${endAddress}`,
                source_id: origemPlaceId,
                destination_id: destinoPlaceId,
            })
        });
        const route = await response.json();
        setOpen(true);
    }
    
    return (
        <Grid2 container sx={{ display: "flex", flex: 1 }}>
            <Grid2 xs={4} px={2}>
                <Typography variant="h4">Nova rota</Typography>
                <form onSubmit={searchPlaces}>
                    <TextField 
                        id="source" 
                        label="Origem" 
                        fullWidth 
                    />
                    <TextField
                        id="destination"
                        label="Destino"
                        fullWidth
                        sx={{ mt: 1 }}
                    />
                    <Button variant="contained" type="submit" sx={{ mt: 1 }} fullWidth>
                        Pesquisar
                    </Button>
                </form>
                {directionsResponseData && (
                    <Card sx={{ mt: 1 }}>
                        <CardContent>
                            <List>
                                <ListItem>
                                    <ListItemText
                                        primary={"Origem"}
                                        secondary={
                                        directionsResponseData?.routes[0]!.legs[0]!.start_address
                                        }
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary={"Destino"}
                                        secondary={
                                        directionsResponseData?.routes[0]!.legs[0]!.end_address
                                        }
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary={"Distância"}
                                        secondary={
                                        directionsResponseData?.routes[0]!.legs[0]!.distance.text
                                        }
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary={"Duração"}
                                        secondary={
                                        directionsResponseData?.routes[0]!.legs[0]!.duration.text
                                        }
                                    />
                                </ListItem>
                            </List>
                        </CardContent>
                        <CardActions sx={{ display: "flex", justifyContent: "center" }}>
                        <Button type="button" variant="contained" onClick={createRoute}>
                            Adicionar rota
                        </Button>
                        </CardActions>
                    </Card>
        )}
            </Grid2>
            <Grid2 id='map' xs={8} ref={mapContainerRef}>
            <Snackbar
                open={open}
                autoHideDuration={3000}
                onClose={() => setOpen(false)}
            >
                <Alert onClose={() => setOpen(false)} severity="success">
                    Rota cadastrada com sucesso
                </Alert>
            </Snackbar>
            </Grid2>
        </Grid2>
    )
}

export default NewRoutePage;