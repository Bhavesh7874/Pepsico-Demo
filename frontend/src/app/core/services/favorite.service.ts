import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class FavoriteService {
    private apiUrl = 'http://localhost:5002/api/favorites';

    constructor(private http: HttpClient) { }

    toggleFavorite(productId: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/toggle`, { productId });
    }

    getMyFavorites(): Observable<any> {
        return this.http.get(this.apiUrl);
    }
}
