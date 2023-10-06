import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';
import { ProductImage } from './entities/product-image.entity';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {
  //==> loger personalizado
  private readonly logger = new Logger('ProductsService');

  //=> Utilizar el patron repositorio
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto, user: User) {
    try {
      const { images = [], ...productDetails } = createProductDto;
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map(
          (image) => this.productImageRepository.create({ url: image }),
          user,
        ),
      });
      await this.productRepository.save(product);
      return { ...product, images };
    } catch (error) {
      // console.log(error);
      this.handleExeptionError(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    /*  const product = await this.productRepository.find();
    return product; */
    const { limit = 10, offset = 0 } = paginationDto;
    return await this.productRepository.find({
      take: limit,
      skip: offset,
      //===> relaciones
      relations: {
        images: true,
      },
    });
  }

  async findOne(param: string) {
    /*  const product = await this.productRepository.findOneBy({ id });
    if (!product)
      throw new NotFoundException(`Product whit id ${id} not found`);
    return product; */
    let product: any = Product;
    if (isUUID(param)) {
      product = await this.productRepository.findOneBy({ id: param });
    } else {
      const query = this.productRepository.createQueryBuilder('prod'); //=> prod es un alias
      product = await query
        .where('UPPER (title) =:title or slug =:slug', {
          title: param.toUpperCase(),
          slug: param.toLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();
    }
    if (!product)
      throw new NotFoundException(`Product whit id ${param} not found`);
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { images, ...rest } = updateProductDto;

    const product = await this.productRepository.preload({
      id,
      ...rest,
    });
    if (!product)
      throw new NotFoundException(`Product whith id: ${id} not found`);
    //Query Runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });
        product.images = images.map((image) =>
          this.productImageRepository.create({ url: image }),
        );
      }
      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      //await this.productRepository.save(product);
      return product;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleExeptionError(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  //==> Menejador de errores
  private handleExeptionError(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException('A ocurrido un error!');
  }

  //==> Metodo para eliminar todos los registros de la tabla
  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('produc');
    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleExeptionError(error);
    }
  }
}
