import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DirectionsRequest, Client as GoogleMapsClient, PlaceInputType, TravelMode } from '@googlemaps/google-maps-services-js';

@Injectable()
export class DirectionsService {

    constructor(
        private configService: ConfigService, 
        private googleMapsClient: GoogleMapsClient
    ) {}

    async getDirections(originId: string, destinationId: string) {
        const params: DirectionsRequest['params'] = {
            origin: `place_id:${originId}`,
            destination: `place_id:${destinationId}`,
            mode: TravelMode.driving,
            key: this.configService.get('GOOGLE_MAPS_API_KEY')
        }
        const { data } = await this.googleMapsClient.directions({
            params
        });

        return {
            ...data,
            request: {
                origin: {
                    place_id: params.origin,
                    location: {
                        lat: data.routes[0].legs[0].start_location.lat,
                        lng: data.routes[0].legs[0].start_location.lng
                    }
                },
                destination: {
                    place_id: params.destination,
                    location: {
                        lat: data.routes[0].legs[0].end_location.lat,
                        lng: data.routes[0].legs[0].end_location.lng
                    }  
                },
                mode: params.mode
            }
        }
    }
}
