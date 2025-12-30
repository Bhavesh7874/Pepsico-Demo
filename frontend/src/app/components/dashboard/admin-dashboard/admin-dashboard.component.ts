import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ProductService } from '../../../core/services/product.service';
import { LoggerService } from '../../../core/services/logger.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  user: any;
  productForm: FormGroup;
  products: any[] = [];
  loading = false;
  showModal = false;
  selectedFile: File | null = null;
  private mouseMoveListener: any;

  // Parallax Variables
  mouseX = 0;
  mouseY = 0;

  systemStatus: 'Active' | 'Checking...' | 'Offline' = 'Checking...';

  constructor(
    private authService: AuthService,
    public productService: ProductService,
    private fb: FormBuilder,
    private http: HttpClient,
    private logger: LoggerService
  ) {
    this.logger.info('AdminDashboardComponent initialized');
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      description: ['', Validators.required],
      stock: [100, Validators.required]
    });
  }

  ngOnInit() {
    this.logger.info('Admin dashboard initializing', { user: this.user?.email });
    this.user = this.authService.currentUserValue;
    this.loadProducts();
    this.checkSystemStatus();

    // Add Mouse Move Listener
    this.mouseMoveListener = (e: MouseEvent) => {
      this.mouseX = (e.clientX - window.innerWidth / 2) / window.innerWidth;
      this.mouseY = (e.clientY - window.innerHeight / 2) / window.innerHeight;
    };
    window.addEventListener('mousemove', this.mouseMoveListener);
  }

  checkSystemStatus() {
    this.systemStatus = 'Checking...';
    this.http.get('http://localhost:5002/api/health').subscribe({
      next: () => this.systemStatus = 'Active',
      error: () => this.systemStatus = 'Offline'
    });
  }

  loadProducts() {
    this.logger.debug('Loading products');
    this.productService.getProducts().subscribe(data => {
      this.products = data;
      this.logger.info('Products loaded', { count: this.products.length });
    });
  }

  openModal() {
    this.logger.debug('Opening add product modal');
    this.showModal = true;
    this.selectedFile = null;
  }

  closeModal(event: Event) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.showModal = false;
    }
  }

  getTotalStock(): number {
    return this.products.reduce((acc, curr) => acc + (curr.stock || 0), 0);
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] as File;
  }

  getProductImage(product: any): string {
    if (product.image && product.image.data) {
      return this.productService.getProductImageUrl(product._id);
    }
    return product.imageUrl || 'https://via.placeholder.com/300';
  }

  addProduct() {
    if (this.productForm.invalid) return;

    this.loading = true;
    const formData = new FormData();
    formData.append('name', this.productForm.get('name')?.value);
    formData.append('price', this.productForm.get('price')?.value);
    formData.append('description', this.productForm.get('description')?.value);
    formData.append('stock', this.productForm.get('stock')?.value);

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.productService.createProduct(formData).subscribe({
      next: (product) => {
        this.products.push(product);
        this.productForm.reset({ stock: 100 });
        this.selectedFile = null;
        this.showModal = false;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  deleteProduct(id: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.logger.info('Deleting product', { id });
      this.productService.deleteProduct(id).subscribe(() => {
        this.products = this.products.filter(p => p._id !== id);
        this.logger.info('Product deleted successfully', { id });
      });
    }
  }

  logout() {
    this.authService.logout();
  }

  ngOnDestroy() {
    if (this.mouseMoveListener) {
      window.removeEventListener('mousemove', this.mouseMoveListener);
    }
  }
}
