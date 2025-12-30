import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { OrderService } from '../../../core/services/order.service';
import { FavoriteService } from '../../../core/services/favorite.service';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { LoggerService } from '../../../core/services/logger.service';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  user: any;
  activeSection: 'home' | 'orders' | 'favorites' | 'settings' | 'cart' = 'home';
  orders: any[] = [];
  favorites: any[] = [];
  products: any[] = [];
  cartItems: any[] = [];
  processing = false;

  // Settings
  profileForm: FormGroup;
  settingsLoading = false;

  // Stripe
  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  card: StripeCardElement | null = null;

  constructor(
    private authService: AuthService,
    private orderService: OrderService,
    private favoriteService: FavoriteService,
    private productService: ProductService,
    public cartService: CartService,
    private fb: FormBuilder,
    private logger: LoggerService
  ) {
    this.logger.info('UserDashboardComponent initialized');
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''] // Optional
    });
  }

  async ngOnInit() {
    this.user = this.authService.currentUserValue;
    this.logger.info('User dashboard initializing', { user: this.user?.email });
    if (this.user) {
      this.profileForm.patchValue({
        name: this.user.name,
        email: this.user.email
      });
    }
    this.loadData();
    this.cartService.cartItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => this.cartItems = items);

    // Initialize Stripe
    this.stripe = await loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx'); // Test key
  }

  setSection(section: 'home' | 'orders' | 'favorites' | 'settings' | 'cart') {
    this.logger.debug('Switching dashboard section', { section });
    this.activeSection = section;
    this.loadData();

    if (section === 'cart' && this.cartItems.length > 0) {
      // Small timeout to ensure DOM is ready for Stripe element
      setTimeout(() => this.mountStripeElement(), 100);
    }
  }

  mountStripeElement() {
    if (this.stripe && !this.card) {
      this.elements = this.stripe.elements();
      this.card = this.elements.create('card', {
        style: {
          base: {
            color: '#fff',
            fontFamily: '"Outfit", sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder': {
              color: '#6b7280'
            }
          },
          invalid: {
            color: '#ef4444',
            iconColor: '#ef4444'
          }
        }
      });
      const element = document.getElementById('card-element');
      if (element) {
        this.card.mount('#card-element');
      }
    }
  }

  loadData() {
    this.logger.debug('Loading dashboard data', { section: this.activeSection });
    if (this.activeSection === 'home') {
      this.productService.getProducts()
        .pipe(takeUntil(this.destroy$))
        .subscribe(products => this.products = products);
    } else if (this.activeSection === 'orders') {
      this.orderService.getMyOrders()
        .pipe(takeUntil(this.destroy$))
        .subscribe(orders => this.orders = orders);
    } else if (this.activeSection === 'favorites') {
      this.favoriteService.getMyFavorites()
        .pipe(takeUntil(this.destroy$))
        .subscribe(favs => this.favorites = favs);
    }
  }

  updateProfile() {
    if (this.profileForm.invalid) return;
    this.settingsLoading = true;
    this.authService.updateProfile(this.profileForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.user = user;
          this.settingsLoading = false;
          alert('Profile updated successfully');
        },
        error: (err) => {
          console.error(err);
          this.settingsLoading = false;
          alert('Update failed');
        }
      });
  }

  addToCart(product: any) {
    this.logger.info('Adding product to cart', { product: product.name });
    this.cartService.addToCart(product);
  }

  async checkout() {
    if (this.cartItems.length === 0 || !this.stripe || !this.card) {
      this.logger.warn('Checkout attempted with empty cart or uninitialized payments');
      return;
    }

    this.logger.info('Starting checkout process', { total: this.getTotalPrice() });
    this.processing = true;

    try {
      // 1. Get Client Secret from backend
      const total = this.getTotalPrice();
      this.orderService.createPaymentIntent(total)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: async (res) => {
            // 2. Confirm Payment on client side
            const { error, paymentIntent } = await this.stripe!.confirmCardPayment(res.clientSecret, {
              payment_method: {
                card: this.card!,
                billing_details: {
                  name: this.user.name,
                  email: this.user.email
                }
              }
            });

            if (error) {
              console.error(error);
              alert(error.message);
              this.processing = false;
            } else if (paymentIntent.status === 'succeeded') {
              // 3. Save Order to backend
              const orderData = {
                orderItems: this.cartItems.map(item => ({
                  name: item.name,
                  qty: item.qty,
                  image: item.image,
                  price: item.price,
                  product: item._id
                })),
                paymentMethod: 'Stripe',
                totalPrice: total,
                paymentResult: {
                  id: paymentIntent.id,
                  status: paymentIntent.status,
                  update_time: new Date().toISOString(),
                  email_address: this.user.email
                }
              };

              this.orderService.createOrder(orderData)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                  next: () => {
                    this.cartService.clearCart();
                    this.processing = false;
                    this.setSection('orders');
                    alert('Order placed successfully!');
                  },
                  error: (err) => {
                    console.error(err);
                    this.processing = false;
                  }
                });
            }
          },
          error: (err) => {
            console.error(err);
            this.processing = false;
          }
        });
    } catch (err) {
      console.error(err);
      this.processing = false;
    }
  }

  getProductImage(product: any): string {
    if (product.image && product.image.data) {
      return `http://localhost:5002/api/products/${product._id}/image`;
    }
    return product.imageUrl || 'https://via.placeholder.com/300';
  }

  getTotalPrice() {
    return this.cartService.getTotalPrice();
  }

  getItemCount() {
    return this.cartService.getItemCount();
  }

  logout() {
    this.authService.logout();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
