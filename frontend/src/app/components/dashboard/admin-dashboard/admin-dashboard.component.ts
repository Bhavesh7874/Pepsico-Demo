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

  constructor(
    private authService: AuthService,
    private productService: ProductService,
    private fb: FormBuilder
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      description: ['', Validators.required],
      imageUrl: ['https://via.placeholder.com/150'],
      stock: [100, Validators.required]
    });
  }

  ngOnInit() {
    this.user = this.authService.currentUserValue;
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts().subscribe(data => {
      this.products = data;
    });
  }

  addProduct() {
    if (this.productForm.invalid) return;

    this.productService.createProduct(this.productForm.value).subscribe({
      next: (product) => {
        this.products.push(product);
        this.productForm.reset({ imageUrl: 'https://via.placeholder.com/150', stock: 100 });
      },
      error: (err) => console.error(err)
    });
  }

  deleteProduct(id: string) {
    if(confirm('Are you sure?')) {
      this.productService.deleteProduct(id).subscribe(() => {
        this.products = this.products.filter(p => p._id !== id);
      });
    }
  }

  logout() {
    this.authService.logout();
  }
}
