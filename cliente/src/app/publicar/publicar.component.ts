import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { NavComponent } from '../nav/nav.component';
import { FooterComponent } from '../footer/footer.component';

interface Marca {
  id: number;
  nombre: string;
}

interface Modelo {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-publicar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    NavComponent,
    FooterComponent
  ],
  templateUrl: './publicar.component.html',
})
export class PublicarComponent implements OnInit {
  publicarForm: FormGroup;
  isSubmitting = false;
  marcas: Marca[] = [];
  modelos: Modelo[] = [];

  imagenPrincipalFile: File | null = null;
  imagenesAdicionalesFiles: File[] = [];

  constructor(private fb: FormBuilder, private http: HttpClient) {
this.publicarForm = this.fb.group({
  titulo: ['', Validators.required],
  matricula: ['', Validators.required],
  marca_id: ['', Validators.required],
  modelo_id: ['', Validators.required],
  precio: ['', Validators.required],
  anio: ['', Validators.required],
  kilometros: ['', Validators.required],
  descripcion: ['', Validators.required],
  estado_vehiculo: ['', Validators.required],
  combustible: ['', Validators.required],
  transmision: ['', Validators.required],
  traccion: ['', Validators.required],
  potencia: ['', Validators.required],
  cilindrada: ['', Validators.required],
  color: ['', Validators.required],
  numero_puertas: ['', Validators.required],
  plazas: ['', Validators.required],
});

  }

  ngOnInit(): void {
    this.cargarMarcas();
  }

  cargarMarcas(): void {
    this.http.get<Marca[]>('http://192.168.2.2:3000/api/marcas').subscribe({
      next: (data) => (this.marcas = data),
      error: (err) => console.error('Error al cargar marcas', err)
    });
  }

  onMarcaChange(): void {
    const marcaId = this.publicarForm.value.marca_id;
    this.publicarForm.patchValue({ modelo_id: null });
    this.modelos = [];

    if (marcaId) {
      this.http.get<Modelo[]>(`http://192.168.2.2:3000/api/modelos?marca_id=${marcaId}`).subscribe({
        next: (data) => (this.modelos = data),
        error: (err) => console.error('Error al cargar modelos', err)
      });
    }
  }

  onPrincipalImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.imagenPrincipalFile = input.files[0];
    }
  }

  onAdicionalImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.imagenesAdicionalesFiles = Array.from(input.files);
    }
  }

  onSubmit(): void {
  if (this.publicarForm.invalid || this.isSubmitting) return;

  this.isSubmitting = true;
  const formData = new FormData();
  const valores = this.publicarForm.value;

  console.log('📦 Valores del formulario:', valores);

  Object.entries(valores).forEach(([key, value]) => {
    console.log(`Añadiendo campo [${key}]:`, value);
    formData.append(key, String(value));
  });

  if (this.imagenPrincipalFile) {
    console.log('🖼 Imagen principal:', this.imagenPrincipalFile.name);
    formData.append('imagen_principal', this.imagenPrincipalFile);
  }

  this.imagenesAdicionalesFiles.forEach((file, i) => {
    console.log(`📸 Imagen adicional ${i + 1}:`, file.name);
    formData.append('imagenes_adicionales', file);
  });

  const token = localStorage.getItem('token') || '';
  const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

  console.log('🚀 Enviando datos a backend...');

  this.http.post('http://192.168.2.2:3000/api/anuncios', formData, { headers }).subscribe({
    next: () => {
      alert('Anuncio publicado con éxito');
      this.publicarForm.reset();
      this.imagenPrincipalFile = null;
      this.imagenesAdicionalesFiles = [];
      this.isSubmitting = false;
    },
    error: (err) => {
      console.error('❌ Error al publicar el anuncio:', err);
      this.isSubmitting = false;
    }
  });
}

}
