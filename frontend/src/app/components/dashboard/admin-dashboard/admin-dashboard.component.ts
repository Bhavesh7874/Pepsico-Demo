import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  user: any;
  productForm: FormGroup;
  products: any[] = [];
  loading = false;
  showModal = false;

  // Parallax Variables
  mouseX = 0;
  mouseY = 0;

  constructor(
    private authService: AuthService,
    private productService: ProductService,
    private fb: FormBuilder
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      description: ['', Validators.required],
      imageUrl: [''],
      stock: [100, Validators.required]
    });
  }

  ngOnInit() {
    this.user = this.authService.currentUserValue;
    this.loadProducts();

    // Add Mouse Move Listener
    window.addEventListener('mousemove', (e) => {
      this.mouseX = (e.clientX - window.innerWidth / 2) / window.innerWidth;
      this.mouseY = (e.clientY - window.innerHeight / 2) / window.innerHeight;
    });
  }

  loadProducts() {
    this.productService.getProducts().subscribe(data => {
      this.products = data;
    });
  }

  openModal() {
    this.showModal = true;
  }

  closeModal(event: Event) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.showModal = false;
    }
  }

  getTotalStock(): number {
    return this.products.reduce((acc, curr) => acc + (curr.stock || 0), 0);
  }

  addProduct() {
    if (this.productForm.invalid) return;

    const productData = {
      ...this.productForm.value,
      imageUrl: this.productForm.value.imageUrl || 'https://via.placeholder.com/300'
    };

    this.productService.createProduct(productData).subscribe({
      next: (product) => {
        this.products.push(product);
        this.productForm.reset({ stock: 100 });
        this.showModal = false;
      },
      error: (err) => console.error(err)
    });
  }

  deleteProduct(id: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe(() => {
        this.products = this.products.filter(p => p._id !== id);
      });
    }
  }

  logout() {
    this.authService.logout();
  }
}
