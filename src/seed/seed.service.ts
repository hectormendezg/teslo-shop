import { Injectable } from '@nestjs/common';
import { ProductsService } from './../products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {
  constructor(private readonly productService: ProductsService) {}
  async runSeed() {
    await this.insertSeedProducts();
    return 'SEED EXECUTED';
  }

  //===> Metodo para eleiminar los registros existentes en la base de datos!

  private async insertSeedProducts() {
    await this.productService.deleteAllProducts();

    const seed = initialData.products;

    const insertPromises = [];

   /*  seed.forEach((product) => {
      insertPromises.push(this.productService.create(product));
    }); */

    await Promise.all(insertPromises);

    return true;
  }
}
