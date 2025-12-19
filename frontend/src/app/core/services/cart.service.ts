import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
    _id: string;
    name: string;
    price: number;
    qty: number;
    image: string;
}

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private cartItems = new BehaviorSubject<CartItem[]>([]);
    cartItems$ = this.cartItems.asObservable();

    constructor() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            this.cartItems.next(JSON.parse(savedCart));
        }
    }

    addToCart(product: any, qty: number = 1) {
        const currentItems = this.cartItems.value;
        const existingItem = currentItems.find(item => item._id === product._id);

        if (existingItem) {
            existingItem.qty += qty;
        } else {
            const newItem: CartItem = {
                _id: product._id,
                name: product.name,
                price: product.price,
                qty: qty,
                image: this.getProductImage(product)
            };
            currentItems.push(newItem);
        }

        this.updateCart(currentItems);
    }

    removeFromCart(productId: string) {
        const updatedItems = this.cartItems.value.filter(item => item._id !== productId);
        this.updateCart(updatedItems);
    }

    updateQuantity(productId: string, qty: number) {
        const currentItems = this.cartItems.value;
        const item = currentItems.find(item => item._id === productId);
        if (item) {
            item.qty = qty;
            if (item.qty <= 0) {
                this.removeFromCart(productId);
            } else {
                this.updateCart(currentItems);
            }
        }
    }

    clearCart() {
        this.updateCart([]);
    }

    private updateCart(items: CartItem[]) {
        this.cartItems.next([...items]);
        localStorage.setItem('cart', JSON.stringify(items));
    }

    getTotalPrice(): number {
        return this.cartItems.value.reduce((acc, item) => acc + item.price * item.qty, 0);
    }

    getItemCount(): number {
        return this.cartItems.value.reduce((acc, item) => acc + item.qty, 0);
    }

    private getProductImage(product: any): string {
        if (product.image && product.image.data) {
            return `http://localhost:5002/api/products/${product._id}/image`;
        }
        return product.imageUrl || 'https://via.placeholder.com/300';
    }
}
